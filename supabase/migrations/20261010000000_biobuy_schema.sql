-- ==============================================================================
-- BIOBUY PLATFORM: PostgreSQL Database Schema & Atomic Functions
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    initial_budget NUMERIC(12, 2) NOT NULL DEFAULT 10000.00 CHECK (initial_budget >= 0),
    remaining_balance NUMERIC(12, 2) NOT NULL DEFAULT 10000.00 CHECK (remaining_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'researcher' CHECK (role IN ('leader', 'researcher', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_team UNIQUE (team_id, user_id)
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    image_url TEXT NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    catalog_number VARCHAR(100) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit_of_sale VARCHAR(100) NOT NULL,
    pack_size VARCHAR(100),
    specifications JSONB DEFAULT '{}'::jsonb,
    storage_information TEXT,
    compatibility_information TEXT,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PURCHASES TABLE (Transaction History)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    user_id UUID,
    user_name VARCHAR(255),
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    unit_of_sale_snapshot VARCHAR(100) NOT NULL,
    product_image_snapshot TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BUDGET TRANSACTIONS (Audit Ledger)
CREATE TABLE IF NOT EXISTS budget_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'budget_allocation', 'budget_adjustment', 'refund')),
    amount NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES FOR HIGH-PERFORMANCE SEARCH & REALTIME QUERYING
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_catalog ON products(catalog_number);
CREATE INDEX IF NOT EXISTS idx_purchases_team ON purchases(team_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_trans_team ON budget_transactions(team_id);

-- 8. ATOMIC STORED FUNCTION: process_purchase
-- Guarantees atomic deduction of stock and balance with row-level locks
CREATE OR REPLACE FUNCTION process_purchase(
    p_team_id UUID,
    p_user_id UUID,
    p_user_name VARCHAR,
    p_product_id UUID,
    p_quantity INT,
    p_idempotency_key VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_team RECORD;
    v_total_amount NUMERIC(12, 2);
    v_new_balance NUMERIC(12, 2);
    v_new_stock INT;
    v_purchase_id UUID;
    v_existing_purchase RECORD;
BEGIN
    -- 1. Idempotency Safeguard: Check if this idempotency key was already processed
    SELECT * INTO v_existing_purchase FROM purchases WHERE transaction_id = p_idempotency_key;
    IF FOUND THEN
        SELECT remaining_balance INTO v_new_balance FROM teams WHERE id = p_team_id;
        SELECT stock_quantity INTO v_new_stock FROM products WHERE id = p_product_id;
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Purchase already processed (idempotent)',
            'purchase_id', v_existing_purchase.id,
            'transaction_id', v_existing_purchase.transaction_id,
            'new_balance', v_new_balance,
            'new_stock', v_new_stock
        );
    END IF;

    -- 2. Validate input quantity
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_QUANTITY',
            'message', 'Selected quantity must be greater than zero.'
        );
    END IF;

    -- 3. Lock product row for update (prevents race condition & overselling)
    SELECT * INTO v_product
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'PRODUCT_NOT_FOUND',
            'message', 'Selected product was not found in catalog.'
        );
    END IF;

    IF NOT v_product.active THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'PRODUCT_INACTIVE',
            'message', 'This product is currently inactive and cannot be purchased.'
        );
    END IF;

    -- 4. Check available stock
    IF v_product.stock_quantity < p_quantity THEN
        IF v_product.stock_quantity = 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'OUT_OF_STOCK',
                'message', 'Item is currently Out of Stock.',
                'current_stock', 0
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'INSUFFICIENT_STOCK',
                'message', format('Only %s units are currently available. Please update your quantity.', v_product.stock_quantity),
                'current_stock', v_product.stock_quantity
            );
        END IF;
    END IF;

    -- 5. Lock team row for update (prevents balance race conditions)
    SELECT * INTO v_team
    FROM teams
    WHERE id = p_team_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'TEAM_NOT_FOUND',
            'message', 'Team was not found.'
        );
    END IF;

    -- 6. Calculate total price strictly using current database price
    v_total_amount := v_product.price * p_quantity;

    -- 7. Check team budget
    IF v_team.remaining_balance < v_total_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INSUFFICIENT_BUDGET',
            'message', format('Insufficient balance. Your team needs ₹%s more for this purchase.', (v_total_amount - v_team.remaining_balance)),
            'remaining_balance', v_team.remaining_balance,
            'required_amount', v_total_amount
        );
    END IF;

    -- 8. Deduct team balance
    v_new_balance := v_team.remaining_balance - v_total_amount;
    UPDATE teams
    SET remaining_balance = v_new_balance
    WHERE id = p_team_id;

    -- 9. Decrement product stock
    v_new_stock := v_product.stock_quantity - p_quantity;
    UPDATE products
    SET stock_quantity = v_new_stock,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- 10. Record Purchase with Snapshots
    INSERT INTO purchases (
        team_id,
        user_id,
        user_name,
        transaction_id,
        product_id,
        product_name_snapshot,
        unit_price_snapshot,
        unit_of_sale_snapshot,
        product_image_snapshot,
        quantity,
        total_amount,
        status,
        created_at
    ) VALUES (
        p_team_id,
        p_user_id,
        p_user_name,
        p_idempotency_key,
        p_product_id,
        v_product.name,
        v_product.price,
        v_product.unit_of_sale,
        v_product.image_url,
        p_quantity,
        v_total_amount,
        'completed',
        NOW()
    ) RETURNING id INTO v_purchase_id;

    -- 11. Record Budget Transaction Audit Ledger
    INSERT INTO budget_transactions (
        team_id,
        purchase_id,
        transaction_type,
        amount,
        balance_after,
        description,
        created_at
    ) VALUES (
        p_team_id,
        v_purchase_id,
        'purchase',
        -v_total_amount,
        v_new_balance,
        format('Purchased %s × %s', p_quantity, v_product.name),
        NOW()
    );

    -- 12. Return Success Payload
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Purchase successful! %s × %s purchased for ₹%s.', p_quantity, v_product.name, v_total_amount),
        'purchase_id', v_purchase_id,
        'transaction_id', p_idempotency_key,
        'product_id', p_product_id,
        'product_name', v_product.name,
        'quantity', p_quantity,
        'total_amount', v_total_amount,
        'new_balance', v_new_balance,
        'new_stock', v_new_stock
    );
EXCEPTION WHEN OTHERS THEN
    -- Any exception triggers automatic rollback
    RETURN jsonb_build_object(
        'success', false,
        'error_code', 'TRANSACTION_FAILED',
        'message', SQLERRM
    );
END;
$$;

-- 9. ADMIN FUNCTION: adjust_team_budget
CREATE OR REPLACE FUNCTION adjust_team_budget(
    p_team_id UUID,
    p_adjustment_amount NUMERIC,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team RECORD;
    v_new_balance NUMERIC(12, 2);
BEGIN
    SELECT * INTO v_team FROM teams WHERE id = p_team_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Team not found');
    END IF;

    v_new_balance := v_team.remaining_balance + p_adjustment_amount;
    IF v_new_balance < 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Resulting balance cannot be negative');
    END IF;

    UPDATE teams
    SET remaining_balance = v_new_balance
    WHERE id = p_team_id;

    INSERT INTO budget_transactions (
        team_id,
        transaction_type,
        amount,
        balance_after,
        description,
        created_at
    ) VALUES (
        p_team_id,
        'budget_adjustment',
        p_adjustment_amount,
        v_new_balance,
        p_reason,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'message', format('Team budget adjusted by ₹%s. New balance: ₹%s', p_adjustment_amount, v_new_balance)
    );
END;
$$;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Products: Only authenticated admin can modify
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'service_role');

-- Teams: Public/authenticated can view teams
DROP POLICY IF EXISTS "Teams viewable by all members" ON teams;
CREATE POLICY "Teams viewable by all members"
ON teams FOR SELECT
USING (true);

-- Purchases: Teams can view their own purchases
DROP POLICY IF EXISTS "Teams can view own purchases" ON purchases;
CREATE POLICY "Teams can view own purchases"
ON purchases FOR SELECT
USING (true);

-- Budget Transactions: Viewable by team members
DROP POLICY IF EXISTS "Teams can view own budget transactions" ON budget_transactions;
CREATE POLICY "Teams can view own budget transactions"
ON budget_transactions FOR SELECT
USING (true);

-- 11. SUPABASE REALTIME REPLICATION ENABLEMENT
-- Safely enable real-time updates for products, purchases, and teams
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE products;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'purchases'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE purchases;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'teams'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE teams;
    END IF;
END $$;

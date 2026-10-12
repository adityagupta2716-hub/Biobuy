export type ProductCategory =
  | 'Laboratory Equipment'
  | 'Reagents and Raw Materials'
  | 'Assay Kits'
  | 'Molecular Biology'
  | 'Cell Culture'
  | 'Laboratory Consumables'
  | 'Analytical and Testing Equipment';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  image_url: string;
  manufacturer: string;
  catalog_number: string;
  price: number; // in INR (₹)
  unit_of_sale: string; // e.g. "Instrument", "Kit", "Bottle", "Pack of 1,000", "Box"
  pack_size?: string;
  specifications?: Record<string, string>;
  storage_information?: string; // e.g. "-20°C", "4°C", "Room Temperature (15-25°C)"
  compatibility_information?: string;
  stock_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  initial_budget: number;
  remaining_balance: number;
  created_at: string;
}

export type UserRole = 'admin' | 'contestant';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  team_id?: string; // assigned team for contestants; null for admins
  password_hash: string;
  created_at: string;
}

export interface UserSession {
  user_id: string;
  user_name: string;
  email: string;
  role: UserRole;
  current_team: Team | null; // Contestant's assigned team; null for administrators
  session_token: string;
}

export interface Purchase {
  id: string;
  team_id: string;
  user_id: string;
  user_name?: string;
  team_name?: string;
  transaction_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  unit_of_sale_snapshot: string;
  product_image_snapshot?: string;
  quantity: number;
  total_amount: number;
  status: 'completed' | 'refunded' | 'failed';
  created_at: string;
}

export interface BudgetTransaction {
  id: string;
  team_id: string;
  purchase_id?: string;
  transaction_type: 'purchase' | 'budget_allocation' | 'budget_adjustment' | 'refund';
  amount: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  purchase?: Purchase;
  new_balance?: number;
  new_stock?: number;
  error_code?: 'INSUFFICIENT_BUDGET' | 'INSUFFICIENT_STOCK' | 'OUT_OF_STOCK' | 'PRODUCT_INACTIVE' | 'UNAUTHORIZED' | 'TRANSACTION_FAILED';
}

export interface AuthResult {
  success: boolean;
  message: string;
  session?: UserSession;
  redirectTab?: 'marketplace' | 'admin';
}

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'availability-desc';
export type AvailabilityFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

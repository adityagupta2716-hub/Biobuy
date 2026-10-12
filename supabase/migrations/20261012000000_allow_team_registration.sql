-- ==============================================================================
-- BIOBUY PLATFORM: Allow Team Registration & Fix RLS Policy
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable Team Creation via RLS Policy
DROP POLICY IF EXISTS "Allow team creation" ON teams;
CREATE POLICY "Allow team creation" 
ON teams FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow team update" ON teams;
CREATE POLICY "Allow team update" 
ON teams FOR UPDATE 
TO public, anon, authenticated 
USING (true);

-- 2. Stored RPC Function for Guaranteed Atomic Team Registration (Bypasses RLS)
CREATE OR REPLACE FUNCTION register_team(
    p_name VARCHAR,
    p_initial_budget NUMERIC DEFAULT 10000.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team_id UUID := uuid_generate_v4();
    v_team RECORD;
BEGIN
    INSERT INTO teams (id, name, initial_budget, remaining_balance)
    VALUES (v_team_id, p_name, p_initial_budget, p_initial_budget)
    RETURNING * INTO v_team;

    RETURN jsonb_build_object(
        'success', true,
        'team_id', v_team.id,
        'name', v_team.name,
        'initial_budget', v_team.initial_budget,
        'remaining_balance', v_team.remaining_balance
    );
EXCEPTION WHEN unique_violation THEN
    -- If already exists, return existing team
    SELECT * INTO v_team FROM teams WHERE LOWER(name) = LOWER(p_name);
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'team_id', v_team.id,
            'name', v_team.name,
            'initial_budget', v_team.initial_budget,
            'remaining_balance', v_team.remaining_balance
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Unique constraint violation occurred.'
        );
    END IF;
END;
$$;

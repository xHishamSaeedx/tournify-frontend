-- =====================================================
-- COMPLETE SECURITY SETUP FOR PLAYERS TABLE
-- =====================================================

-- 1. Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies
-- Users can only view their own player record
CREATE POLICY "Users can view own player data" ON players
    FOR SELECT
    USING (auth.uid() = player_id);

-- Users can insert their own player record
CREATE POLICY "Users can insert own player data" ON players
    FOR INSERT
    WITH CHECK (auth.uid() = player_id);

-- Users can update their own player record
CREATE POLICY "Users can update own player data" ON players
    FOR UPDATE
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Users can delete their own player record (optional)
CREATE POLICY "Users can delete own player data" ON players
    FOR DELETE
    USING (auth.uid() = player_id);

-- 3. Additional Security Constraints
-- Ensure player_id cannot be null
ALTER TABLE players ALTER COLUMN player_id SET NOT NULL;

-- Add check constraint for DOB (must be in the past)
ALTER TABLE players ADD CONSTRAINT check_dob_past 
    CHECK (DOB <= CURRENT_DATE);

-- Add check constraint for display_name (must not be empty)
ALTER TABLE players ADD CONSTRAINT check_display_name_not_empty 
    CHECK (display_name != '' AND display_name IS NOT NULL);

-- Add check constraint for username (must not be empty)
ALTER TABLE players ADD CONSTRAINT check_username_not_empty 
    CHECK (username != '' AND username IS NOT NULL);

-- Add check constraint for valo_id (must not be empty)
ALTER TABLE players ADD CONSTRAINT check_valo_id_not_empty 
    CHECK (valo_id != '' AND valo_id IS NOT NULL);

-- Add check constraint for VPA (must not be empty)
ALTER TABLE players ADD CONSTRAINT check_vpa_not_empty 
    CHECK (VPA != '' AND VPA IS NOT NULL);

-- 4. Optional: Admin Policy (uncomment if you have admin users)
-- CREATE POLICY "Admins have full access" ON players
--     FOR ALL
--     USING (auth.jwt() ->> 'role' = 'admin_role');

-- 5. Optional: Service Role Policy (for backend operations)
-- CREATE POLICY "Service role has full access" ON players
--     FOR ALL
--     USING (auth.role() = 'service_role');

-- 6. Create indexes for better performance
CREATE INDEX idx_players_player_id ON players(player_id);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_valo_id ON players(valo_id);

-- 7. Optional: Function to validate Valorant ID format
CREATE OR REPLACE FUNCTION validate_valorant_id(valo_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation: should contain # symbol
    RETURN valo_id LIKE '%#%' AND length(valo_id) >= 3;
END;
$$ LANGUAGE plpgsql;

-- Add constraint using the function (optional)
-- ALTER TABLE players ADD CONSTRAINT check_valorant_id_format 
--     CHECK (validate_valorant_id(valo_id));

-- 8. Optional: Function to get player by auth user
CREATE OR REPLACE FUNCTION get_current_player()
RETURNS TABLE (
    player_id UUID,
    display_name TEXT,
    username TEXT,
    DOB DATE,
    valo_id TEXT,
    VPA TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.player_id, p.display_name, p.username, p.DOB, p.valo_id, p.VPA, p.created_at
    FROM players p
    WHERE p.player_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_player() TO authenticated; 
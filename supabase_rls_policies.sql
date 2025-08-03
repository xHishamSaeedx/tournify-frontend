-- Enable Row Level Security on the players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own player record
CREATE POLICY "Users can view own player data" ON players
    FOR SELECT
    USING (auth.uid() = player_id);

-- Policy: Users can insert their own player record
CREATE POLICY "Users can insert own player data" ON players
    FOR INSERT
    WITH CHECK (auth.uid() = player_id);

-- Policy: Users can update their own player record
CREATE POLICY "Users can update own player data" ON players
    FOR UPDATE
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Policy: Users can delete their own player record (optional - remove if you don't want deletion)
CREATE POLICY "Users can delete own player data" ON players
    FOR DELETE
    USING (auth.uid() = player_id);

-- Optional: Admin policy for full access (if you have admin users)
-- Replace 'admin_role' with your actual admin role name
-- CREATE POLICY "Admins have full access" ON players
--     FOR ALL
--     USING (auth.jwt() ->> 'role' = 'admin_role'); 
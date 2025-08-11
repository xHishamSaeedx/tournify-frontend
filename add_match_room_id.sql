-- Add match_room_id column to tournaments table
-- This field will store Discord server IDs or other match room identifiers

ALTER TABLE tournaments 
ADD COLUMN match_room_id TEXT;

-- Add comment to document the field
COMMENT ON COLUMN tournaments.match_room_id IS 'Discord server ID or other match room identifier for tournament participants';

-- Create an index for better query performance
CREATE INDEX idx_tournaments_match_room_id ON tournaments(match_room_id);

-- Update RLS policies to allow access to match_room_id
-- (This assumes you have RLS enabled on the tournaments table)

-- Grant access to authenticated users to read match_room_id
-- This allows players to see the match room ID for tournaments they're participating in
-- and hosts to manage the match room ID for their tournaments

-- Note: You may need to adjust these policies based on your existing RLS setup
-- and security requirements

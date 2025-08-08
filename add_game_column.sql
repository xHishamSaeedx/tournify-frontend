-- Add game column to user_roles table
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS game TEXT;

-- Add game column to host_applications table
ALTER TABLE host_applications ADD COLUMN IF NOT EXISTS game TEXT;

-- Create index for better performance when filtering by game
CREATE INDEX IF NOT EXISTS idx_user_roles_game ON user_roles(game);
CREATE INDEX IF NOT EXISTS idx_host_applications_game ON host_applications(game);

-- Add comment to describe the game column
COMMENT ON COLUMN user_roles.game IS 'The game this user is a host for (e.g., valorant)';
COMMENT ON COLUMN host_applications.game IS 'The game this application is for (e.g., valorant)';

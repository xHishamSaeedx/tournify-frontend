# Game-Specific Host Dashboard Implementation

## Overview

The game-specific host dashboard feature ensures that hosts can only access the host dashboard for games they have been granted privileges for. This provides better security and organization by tying host access to specific games.

## How It Works

### 1. URL Structure

- **Old**: `/host-dashboard` (generic host dashboard)
- **New**: `/:game/host-dashboard` (game-specific host dashboard)
  - Example: `/valorant/host-dashboard` for Valorant tournaments

### 2. Access Control Logic

The system checks access in the following order:

1. **Admin Access**: Admins have access to all game dashboards
2. **Host Access**: Hosts must have the specific game in their `game` column (JSONB array) in the `user_roles` table
3. **Access Denied**: If neither admin nor host with game access, show access denied message

### 3. Database Schema

The `user_roles` table structure:

```sql
user_id: UUID
user_role: TEXT ('admin', 'host', 'player')
game: JSONB (array of games the host has access to)
```

Example:

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_role": "host",
  "game": ["valorant", "csgo"]
}
```

### 4. API Endpoints

#### Check Host Access for Game

```
GET /api/user-roles/:userId/host-for-game/:game
```

Response:

```json
{
  "isHost": true,
  "games": ["valorant", "csgo"],
  "requestedGame": "valorant"
}
```

### 5. Components

#### GameHostDashboard Component

- **Location**: `src/components/GameHostDashboard.jsx`
- **Features**:
  - Checks user access for specific game
  - Shows loading state while checking access
  - Shows access denied message if no access
  - Filters tournaments by game
  - Creates game-specific tournaments

#### Updated Components

- **ValorantHeroSection**: Links to `/valorant/host-dashboard`
- **CreateTournamentForm**: Accepts `game` prop and includes it in tournament data
- **App.jsx**: Added new route `/:game/host-dashboard`

### 6. User Experience Flow

1. **From Valorant Page**: Click "Create Tournament" or "My Created Tournaments"
2. **Access Check**: System verifies if user is admin or host with Valorant access
3. **Dashboard Access**: If authorized, shows Valorant-specific host dashboard
4. **Tournament Creation**: Creates tournaments with `game: "valorant"` field
5. **Tournament Filtering**: Only shows Valorant tournaments in the list

### 7. Error Handling

#### Access Denied

- Shows clear message explaining why access is denied
- Provides button to go back to game page
- Suggests contacting administrator

#### Loading States

- Shows loading message while checking access
- Prevents premature access to dashboard features

### 8. Security Benefits

1. **Game Isolation**: Hosts can only manage tournaments for games they're authorized for
2. **Admin Override**: Admins maintain full access to all games
3. **Clear Access Control**: Explicit checking of game permissions
4. **Audit Trail**: All access attempts are logged

### 9. Implementation Details

#### Frontend Changes

- New `GameHostDashboard` component
- Updated routing in `App.jsx`
- Enhanced `CreateTournamentForm` with game support
- Updated navigation in `ValorantHeroSection`

#### Backend Support

- Existing `/api/user-roles/:userId/host-for-game/:game` endpoint
- JSONB game column in user_roles table
- Proper error handling for access checks

### 10. Future Extensibility

This implementation can easily be extended for other games:

1. **Add New Game**: Create new game page (e.g., `/csgo`)
2. **Update Navigation**: Link to `/csgo/host-dashboard`
3. **Grant Access**: Add "csgo" to host's game array in database
4. **Automatic Support**: No additional code changes needed

### 11. Testing

To test the implementation:

1. **Admin Access**: Login as admin, navigate to `/valorant/host-dashboard`
2. **Host Access**: Login as host with Valorant access, navigate to `/valorant/host-dashboard`
3. **No Access**: Login as host without Valorant access, should see access denied
4. **Player Access**: Login as player, should be redirected or see access denied

### 12. CSS Styling

Added new styles for:

- `.access-denied-message`: Styling for access denied state
- `.loading-message`: Styling for loading state
- Responsive design for all new components

## Conclusion

The game-specific host dashboard provides a secure, organized way to manage tournament hosting privileges on a per-game basis. It maintains backward compatibility while adding the new security layer and improves the overall user experience by providing game-specific contexts.

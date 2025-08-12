# Tournament Access Control

## Overview

The tournament access control system ensures that only authorized users can view tournament room pages. This prevents users who are not participating in a tournament from accessing sensitive tournament information.

## Access Rules

### Who Can Access Tournament Rooms

1. **Tournament Participants** - Users who have joined the tournament
2. **Tournament Host** - The user who created the tournament
3. **Administrators** - Users with admin role

### Who Cannot Access Tournament Rooms

- Regular users who are not participating in the tournament
- Users who are not logged in (redirected to login page)

## Implementation

### Components

- **TournamentAccessControl** - Wrapper component that checks access permissions
- **TournamentRoom** - The actual tournament room component (only rendered if access is granted)

### Access Control Flow

1. User navigates to `/tournament/:tournamentId`
2. `ProtectedRoute` ensures user is authenticated
3. `TournamentAccessControl` checks:
   - User's role (admin, host, player)
   - Tournament participation status
   - Whether user is the tournament host
4. If access is denied, shows access denied page
5. If access is granted, renders `TournamentRoom` component

### API Endpoints Used

- `GET /api/tournaments/:id` - Fetch tournament details and host information
- `GET /api/tournaments/:id/participation` - Check if user is a participant

### User Roles

The system checks the following user roles from the `user_roles` table:
- `admin` - Full access to all tournaments
- `host` - Can access tournaments they created
- `player` - Can access tournaments they've joined

## Error Handling

- **Network Errors** - Shows access denied if API calls fail
- **Tournament Not Found** - Shows access denied
- **Unauthorized** - Redirects to login page

## UI/UX

### Access Denied Page

- Clean, informative error message
- Action buttons to navigate to browse tournaments or my tournaments
- Consistent styling with the rest of the application

### Loading States

- Shows loading spinner while checking access
- Prevents flash of content before access check completes

## Security Considerations

- All access checks happen on both frontend and backend
- API endpoints are protected with authentication middleware
- User roles are verified against the database
- Tournament participation is verified against the participants table

## Testing

To test the access control:

1. Create a tournament as one user
2. Try to access the tournament room as a different user (should be denied)
3. Join the tournament as the different user (should now have access)
4. Access as an admin (should always have access)
5. Access as the tournament host (should always have access)

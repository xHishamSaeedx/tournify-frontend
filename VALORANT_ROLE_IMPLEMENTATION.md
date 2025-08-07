# Valorant Role-Based Dashboard Implementation

This document describes the implementation of role-based functionality for the Valorant game page using Supabase user roles.

## Overview

The Valorant page now includes role-based dashboards that show different options based on the user's role in the `user_roles` table. The implementation uses React contexts, hooks, and components to provide a seamless user experience.

## Database Schema

### user_roles Table

```sql
CREATE TABLE user_roles (
  user_email TEXT,
  user_id TEXT PRIMARY KEY,
  user_role TEXT CHECK (user_role IN ('host', 'player', 'admin'))
);
```

## Role Types

### 1. Player/Non-signed in User

- **Browse Tournaments**: View available tournaments
- **Joined Tournaments**: See tournaments they've joined
- **Claim Match Win Money**: Claim winnings from completed tournaments
- **Apply for Host**: Submit application to become a host
- **Show Credits**: View current credit balance

### 2. Host

- **Create Tournaments**: Form to create new tournaments
- **My Created Tournaments**: Manage tournaments they've created

### 3. Admin

- **Browse All Tournaments**: View and manage all tournaments
- **Create Hosts**: Promote users to host or admin roles

## Implementation Details

### Contexts

#### UserRolesContext (`src/contexts/UserRolesContext.jsx`)

- Manages user role state
- Fetches role from Supabase on user authentication
- Provides role-based helper functions

### Components

#### PlayerDashboard (`src/components/PlayerDashboard.jsx`)

- Tabbed interface for player functionality
- Includes forms for host application
- Credit display and tournament browsing

#### HostDashboard (`src/components/HostDashboard.jsx`)

- Tournament creation form
- Tournament management interface
- Status tracking for created tournaments

#### AdminDashboard (`src/components/AdminDashboard.jsx`)

- Administrative controls
- Host management
- Tournament oversight

### Utility Functions (`src/utils/userRoles.js`)

#### `getUserRole(userId)`

Fetches user role from Supabase

#### `setUserRole(userId, userEmail, userRole)`

Creates or updates user role

#### `removeUserRole(userId)`

Removes user role

#### `getAllHosts()`

Fetches all hosts and admins

#### `hasRole(userRole, requiredRole)`

Checks if user has specific role permissions

## Styling

The implementation includes comprehensive CSS styling in `src/styles/dashboard.css` with:

- Responsive design
- Dark theme matching Valorant aesthetic
- Smooth animations and transitions
- Role-specific color coding

## Usage

### Setting up User Roles

1. **Create a new host:**

```javascript
import { setUserRole } from "../utils/userRoles";

const result = await setUserRole(userId, userEmail, "host");
```

2. **Check user permissions:**

```javascript
import { hasRole } from "../utils/userRoles";

const canCreateTournaments = hasRole(userRole, "host");
```

### Adding New Features

To add new role-based features:

1. Update the appropriate dashboard component
2. Add new utility functions if needed
3. Update CSS styles for new elements
4. Test with different user roles

## Security Considerations

- Role checks are performed on both client and server side
- User authentication is required for role-based actions
- Form validation prevents unauthorized submissions

## Future Enhancements

- Real-time role updates using Supabase subscriptions
- Advanced tournament management features
- Integration with payment systems for prize pools
- Tournament analytics and reporting
- Email notifications for role changes

## Testing

Test the implementation with:

1. Non-authenticated users (should see player dashboard)
2. Players (should see player dashboard with all features)
3. Hosts (should see host dashboard)
4. Admins (should see admin dashboard)

Each role should only see the appropriate options and functionality.

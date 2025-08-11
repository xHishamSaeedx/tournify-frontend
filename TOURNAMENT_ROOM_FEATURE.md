# Tournament Room Feature

## Overview
The Tournament Room feature provides players with a dedicated page to view tournament details, countdown timer, match room information, and other essential tournament data. This page is accessible through the "View Details" button in the "My Tournaments" page.

## Features Implemented

### 1. Tournament Room Page (`/tournament/:tournamentId`)
- **Route**: `/tournament/:tournamentId` (protected route)
- **Component**: `TournamentRoom.jsx`
- **Styling**: `TournamentRoom.css`

### 2. Key Features

#### Countdown Timer
- Real-time countdown timer showing days, hours, minutes, and seconds until match start
- Dynamic status indicators:
  - **Live**: Tournament is currently running (pulsing animation)
  - **Starting**: Tournament starts within 5 minutes (orange theme)
  - **Preparing**: Tournament starts within 15 minutes (blue theme)
  - **Waiting**: Tournament starts later (gray theme)

#### Match Room Information
- **Match Room ID**: Discord server ID or other room identifier
- **Copy to Clipboard**: One-click copying of room ID
- **Room Status**: Shows if room is available or pending
- **Game Type**: Displays game mode (Deathmatch)
- **Server Region**: Tournament server region
- **Platform**: Supported platforms

#### Tournament Details
- **Prize Pool**: Total prize money with formatting
- **Participants**: Current players vs capacity
- **Entry Fee**: Tournament entry cost
- **Created Date**: When tournament was created

#### Prize Distribution
- Visual breakdown of prize distribution:
  - 1st Place: 60% of prize pool
  - 2nd Place: 30% of prize pool
  - 3rd Place: 10% of prize pool

#### Action Buttons
- **Join Discord Server**: Direct link to Discord server (if room ID available)
- **Back to My Tournaments**: Navigation back to joined tournaments list

### 3. Navigation Integration
- Updated `JoinedTournaments.jsx` to navigate to tournament room
- Added route in `App.jsx` with proper protection
- Back button navigation to "My Tournaments" page

### 4. Database Schema Update
- Added `match_room_id` field to tournaments table
- SQL script: `add_match_room_id.sql`
- Includes index for performance optimization

## Technical Implementation

### Components Created
1. **TournamentRoom.jsx**: Main component with all tournament room functionality
2. **TournamentRoom.css**: Comprehensive styling with responsive design

### API Integration
- Uses existing `api.getTournament(tournamentId)` for tournament data
- Uses existing `api.getParticipationStatus(tournamentId)` for participation check
- Handles loading states and error scenarios

### State Management
- Tournament data state
- Countdown timer state (days, hours, minutes, seconds)
- Loading and error states
- Participation status

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive countdown timer sizing
- Touch-friendly buttons and interactions

## Usage

### For Players
1. Navigate to "My Tournaments" page
2. Click "View Details" on any joined tournament
3. View tournament room with countdown timer and match information
4. Copy match room ID or join Discord server
5. Monitor countdown until tournament starts

### For Hosts
1. Set match room ID in tournament settings (backend implementation needed)
2. Players can view the room ID in the tournament room
3. Monitor participant access to tournament information

## Security Considerations
- Protected route requiring authentication
- Participation status verification
- Proper error handling for unauthorized access
- Secure API calls with authentication headers

## Future Enhancements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Match Results**: Display match results and standings
3. **Chat Integration**: In-app chat functionality
4. **Notifications**: Push notifications for countdown milestones
5. **Streaming Integration**: Twitch/YouTube stream links
6. **Match History**: Previous match results and statistics

## Database Migration
Run the following SQL script to add the required field:
```sql
-- Execute add_match_room_id.sql
ALTER TABLE tournaments ADD COLUMN match_room_id TEXT;
CREATE INDEX idx_tournaments_match_room_id ON tournaments(match_room_id);
```

## Styling Features
- Glassmorphism design with backdrop blur effects
- Gradient backgrounds and animations
- Smooth hover transitions
- Pulsing animations for live tournaments
- Responsive grid layouts
- Modern typography and spacing
- Color-coded status indicators

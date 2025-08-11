# Tournament Join Confirmation Feature

## Overview

This feature adds a confirmation popup when users attempt to join a tournament, warning them about cancellation fees and restrictions.

## Features Implemented

### 1. Confirmation Modal Component

- **File**: `src/components/ConfirmationModal.jsx`
- **CSS**: `src/components/ConfirmationModal.css`
- **Test**: `src/components/ConfirmationModal.test.jsx`

A reusable modal component that displays:

- Warning message about cancellation fees
- 50% cancellation fee information
- 15-minute cancellation restriction
- Confirm/Cancel buttons

### 2. Frontend Changes

#### TournamentBrowser Component (`src/components/TournamentBrowser.jsx`)

- Added confirmation modal state management for join, leave, and penalty warnings
- Modified `handleJoinTournament` to show confirmation first
- Added `handleConfirmJoinTournament` for actual joining logic
- Modified `handleLeaveTournament` to check time restrictions and show appropriate modal
- Added `handleConfirmLeaveTournament` for actual leaving logic
- Added penalty warning modal for restricted cancellation times
- Updated error handling for new backend responses

#### JoinedTournaments Component (`src/components/JoinedTournaments.jsx`)

- Added confirmation modal state management for leave functionality and penalty warnings
- Modified `handleLeaveTournament` to check time restrictions and show appropriate modal
- Added `handleConfirmLeaveTournament` for actual leaving logic
- Added penalty warning modal for restricted cancellation times
- Updated error handling to support new backend error messages
- Enhanced user feedback for cancellation restrictions

### 3. Backend Changes

#### Tournament Leave Endpoint (`tournify-backend/src/routes/tournaments.js`)

- Added 15-minute cancellation restriction check
- Implemented 50% cancellation fee calculation
- Enhanced error messages for different scenarios
- Added refund amount to response

## User Experience

### When Joining a Tournament:

1. User clicks "Join Tournament"
2. Confirmation modal appears with warning message:

   ```
   ⚠️ Important: By joining this tournament, you agree to the following terms:

   • If you leave the tournament, there will be a 50% cancellation fee
   • You will only receive half of your credits back upon cancellation
   • No cancellations are allowed within 15 minutes of the match start time

   Are you sure you want to join this tournament?
   ```

3. User can either:
   - Click "Join Tournament" to proceed
   - Click "Cancel" to abort

### When Leaving a Tournament:

1. User clicks "Leave Tournament"
2. If within 15 minutes of match start: **Penalty Warning Modal** appears showing:
   - Tournament name
   - Time remaining until match start
   - **🚨 IMPORTANT**: Warning about penalties for not joining
   - User must click "I Understand" to acknowledge
3. If more than 15 minutes before match start: Confirmation modal appears showing:
   - Tournament name
   - 50% refund amount (calculated from joining fee)
   - Warning that action cannot be undone
   - User can choose "Leave Tournament" or "Stay in Tournament"
4. If confirmed: Success message shows refund amount
5. 50% of joining fee is refunded to user's account

## Technical Implementation

### Confirmation Modal Features:

- **Backdrop click to close**: Clicking outside modal closes it
- **Close button**: × button in top-right corner
- **Keyboard accessibility**: Proper focus management
- **Responsive design**: Works on mobile and desktop
- **Customizable**: Supports custom button text and CSS classes
- **Dynamic content**: Shows tournament-specific information (name, refund amount)
- **Time-based logic**: Different behavior based on match start time proximity

### Backend Logic:

- **Time validation**: Checks if match starts within 15 minutes
- **Fee calculation**: 50% of original joining fee
- **Error handling**: Specific error messages for different scenarios
- **Refund tracking**: Logs refund amounts (TODO: implement actual credit system)

### Error Messages:

- "Tournament not found"
- "You are not registered for this tournament"

### Warning Messages:

- **Penalty Warning Modal**: Professional popup for restricted cancellation times
- Shows tournament name, time remaining, and penalty consequences
- Requires user acknowledgment before closing

## Future Enhancements

### Credit System Integration:

- Implement actual user credit balance management
- Add credit transaction history
- Create admin interface for credit management

### Additional Features:

- Email notifications for refunds
- Tournament cancellation policies per tournament
- Refund processing status tracking

## Testing

The implementation includes comprehensive tests for the ConfirmationModal component:

- Rendering behavior
- User interactions
- Custom props handling
- Accessibility features

## Files Modified

### Frontend:

- `src/components/ConfirmationModal.jsx` (new)
- `src/components/ConfirmationModal.css` (new)
- `src/components/ConfirmationModal.test.jsx` (new)
- `src/components/TournamentBrowser.jsx` (modified - added leave confirmation)
- `src/components/JoinedTournaments.jsx` (modified - added leave confirmation)

### Backend:

- `tournify-backend/src/routes/tournaments.js` (modified)

## Usage

The confirmation modal is automatically triggered when users attempt to join tournaments. No additional configuration is required. The modal provides clear information about cancellation policies and ensures users make informed decisions before joining tournaments.

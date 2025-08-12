# Credit System Implementation

## Overview

The credit system has been successfully implemented in Tournify, allowing players to use credits for tournament entry fees and receive credits as prizes. The system includes both backend API endpoints and frontend components.

## Database Schema

The credit system uses two main tables:

### `user_wallets` Table
- `user_id` (UUID, Primary Key) - References `auth.users.id`
- `created_at` (timestamptz) - When the wallet was created
- `last_updated` (timestamptz) - Last time the wallet was updated
- `balance` (int8) - Current credit balance

### `wallet_transactions` Table
- `id` (UUID, Primary Key) - Unique transaction ID
- `user_id` (UUID) - References `auth.users.id`
- `created_at` (timestamptz) - When the transaction occurred
- `type` (text) - Transaction type (credit, debit, tournament_entry, tournament_prize, refund)
- `amount` (int8) - Transaction amount
- `description` (text) - Human-readable description
- `ref_id` (UUID) - Reference to related entity (e.g., tournament ID)

## Backend Implementation

### New Routes (`/api/wallets`)

1. **GET `/api/wallets/balance/:userId`**
   - Get user's wallet balance
   - Creates wallet if it doesn't exist

2. **GET `/api/wallets/transactions/:userId`**
   - Get user's transaction history with pagination
   - Query parameters: `page`, `limit`

3. **POST `/api/wallets/transactions`**
   - Create a new transaction
   - Body: `{ user_id, type, amount, description, ref_id }`

4. **POST `/api/wallets/tournament-entry`**
   - Process tournament entry fee
   - Body: `{ user_id, tournament_id, entry_fee }`
   - Checks balance before processing

5. **POST `/api/wallets/tournament-prize`**
   - Process tournament prize distribution
   - Body: `{ user_id, tournament_id, prize_amount, position }`

6. **POST `/api/wallets/add-credits`**
   - Add credits to wallet (admin function)
   - Body: `{ user_id, amount, description }`

### Transaction Types

- `credit` - General credit addition
- `debit` - General credit deduction
- `tournament_entry` - Tournament entry fee
- `tournament_prize` - Tournament prize winnings
- `refund` - Refund transactions

## Frontend Implementation

### New Components

1. **Wallet Component** (`/src/components/Wallet.jsx`)
   - Displays current balance
   - Shows transaction history with pagination
   - Allows adding credits (for testing)
   - Modern UI with dark theme

2. **Updated Tournament Browser**
   - Integrates credit system with tournament joining
   - Checks balance before joining tournaments
   - Shows appropriate error messages for insufficient credits

### New API Functions

Added to `/src/utils/api.js`:
- `getWalletBalance(userId)`
- `getWalletTransactions(userId, page, limit)`
- `createTransaction(data)`
- `processTournamentEntry(data)`
- `processTournamentPrize(data)`
- `addCredits(data)`

### Navigation

- Added "Wallet" link to navbar dropdown menu
- Accessible via `/wallet` route
- Protected route requiring authentication

## Usage

### For Players

1. **Access Wallet**: Click on profile dropdown → "Wallet"
2. **View Balance**: Current balance is displayed prominently
3. **Join Tournaments**: Credits are automatically deducted when joining tournaments with entry fees
4. **View Transactions**: Complete transaction history with details
5. **Add Credits**: Use the "Add Credits" button for testing (in production, this would be admin-only)

### For Tournament Hosts

1. **Set Entry Fees**: When creating tournaments, specify the entry fee in credits
2. **Prize Distribution**: Credits are automatically distributed to winners

### For Admins

1. **Add Credits**: Use the API endpoint to add credits to user wallets
2. **Monitor Transactions**: View all transaction history through the API

## Security Features

1. **Balance Validation**: Prevents negative balances
2. **Transaction Logging**: All transactions are logged with timestamps
3. **Authentication Required**: All wallet operations require user authentication
4. **Reference Tracking**: Transactions are linked to specific tournaments

## Error Handling

The system handles various error scenarios:
- Insufficient balance when joining tournaments
- Invalid transaction amounts
- Missing user wallets (auto-created)
- Network errors with appropriate user feedback

## Testing

To test the credit system:

1. **Add Credits**: Use the "Add Credits" button in the wallet
2. **Join Tournament**: Try joining a tournament with an entry fee
3. **View Transactions**: Check the transaction history
4. **Test Insufficient Balance**: Try joining a tournament without enough credits

## Future Enhancements

Potential improvements for the credit system:
1. **Payment Gateway Integration**: Real money to credits conversion
2. **Credit Packages**: Predefined credit amounts for purchase
3. **Referral System**: Earn credits by referring friends
4. **Achievement Rewards**: Earn credits for completing achievements
5. **Admin Dashboard**: Web interface for credit management
6. **Transaction Notifications**: Email/SMS notifications for transactions

## Database Setup

To set up the credit system tables, run the following SQL:

```sql
-- Create user_wallets table
CREATE TABLE user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    balance BIGINT DEFAULT 0
);

-- Create wallet_transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    ref_id UUID
);

-- Add indexes for performance
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);

-- Enable Row Level Security
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own wallet" ON user_wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON user_wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON user_wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## API Documentation

### Wallet Balance
```bash
GET /api/wallets/balance/{userId}
Authorization: Bearer {token}
```

### Transaction History
```bash
GET /api/wallets/transactions/{userId}?page=1&limit=20
Authorization: Bearer {token}
```

### Process Tournament Entry
```bash
POST /api/wallets/tournament-entry
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": "uuid",
  "tournament_id": "uuid",
  "entry_fee": 100
}
```

### Add Credits
```bash
POST /api/wallets/add-credits
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": "uuid",
  "amount": 500,
  "description": "Initial credits"
}
```

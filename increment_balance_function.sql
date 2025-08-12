-- Function to increment wallet balance safely
CREATE OR REPLACE FUNCTION increment_balance(user_id_param UUID, amount_param BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance BIGINT;
    new_balance BIGINT;
BEGIN
    -- Get current balance
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM user_wallets
    WHERE user_id = user_id_param;
    
    -- If no wallet exists, create one with the amount
    IF current_balance IS NULL THEN
        INSERT INTO user_wallets (user_id, balance, created_at, last_updated)
        VALUES (user_id_param, amount_param, NOW(), NOW());
        RETURN amount_param;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance + amount_param;
    
    -- Ensure balance doesn't go negative (for debits)
    IF new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient balance: current balance is %, trying to deduct %', current_balance, ABS(amount_param);
    END IF;
    
    -- Update the wallet
    UPDATE user_wallets
    SET balance = new_balance, last_updated = NOW()
    WHERE user_id = user_id_param;
    
    RETURN new_balance;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_balance(UUID, BIGINT) TO authenticated;

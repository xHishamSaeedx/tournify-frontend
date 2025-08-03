# Supabase Row Level Security Setup

This document explains how to set up Row Level Security (RLS) for your players table in Supabase.

## Quick Setup

### Option 1: Basic RLS (Recommended for most cases)
Run the SQL from `supabase_rls_policies.sql` in your Supabase SQL Editor.

### Option 2: Complete Security Setup
Run the SQL from `supabase_complete_security.sql` for comprehensive security including constraints and indexes.

## What These Policies Do

### 🔒 **Security Features:**
- **User Isolation**: Users can only access their own player data
- **Authentication Required**: All operations require valid authentication
- **Data Integrity**: Additional constraints prevent invalid data
- **Performance**: Indexes on frequently queried columns

### 📋 **Policies Created:**

1. **SELECT Policy**: Users can only view their own player record
2. **INSERT Policy**: Users can only create their own player record
3. **UPDATE Policy**: Users can only update their own player record
4. **DELETE Policy**: Users can only delete their own player record

### 🛡️ **Additional Security Measures:**

- **NOT NULL constraints** on all required fields
- **Check constraints** for data validation
- **Date validation** (DOB must be in the past)
- **Empty string prevention** for text fields
- **Performance indexes** on key columns

## How to Apply

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the SQL
1. Copy the contents of either SQL file
2. Paste into the SQL Editor
3. Click **Run** to execute

### Step 3: Verify Setup
1. Go to **Authentication > Policies** in your dashboard
2. You should see the new policies listed for the `players` table

## Testing the Security

### ✅ **What Should Work:**
- Authenticated users can create/read/update/delete their own player data
- Your React form should work normally for authenticated users

### ❌ **What Should Be Blocked:**
- Unauthenticated users cannot access any player data
- Users cannot access other users' player data
- Users cannot create records for other users

## Optional Customizations

### Admin Access
If you need admin users with full access, uncomment and modify the admin policy:

```sql
CREATE POLICY "Admins have full access" ON players
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'your_admin_role');
```

### Service Role Access
For backend operations, uncomment the service role policy:

```sql
CREATE POLICY "Service role has full access" ON players
    FOR ALL
    USING (auth.role() = 'service_role');
```

### Valorant ID Validation
To enable Valorant ID format validation, uncomment the constraint:

```sql
ALTER TABLE players ADD CONSTRAINT check_valorant_id_format 
    CHECK (validate_valorant_id(valo_id));
```

## Troubleshooting

### Common Issues:

1. **"Policy violation" errors**: Ensure the user is authenticated and trying to access their own data
2. **"Column not found" errors**: Make sure your table structure matches the expected schema
3. **Performance issues**: The indexes should help, but monitor query performance

### Debugging:
- Check the **Logs** section in Supabase dashboard for detailed error messages
- Use the **Table Editor** to verify your table structure
- Test policies using the **SQL Editor** with different user contexts

## Security Best Practices

1. **Always use RLS** for user-specific data
2. **Test thoroughly** with different user scenarios
3. **Monitor logs** for suspicious activity
4. **Regular audits** of your security policies
5. **Keep policies simple** and focused on specific use cases

## Next Steps

After applying these policies:
1. Test your React form to ensure it still works
2. Monitor for any errors in the browser console
3. Consider adding additional validation in your frontend code
4. Set up monitoring for security events if needed 
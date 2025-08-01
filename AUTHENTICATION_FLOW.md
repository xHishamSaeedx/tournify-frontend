# 🔐 Tournify Authentication Flow

This document explains the complete authentication flow between the frontend and backend of the Tournify application.

## Overview

The authentication system uses **Google OAuth** via **Supabase** for initial authentication, then verifies tokens with the backend for additional security and user management.

## 🔄 Complete Flow

### 1. **User Login (Frontend)**
```javascript
// User clicks "Sign in with Google" in Login.jsx
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  });
};
```

**What happens:**
- User is redirected to Google OAuth
- User authenticates with Google
- Google redirects back to your app
- Supabase creates a JWT session token
- User state is updated in AuthContext

### 2. **Automatic Token Verification (AuthHandler.jsx)**
```javascript
// AuthHandler automatically triggers when user state changes
useEffect(() => {
  const sendTokenToBackend = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session.access_token;
    
    // Send to backend for verification
    const res = await fetch('http://localhost:3001/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  };
}, [user]);
```

**What happens:**
- AuthHandler detects user login
- Gets JWT token from Supabase session
- Sends token to backend for verification
- Shows verification status to user
- Stores backend user data in localStorage

### 3. **Backend Token Verification (server.js)**
```javascript
app.post('/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // Verify with Supabase
  const response = await fetch('https://supabase.co/auth/v1/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Create/update user in database
  // Return verified user data
});
```

**What happens:**
- Receives JWT token from frontend
- Verifies token with Supabase auth API
- Creates or updates user in your database
- Returns verified user data to frontend

### 4. **Protected API Calls (utils/api.js)**
```javascript
// All subsequent API calls use authenticated headers
export const authenticatedApiCall = async (endpoint, options = {}) => {
  const headers = await getAuthHeaders(); // Gets fresh token
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
};
```

**What happens:**
- Gets fresh token from Supabase session
- Includes token in Authorization header
- Makes authenticated request to backend
- Handles errors consistently

### 5. **Backend Route Protection (middleware/auth.js)**
```javascript
// Protected routes use middleware
router.post("/", verifyToken, ensureUserExists, async (req, res) => {
  // req.user contains verified user data
  const tournamentData = { ...req.body, created_by: req.user.id };
});
```

**What happens:**
- Middleware verifies token with Supabase
- Ensures user exists in database
- Attaches user data to request object
- Route handler can access user info

## 🛡️ Security Features

### **Token Verification**
- JWT tokens are verified with Supabase on every request
- Tokens expire automatically (handled by Supabase)
- Invalid tokens are rejected immediately

### **User Management**
- Users are automatically created in your database on first login
- User data is kept in sync between Supabase and your database
- User permissions are checked on protected routes

### **Error Handling**
- Comprehensive error messages for debugging
- Graceful fallbacks when backend is unavailable
- User-friendly error notifications

## 📁 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Google OAuth login
│   │   ├── AuthHandler.jsx        # Token verification
│   │   ├── ProtectedRoute.jsx     # Route protection
│   │   └── TournamentList.jsx     # Example API usage
│   ├── contexts/
│   │   └── AuthContext.jsx        # User state management
│   ├── utils/
│   │   └── api.js                 # Authenticated API calls
│   └── supabaseClient.js          # Supabase configuration

backend/
├── server.js                      # Main server with auth endpoint
├── middleware/
│   └── auth.js                    # Token verification middleware
├── routes/
│   └── tournaments.js             # Protected routes example
└── config/
    └── supabase.js                # Backend Supabase config
```

## 🔧 Environment Variables

### **Frontend (.env)**
```env
VITE_SUPABASE_URL=https://jhbghpsjzcndqxlhryvz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **Backend (.env)**
```env
SUPABASE_URL=https://jhbghpsjzcndqxlhryvz.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Usage Examples

### **Making Authenticated API Calls**
```javascript
import api from '../utils/api';

// Get all tournaments
const tournaments = await api.getTournaments();

// Create a tournament
const newTournament = await api.createTournament({
  name: "Valorant Championship",
  description: "Annual tournament",
  max_participants: 32
});

// Delete a tournament (only if you created it)
await api.deleteTournament(tournamentId);
```

### **Protected Routes**
```javascript
// Frontend: Protect routes
<Route path="/profile" element={
  <ProtectedRoute>
    <UserProfile />
  </ProtectedRoute>
} />

// Backend: Protect endpoints
router.post("/", verifyToken, ensureUserExists, async (req, res) => {
  // Only authenticated users can access
  // req.user contains verified user data
});
```

## 🐛 Troubleshooting

### **Common Issues**

1. **"No token provided"**
   - User not logged in
   - Token expired (refresh page)
   - AuthHandler not working

2. **"Invalid token"**
   - Token corrupted
   - Supabase configuration issue
   - Network connectivity problem

3. **"Backend server offline"**
   - Backend not running
   - Wrong port/URL
   - CORS configuration issue

### **Debug Steps**

1. Check browser console for frontend errors
2. Check backend console for server errors
3. Verify Supabase configuration
4. Test token manually with Supabase API
5. Check network tab for failed requests

## 🔄 Token Lifecycle

1. **Creation**: User logs in → Supabase creates JWT
2. **Verification**: Frontend sends token to backend
3. **Validation**: Backend verifies with Supabase
4. **Usage**: Token used for all API calls
5. **Expiration**: Token expires → User must re-authenticate

## 📊 Monitoring

### **Frontend Logs**
- ✅ "Backend verification successful"
- ❌ "Error sending token to backend"
- ⚠️ "Backend server might be offline"

### **Backend Logs**
- ✅ "Token verified successfully for user: user@email.com"
- ✅ "New user created: user@email.com"
- ❌ "Token verification failed"

This authentication system provides a secure, scalable foundation for your tournament management application! 
# Tournify Authentication Setup

This guide will help you set up Google OAuth authentication with Supabase for your Tournify frontend.

## Prerequisites

1. A Supabase project
2. Google OAuth credentials

## Step 1: Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials (Client ID and Client Secret)

## Step 2: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set up the OAuth consent screen
6. Create a web application client
7. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production)

## Step 3: Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard under **Settings** > **API**.

## Step 4: Backend Integration

The `AuthHandler` component automatically sends the user's token to your backend at `http://localhost:3001/auth/verify`. Make sure your backend endpoint is set up to:

1. Receive the JWT token in the Authorization header
2. Verify the token with Supabase
3. Return user information or create a session

## Step 5: Testing

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173/login`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected back to the home page

## Features Included

- ✅ Google OAuth authentication
- ✅ Protected routes
- ✅ User profile display
- ✅ Automatic token verification with backend
- ✅ Sign out functionality
- ✅ Loading states and error handling
- ✅ Responsive design

## File Structure

```
src/
├── components/
│   ├── Login.jsx          # Login page with Google OAuth
│   ├── AuthHandler.jsx    # Handles token verification
│   ├── ProtectedRoute.jsx # Route protection component
│   └── UserProfile.jsx    # User profile display
├── contexts/
│   └── AuthContext.jsx    # Authentication state management
└── supabaseClient.js      # Supabase client configuration
```

## Troubleshooting

1. **"crypto.hash is not a function"**: This is a Node.js version compatibility issue. Try using Node.js v18 or v20.
2. **OAuth redirect errors**: Make sure your redirect URIs are correctly configured in both Supabase and Google Cloud Console.
3. **Backend connection errors**: Ensure your backend server is running and the `/auth/verify` endpoint is properly configured.

## Next Steps

1. Customize the UI styling to match your brand
2. Add additional OAuth providers (GitHub, Discord, etc.)
3. Implement user role-based access control
4. Add email verification flow
5. Set up user profile management 
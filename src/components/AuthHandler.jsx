import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabaseClient';

function AuthHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const sendTokenToBackend = async () => {
      if (!user) return;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error.message);
          return;
        }

        if (session) {
          const token = session.access_token;

          // Send token to backend for verification
          const res = await fetch('http://localhost:3001/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const result = await res.json();
          console.log('Backend response:', result);
        }
      } catch (error) {
        console.error('Error sending token to backend:', error);
        // You might want to show a user-friendly error message here
      }
    };

    sendTokenToBackend();
  }, [user]);

  return null;
}

export default AuthHandler; 
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabaseClient';

function AuthHandler() {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error'

  useEffect(() => {
    const sendTokenToBackend = async () => {
      if (!user) {
        setVerificationStatus('idle');
        return;
      }

      setVerificationStatus('verifying');

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error.message);
          setVerificationStatus('error');
          return;
        }

        if (session) {
          const token = session.access_token;

          // Send token to backend for verification
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
          }

          const result = await res.json();
          console.log('✅ Backend verification successful:', result);
          setVerificationStatus('success');

          // Store backend user data in localStorage for future use
          if (result.user) {
            localStorage.setItem('backendUserData', JSON.stringify(result.user));
          }
        }
      } catch (error) {
        console.error('❌ Error sending token to backend:', error);
        setVerificationStatus('error');
        
        // Show user-friendly error message
        if (error.message.includes('Failed to fetch')) {
          console.warn('⚠️ Backend server might be offline');
        }
      }
    };

    sendTokenToBackend();
  }, [user]);

  // Optional: Show verification status to user
  if (verificationStatus === 'verifying') {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 240, 255, 0.1)',
        border: '1px solid var(--accent)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        🔐 Verifying session...
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 70, 85, 0.1)',
        border: '1px solid var(--primary)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        ⚠️ Session verification failed
      </div>
    );
  }

  return null;
}

export default AuthHandler; 
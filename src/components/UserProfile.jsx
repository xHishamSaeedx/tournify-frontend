import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-sm mx-auto">
      <div className="flex items-center space-x-4">
        {user.user_metadata?.avatar_url && (
          <img
            className="h-12 w-12 rounded-full"
            src={user.user_metadata.avatar_url}
            alt="Profile"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default UserProfile; 
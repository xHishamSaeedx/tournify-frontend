import api from './api';

// Get user role from API
export const getUserRole = async (userId) => {
  try {
    const response = await api.getUserRoles(userId);
    
    if (response.roles && response.roles.length > 0) {
      // Get the highest priority role (admin > host > player)
      const roles = response.roles.map(r => r.role);
      
      if (roles.includes('admin')) {
        return 'admin';
      } else if (roles.includes('host')) {
        return 'host';
      } else {
        return 'player';
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

// Create or update user role - This should be done through admin API
export const setUserRole = async (userId, userEmail, userRole) => {
  try {
    // Note: This should be called from admin context only
    const response = await api.authenticatedApiCall(`/api/user-roles/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({
        user_role: userRole,
        user_email: userEmail
      })
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { success: false, error };
  }
};

// Remove user role - This should be done through admin API
export const removeUserRole = async (userId, roleName) => {
  try {
    // Note: This should be called from admin context only
    const response = await api.authenticatedApiCall(`/api/user-roles/${userId}/roles/${roleName}`, {
      method: 'DELETE'
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error removing user role:', error);
    return { success: false, error };
  }
};

// Get all hosts (for admin dashboard) - This should be done through admin API
export const getAllHosts = async () => {
  try {
    // Note: This should be called from admin context only
    const response = await api.authenticatedApiCall('/api/admin/hosts');
    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return { success: false, error };
  }
};

// Check if user has specific role
export const hasRole = (userRole, requiredRole) => {
  if (!userRole) return false;
  
  switch (requiredRole) {
    case 'admin':
      return userRole === 'admin';
    case 'host':
      return userRole === 'host' || userRole === 'admin';
    case 'player':
      return userRole === 'player' || userRole === 'host' || userRole === 'admin';
    default:
      return false;
  }
};

// Check if user is host for specific game
export const isHostForGame = async (userId, game) => {
  try {
    const response = await api.checkHostForGame(userId, game);
    return response.isHost;
  } catch (error) {
    console.error('Error checking host for game:', error);
    return false;
  }
};

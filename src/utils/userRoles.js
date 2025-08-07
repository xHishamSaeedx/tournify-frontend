import supabase from '../supabaseClient';

// Get user role from Supabase
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_role')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.user_role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

// Create or update user role
export const setUserRole = async (userId, userEmail, userRole) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        user_email: userEmail,
        user_role: userRole
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error setting user role:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { success: false, error };
  }
};

// Remove user role
export const removeUserRole = async (userId) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing user role:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing user role:', error);
    return { success: false, error };
  }
};

// Get all hosts (for admin dashboard)
export const getAllHosts = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .in('user_role', ['host', 'admin']);

    if (error) {
      console.error('Error fetching hosts:', error);
      return { success: false, error };
    }

    return { success: true, data };
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

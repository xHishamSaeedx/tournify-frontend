import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const UserRolesContext = createContext({});

export const useUserRoles = () => {
  const context = useContext(UserRolesContext);
  if (!context) {
    throw new Error("useUserRoles must be used within a UserRolesProvider");
  }
  return context;
};

export const UserRolesProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.getUserRoles(user.id);
        
        if (response.roles && response.roles.length > 0) {
          // Get the highest priority role (admin > host > player)
          const roles = response.roles.map(r => r.role);
          let highestRole = 'player';
          
          if (roles.includes('admin')) {
            highestRole = 'admin';
          } else if (roles.includes('host')) {
            highestRole = 'host';
          }
          
          console.log("UserRolesContext: Fetched user role:", {
            userId: user.id,
            userRole: highestRole,
            allRoles: roles,
            isAdmin: highestRole === "admin",
          });
          setUserRole(highestRole);
        } else {
          console.log("UserRolesContext: No roles found for user:", user.id);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const value = {
    userRole,
    loading,
    isPlayer: userRole === "player" || !userRole,
    isHost: userRole === "host",
    isAdmin: userRole === "admin",
  };

  return (
    <UserRolesContext.Provider value={value}>
      {children}
    </UserRolesContext.Provider>
  );
};

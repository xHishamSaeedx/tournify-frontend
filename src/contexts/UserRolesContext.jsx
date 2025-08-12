import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabaseClient";
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
        const { data, error } = await supabase
          .from("user_roles")
          .select("user_role")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user role:", error);
        }

        console.log("UserRolesContext: Fetched user role:", {
          userId: user.id,
          userRole: data?.user_role,
          isAdmin: data?.user_role === "admin",
        });
        setUserRole(data?.user_role || null);
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

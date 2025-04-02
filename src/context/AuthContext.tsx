
/**
 * NOTE: This authentication context is currently disabled in the application.
 * It's kept for reference in case authentication needs to be re-enabled in the future.
 * See the documentation in src/docs/Authentication.md for re-enabling instructions.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import authService from "@/services/authService";

// Define AuthUser type
interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize auth headers with stored token if any
        authService.initAuthHeaders();
        
        // Check if token is valid and get current user
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const user = await authService.login(username, password);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

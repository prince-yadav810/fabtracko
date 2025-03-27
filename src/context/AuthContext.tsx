
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import authService, { AuthUser } from "@/services/authService";

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
        // Check localStorage first for persisted auth
        const isLocalAuth = localStorage.getItem('authenticated') === 'true';
        
        // Initialize auth headers with stored token if any
        authService.initAuth();
        
        // Check if token is valid and get current user
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('authenticated', 'true');
        } else if (isLocalAuth) {
          // If localStorage shows authenticated but no valid token, clear it
          localStorage.removeItem('authenticated');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem('authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log("Login attempt with:", { username, passwordProvided: !!password });
      
      // Ensure username and password are strings and properly trimmed
      const trimmedUsername = String(username).trim();
      const trimmedPassword = String(password).trim();
      
      if (trimmedUsername !== 'vikasfabtech') {
        console.warn("Username mismatch in client validation");
      }
      
      // Attempt login with the service
      const user = await authService.login(trimmedUsername, trimmedPassword);
      console.log("Login successful, user:", user);
      setUser(user);
      localStorage.setItem('authenticated', 'true');
    } catch (error) {
      console.error("Login failed in context:", error);
      localStorage.removeItem('authenticated');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('authenticated');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || localStorage.getItem('authenticated') === 'true',
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

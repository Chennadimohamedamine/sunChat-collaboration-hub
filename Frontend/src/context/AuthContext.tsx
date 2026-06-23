/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import ApiService from '../service/ApiService';

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const data = await ApiService.getCurrentUser();
        setCurrentUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error fetching current user:', error);
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

export const useAuth = useAppContext;
"use client";

import React, { useState, useEffect, createContext, useContext } from "react";

// Mock user data
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "therapist" | "admin";
  avatar?: string;
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "customer",
    avatar: "👩‍💼",
  },
  {
    id: "2",
    name: "David Chen",
    email: "david@therapist.com",
    role: "therapist",
    avatar: "👨‍⚕️",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@eyetouch.com",
    role: "admin",
    avatar: "👨‍💻",
  },
];

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user by email (password is ignored for simplicity)
    const foundUser = mockUsers.find((u) => u.email === email);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return {
    user,
    login,
    logout,
    isLoading,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = useAuthProvider();

  return React.createElement(AuthContext.Provider, { value: authValue }, children);
}

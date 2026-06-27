import { API_ENDPOINTS } from "@/config/api";
import { clearUserData, getUserData, saveUserData } from "@/utils/storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import axios, { AxiosError } from "axios";

type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserData();

        console.log("Stored user data:", data);

        if (data._id && data.name && data.email) {
          setUser({
            _id: data._id,
            name: data.name,
            email: data.email,
          });

          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Storage error:", error);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("LOGIN API:", API_ENDPOINTS.LOGIN);

      console.log("Login payload:", {
        email,
        password,
      });

      const res = await axios.post(
        API_ENDPOINTS.LOGIN,
        {
          email,
          password,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Login response:", res.data);

      const data = res.data.user;

      if (data?.fullName) {
        await saveUserData(data._id, data.fullName, data.email);

        setUser({
          _id: data._id,
          name: data.fullName,
          email: data.email,
        });

        setIsAuthenticated(true);
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error) {
      const err = error as AxiosError;

      console.log("LOGIN ERROR:");
      console.log("Message:", err.message);
      console.log("Code:", err.code);
      console.log("Response:", err.response?.data);
      console.log("Status:", err.response?.status);

      throw error;
    }
  };

  const Signup = async (fullName: string, email: string, password: string) => {
    try {
      console.log("SIGNUP API:", API_ENDPOINTS.SIGNUP);

      console.log("Signup payload:", {
        fullName,
        email,
        password,
      });

      const res = await axios.post(
        API_ENDPOINTS.SIGNUP,
        {
          fullName,
          email,
          password,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Signup response:", res.data);

      const data = res.data.user;

      if (data?.fullName) {
        await saveUserData(data._id, data.fullName, data.email);

        setUser({
          _id: data._id,
          name: data.fullName,
          email: data.email,
        });

        setIsAuthenticated(true);
      } else {
        throw new Error(res.data.message || "Signup failed");
      }
    } catch (error) {
      const err = error as AxiosError;

      console.log("SIGNUP ERROR:");
      console.log("Message:", err.message);
      console.log("Code:", err.code);
      console.log("Response:", err.response?.data);
      console.log("Status:", err.response?.status);
      console.log("Full Error:", JSON.stringify(err, null, 2));

      throw error;
    }
  };

  const logout = async () => {
    await clearUserData();

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        Signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;

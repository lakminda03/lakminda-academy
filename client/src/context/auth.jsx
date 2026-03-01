import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const data = await apiRequest("/api/users/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await loadMe();
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    return data;
  };

  const resendVerification = async (email) => {
    const data = await apiRequest("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return data;
  };

  const verifyEmail = async (token) => {
    const data = await apiRequest(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    return data;
  };

  const forgotPassword = async (email) => {
    const data = await apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return data;
  };

  const resetPassword = async (token, password) => {
    const data = await apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    return data;
  };

  const logout = async () => {
    await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      resendVerification,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout,
      refresh: loadMe,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
<<<<<<< HEAD

=======
>>>>>>> 2894c84 (Update README and env template)

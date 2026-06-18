import React, { createContext, useContext, useState } from "react";
import api from "../services/api";





















const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("hms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;

      const formattedUser = { ...userData, id: userData._id };
      setUser(formattedUser);
      localStorage.setItem("hms_user", JSON.stringify(formattedUser));
      return formattedUser.role;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const userData = response.data;
      const formattedUser = { ...userData, id: userData._id };
      setUser(formattedUser);
      localStorage.setItem("hms_user", JSON.stringify(formattedUser));
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hms_user");
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser({ ...userData, id: userData._id });
      localStorage.setItem("hms_user", JSON.stringify({ ...userData, id: userData._id }));
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
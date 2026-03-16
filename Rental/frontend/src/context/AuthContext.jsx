import { createContext, useEffect, useMemo, useState } from "react";
import authService from "@/services/AuthService";
import { clearToken, getToken, setToken } from "@/utils/storage";

const AuthContext = createContext(null);

const getPayloadData = (response) => response?.data?.data ?? response?.data ?? {};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.me();
      const payload = getPayloadData(response);
      setUser(payload.user || null);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const payload = getPayloadData(response);
    setToken(payload.token);
    setUser(payload.user);
    return payload.user;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const responsePayload = getPayloadData(response);
    setToken(responsePayload.token);
    setUser(responsePayload.user);
    return responsePayload.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

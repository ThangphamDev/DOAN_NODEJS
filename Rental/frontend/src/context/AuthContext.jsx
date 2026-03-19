import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "@/services/AuthService";
import { clearToken, getToken, setToken } from "@/utils/storage";

const AuthContext = createContext(null);

const getPayloadData = (response) => response?.data?.data ?? response?.data ?? {};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const payload = getPayloadData(response);
    setToken(payload.token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload);
    const responsePayload = getPayloadData(response);
    setToken(responsePayload.token);
    setUser(responsePayload.user);
    return responsePayload.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await authService.updateProfile(payload);
    const responsePayload = getPayloadData(response);
    setUser(responsePayload.user || null);
    return responsePayload.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh: fetchMe, updateProfile }),
    [fetchMe, loading, login, logout, register, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

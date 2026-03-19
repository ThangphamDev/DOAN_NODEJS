import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "@/services/AuthService";
import { clearStoredUser, clearToken, getStoredUser, getToken, setStoredUser, setToken } from "@/utils/storage";

const AuthContext = createContext(null);

const getPayloadData = (response) => response?.data?.data ?? response?.data ?? {};

export const AuthProvider = ({ children }) => {
  const hasStoredToken = Boolean(getToken());
  const [user, setUser] = useState(() => (hasStoredToken ? getStoredUser() : null));
  const [loading, setLoading] = useState(hasStoredToken);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.me();
      const payload = getPayloadData(response);
      const nextUser = payload.user || null;
      setUser(nextUser);
      setStoredUser(nextUser);
    } catch {
      clearToken();
      clearStoredUser();
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
    setStoredUser(payload.user);
    return payload.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload);
    const responsePayload = getPayloadData(response);
    setToken(responsePayload.token);
    setUser(responsePayload.user);
    setStoredUser(responsePayload.user);
    return responsePayload.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await authService.updateProfile(payload);
    const responsePayload = getPayloadData(response);
    const nextUser = responsePayload.user || null;
    setUser(nextUser);
    setStoredUser(nextUser);
    return responsePayload.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearStoredUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh: fetchMe, updateProfile }),
    [fetchMe, loading, login, logout, register, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

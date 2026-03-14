import { createContext, useEffect, useMemo, useState } from "react";
import authService from "@/services/AuthService";
import { clearToken, getToken, setToken } from "@/utils/storage";

const AuthContext = createContext(null);

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
      const { data } = await authService.me();
      setUser(data.user);
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
    const { data } = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    setToken(data.token);
    setUser(data.user);
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

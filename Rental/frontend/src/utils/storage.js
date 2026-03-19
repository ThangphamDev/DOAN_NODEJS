const TOKEN_KEY = "token";
const USER_SNAPSHOT_KEY = "user_snapshot";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    const rawValue = localStorage.getItem(USER_SNAPSHOT_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const setStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_SNAPSHOT_KEY);
    return;
  }

  localStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_SNAPSHOT_KEY);
};

export { TOKEN_KEY, USER_SNAPSHOT_KEY };

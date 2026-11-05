import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("pdfly_token")
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .fetchMe()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("pdfly_token");
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function persist(session) {
    localStorage.setItem("pdfly_token", session.access_token);
    setToken(session.access_token);
    setUser(session.user);
  }

  async function doSignup(payload) {
    const session = await api.signup(payload);
    persist(session);
    return session.user;
  }

  async function doLogin(payload) {
    const session = await api.login(payload);
    persist(session);
    return session.user;
  }

  function logout() {
    localStorage.removeItem("pdfly_token");
    setToken(null);
    setUser(null);
  }

  function updateUser(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signup: doSignup,
      login: doLogin,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

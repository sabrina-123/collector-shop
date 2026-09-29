import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = sessionStorage.getItem("access");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("auth/me/");
      setUser(response.data);
    } catch {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const response = await api.post("auth/login/", {
      username,
      password,
    });

    sessionStorage.setItem(
      "access",
      response.data.access
    );

    sessionStorage.setItem(
      "refresh",
      response.data.refresh
    );

    await loadUser();
  }

  function logout() {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    setUser(null);
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
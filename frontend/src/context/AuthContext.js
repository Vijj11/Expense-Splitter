import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

function safeDecode(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(token ? safeDecode(token) : null);

  useEffect(() => {
    if (token) {
      const decoded = safeDecode(token);
      if (decoded) {
        setUser(decoded);
        localStorage.setItem('token', token);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (jwt) => setToken(jwt);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
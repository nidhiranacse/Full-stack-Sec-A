// Author: Radha Pandey, CSE - CampusConnect
import { createContext, useContext, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cc_user'));
    } catch {
      return null;
    }
  });

  const save = ({ user, token }) => {
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const signup = async (name, email, password) =>
    save((await api.post('/auth/signup', { name, email, password })).data);
  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 💡 1. App එක load වෙද්දීම localStorage එකෙන් user details සහ permissionMatrix එක කියවා ගනී
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  // 💡 2. Login වෙද්දී user state එකට මෙන්ම localStorage එකටත් permissionMatrix සමඟම save කරයි
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('mms_user', JSON.stringify(userData));
  };

  // 💡 3. Logout වෙද්දී localStorage එකෙන් සම්පූර්ණයෙන්ම ඉවත් කරයි
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mms_user');
  };

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
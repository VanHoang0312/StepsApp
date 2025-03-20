import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentData } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi ứng dụng khởi động
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await getCurrentData(token);
          if (response && response.message && response.message._id) {
            setUserId(response.message._id);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (token) => {
    await AsyncStorage.setItem('token', token);
    const response = await getCurrentData(token);
    if (response && response.message && response.message._id) {
      setUserId(response.message._id);
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
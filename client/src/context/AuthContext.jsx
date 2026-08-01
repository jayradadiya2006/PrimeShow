import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('primeshow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('primeshow_token') || null;
  });

  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('primeshow_selected_city') || 'Mumbai';
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('primeshow_wishlist');
    return saved ? JSON.parse(saved) : ['mov_1'];
  });

  // Theme Preference State: 'dark' | 'light' | 'system'
  const [themePreference, setThemePreferenceState] = useState(() => {
    return localStorage.getItem('primeshow_theme_mode') || 'dark';
  });

  // Derived effective theme ('dark' or 'light')
  const [effectiveTheme, setEffectiveTheme] = useState('dark');

  // Support messages stream state
  const [supportMessages, setSupportMessages] = useState([]);

  // Notifications Stream State
  const [notifications, setNotifications] = useState([]);

  // Fetch support messages & notifications
  const fetchStreamData = async () => {
    try {
      const [msgRes, notifRes] = await Promise.all([
        axios.get(`${API_BASE}/support/messages`),
        axios.get(`${API_BASE}/notifications`)
      ]);
      setSupportMessages(msgRes.data);
      setNotifications(notifRes.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchStreamData();
    const interval = setInterval(fetchStreamData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync Wishlist & City to LocalStorage
  useEffect(() => {
    localStorage.setItem('primeshow_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('primeshow_selected_city', selectedCity);
  }, [selectedCity]);

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('primeshow_selected_city', city);
  };

  const toggleWishlist = (movieId) => {
    setWishlist(prev => {
      if (prev.includes(movieId)) {
        return prev.filter(id => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  // Theme Sync & System Listener Effect
  useEffect(() => {
    const applyTheme = () => {
      let activeTheme = 'dark';
      if (themePreference === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = isSystemDark ? 'dark' : 'light';
      } else {
        activeTheme = themePreference;
      }

      setEffectiveTheme(activeTheme);

      const rootHtml = document.documentElement;
      const body = document.body;
      if (activeTheme === 'light') {
        rootHtml.classList.remove('dark');
        rootHtml.classList.add('light');
        body.classList.remove('dark');
        body.classList.add('light');
      } else {
        rootHtml.classList.remove('light');
        rootHtml.classList.add('dark');
        body.classList.remove('light');
        body.classList.add('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themePreference === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themePreference]);

  const setThemePreference = (mode) => {
    setThemePreferenceState(mode);
    localStorage.setItem('primeshow_theme_mode', mode);
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: userToken, user: userData } = res.data;
      
      let mergedUser = userData;
      if (userData.role !== 'ADMIN') {
        const savedLocalUser = localStorage.getItem('primeshow_user');
        const parsedSaved = savedLocalUser ? JSON.parse(savedLocalUser) : {};
        if (parsedSaved.email === userData.email) {
          mergedUser = { ...userData, ...parsedSaved, role: userData.role };
        }
      }

      setToken(userToken);
      setUser(mergedUser);

      localStorage.setItem('primeshow_token', userToken);
      localStorage.setItem('primeshow_user', JSON.stringify(mergedUser));

      return { success: true, user: mergedUser };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { name, email, phone, password });
      const { token: userToken, user: userData } = res.data;

      setToken(userToken);
      setUser(userData);

      localStorage.setItem('primeshow_token', userToken);
      localStorage.setItem('primeshow_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('primeshow_token');
    localStorage.removeItem('primeshow_user');
  };

  // Update & Persist User Profile Fields
  const updateUserProfile = (updatedFields) => {
    setUser(prevUser => {
      const newUser = { ...(prevUser || {}), ...updatedFields };
      localStorage.setItem('primeshow_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Admin Broadcast Notification
  const broadcastNotification = async (title, message, type = 'PROMO') => {
    try {
      const res = await axios.post(`${API_BASE}/notifications`, { title, message, type });
      setNotifications(prev => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  // Mark Notification as Read
  const markNotificationRead = async (notifId) => {
    try {
      await axios.put(`${API_BASE}/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    }
  };

  const sendMessageToSupport = async (subject, message) => {
    try {
      const res = await axios.post(`${API_BASE}/support/messages`, {
        userId: user?.id || 'usr_1',
        userName: user?.name || 'Customer',
        userEmail: user?.email || 'customer@primeshow.com',
        subject,
        message
      });
      setSupportMessages(prev => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const replyToSupportMessage = async (msgId, replyText) => {
    try {
      const res = await axios.put(`${API_BASE}/support/messages/${msgId}/reply`, { reply: replyText });
      setSupportMessages(prev => prev.map(m => m.id === msgId ? res.data : m));
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user ? { ...user, wishlist } : null,
      token,
      login,
      register,
      logout,
      updateUserProfile,
      wishlist,
      toggleWishlist,
      selectedCity,
      setSelectedCity,
      changeCity,
      themePreference,
      setThemePreference,
      effectiveTheme,
      supportMessages,
      sendMessageToSupport,
      replyToSupportMessage,
      notifications,
      broadcastNotification,
      markNotificationRead,
      isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

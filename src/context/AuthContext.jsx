import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Demo mode: store users in localStorage when backend is unavailable
const DEMO_USERS_KEY = 'aidmap_demo_users';

const getDemoUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveDemoUsers = (users) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

// Pre-seed an admin user for demo
const ensureAdminExists = () => {
  const users = getDemoUsers();
  if (!users.find((u) => u.role === 'admin')) {
    users.push({
      _id: 'admin-001',
      name: 'Admin User',
      email: 'admin@aidmap.org',
      password: 'admin123',
      phone: '+91 9000000001',
      role: 'admin',
      skills: [],
      helpType: '',
      tasksCompleted: 0,
      rating: 5,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    });
    saveDemoUsers(users);
  }
};

const demoRegister = (formData) => {
  const users = getDemoUsers();
  if (users.find((u) => u.email === formData.email)) {
    throw new Error('Email already registered');
  }

  const newUser = {
    _id: `user-${Date.now()}`,
    name: formData.name,
    email: formData.email,
    password: formData.password,
    phone: formData.phone || '',
    role: formData.role || 'community',
    skills: formData.skills || [],
    helpType: formData.helpType || '',
    tasksCompleted: 0,
    rating: 5,
    isAvailable: true,
    location: { type: 'Point', coordinates: [77.209 + Math.random(), 28.614 + Math.random()], address: '' },
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveDemoUsers(users);

  const { password, ...userWithoutPassword } = newUser;
  return { token: `demo-token-${newUser._id}`, user: userWithoutPassword };
};

const demoLogin = (email, password) => {
  const users = getDemoUsers();
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  if (user.password !== password) {
    throw new Error('Invalid email or password');
  }
  const { password: pw, ...userWithoutPassword } = user;
  return { token: `demo-token-${user._id}`, user: userWithoutPassword };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAdminExists();

    const storedToken = localStorage.getItem('aidmap_token');
    const storedUser = localStorage.getItem('aidmap_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Try backend first, fallback to demo mode
    try {
      const { data } = await authAPI.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('aidmap_token', data.token);
      localStorage.setItem('aidmap_user', JSON.stringify(data.user));
      return data.user;
    } catch (backendErr) {
      // If backend is down (network error), use demo mode
      if (!backendErr.response) {
        try {
          const result = demoLogin(email, password);
          setToken(result.token);
          setUser(result.user);
          localStorage.setItem('aidmap_token', result.token);
          localStorage.setItem('aidmap_user', JSON.stringify(result.user));
          return result.user;
        } catch (demoErr) {
          throw { response: { data: { message: demoErr.message } } };
        }
      }
      throw backendErr;
    }
  };

  const register = async (formData) => {
    // Try backend first, fallback to demo mode
    try {
      const { data } = await authAPI.register(formData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('aidmap_token', data.token);
      localStorage.setItem('aidmap_user', JSON.stringify(data.user));
      return data.user;
    } catch (backendErr) {
      // If backend is down (network error), use demo mode
      if (!backendErr.response) {
        try {
          const result = demoRegister(formData);
          setToken(result.token);
          setUser(result.user);
          localStorage.setItem('aidmap_token', result.token);
          localStorage.setItem('aidmap_user', JSON.stringify(result.user));
          return result.user;
        } catch (demoErr) {
          throw { response: { data: { message: demoErr.message } } };
        }
      }
      throw backendErr;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aidmap_token');
    localStorage.removeItem('aidmap_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('aidmap_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

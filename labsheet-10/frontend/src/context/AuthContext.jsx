import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api, { setAccessToken } from '../api/axiosInstance';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Silent session restore on app mount using httpOnly refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res.data?.accessToken && res.data?.user) {
          setAccessToken(res.data.accessToken);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: res.data.user },
          });
        } else {
          dispatch({ type: 'AUTH_FAIL', payload: null });
        }
      } catch (err) {
        setAccessToken(null);
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };

    restoreSession();

    const handleAuthExpired = () => {
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await api.post('/auth/login', { email, password });
      setAccessToken(res.data.accessToken);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user },
      });
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check credentials.';
      dispatch({ type: 'AUTH_FAIL', payload: errorMsg });
      return { success: false, message: errorMsg, details: err.response?.data?.details };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await api.post('/auth/register', userData);
      setAccessToken(res.data.accessToken);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user },
      });
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_FAIL', payload: errorMsg });
      return { success: false, message: errorMsg, details: err.response?.data?.details };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint error:', err.message);
    } finally {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

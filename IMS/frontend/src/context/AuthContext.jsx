import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('ims_token') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ims_user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('ims_token', token);
    } else {
      localStorage.removeItem('ims_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ims_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ims_user');
    }
  }, [user]);

  const auth = useMemo(
    () => ({
      token,
      user,
      login(data) {
        setToken(data.token);
        setUser(data.user);
      },
      logout() {
        setToken('');
        setUser(null);
        navigate('/login');
      },
    }),
    [token, user, navigate]
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

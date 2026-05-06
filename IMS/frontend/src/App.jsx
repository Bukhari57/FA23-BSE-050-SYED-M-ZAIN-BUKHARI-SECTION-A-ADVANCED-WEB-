import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ims_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ims_theme', theme);
    document.body.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  return (
    <div className="min-h-screen text-[var(--text)] transition-colors duration-300">
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-screen"
        >
          <Routes>
            <Route path="/login" element={<Login theme={theme} setTheme={setTheme} />} />
            <Route path="/signup" element={<Signup theme={theme} setTheme={setTheme} />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Dashboard theme={theme} setTheme={setTheme} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

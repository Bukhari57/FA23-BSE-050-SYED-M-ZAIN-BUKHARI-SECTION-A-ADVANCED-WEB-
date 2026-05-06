import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ModuleLayout({ theme, setTheme, children }) {
  const auth = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen gap-6 px-4 py-6 lg:px-8">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        theme={theme}
        setTheme={setTheme}
        user={auth.user}
        onLogout={() => auth.logout()}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 space-y-6">
        <Topbar theme={theme} setTheme={setTheme} onMobileMenuToggle={() => setMobileSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}

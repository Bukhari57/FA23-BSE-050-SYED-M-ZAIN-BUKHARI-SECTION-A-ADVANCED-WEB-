import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, Tag, BarChart3, LogOut, PanelLeftClose, PanelLeftOpen, X, Package, ShoppingCart, FileText, Truck, AlertCircle, ArrowRightLeft, Clock, RotateCcw } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', to: '/products', icon: Box },
  { label: 'Categories', to: '/categories', icon: Tag },
  { label: 'Warehouses', to: '/warehouses', icon: Package },
  { label: 'Sales Orders', to: '/sales-orders', icon: ShoppingCart },
  { label: 'Invoices', to: '/invoices', icon: FileText },
  { label: 'Goods In/Out', to: '/goods-inout', icon: Truck },
  { label: 'Transfers', to: '/transfers', icon: ArrowRightLeft },
  { label: 'Purchase Requests', to: '/purchase-requests', icon: Clock },
  { label: 'Returns', to: '/returns', icon: RotateCcw },
  { label: 'Alerts', to: '/alerts', icon: AlertCircle },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
];

export default function Sidebar({ collapsed, onToggle, theme, setTheme, user, onLogout, mobileOpen, onMobileClose }) {
  const location = useLocation();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onMobileClose}>
          <div className="premium-panel fixed left-0 top-0 flex h-full w-72 flex-col p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Operations Suite</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">StockDesk</p>
              </div>
              <button className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-[var(--text)]" onClick={onMobileClose}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Theme</p>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="mt-2 text-sm font-semibold text-[var(--text)]"
              >
                Switch to {theme === 'light' ? 'dark' : 'light'} mode
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map(item => {
                const active = location.pathname.startsWith(item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm transition ${active ? 'bg-[linear-gradient(135deg,var(--accent-soft),transparent)] text-[var(--text-strong)] shadow-[inset_0_0_0_1px_rgba(228,196,141,0.18)]' : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4 text-sm text-[var(--muted)]">
              <p className="font-medium text-[var(--text)]">{user?.name || 'Inventory Manager'}</p>
              <p className="mt-1 text-xs">{user?.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em]">{user?.role || 'user'}</p>
              <button onClick={onLogout} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--surface-strong)] px-4 py-2 text-xs text-[var(--text)] hover:bg-[var(--accent-soft)]">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`premium-panel hidden h-full w-full flex-col gap-6 rounded-[2rem] p-6 transition-all lg:flex ${collapsed ? 'max-w-[88px] px-3' : 'max-w-[296px] px-6'}`}>
        <div className="flex items-center justify-between gap-2">
          <div className={`space-y-1 ${collapsed ? 'hidden' : 'block'}`}>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Operations Suite</p>
            <p className="text-2xl font-semibold text-[var(--text-strong)]">StockDesk</p>
            <p className="text-sm text-[var(--muted)]">Premium inventory command center</p>
          </div>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] hover:bg-[var(--surface-strong)]"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Theme</p>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="mt-2 text-left text-sm font-semibold text-[var(--text)]"
            >
              Switch to {theme === 'light' ? 'dark' : 'light'} mode
            </button>
          </div>
        )}

        <nav className="space-y-2">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm transition ${active ? 'bg-[linear-gradient(135deg,var(--accent-soft),transparent)] text-[var(--text-strong)] shadow-[inset_0_0_0_1px_rgba(228,196,141,0.18)]' : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'}`}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--text)]">{user?.name || 'Inventory Manager'}</p>
          {!collapsed && (
            <>
              <p className="mt-1 text-xs">{user?.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em]">{user?.role || 'user'}</p>
            </>
          )}
          <button onClick={onLogout} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent-soft)]">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

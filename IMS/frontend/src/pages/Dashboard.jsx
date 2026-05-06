import { useEffect, useState } from 'react';
import { useNavigate, Route, Routes, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { api } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Products from './Products';
import Categories from './Categories';
import Reports from './Reports';
import Warehouses from './Warehouses';
import SalesOrders from './SalesOrders';
import Invoices from './Invoices';
import GoodsInOut from './GoodsInOut';
import Transfers from './Transfers';
import PurchaseRequests from './PurchaseRequests';
import Returns from './Returns';
import Alerts from './Alerts';

const chartColors = ['#c7a46a', '#67c29c', '#d58e76', '#8ba9c9'];

function DashboardShell({ theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      try {
        const response = await api.summary.get();
        setSummary(response.summary);
      } catch (error) {
        toast.push(error.message || 'Unable to load summary', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [toast]);

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

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Inventory summary</p>
                  <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Quick insights</h2>
                </div>
                <Button variant="secondary" onClick={() => navigate('/products')}>
                  Manage products
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ['total_products', 'Products', 'Active items in your catalog'],
                  ['total_categories', 'Categories', 'Structured product groups'],
                  ['low_stock', 'Low stock', 'Items needing attention soon'],
                ].map(([key, label, description]) => (
                  <div key={key} className="rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">{label}</p>
                    <p className="mt-3 text-4xl font-semibold text-[var(--text-strong)]">{loading ? '–' : summary?.[key] ?? 0}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Stock distribution</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[var(--text-strong)]">Category breakdown</h3>
                </div>
                <div className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Live mix
                </div>
              </div>

              <div className="mt-6 h-[320px]">
                {summary ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={summary.topCategories} dataKey="count" nameKey="category" innerRadius={68} outerRadius={100} paddingAngle={3} stroke="transparent">
                        {summary.topCategories.map((entry, index) => (
                          <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#161b24', borderRadius: 16, border: '1px solid rgba(228,196,141,0.12)', color: '#f6efe5' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-20 text-center text-[var(--muted)]">Loading chart…</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Activity stream</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">Recent actions</h3>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  'Added new Marketing Laptop to Electronics.',
                  'Created Office Supplies category.',
                  'Updated stock quantity for Wireless Mouse.',
                  'Removed old stock from furniture collection.',
                ].map((item, index) => (
                  <div key={index} className="rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4">
                    <p className="text-sm text-[var(--text)]">{item}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">{['2m ago', '10m ago', '35m ago', '1h ago'][index]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Inventory health</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">Low stock alerts</h3>
                </div>
              </div>

              <div className="h-[320px] rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.topCategories || []} margin={{ left: -16, right: -16, top: 8, bottom: 0 }}>
                    <XAxis dataKey="category" stroke="#b8ad9b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#b8ad9b" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#161b24', borderRadius: 16, border: '1px solid rgba(228,196,141,0.12)', color: '#f6efe5' }} />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#c7a46a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard({ theme, setTheme }) {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardShell theme={theme} setTheme={setTheme} />} />
      <Route path="products" element={<Products theme={theme} setTheme={setTheme} />} />
      <Route path="categories" element={<Categories theme={theme} setTheme={setTheme} />} />
      <Route path="warehouses" element={<Warehouses theme={theme} setTheme={setTheme} />} />
      <Route path="reports" element={<Reports theme={theme} setTheme={setTheme} />} />
      <Route path="sales-orders" element={<SalesOrders theme={theme} setTheme={setTheme} />} />
      <Route path="invoices" element={<Invoices theme={theme} setTheme={setTheme} />} />
      <Route path="goods-inout" element={<GoodsInOut theme={theme} setTheme={setTheme} />} />
      <Route path="transfers" element={<Transfers theme={theme} setTheme={setTheme} />} />
      <Route path="purchase-requests" element={<PurchaseRequests theme={theme} setTheme={setTheme} />} />
      <Route path="returns" element={<Returns theme={theme} setTheme={setTheme} />} />
      <Route path="alerts" element={<Alerts theme={theme} setTheme={setTheme} />} />
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
  );
}

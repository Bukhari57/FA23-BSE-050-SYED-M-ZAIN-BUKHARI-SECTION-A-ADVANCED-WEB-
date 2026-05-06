import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const colors = ['#c7a46a', '#67c29c', '#d58e76', '#8ba9c9', '#ead7b6'];

export default function Reports({ theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const auth = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryResp, productResp] = await Promise.all([api.categories.list(), api.products.list({ page: 1, limit: 100 })]);
      setCategories(categoryResp.categories);
      setProducts(productResp.products.map(product => ({
        ...product,
        price: Number(product.price),
        quantity: Number(product.quantity),
      })));
    } catch (error) {
      toast.push(error.message || 'Unable to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reportData = categories.map((category, index) => ({
    category: category.name,
    count: products.filter(product => product.category === category.name).length,
    color: colors[index % colors.length],
  }));

  const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);

  const exportCsv = () => {
    const csvRows = ['Name,Category,Price,Quantity,Status'];
    products.forEach(item => {
      csvRows.push(`${item.name},${item.category},${item.price},${item.quantity},${item.status}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'inventory-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

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

        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Inventory reports</p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Insights & exports</h2>
              </div>
              <Button onClick={exportCsv}>Export CSV</Button>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Stock levels</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">Total units in inventory</h3>
                </div>
                <p className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--text)]">{totalStock} units</p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ left: -8, right: -8, top: 8, bottom: 8 }}>
                    <XAxis dataKey="category" stroke="#b8ad9b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#b8ad9b" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#161b24', borderRadius: 16, border: '1px solid rgba(228,196,141,0.12)', color: '#f6efe5' }} />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#c7a46a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Category share</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">Product distribution</h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportData} dataKey="count" nameKey="category" innerRadius={65} outerRadius={100} paddingAngle={4} stroke="transparent">
                      {reportData.map((item, index) => (
                        <Cell key={item.category} fill={item.color || colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#161b24', borderRadius: 16, border: '1px solid rgba(228,196,141,0.12)', color: '#f6efe5' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <div className="overflow-x-auto rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4">
              <table className="min-w-full text-left text-sm text-[var(--text)]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-16 text-center"><span>Loading report data…</span></td></tr>
                  ) : products.length ? (
                    products.map(product => (
                      <tr key={product.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-soft)]">
                        <td className="px-4 py-4 text-[var(--text-strong)]">{product.name}</td>
                        <td className="px-4 py-4">{product.category}</td>
                        <td className="px-4 py-4">{product.quantity}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.status === 'Low Stock' ? 'bg-[rgba(239,143,136,0.14)] text-[var(--danger)]' : 'bg-[rgba(103,194,156,0.14)] text-[var(--success)]'}`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-[var(--muted)]">No report data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

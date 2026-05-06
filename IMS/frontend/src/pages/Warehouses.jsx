import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { Trash2 } from 'lucide-react';

export default function Warehouses({ theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const auth = useAuth();
  const isAdmin = auth.user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [warehouseResp, statsResp, productResp] = await Promise.all([
        api.warehouses.list(),
        api.warehouses.stats(),
        api.products.list({ page: 1, limit: 100 }),
      ]);

      setWarehouses(warehouseResp.warehouses || []);

      const statsMap = {};
      (statsResp.stats || []).forEach(s => {
        statsMap[s.name] = {
          ...s,
          totalProducts: Number(s.totalProducts || 0),
          totalValue: Number(s.totalValue || 0),
          totalStock: Number(s.totalStock || 0),
          lowStock: Number(s.lowStock || 0),
        };
      });

      setStats(statsMap);
      setProducts(productResp.products.map(p => ({
        ...p,
        price: Number(p.price),
        quantity: Number(p.quantity),
      })));
    } catch (error) {
      toast.push(error.message || 'Unable to load warehouse data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWarehouse = async () => {
    const warehouseNameTrimmed = warehouseName.trim();
    if (!warehouseNameTrimmed) {
      setErrors({ name: 'Warehouse name is required' });
      return;
    }

    try {
      await api.warehouses.create({
        name: warehouseNameTrimmed,
        location: warehouseLocation.trim(),
      });
      toast.push('Warehouse created successfully');
      setWarehouseName('');
      setWarehouseLocation('');
      setErrors({});
      setModalOpen(false);
      loadData();
    } catch (error) {
      setErrors({ name: error.message || 'Failed to create warehouse' });
    }
  };

  const handleDeleteWarehouse = async id => {
    if (!confirm('Delete this warehouse?')) return;
    try {
      await api.warehouses.delete(id);
      toast.push('Warehouse deleted successfully');
      loadData();
    } catch (error) {
      toast.push(error.message || 'Unable to delete warehouse', 'error');
    }
  };

  const warehouseProducts = products.filter(p => (p.warehouse || 'Main') === selectedWarehouse);

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

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Warehouse management</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Manage storage locations</h2>
            </div>
            {isAdmin && (
              <Button variant="secondary" onClick={() => { setModalOpen(true); setWarehouseName(''); setWarehouseLocation(''); setErrors({}); }}>
                Add Warehouse
              </Button>
            )}
          </div>
        </Card>

        {loading ? (
          <Card>
            <div className="py-20"><Spinner /></div>
          </Card>
        ) : warehouses.length === 0 ? (
          <Card>
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">No warehouses yet</p>
              <h3 className="text-3xl font-semibold text-[var(--text-strong)]">Create your first storage location</h3>
              <p className="text-sm text-[var(--muted)]">Add a warehouse to track stock, inventory value, and low stock alerts per location.</p>
              {isAdmin && (
                <Button variant="secondary" onClick={() => setModalOpen(true)}>
                  Add Warehouse
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {warehouses.map(warehouse => {
              const warehouseStats = stats[warehouse.name] || {
                totalProducts: 0,
                totalValue: 0,
                totalStock: 0,
                lowStock: 0,
              };

              return (
                <Card key={warehouse.id}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-[var(--text-strong)]">{warehouse.name}</h3>
                        {warehouse.location && <p className="mt-1 text-sm text-[var(--muted)]">{warehouse.location}</p>}
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{warehouseStats.totalProducts} products</p>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                          title="Delete warehouse"
                          className="p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Total stock</p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{warehouseStats.totalStock}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Low stock items</p>
                        <p className={`mt-2 text-2xl font-semibold ${warehouseStats.lowStock > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                          {warehouseStats.lowStock}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Total value</p>
                      <p className="mt-2 text-xl font-semibold text-[var(--text-strong)]">${warehouseStats.totalValue.toFixed(2)}</p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => setSelectedWarehouse(warehouse.name)}>
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {selectedWarehouse && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--text-strong)]">{selectedWarehouse} - Products</h3>
              </div>
              <Button variant="ghost" onClick={() => setSelectedWarehouse(null)}>Close</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[var(--text)]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-[var(--muted)]">Product Name</th>
                    <th className="px-4 py-3 text-[var(--muted)]">Category</th>
                    <th className="px-4 py-3 text-[var(--muted)]">Price</th>
                    <th className="px-4 py-3 text-[var(--muted)]">Quantity</th>
                    <th className="px-4 py-3 text-[var(--muted)]">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseProducts.map(product => (
                    <tr key={product.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-soft)]">
                      <td className="px-4 py-4 font-medium text-[var(--text-strong)]">{product.name}</td>
                      <td className="px-4 py-4">{product.category}</td>
                      <td className="px-4 py-4">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-4">{product.quantity}</td>
                      <td className="px-4 py-4 font-semibold text-[var(--text-strong)]">${(product.price * product.quantity).toFixed(2)}</td>
                    </tr>
                  ))}

                  {!warehouseProducts.length && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-[var(--muted)]">
                        No products are currently assigned to this warehouse.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        title="Add New Warehouse"
        onClose={() => setModalOpen(false)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWarehouse}>Create</Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <Input
            label="Warehouse Name"
            value={warehouseName}
            onChange={e => setWarehouseName(e.target.value)}
            error={errors.name}
            placeholder="e.g., Main, Branch A"
          />
          <Input
            label="Location (Optional)"
            value={warehouseLocation}
            onChange={e => setWarehouseLocation(e.target.value)}
            placeholder="e.g., New York, Los Angeles"
          />
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import ModuleLayout from '../components/ModuleLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';

const selectClassName = 'w-full rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),rgba(255,255,255,0.01))] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]';

export default function GoodsInOut({ theme, setTheme }) {
  const toast = useToast();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [filters, setFilters] = useState({ type: '', product_id: '', warehouse_id: '' });
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    type: 'inbound',
    quantity: 1,
    reference_id: '',
    notes: '',
  });

  useEffect(() => {
    loadMovements();
  }, [filters]);

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await api.stockMovements.list(filters);
      setMovements(response.movements || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch stock movements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.products.list({ page: 1, limit: 100 });
      setProducts(response.products || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch products', 'error');
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await api.warehouses.list();
      setWarehouses(response.warehouses || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch warehouses', 'error');
    }
  };

  const submitMovement = async event => {
    event.preventDefault();
    if (!formData.product_id || !formData.quantity) {
      toast.push('Product and quantity are required', 'error');
      return;
    }

    try {
      await api.stockMovements.create({
        ...formData,
        product_id: Number(formData.product_id),
        warehouse_id: formData.warehouse_id ? Number(formData.warehouse_id) : null,
        quantity: Number(formData.quantity),
        reference_id: formData.reference_id ? Number(formData.reference_id) || null : null,
      });
      toast.push('Stock movement recorded successfully');
      setModalOpen(false);
      setFormData({
        product_id: '',
        warehouse_id: '',
        type: 'inbound',
        quantity: 1,
        reference_id: '',
        notes: '',
      });
      loadMovements();
    } catch (error) {
      toast.push(error.message || 'Failed to record stock movement', 'error');
    }
  };

  const openDetails = movement => {
    setSelectedMovement(movement);
    setDetailOpen(true);
  };

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Goods in / out</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Record every stock movement</h2>
            </div>
            <Button onClick={() => setModalOpen(true)}>Record Movement</Button>
          </div>
        </Card>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Movement Type</span>
              <select value={filters.type} onChange={event => setFilters(current => ({ ...current, type: event.target.value }))} className={selectClassName}>
                <option value="">All types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="adjustment">Adjustment</option>
                <option value="damage">Damage</option>
                <option value="return">Return</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Product</span>
              <select value={filters.product_id} onChange={event => setFilters(current => ({ ...current, product_id: event.target.value }))} className={selectClassName}>
                <option value="">All products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Warehouse</span>
              <select value={filters.warehouse_id} onChange={event => setFilters(current => ({ ...current, warehouse_id: event.target.value }))} className={selectClassName}>
                <option value="">All warehouses</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="py-20"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto rounded-[1.5rem] border border-[var(--border)]">
              <table className="min-w-full text-left text-sm text-[var(--text)]">
                <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(movement => (
                    <tr key={movement.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4">{new Date(movement.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4 capitalize">{movement.type}</td>
                      <td className="px-4 py-4">{movement.product_name}</td>
                      <td className="px-4 py-4">{movement.warehouse_name || 'Unassigned'}</td>
                      <td className="px-4 py-4">{movement.quantity}</td>
                      <td className="px-4 py-4">{movement.reference_id || '—'}</td>
                      <td className="px-4 py-4">
                        <Button variant="secondary" onClick={() => openDetails(movement)}>Details</Button>
                      </td>
                    </tr>
                  ))}
                  {!movements.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">No stock movements found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} title="Record Stock Movement" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitMovement} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Movement Type</span>
              <select value={formData.type} onChange={event => setFormData(current => ({ ...current, type: event.target.value }))} className={selectClassName}>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="adjustment">Adjustment</option>
                <option value="damage">Damage</option>
                <option value="return">Return</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Product</span>
              <select value={formData.product_id} onChange={event => setFormData(current => ({ ...current, product_id: event.target.value }))} className={selectClassName}>
                <option value="">Select product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Warehouse</span>
              <select value={formData.warehouse_id} onChange={event => setFormData(current => ({ ...current, warehouse_id: event.target.value }))} className={selectClassName}>
                <option value="">Select warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </label>
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={event => setFormData(current => ({ ...current, quantity: Number(event.target.value) }))}
            />
          </div>

          <Input
            label="Reference Id"
            type="text"
            value={formData.reference_id}
            onChange={event => setFormData(current => ({ ...current, reference_id: event.target.value }))}
            placeholder="Related order or request id"
          />

          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Notes</span>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))}
              className={`${selectClassName} min-h-[96px]`}
            />
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Record Movement</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} title="Movement Details" onClose={() => setDetailOpen(false)}>
        {selectedMovement && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--muted)]">Date</p>
              <p className="font-semibold text-[var(--text-strong)]">{new Date(selectedMovement.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Type</p>
              <p className="font-semibold capitalize text-[var(--text-strong)]">{selectedMovement.type}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Product</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedMovement.product_name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Warehouse</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedMovement.warehouse_name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Quantity</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedMovement.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Reference Id</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedMovement.reference_id || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-[var(--muted)]">Notes</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedMovement.notes || 'No notes provided.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </ModuleLayout>
  );
}

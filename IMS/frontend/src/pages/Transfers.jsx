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

export default function Transfers({ theme, setTheme }) {
  const toast = useToast();
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [formData, setFormData] = useState({
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: 1,
    notes: '',
  });

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const response = await api.transfers.list(filters);
      setTransfers(response.transfers || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch transfers', 'error');
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

  const submitTransfer = async event => {
    event.preventDefault();
    if (!formData.product_id || !formData.from_warehouse_id || !formData.to_warehouse_id || !formData.quantity) {
      toast.push('All transfer fields are required', 'error');
      return;
    }
    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      toast.push('Source and destination warehouses must be different', 'error');
      return;
    }

    try {
      await api.transfers.create({
        ...formData,
        product_id: Number(formData.product_id),
        from_warehouse_id: Number(formData.from_warehouse_id),
        to_warehouse_id: Number(formData.to_warehouse_id),
        quantity: Number(formData.quantity),
      });
      toast.push('Transfer initiated successfully');
      setModalOpen(false);
      setFormData({
        product_id: '',
        from_warehouse_id: '',
        to_warehouse_id: '',
        quantity: 1,
        notes: '',
      });
      loadTransfers();
    } catch (error) {
      toast.push(error.message || 'Failed to create transfer', 'error');
    }
  };

  const receiveTransfer = async id => {
    try {
      await api.transfers.receive(id);
      toast.push('Transfer received successfully');
      if (selectedTransfer?.id === id) setDetailOpen(false);
      loadTransfers();
    } catch (error) {
      toast.push(error.message || 'Failed to receive transfer', 'error');
    }
  };

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Warehouse transfers</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Move stock between locations safely</h2>
            </div>
            <Button onClick={() => setModalOpen(true)}>Create Transfer</Button>
          </div>
        </Card>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Status</span>
              <select value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))} className={selectClassName}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In transit</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
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
                    <th className="px-4 py-3">Transfer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(transfer => (
                    <tr key={transfer.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4 font-semibold text-[var(--text-strong)]">{transfer.transfer_number}</td>
                      <td className="px-4 py-4">{transfer.product_name}</td>
                      <td className="px-4 py-4">{transfer.from_warehouse_name} to {transfer.to_warehouse_name}</td>
                      <td className="px-4 py-4">{transfer.quantity}</td>
                      <td className="px-4 py-4 capitalize">{String(transfer.status || '').replace('_', ' ')}</td>
                      <td className="space-x-2 px-4 py-4">
                        <Button variant="secondary" onClick={() => { setSelectedTransfer(transfer); setDetailOpen(true); }}>View</Button>
                        {['pending', 'in_transit'].includes(transfer.status) && (
                          <Button variant="outline" onClick={() => receiveTransfer(transfer.id)}>Receive</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!transfers.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">No transfers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} title="Create Transfer" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitTransfer} className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Product</span>
            <select value={formData.product_id} onChange={event => setFormData(current => ({ ...current, product_id: event.target.value }))} className={selectClassName}>
              <option value="">Select product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name} ({product.warehouse})</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">From Warehouse</span>
              <select value={formData.from_warehouse_id} onChange={event => setFormData(current => ({ ...current, from_warehouse_id: event.target.value }))} className={selectClassName}>
                <option value="">Select source</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">To Warehouse</span>
              <select value={formData.to_warehouse_id} onChange={event => setFormData(current => ({ ...current, to_warehouse_id: event.target.value }))} className={selectClassName}>
                <option value="">Select destination</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </label>
          </div>
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={event => setFormData(current => ({ ...current, quantity: Number(event.target.value) }))}
          />
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Notes</span>
            <textarea rows="3" value={formData.notes} onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))} className={`${selectClassName} min-h-[96px]`} />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Start Transfer</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} title={selectedTransfer ? `Transfer ${selectedTransfer.transfer_number}` : 'Transfer Details'} onClose={() => setDetailOpen(false)}>
        {selectedTransfer && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Product</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedTransfer.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="font-semibold capitalize text-[var(--text-strong)]">{String(selectedTransfer.status || '').replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">From</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedTransfer.from_warehouse_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">To</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedTransfer.to_warehouse_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Quantity</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedTransfer.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Created</p>
                <p className="font-semibold text-[var(--text-strong)]">{new Date(selectedTransfer.created_at || selectedTransfer.transfer_date).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Notes</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedTransfer.notes || 'No notes provided.'}</p>
            </div>
            <div className="flex justify-end gap-3">
              {['pending', 'in_transit'].includes(selectedTransfer.status) && (
                <Button onClick={() => receiveTransfer(selectedTransfer.id)}>Receive Transfer</Button>
              )}
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </ModuleLayout>
  );
}

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

export default function Returns({ theme, setTheme }) {
  const toast = useToast();
  const [returnsList, setReturnsList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [filters, setFilters] = useState({ status: '', return_type: '' });
  const [formData, setFormData] = useState({
    product_id: '',
    return_type: 'customer',
    quantity: 1,
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadReturns();
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const response = await api.returns.list(filters);
      setReturnsList(response.returns || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch returns', 'error');
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

  const submitReturn = async event => {
    event.preventDefault();
    if (!formData.product_id || !formData.quantity || !formData.reason.trim()) {
      toast.push('Product, quantity, and reason are required', 'error');
      return;
    }

    try {
      await api.returns.create({
        ...formData,
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
      });
      toast.push('Return created successfully');
      setModalOpen(false);
      setFormData({
        product_id: '',
        return_type: 'customer',
        quantity: 1,
        reason: '',
        notes: '',
      });
      loadReturns();
    } catch (error) {
      toast.push(error.message || 'Failed to create return', 'error');
    }
  };

  const approveReturn = async id => {
    try {
      await api.returns.approve(id);
      toast.push('Return approved successfully');
      if (selectedReturn?.id === id) setDetailOpen(false);
      loadReturns();
    } catch (error) {
      toast.push(error.message || 'Failed to approve return', 'error');
    }
  };

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Returns</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Track customer and supplier returns</h2>
            </div>
            <Button onClick={() => setModalOpen(true)}>Create Return</Button>
          </div>
        </Card>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Status</span>
              <select value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))} className={selectClassName}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="received">Received</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Return Type</span>
              <select value={filters.return_type} onChange={event => setFilters(current => ({ ...current, return_type: event.target.value }))} className={selectClassName}>
                <option value="">All types</option>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
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
                    <th className="px-4 py-3">Return</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnsList.map(item => (
                    <tr key={item.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4 font-semibold text-[var(--text-strong)]">{item.return_number}</td>
                      <td className="px-4 py-4">{item.product_name}</td>
                      <td className="px-4 py-4 capitalize">{item.return_type}</td>
                      <td className="px-4 py-4">{item.quantity}</td>
                      <td className="px-4 py-4 capitalize">{item.status}</td>
                      <td className="space-x-2 px-4 py-4">
                        <Button variant="secondary" onClick={() => { setSelectedReturn(item); setDetailOpen(true); }}>View</Button>
                        {item.status === 'pending' && <Button variant="outline" onClick={() => approveReturn(item.id)}>Approve</Button>}
                      </td>
                    </tr>
                  ))}
                  {!returnsList.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">No returns found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} title="Create Return" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitReturn} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Return Type</span>
              <select value={formData.return_type} onChange={event => setFormData(current => ({ ...current, return_type: event.target.value }))} className={selectClassName}>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
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
            <Input label="Quantity" type="number" min="1" value={formData.quantity} onChange={event => setFormData(current => ({ ...current, quantity: Number(event.target.value) }))} />
            <Input label="Reason" value={formData.reason} onChange={event => setFormData(current => ({ ...current, reason: event.target.value }))} placeholder="Damaged, duplicate, wrong item..." />
          </div>
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Notes</span>
            <textarea rows="3" value={formData.notes} onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))} className={`${selectClassName} min-h-[96px]`} />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Return</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} title={selectedReturn ? `Return ${selectedReturn.return_number}` : 'Return Details'} onClose={() => setDetailOpen(false)}>
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Product</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedReturn.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="font-semibold capitalize text-[var(--text-strong)]">{selectedReturn.status}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Type</p>
                <p className="font-semibold capitalize text-[var(--text-strong)]">{selectedReturn.return_type}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Quantity</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedReturn.quantity}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-[var(--muted)]">Reason</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedReturn.reason || 'No reason provided.'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-[var(--muted)]">Notes</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedReturn.notes || 'No notes provided.'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {selectedReturn.status === 'pending' && <Button onClick={() => approveReturn(selectedReturn.id)}>Approve Return</Button>}
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </ModuleLayout>
  );
}

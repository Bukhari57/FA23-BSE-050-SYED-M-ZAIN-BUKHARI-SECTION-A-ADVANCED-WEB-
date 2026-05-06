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

export default function PurchaseRequests({ theme, setTheme }) {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({ status: '', supplier_name: '' });
  const [formData, setFormData] = useState({
    product_id: '',
    supplier_name: '',
    supplier_email: '',
    quantity: 1,
    unit_price: 0,
    expected_delivery_date: '',
    notes: '',
  });

  useEffect(() => {
    loadRequests();
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.purchaseRequests.list(filters);
      setRequests(response.requests || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch purchase requests', 'error');
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

  const submitRequest = async event => {
    event.preventDefault();
    if (!formData.product_id || !formData.supplier_name.trim() || !formData.quantity) {
      toast.push('Supplier, product, and quantity are required', 'error');
      return;
    }

    try {
      await api.purchaseRequests.create({
        ...formData,
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price || 0),
      });
      toast.push('Purchase request created successfully');
      setModalOpen(false);
      setFormData({
        product_id: '',
        supplier_name: '',
        supplier_email: '',
        quantity: 1,
        unit_price: 0,
        expected_delivery_date: '',
        notes: '',
      });
      loadRequests();
    } catch (error) {
      toast.push(error.message || 'Failed to create purchase request', 'error');
    }
  };

  const receiveRequest = async id => {
    try {
      await api.purchaseRequests.receive(id);
      toast.push('Purchase received successfully');
      if (selectedRequest?.id === id) setDetailOpen(false);
      loadRequests();
    } catch (error) {
      toast.push(error.message || 'Failed to receive purchase', 'error');
    }
  };

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Purchase requests</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Plan replenishment and inbound supply</h2>
            </div>
            <Button onClick={() => setModalOpen(true)}>Create Request</Button>
          </div>
        </Card>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Supplier"
              value={filters.supplier_name}
              onChange={event => setFilters(current => ({ ...current, supplier_name: event.target.value }))}
              placeholder="Search by supplier"
            />
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Status</span>
              <select value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))} className={selectClassName}>
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
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
                    <th className="px-4 py-3">Request</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4 font-semibold text-[var(--text-strong)]">{request.request_number}</td>
                      <td className="px-4 py-4">{request.product_name}</td>
                      <td className="px-4 py-4">{request.supplier_name}</td>
                      <td className="px-4 py-4">{request.quantity}</td>
                      <td className="px-4 py-4">${Number(request.total_amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 capitalize">{request.status}</td>
                      <td className="space-x-2 px-4 py-4">
                        <Button variant="secondary" onClick={() => { setSelectedRequest(request); setDetailOpen(true); }}>View</Button>
                        {['submitted', 'approved'].includes(request.status) && (
                          <Button variant="outline" onClick={() => receiveRequest(request.id)}>Receive</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!requests.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">No purchase requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} title="Create Purchase Request" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitRequest} className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Product</span>
            <select value={formData.product_id} onChange={event => setFormData(current => ({ ...current, product_id: event.target.value }))} className={selectClassName}>
              <option value="">Select product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Supplier Name" value={formData.supplier_name} onChange={event => setFormData(current => ({ ...current, supplier_name: event.target.value }))} />
            <Input label="Supplier Email" type="email" value={formData.supplier_email} onChange={event => setFormData(current => ({ ...current, supplier_email: event.target.value }))} />
            <Input label="Quantity" type="number" min="1" value={formData.quantity} onChange={event => setFormData(current => ({ ...current, quantity: Number(event.target.value) }))} />
            <Input label="Unit Price" type="number" min="0" step="0.01" value={formData.unit_price} onChange={event => setFormData(current => ({ ...current, unit_price: Number(event.target.value) }))} />
            <Input label="Expected Delivery Date" type="date" value={formData.expected_delivery_date} onChange={event => setFormData(current => ({ ...current, expected_delivery_date: event.target.value }))} />
          </div>
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Notes</span>
            <textarea rows="3" value={formData.notes} onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))} className={`${selectClassName} min-h-[96px]`} />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Request</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} title={selectedRequest ? `Request ${selectedRequest.request_number}` : 'Request Details'} onClose={() => setDetailOpen(false)}>
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Product</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedRequest.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="font-semibold capitalize text-[var(--text-strong)]">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Supplier</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedRequest.supplier_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Quantity</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedRequest.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Unit Price</p>
                <p className="font-semibold text-[var(--text-strong)]">${Number(selectedRequest.unit_price || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Expected Delivery</p>
                <p className="font-semibold text-[var(--text-strong)]">
                  {selectedRequest.expected_delivery_date ? new Date(selectedRequest.expected_delivery_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Notes</p>
              <p className="font-semibold text-[var(--text-strong)]">{selectedRequest.notes || 'No notes provided.'}</p>
            </div>
            <div className="flex justify-end gap-3">
              {['submitted', 'approved'].includes(selectedRequest.status) && (
                <Button onClick={() => receiveRequest(selectedRequest.id)}>Receive Purchase</Button>
              )}
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </ModuleLayout>
  );
}

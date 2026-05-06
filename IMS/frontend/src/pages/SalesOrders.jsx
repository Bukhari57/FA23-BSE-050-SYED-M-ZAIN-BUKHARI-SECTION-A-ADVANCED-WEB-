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

export default function SalesOrders({ theme, setTheme }) {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', customer_name: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }],
    tax_rate: 0,
    discount: 0,
    notes: '',
  });

  useEffect(() => {
    loadOrders();
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.salesOrders.list(filters);
      setOrders(response.orders || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch sales orders', 'error');
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

  const openDetails = async order => {
    try {
      const response = await api.salesOrders.get(order.id);
      setSelectedOrder(response.order || order);
      setSelectedItems(response.items || []);
      setDetailOpen(true);
    } catch (error) {
      toast.push(error.message || 'Failed to load order details', 'error');
    }
  };

  const updateItem = (index, field, value) => {
    setFormData(current => {
      const items = current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ));
      return { ...current, items };
    });
  };

  const addItem = () => {
    setFormData(current => ({
      ...current,
      items: [...current.items, { product_id: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItem = index => {
    setFormData(current => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      items: [{ product_id: '', quantity: 1, unit_price: 0 }],
      tax_rate: 0,
      discount: 0,
      notes: '',
    });
  };

  const submitOrder = async event => {
    event.preventDefault();
    const validItems = formData.items.filter(item => item.product_id && item.quantity > 0 && item.unit_price >= 0);
    if (!formData.customer_name.trim() || validItems.length === 0) {
      toast.push('Customer name and at least one valid item are required', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.salesOrders.create({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        items: validItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
        tax_rate: Number(formData.tax_rate || 0),
        discount: Number(formData.discount || 0),
        notes: formData.notes.trim(),
      });
      toast.push('Sales order created successfully');
      setModalOpen(false);
      resetForm();
      loadOrders();
    } catch (error) {
      toast.push(error.message || 'Failed to create sales order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmOrder = async id => {
    try {
      await api.salesOrders.confirm(id);
      toast.push('Order confirmed successfully');
      if (selectedOrder?.id === id) setDetailOpen(false);
      loadOrders();
    } catch (error) {
      toast.push(error.message || 'Failed to confirm order', 'error');
    }
  };

  const deleteOrder = async id => {
    if (!window.confirm('Delete this sales order?')) return;
    try {
      await api.salesOrders.delete(id);
      toast.push('Order deleted successfully');
      if (selectedOrder?.id === id) setDetailOpen(false);
      loadOrders();
    } catch (error) {
      toast.push(error.message || 'Failed to delete order', 'error');
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Sales orders</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Track customer demand and order flow</h2>
            </div>
            <Button onClick={() => setModalOpen(true)}>Create Order</Button>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Open orders', totalOrders],
            ['Pending confirmation', pendingOrders],
            ['Confirmed', confirmedOrders],
          ].map(([label, value]) => (
            <Card key={label}>
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">{label}</p>
              <p className="mt-3 text-4xl font-semibold text-[var(--text-strong)]">{value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Customer"
              value={filters.customer_name}
              onChange={event => setFilters(current => ({ ...current, customer_name: event.target.value }))}
              placeholder="Search by customer name"
            />
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Status</span>
              <select
                value={filters.status}
                onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}
                className={selectClassName}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
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
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4 font-semibold text-[var(--text-strong)]">{order.order_number}</td>
                      <td className="px-4 py-4">{order.customer_name}</td>
                      <td className="px-4 py-4">{order.item_count ?? 0}</td>
                      <td className="px-4 py-4">${Number(order.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 capitalize">{order.status}</td>
                      <td className="px-4 py-4">{new Date(order.created_at || order.order_date).toLocaleDateString()}</td>
                      <td className="space-x-2 px-4 py-4">
                        <Button variant="secondary" onClick={() => openDetails(order)}>View</Button>
                        {order.status === 'pending' && <Button variant="outline" onClick={() => confirmOrder(order.id)}>Confirm</Button>}
                        <Button variant="ghost" onClick={() => deleteOrder(order.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">No sales orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={modalOpen}
        title="Create Sales Order"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submitOrder} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Customer Name"
              value={formData.customer_name}
              onChange={event => setFormData(current => ({ ...current, customer_name: event.target.value }))}
              placeholder="ACME Corp"
            />
            <Input
              label="Customer Email"
              type="email"
              value={formData.customer_email}
              onChange={event => setFormData(current => ({ ...current, customer_email: event.target.value }))}
              placeholder="buyer@company.com"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text)]">Order Items</p>
              <Button type="button" variant="secondary" onClick={addItem}>Add Item</Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={`${index}-${item.product_id}`} className="grid gap-3 rounded-[1.25rem] border border-[var(--border)] p-4 md:grid-cols-[1.5fr_0.7fr_0.8fr_auto]">
                <select
                  value={item.product_id}
                  onChange={event => {
                    const product = products.find(entry => String(entry.id) === event.target.value);
                    updateItem(index, 'product_id', event.target.value);
                    if (product) updateItem(index, 'unit_price', Number(product.price || 0));
                  }}
                  className={selectClassName}
                >
                  <option value="">Select product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${Number(product.price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={event => updateItem(index, 'quantity', Number(event.target.value))}
                />
                <Input
                  label="Unit Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={event => updateItem(index, 'unit_price', Number(event.target.value))}
                />
                <Button type="button" variant="ghost" className="self-end" onClick={() => removeItem(index)} disabled={formData.items.length === 1}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tax Rate (%)"
              type="number"
              min="0"
              step="0.01"
              value={formData.tax_rate}
              onChange={event => setFormData(current => ({ ...current, tax_rate: Number(event.target.value) }))}
            />
            <Input
              label="Discount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discount}
              onChange={event => setFormData(current => ({ ...current, discount: Number(event.target.value) }))}
            />
          </div>

          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Notes</span>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))}
              className={`${selectClassName} min-h-[96px]`}
              placeholder="Delivery or handling instructions"
            />
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Order'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={detailOpen}
        title={selectedOrder ? `Order ${selectedOrder.order_number}` : 'Order Details'}
        onClose={() => setDetailOpen(false)}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Customer</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="font-semibold capitalize text-[var(--text-strong)]">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Email</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedOrder.customer_email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Total</p>
                <p className="font-semibold text-[var(--text-strong)]">${Number(selectedOrder.total || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-[1.25rem] border border-[var(--border)]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map(item => (
                    <tr key={item.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">${Number(item.unit_price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">${Number(item.line_total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {!selectedItems.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-[var(--muted)]">No line items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              {selectedOrder.status === 'pending' && <Button onClick={() => confirmOrder(selectedOrder.id)}>Confirm Order</Button>}
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </ModuleLayout>
  );
}

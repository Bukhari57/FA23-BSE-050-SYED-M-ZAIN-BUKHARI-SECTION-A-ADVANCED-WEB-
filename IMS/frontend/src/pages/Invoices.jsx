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

export default function Invoices({ theme, setTheme }) {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({ payment_status: '' });
  const [formData, setFormData] = useState({
    sales_order_id: '',
    customer_name: '',
    due_date: '',
    subtotal: 0,
    tax_rate: 0,
    discount: 0,
    payment_method: 'cash',
    notes: '',
  });
  const [paymentData, setPaymentData] = useState({ amount_paid: 0, payment_method: 'cash' });

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.invoices.list(filters);
      setInvoices(response.invoices || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesOrders = async () => {
    try {
      const response = await api.salesOrders.list({ status: 'confirmed' });
      setSalesOrders(response.orders || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch confirmed sales orders', 'error');
    }
  };

  const openDetails = async invoice => {
    try {
      const response = await api.invoices.get(invoice.id);
      setSelectedInvoice(response.invoice || invoice);
      setSelectedItems(response.items || []);
      setDetailOpen(true);
    } catch (error) {
      toast.push(error.message || 'Failed to load invoice details', 'error');
    }
  };

  const createInvoice = async event => {
    event.preventDefault();
    if (!formData.sales_order_id && !formData.customer_name.trim()) {
      toast.push('Select a sales order or provide a customer name', 'error');
      return;
    }

    try {
      await api.invoices.create({
        sales_order_id: formData.sales_order_id ? Number(formData.sales_order_id) : null,
        customer_name: formData.customer_name.trim(),
        due_date: formData.due_date || null,
        subtotal: Number(formData.subtotal || 0),
        tax_rate: Number(formData.tax_rate || 0),
        discount: Number(formData.discount || 0),
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
      });
      toast.push('Invoice created successfully');
      setModalOpen(false);
      setFormData({
        sales_order_id: '',
        customer_name: '',
        due_date: '',
        subtotal: 0,
        tax_rate: 0,
        discount: 0,
        payment_method: 'cash',
        notes: '',
      });
      loadInvoices();
    } catch (error) {
      toast.push(error.message || 'Failed to create invoice', 'error');
    }
  };

  const updatePayment = async () => {
    if (!selectedInvoice) return;
    if (!paymentData.amount_paid) {
      toast.push('Payment amount is required', 'error');
      return;
    }

    try {
      await api.invoices.updatePayment(selectedInvoice.id, {
        amount_paid: Number(paymentData.amount_paid),
        payment_method: paymentData.payment_method,
      });
      toast.push('Payment recorded successfully');
      setPaymentOpen(false);
      setSelectedInvoice(null);
      setPaymentData({ amount_paid: 0, payment_method: 'cash' });
      loadInvoices();
    } catch (error) {
      toast.push(error.message || 'Failed to record payment', 'error');
    }
  };

  const previewInvoice = async id => {
    try {
      const response = await api.invoices.pdf(id);
      const invoice = response.invoice;
      if (!invoice) {
        toast.push('Invoice preview data is unavailable', 'error');
        return;
      }

      const previewWindow = window.open('', '_blank', 'width=900,height=700');
      if (!previewWindow) {
        toast.push('Please allow popups to preview invoice output', 'error');
        return;
      }

      previewWindow.document.write(`
        <html>
          <head>
            <title>${invoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
              h1 { margin-bottom: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 24px; }
              th, td { padding: 10px; border: 1px solid #d1d5db; text-align: left; }
              .meta { margin-bottom: 24px; color: #4b5563; }
            </style>
          </head>
          <body>
            <h1>Invoice ${invoice.invoice_number}</h1>
            <div class="meta">
              <div>Customer: ${invoice.customer_name || 'N/A'}</div>
              <div>Date: ${new Date(invoice.invoice_date).toLocaleDateString()}</div>
              <div>Total: $${Number(invoice.total || 0).toFixed(2)}</div>
            </div>
            <table>
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${(invoice.items || []).map(item => `<tr><td>${item.name || ''}</td><td>${item.quantity || 0}</td><td>$${Number(item.unit_price || 0).toFixed(2)}</td><td>$${Number(item.line_total || 0).toFixed(2)}</td></tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      previewWindow.document.close();
    } catch (error) {
      toast.push(error.message || 'Failed to preview invoice', 'error');
    }
  };

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Invoices</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Bill confirmed orders and track payments</h2>
            </div>
            <Button onClick={() => setModalOpen(true)}>Create Invoice</Button>
          </div>
        </Card>

        <Card>
          <label className="block max-w-sm text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Payment Status</span>
            <select value={filters.payment_status} onChange={event => setFilters(current => ({ ...current, payment_status: event.target.value }))} className={selectClassName}>
              <option value="">All payment states</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </label>
        </Card>

        <Card>
          {loading ? (
            <div className="py-20"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto rounded-[1.5rem] border border-[var(--border)]">
              <table className="min-w-full text-left text-sm text-[var(--text)]">
                <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4 font-semibold text-[var(--text-strong)]">{invoice.invoice_number}</td>
                      <td className="px-4 py-4">{invoice.customer_name}</td>
                      <td className="px-4 py-4">${Number(invoice.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-4">${Number(invoice.amount_paid || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 capitalize">{invoice.payment_status}</td>
                      <td className="space-x-2 px-4 py-4">
                        <Button variant="secondary" onClick={() => openDetails(invoice)}>View</Button>
                        <Button variant="outline" onClick={() => { setSelectedInvoice(invoice); setPaymentOpen(true); }}>Payment</Button>
                        <Button variant="ghost" onClick={() => previewInvoice(invoice.id)}>Preview</Button>
                      </td>
                    </tr>
                  ))}
                  {!invoices.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">No invoices found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} title="Create Invoice" onClose={() => setModalOpen(false)}>
        <form onSubmit={createInvoice} className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Confirmed Sales Order</span>
            <select value={formData.sales_order_id} onChange={event => setFormData(current => ({ ...current, sales_order_id: event.target.value }))} className={selectClassName}>
              <option value="">Manual invoice</option>
              {salesOrders.map(order => (
                <option key={order.id} value={order.id}>{order.order_number} - {order.customer_name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Customer Name" value={formData.customer_name} onChange={event => setFormData(current => ({ ...current, customer_name: event.target.value }))} />
            <Input label="Due Date" type="date" value={formData.due_date} onChange={event => setFormData(current => ({ ...current, due_date: event.target.value }))} />
            <Input label="Subtotal" type="number" min="0" step="0.01" value={formData.subtotal} onChange={event => setFormData(current => ({ ...current, subtotal: Number(event.target.value) }))} />
            <Input label="Tax Rate (%)" type="number" min="0" step="0.01" value={formData.tax_rate} onChange={event => setFormData(current => ({ ...current, tax_rate: Number(event.target.value) }))} />
            <Input label="Discount" type="number" min="0" step="0.01" value={formData.discount} onChange={event => setFormData(current => ({ ...current, discount: Number(event.target.value) }))} />
            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="mb-2 block text-[var(--muted)]">Payment Method</span>
              <select value={formData.payment_method} onChange={event => setFormData(current => ({ ...current, payment_method: event.target.value }))} className={selectClassName}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="upi">UPI</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-[var(--text)]">
            <span className="mb-2 block text-[var(--muted)]">Notes</span>
            <textarea rows="3" value={formData.notes} onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))} className={`${selectClassName} min-h-[96px]`} />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>

      <Modal open={paymentOpen} title={selectedInvoice ? `Record Payment for ${selectedInvoice.invoice_number}` : 'Record Payment'} onClose={() => setPaymentOpen(false)}>
        <div className="space-y-4">
          {selectedInvoice && (
            <>
              <div className="rounded-[1.25rem] border border-[var(--border)] p-4">
                <p className="text-sm text-[var(--muted)]">Outstanding balance</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">
                  ${(Number(selectedInvoice.total || 0) - Number(selectedInvoice.amount_paid || 0)).toFixed(2)}
                </p>
              </div>
              <Input label="Payment Amount" type="number" min="0" step="0.01" value={paymentData.amount_paid} onChange={event => setPaymentData(current => ({ ...current, amount_paid: Number(event.target.value) }))} />
              <label className="block text-sm font-medium text-[var(--text)]">
                <span className="mb-2 block text-[var(--muted)]">Payment Method</span>
                <select value={paymentData.payment_method} onChange={event => setPaymentData(current => ({ ...current, payment_method: event.target.value }))} className={selectClassName}>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="check">Check</option>
                  <option value="upi">UPI</option>
                </select>
              </label>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setPaymentOpen(false)}>Cancel</Button>
                <Button onClick={updatePayment}>Record Payment</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={detailOpen} title={selectedInvoice ? `Invoice ${selectedInvoice.invoice_number}` : 'Invoice Details'} onClose={() => setDetailOpen(false)}>
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Customer</p>
                <p className="font-semibold text-[var(--text-strong)]">{selectedInvoice.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Date</p>
                <p className="font-semibold text-[var(--text-strong)]">{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Total</p>
                <p className="font-semibold text-[var(--text-strong)]">${Number(selectedInvoice.total || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Paid</p>
                <p className="font-semibold text-[var(--text-strong)]">${Number(selectedInvoice.amount_paid || 0).toFixed(2)}</p>
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
                      <td colSpan={4} className="px-4 py-6 text-center text-[var(--muted)]">No invoice line items available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </ModuleLayout>
  );
}

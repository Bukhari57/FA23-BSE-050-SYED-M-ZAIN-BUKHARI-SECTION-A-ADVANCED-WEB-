import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Download } from 'lucide-react';

const fields = ['Product name', 'Category', 'Price', 'Quantity', 'Warehouse', 'Status'];
const selectClassName = 'mt-2 w-full rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),rgba(255,255,255,0.01))] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]';

export default function Products({ theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [productForStock, setProductForStock] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [form, setForm] = useState({ name: '', category_id: '', price: '', quantity: '', warehouse: '' });
  const [formErrors, setFormErrors] = useState({});
  const [searchError, setSearchError] = useState('');
  const searchDebounce = useRef(null);
  const toast = useToast();
  const auth = useAuth();
  const isAdmin = auth.user?.role === 'admin';

  const requestProducts = async (page = 1) => {
    setLoading(true);
    setSearchError('');
    try {
      const response = await api.products.list({ page, limit: pagination.limit, search, category: categoryFilter });
      const normalizedProducts = (response.products || []).map(product => ({
        ...product,
        price: Number(product.price || 0),
        quantity: Number(product.quantity || 0),
      }));
      setProducts(normalizedProducts);
      setPagination({
        page: Number(response.pagination?.page || page),
        limit: Number(response.pagination?.limit || pagination.limit),
        total: Number(response.pagination?.total || 0),
      });
    } catch (error) {
      setProducts([]);
      setPagination(prev => ({ ...prev, total: 0 }));
      const message = error.message || 'Unable to load products';
      setSearchError(message);
      toast.push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.categories.list();
      setCategories(response.categories);
    } catch (error) {
      toast.push(error.message || 'Unable to load categories', 'error');
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await api.warehouses.list();
      setWarehouses(response.warehouses);
    } catch (error) {
      toast.push(error.message || 'Unable to load warehouses', 'error');
    }
  };

  useEffect(() => {
    loadCategories();
    loadWarehouses();
    requestProducts(1);
  }, []);

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      requestProducts(1);
    }, 500);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [search, categoryFilter]);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', category_id: '', price: '', quantity: '', warehouse: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = product => {
    setEditing(product);
    setForm({
      name: product.name,
      category_id: categories.find(cat => cat.name === product.category)?.id || '',
      price: product.price,
      quantity: product.quantity,
      warehouse: product.warehouse || 'Main',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openStockModal = product => {
    setProductForStock(product);
    setStockQuantity(String(product.quantity));
    setStockModalOpen(true);
  };

  const submitStock = async () => {
    if (stockQuantity === '' || Number(stockQuantity) < 0) {
      toast.push('Quantity must be a valid number', 'error');
      return;
    }

    try {
      await api.products.updateStock(productForStock.id, { quantity: Number(stockQuantity) });
      toast.push('Stock updated successfully');
      setStockModalOpen(false);
      setProductForStock(null);
      requestProducts(pagination.page);
    } catch (error) {
      toast.push(error.message || 'Unable to update stock', 'error');
    }
  };

  const submitProduct = async () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Product name is required';
    if (!form.category_id) errors.category_id = 'Category is required';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Valid price is required';
    if (!form.quantity || Number(form.quantity) < 0) errors.quantity = 'Valid quantity is required';
    if (!form.warehouse || !form.warehouse.trim()) errors.warehouse = 'Warehouse is required';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        category_id: Number(form.category_id),
        price: Number(form.price),
        quantity: Number(form.quantity),
        warehouse: form.warehouse.trim(),
      };

      if (editing) {
        await api.products.update(editing.id, payload);
        toast.push('Product updated successfully');
      } else {
        await api.products.create(payload);
        toast.push('Product created successfully');
      }

      setModalOpen(false);
      requestProducts(pagination.page);
    } catch (error) {
      toast.push(error.message || 'Unable to save product', 'error');
    }
  };

  const deleteItem = async id => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.products.delete(id);
      toast.push('Product deleted');
      requestProducts(pagination.page);
    } catch (error) {
      toast.push(error.message || 'Unable to remove product', 'error');
    }
  };

  const paginationButtons = useMemo(() => {
    const pages = [];
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(
        <button
          key={i}
          onClick={() => requestProducts(i)}
          className={`rounded-2xl px-4 py-2 text-sm transition ${pagination.page === i ? 'bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-[#16110b]' : 'border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]'}`}
        >
          {i}
        </button>
      );
    }

    return <div className="flex flex-wrap gap-2">{pages}</div>;
  }, [pagination]);

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
            <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-6 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Product catalogue</p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Manage inventory items</h2>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const csv = ['Product,Category,Price,Quantity,Warehouse,Status'];
                    products.forEach(p => csv.push(`${p.name},${p.category},${p.price},${p.quantity},${p.warehouse || 'Main'},${p.status}`));
                    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'inventory-products.csv';
                    a.click();
                  }}
                  title="Export products to CSV"
                >
                  <Download className="h-4 w-4" /> Export
                </Button>
                {isAdmin && <Button variant="secondary" onClick={openAddModal}>Add Product</Button>}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Input
                label="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by product or category"
              />

              <label className="block text-sm font-medium text-[var(--text)]">
                <span className="text-[var(--muted)]">Category</span>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={selectClassName}>
                  <option value="">All categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4 text-sm text-[var(--muted)]">
              {searchError ? (
                <p className="text-[var(--danger)]">{searchError}</p>
              ) : loading ? (
                <p>{search ? 'Searching products…' : 'Loading products…'}</p>
              ) : search || categoryFilter ? (
                <p>{products.length ? `${products.length} results found` : 'No products match your search criteria.'}</p>
              ) : (
                <p>Use the search box or filters to find products quickly.</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4">
              {loading ? (
                <div className="py-20"><Spinner /></div>
              ) : (
                <table className="min-w-full text-left text-sm text-[var(--text)]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                      {fields.map(field => (<th key={field} className="px-4 py-3">{field}</th>))}
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-soft)]">
                        <td className="px-4 py-4 text-[var(--text-strong)]">{product.name}</td>
                        <td className="px-4 py-4">{product.category}</td>
                        <td className="px-4 py-4">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-4">{product.quantity}</td>
                        <td className="px-4 py-4 text-[var(--muted)]">{product.warehouse || 'Main'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.status === 'Low Stock' ? 'bg-[rgba(239,143,136,0.14)] text-[var(--danger)]' : 'bg-[rgba(103,194,156,0.14)] text-[var(--success)]'}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="space-x-2 px-4 py-4">
                          {isAdmin ? (
                            <>
                              <Button variant="secondary" onClick={() => openEditModal(product)} title="Edit product">Edit</Button>
                              <Button variant="outline" onClick={() => openStockModal(product)} title="Update stock">Stock</Button>
                              <Button variant="ghost" onClick={() => deleteItem(product.id)} title="Delete product">Delete</Button>
                            </>
                          ) : (
                            <Button variant="secondary" onClick={() => openStockModal(product)} title="Update stock">Update Stock</Button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {!products.length && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[var(--muted)]">
              <p>Showing {products.length} of {pagination.total} products</p>
              {paginationButtons}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={modalOpen || stockModalOpen}
        title={stockModalOpen ? `Update stock for ${productForStock?.name || ''}` : editing ? 'Edit product' : 'Add new product'}
        onClose={() => {
          setModalOpen(false);
          setStockModalOpen(false);
        }}
        footer={(
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setStockModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={stockModalOpen ? submitStock : submitProduct}>
              {stockModalOpen ? 'Update stock' : editing ? 'Update' : 'Create'}
            </Button>
          </div>
        )}
      >
        {stockModalOpen ? (
          <div className="grid gap-4">
            <Input
              label="Quantity"
              type="number"
              min="0"
              value={stockQuantity}
              onChange={e => setStockQuantity(e.target.value)}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <Input
              label="Product name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              error={formErrors.name}
            />

            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="text-[var(--muted)]">Category</span>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className={`${selectClassName} ${formErrors.category_id ? '!border-[var(--danger)]' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {formErrors.category_id && <span className="mt-2 block text-xs text-[var(--danger)]">{formErrors.category_id}</span>}
            </label>

            <Input
              label="Price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              error={formErrors.price}
            />

            <Input
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              error={formErrors.quantity}
            />

            <label className="block text-sm font-medium text-[var(--text)]">
              <span className="text-[var(--muted)]">Warehouse</span>
              <select
                value={form.warehouse}
                onChange={e => setForm({ ...form, warehouse: e.target.value })}
                className={`${selectClassName} ${formErrors.warehouse ? '!border-[var(--danger)]' : ''}`}
              >
                <option value="">Select warehouse</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.name}>{wh.name}</option>
                ))}
              </select>
              {formErrors.warehouse && <span className="mt-2 block text-xs text-[var(--danger)]">{formErrors.warehouse}</span>}
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

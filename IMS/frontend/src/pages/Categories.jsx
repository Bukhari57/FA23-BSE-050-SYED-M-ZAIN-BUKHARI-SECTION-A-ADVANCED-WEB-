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

export default function Categories({ theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const toast = useToast();
  const auth = useAuth();
  const isAdmin = auth.user?.role === 'admin';

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await api.categories.list();
      setCategories(response.categories);
    } catch (error) {
      toast.push(error.message || 'Unable to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setName('');
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = category => {
    setEditing(category);
    setName(category.name);
    setModalOpen(true);
  };

  const submitCategory = async () => {
    if (!isAdmin) {
      toast.push('Admin access required to manage categories', 'error');
      return;
    }
    if (!name.trim()) {
      toast.push('Category name is required', 'error');
      return;
    }

    try {
      if (editing) {
        await api.categories.update(editing.id, { name });
        toast.push('Category updated');
      } else {
        await api.categories.create({ name });
        toast.push('Category created');
      }
      setModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.push(error.message || 'Unable to save category', 'error');
    }
  };

  const deleteCategory = async id => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.categories.delete(id);
      toast.push('Category deleted');
      loadCategories();
    } catch (error) {
      toast.push(error.message || 'Unable to delete category', 'error');
    }
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

        <Card>
          <div className="flex flex-col gap-4 rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Category manager</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Organize inventory groups</h2>
            </div>
            {isAdmin && <Button onClick={openAdd}>Add category</Button>}
          </div>

          <div className="mt-6 overflow-x-auto rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-4">
            <table className="min-w-full text-left text-sm text-[var(--text)]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-soft)]">
                    <td className="px-4 py-4 text-[var(--text-strong)]">{category.name}</td>
                    <td className="space-x-2 px-4 py-4">
                      {isAdmin ? (
                        <>
                          <Button variant="secondary" onClick={() => openEdit(category)}>Edit</Button>
                          <Button variant="ghost" onClick={() => deleteCategory(category.id)}>Delete</Button>
                        </>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">Admin only</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && !categories.length && (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-[var(--muted)]">No categories available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit category' : 'Create category'}
        onClose={() => setModalOpen(false)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submitCategory}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        )}
      >
        <Input label="Category name" value={name} onChange={e => setName(e.target.value)} />
      </Modal>
    </div>
  );
}

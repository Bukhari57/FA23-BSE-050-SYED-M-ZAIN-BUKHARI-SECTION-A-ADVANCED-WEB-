import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login({ theme, setTheme }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();

  const demoAccounts = [
    {
      label: 'Admin demo',
      role: 'admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      description: 'Full warehouse, reports, and management access.',
    },
    {
      label: 'User demo',
      role: 'user',
      email: 'tester@example.com',
      password: 'password123',
      description: 'View inventory and run reports with limited access.',
    },
  ];

  const handleFillDemo = account => {
    setForm({ email: account.email, password: account.password });
    setErrors({});
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.email) next.email = 'Email is required';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await api.auth.login(form);
      auth.login(response);
      localStorage.setItem('ims_token', response.token);
      localStorage.setItem('ims_user', JSON.stringify(response.user));
      toast.push('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.push(error.message || 'Unable to login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-panel rounded-[2.5rem] p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Inventory control, refined</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight text-[var(--text-strong)]">
            The premium workspace for modern stock operations.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
            Run products, categories, warehouses, and reporting from a calmer, executive-style command center built for clarity.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Unified workspace', 'Manage inventory, reporting, and warehouse workflows from one surface.'],
              ['Operational visibility', 'See stock health, product movement, and category distribution at a glance.'],
              ['Role-aware access', 'Keep admin controls distinct while preserving fast team workflows.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-panel rounded-[2.5rem] p-10">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Secure access</p>
              <h2 className="mt-4 text-4xl font-semibold text-[var(--text-strong)]">Welcome back</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Sign in with a demo admin or user account. Admin access gives full warehouse and management control, while user access provides inventory visibility and reports.
              </p>
            </div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--surface-strong)]"
            >
              {theme === 'light' ? 'Dark' : 'Light'} mode
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="hello@company.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Enter your password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {demoAccounts.map(account => (
              <div key={account.role} className="rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),transparent)] p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">{account.label}</p>
                <h3 className="mt-3 text-base font-semibold text-[var(--text)]">{account.email}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Password: <span className="font-semibold text-[var(--text)]">{account.password}</span>
                </p>
                <p className="mt-3 text-sm text-[var(--muted)]">{account.description}</p>
                <Button variant="secondary" className="mt-4 w-full" type="button" onClick={() => handleFillDemo(account)}>
                  Use {account.label}
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            New to IMS?{' '}
            <Link to="/signup" className="font-semibold text-[var(--text)] hover:text-[var(--accent-strong)]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

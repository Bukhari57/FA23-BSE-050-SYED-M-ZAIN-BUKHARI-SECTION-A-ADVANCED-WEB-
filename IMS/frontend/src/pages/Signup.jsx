import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Signup({ theme, setTheme }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name) next.name = 'Name is required';
    if (!form.email) next.email = 'Email is required';
    if (!form.password) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await api.auth.signup(form);
      toast.push('Account created successfully');
      navigate('/login');
    } catch (error) {
      toast.push(error.message || 'Unable to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="premium-panel relative z-10 w-full max-w-2xl rounded-[2.5rem] p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Create account</p>
            <h1 className="mt-4 text-4xl font-semibold text-[var(--text-strong)]">Start managing stock with confidence</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Set up a new workspace identity and step into a cleaner inventory environment built for teams that care about polish and speed.
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--surface-strong)]"
          >
            Toggle {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Jane Doe"
          />
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
            placeholder="Create a secure password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create an account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--text)] hover:text-[var(--accent-strong)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

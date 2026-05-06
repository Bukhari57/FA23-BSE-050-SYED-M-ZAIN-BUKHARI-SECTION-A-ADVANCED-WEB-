import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import ModuleLayout from '../components/ModuleLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const typeLabels = {
  low_stock: 'Low Stock',
  expiry_warning: 'Expiry Warning',
  expired: 'Expired',
  order_pending: 'Order Pending',
};

export default function Alerts({ theme, setTheme }) {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [showUnreadOnly]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.alerts.list({ read: showUnreadOnly ? 'false' : 'all' });
      setAlerts(response.alerts || []);
    } catch (error) {
      toast.push(error.message || 'Failed to fetch alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async () => {
    try {
      await api.alerts.generate();
      toast.push('Alerts generated successfully');
      loadAlerts();
    } catch (error) {
      toast.push(error.message || 'Failed to generate alerts', 'error');
    }
  };

  const markRead = async id => {
    try {
      await api.alerts.mark(id);
      toast.push('Alert marked as read');
      loadAlerts();
    } catch (error) {
      toast.push(error.message || 'Failed to mark alert as read', 'error');
    }
  };

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <ModuleLayout theme={theme} setTheme={setTheme}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Alerts</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Monitor urgent inventory events</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{unreadCount} unread notifications in view.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowUnreadOnly(current => !current)}>
                {showUnreadOnly ? 'Show All' : 'Show Unread'}
              </Button>
              <Button onClick={generateAlerts}>Generate Alerts</Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(typeLabels).map(([type, label]) => (
            <Card key={type}>
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">{label}</p>
              <p className="mt-3 text-4xl font-semibold text-[var(--text-strong)]">
                {alerts.filter(alert => alert.type === type).length}
              </p>
            </Card>
          ))}
        </div>

        {loading ? (
          <Card>
            <div className="py-20"><Spinner /></div>
          </Card>
        ) : alerts.length ? (
          <div className="space-y-4">
            {alerts.map(alert => (
              <Card key={alert.id} className={!alert.is_read ? 'border-[var(--accent)]' : ''}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{typeLabels[alert.type] || alert.type}</p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{alert.message}</h3>
                    {alert.product_name && <p className="mt-2 text-sm text-[var(--muted)]">Product: {alert.product_name}</p>}
                    <p className="mt-2 text-xs text-[var(--muted)]">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                  {!alert.is_read && (
                    <Button variant="outline" onClick={() => markRead(alert.id)}>Mark Read</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="py-12 text-center">
              <p className="text-lg text-[var(--text-strong)]">No alerts right now.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Generate alerts to scan for low stock and expiry issues.</p>
            </div>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}

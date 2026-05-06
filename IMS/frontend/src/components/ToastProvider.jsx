import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);

  function push(message, type = 'default') {
    const id = Date.now();
    setMessages(current => [...current, { id, message, type }]);
    setTimeout(() => setMessages(current => current.filter(item => item.id !== id)), 4000);
  }

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {messages.map(({ id, message, type }) => (
          <div key={id} className="premium-panel rounded-[1.75rem] px-4 py-3 text-sm text-[var(--text)]">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{type === 'error' ? 'Error' : 'Success'}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${type === 'error' ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'}`} />
            </div>
            <p className="mt-1 text-[var(--muted)]">{message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

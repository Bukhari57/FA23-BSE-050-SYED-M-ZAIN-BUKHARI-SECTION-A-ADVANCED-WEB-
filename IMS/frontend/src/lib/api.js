const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('ims_token');
  const { body, headers = {}, ...rest } = options;
  const requestHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const requestOptions = {
    ...rest,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body);
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, requestOptions);
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText || 'Request failed';
    if (response.status === 401) {
      // Token invalid, clear it
      localStorage.removeItem('ims_token');
      localStorage.removeItem('ims_user');
      window.location.href = '/login';
    }
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export const api = {
  auth: {
    login: data => request('/auth/login', { method: 'POST', body: data }),
    signup: data => request('/auth/signup', { method: 'POST', body: data }),
  },
  summary: {
    get: () => request('/summary'),
  },
  products: {
    list: params => request(`/products?${new URLSearchParams(params || {}).toString()}`),
    create: data => request('/products', { method: 'POST', body: data }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
    updateStock: (id, data) => request(`/products/${id}/stock`, { method: 'PATCH', body: data }),
    delete: id => request(`/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request('/categories'),
    create: data => request('/categories', { method: 'POST', body: data }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: id => request(`/categories/${id}`, { method: 'DELETE' }),
  },
  warehouses: {
    list: () => request('/warehouses'),
    stats: () => request('/warehouses/stats'),
    create: data => request('/warehouses', { method: 'POST', body: data }),
    update: (id, data) => request(`/warehouses/${id}`, { method: 'PUT', body: data }),
    delete: id => request(`/warehouses/${id}`, { method: 'DELETE' }),
  },
  stockMovements: {
    list: params => request(`/stock-movements?${new URLSearchParams(params || {}).toString()}`),
    create: data => request('/stock-movements', { method: 'POST', body: data }),
    history: product_id => request(`/stock-history/${product_id}`),
  },
  salesOrders: {
    list: params => request(`/sales-orders?${new URLSearchParams(params || {}).toString()}`),
    get: id => request(`/sales-orders/${id}`),
    create: data => request('/sales-orders', { method: 'POST', body: data }),
    confirm: id => request(`/sales-orders/${id}/confirm`, { method: 'PATCH' }),
    update: (id, data) => request(`/sales-orders/${id}`, { method: 'PUT', body: data }),
    delete: id => request(`/sales-orders/${id}`, { method: 'DELETE' }),
  },
  invoices: {
    list: params => request(`/invoices?${new URLSearchParams(params || {}).toString()}`),
    get: id => request(`/invoices/${id}`),
    create: data => request('/invoices', { method: 'POST', body: data }),
    updatePayment: (id, data) => request(`/invoices/${id}/payment`, { method: 'PATCH', body: data }),
    pdf: id => request(`/invoices/${id}/pdf`),
  },
  transfers: {
    list: params => request(`/warehouse-transfers?${new URLSearchParams(params || {}).toString()}`),
    create: data => request('/warehouse-transfers', { method: 'POST', body: data }),
    receive: id => request(`/warehouse-transfers/${id}/receive`, { method: 'PATCH' }),
  },
  purchaseRequests: {
    list: params => request(`/purchase-requests?${new URLSearchParams(params || {}).toString()}`),
    create: data => request('/purchase-requests', { method: 'POST', body: data }),
    receive: id => request(`/purchase-requests/${id}/receive`, { method: 'PATCH' }),
  },
  returns: {
    list: params => request(`/returns?${new URLSearchParams(params || {}).toString()}`),
    create: data => request('/returns', { method: 'POST', body: data }),
    approve: id => request(`/returns/${id}/approve`, { method: 'PATCH' }),
  },
  alerts: {
    list: params => request(`/alerts?${new URLSearchParams(params || {}).toString()}`),
    mark: id => request(`/alerts/${id}/read`, { method: 'PATCH' }),
    generate: () => request('/alerts/generate', { method: 'POST' }),
  },
  dashboard: {
    getPreferences: () => request('/dashboard/preferences'),
    savePreferences: data => request('/dashboard/preferences', { method: 'POST', body: data }),
  },
  reports: {
    sales: params => request(`/reports/sales?${new URLSearchParams(params || {}).toString()}`),
    purchases: params => request(`/reports/purchases?${new URLSearchParams(params || {}).toString()}`),
    stockValuation: () => request('/reports/stock-valuation'),
    expiry: params => request(`/reports/expiry?${new URLSearchParams(params || {}).toString()}`),
    warehouse: () => request('/reports/warehouse'),
    lowStock: params => request(`/reports/low-stock?${new URLSearchParams(params || {}).toString()}`),
    category: () => request('/reports/category'),
  },
};

const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').trim().replace(/\/+$/, '');
let csrf = null;
export function safeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/account';
  try {
    const target = new URL(value, 'https://portal.invalid');
    return target.origin === 'https://portal.invalid' && /^\/(booking|airbnb|account)(\/|$)/.test(target.pathname) ? target.pathname + target.search : '/account';
  } catch { return '/account'; }
}
export async function customerRequest(path, options = {}) {
  const method = options.method || 'GET';
  const headers = { ...options.headers };
  if (!['GET', 'HEAD'].includes(method)) {
    const response = await fetch(`${BASE}/api/customers/auth/csrf/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Unable to prepare a secure request. Please try again.');
    csrf = (await response.json()).csrfToken;
    headers['X-CSRFToken'] = csrf;
    if (options.body) headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${BASE}${path}`, { ...options, method, headers, credentials: 'include' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(typeof data.detail === 'string' ? data.detail : Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : String(value)}`).join(' · ') || `Request failed (${response.status})`);
    error.status = response.status; throw error;
  }
  return options.download ? response.blob() : response.status === 204 ? null : response.json();
}
const post = (path, data) => customerRequest(`/api/customers/${path}/`, { method: 'POST', body: JSON.stringify(data) });
export const customerApi = {
  reviewOptions: () => customerRequest('/api/customers/reviews/eligible/'),
  submitReview: data => post('reviews', data),
  completeService: id => post(`staff/requests/${id}/complete`, {}),
  favourites: () => customerRequest('/api/customers/favourite-rooms/'),
  favourite: (room, saved) => customerRequest('/api/customers/favourite-rooms/', { method: saved ? 'POST' : 'DELETE', body: JSON.stringify({ room }) }),
  catalogue: () => customerRequest('/api/customers/catalogue/'),
  packages: () => customerRequest('/api/customers/staff/packages/'),
  savePackage: (id, data) => customerRequest(`/api/customers/staff/packages/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  me: () => customerRequest('/api/customers/auth/me/'),
  auth: (action, data = {}) => post(`auth/${action}`, data),
  facilities: () => customerRequest('/api/customers/facilities/'),
  list: (resource, page = 1, staff = false) => customerRequest(`/api/customers/${staff ? 'staff/' : ''}${resource}/?page=${page}`),
  detail: (resource, id, staff = false) => customerRequest(`/api/customers/${staff ? 'staff/' : ''}${resource}/${id}/`),
  create: data => post('requests', data),
  messages: (id, page = 1, staff = false) => customerRequest(`/api/customers/${staff ? 'staff/' : ''}requests/${id}/messages/?page=${page}`),
  reply: (id, body, staff = false) => post(`${staff ? 'staff/' : ''}requests/${id}/messages`, { body }),
  update: (id, data) => customerRequest(`/api/customers/staff/requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  issue: (id, data) => post(`staff/requests/${id}/issue-invoice`, data),
  review: (id, data) => post(`invoices/${id}/review`, data),
  void: id => post(`staff/invoices/${id}/void`),
  async download(id, reference, staff = false) {
    const blob = await customerRequest(`/api/customers/${staff ? 'staff/' : ''}invoices/${id}/download/`, { download: true });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `Elparaiso-invoice-${reference}.html`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  },
};

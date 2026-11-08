import { staffApi, staffRequest } from './staffApi';
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').trim().replace(/\/+$/, '');
export const galleryCategories = ['rooms', 'restaurant', 'garden', 'airbnb', 'experiences', 'general'];
export const galleryApi = {
  async list({ category = '', featured = false, page = 1, signal } = {}) {
    const params = new URLSearchParams({ page });
    if (category) params.set('category', category);
    if (featured) params.set('featured', 'true');
    const response = await fetch(`${API_URL}/api/gallery/images/?${params}`, { signal });
    if (!response.ok) throw new Error('We could not load the gallery. Please try again.');
    return response.json();
  },
  staffList: (page = 1) => staffRequest(`/api/gallery/staff/images/?page=${page}`),
  async upload(form) {
    await staffApi.csrf();
    return staffRequest('/api/gallery/staff/images/', { method: 'POST', body: form });
  },
  async update(id, data) {
    await staffApi.csrf();
    return staffRequest(`/api/gallery/staff/images/${id}/`, { method: 'PATCH', body: data instanceof FormData ? data : JSON.stringify(data) });
  },
  async remove(id) {
    await staffApi.csrf();
    return staffRequest(`/api/gallery/staff/images/${id}/`, { method: 'DELETE' });
  },
  async reorder(rows) {
    await staffApi.csrf();
    return staffRequest('/api/gallery/staff/images/reorder/', { method: 'POST', body: JSON.stringify(rows) });
  },
};

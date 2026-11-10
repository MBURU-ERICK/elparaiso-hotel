import { staffApi, staffRequest } from './staffApi';
export const airbnbPhotos = {
  async upload(unitId, file, altText) {
    const form = new FormData();
    form.set('image', file); form.set('alt_text', altText.slice(0, 300));
    await staffApi.csrf();
    return staffRequest(`/api/customers/staff/units/${unitId}/photos/`, { method: 'POST', body: form });
  },
  async remove(unitId, photoId) {
    await staffApi.csrf();
    return staffRequest(`/api/customers/staff/units/${unitId}/photos/${photoId}/`, { method: 'DELETE' });
  },
};

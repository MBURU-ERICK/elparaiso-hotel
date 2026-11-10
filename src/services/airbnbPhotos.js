import { staffApi, staffRequest } from './staffApi';
export const airbnbPhotos = {
  async upload(unitId, file, altText) {
    const form = new FormData();
    form.set('image', file); form.set('alt_text', altText.slice(0, 300));
    await staffApi.csrf();
    try {
      return await staffRequest(`/api/customers/staff/units/${unitId}/photos/`, { method: 'POST', body: form });
    } catch (error) {
      if (error.status === 404) {
        error.message = 'The photo-upload endpoint is unavailable, or access to this room has changed. If the room is still editable, update and restart the backend before uploading again.';
      }
      throw error;
    }
  },
  async remove(unitId, photoId) {
    await staffApi.csrf();
    return staffRequest(`/api/customers/staff/units/${unitId}/photos/${photoId}/`, { method: 'DELETE' });
  },
};

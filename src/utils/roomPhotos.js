export const ROOM_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ROOM_PHOTO_LIMIT = 8 * 1024 * 1024;
export function validateRoomPhotos(files, remaining = 12) {
  if (files.length > remaining) return `Choose at most ${remaining} more photo(s). A room can have 12 photos.`;
  for (const file of files) {
    if (!ROOM_PHOTO_TYPES.includes(file.type)) return `${file.name}: choose a JPEG, PNG or WebP image.`;
    if (file.size > ROOM_PHOTO_LIMIT) return `${file.name}: images must be no larger than 8 MiB.`;
  }
  return '';
}

export function summarizeRoomAmenities(rooms) {
  const features = new Map();
  for (const room of rooms) {
    const seen = new Set();
    for (const value of Array.isArray(room.amenities) ? room.amenities : []) {
      if (typeof value !== 'string' || !value.trim()) continue;
      const name = value.trim();
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const feature = features.get(key) || { name, categories: 0 };
      feature.categories++;
      features.set(key, feature);
    }
  }
  return [...features.values()].sort((a, b) => b.categories - a.categories || a.name.localeCompare(b.name));
}

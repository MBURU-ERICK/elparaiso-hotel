import { useState } from 'react';
export function useRoomPreferences() {
  const [ids, setIds] = useState(() => { try { return JSON.parse(localStorage.getItem('elparaiso-favourites') || '[]'); } catch { return []; } });
  const [classification, setClassification] = useState(''); const [onlyFavourites, setOnlyFavourites] = useState(false);
  function toggle(room) { const next = ids.includes(room) ? ids.filter(id => id !== room) : [...ids, room]; setIds(next); try { localStorage.setItem('elparaiso-favourites', JSON.stringify(next)); } catch { /* Preferences remain available for this visit. */ } }
  function filter(rooms) { return rooms.filter(room => (!classification || room.name === classification) && (!onlyFavourites || ids.includes(room.id))); }
  return { ids, toggle, filter, classification, setClassification, onlyFavourites, setOnlyFavourites, pending: null, error: '' };
}

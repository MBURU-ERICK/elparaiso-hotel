import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { customerApi } from '../customer/customerApi';
import { useCustomer } from '../customer/context';
export function useRoomPreferences() {
  const { user } = useCustomer(); const navigate = useNavigate(); const location = useLocation();
  const [state, setState] = useState({ owner: null, ids: [], pending: null, error: '' });
  const [classification, setClassification] = useState(''); const [onlyFavourites, setOnlyFavourites] = useState(false);
  const owner = user?.id || null;
  const ids = state.owner === owner ? state.ids : [];
  useEffect(() => {
    if (!owner || !user?.verified) return;
    let active = true;
    customerApi.favourites().then(rows => { if (active) setState({ owner, ids: rows, pending: null, error: '' }); }).catch(() => { if (active) setState({ owner, ids: [], pending: null, error: 'Saved rooms could not be loaded. Try refreshing.' }); });
    return () => { active = false; };
  }, [owner, user?.verified]);
  async function toggle(room) {
    if (!user) { navigate(`/account/login?next=${encodeURIComponent(location.pathname + location.search)}`); return; }
    if (!user.verified) { setState(previous => ({ ...previous, error: 'Verify your email in your account to save favourite rooms.' })); return; }
    if (state.pending !== null) return;
    const save = !ids.includes(room);
    setState(previous => ({ ...previous, owner, pending: room, error: '' }));
    try { await customerApi.favourite(room, save); setState(previous => ({ owner, ids: save ? [...previous.ids.filter(id => id !== room), room] : previous.ids.filter(id => id !== room), pending: null, error: '' })); }
    catch { setState(previous => ({ ...previous, pending: null, error: 'Unable to save this preference. Please try again.' })); }
  }
  function filter(rooms) { return rooms.filter(room => (!classification || room.name === classification) && (!onlyFavourites || ids.includes(room.id))); }
  return { ids, toggle, filter, classification, setClassification, onlyFavourites, setOnlyFavourites, pending: state.pending, error: state.owner === owner ? state.error : '' };
}

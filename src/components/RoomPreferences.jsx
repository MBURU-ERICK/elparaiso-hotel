import { Heart } from 'lucide-react';
import './RoomPreferences.css';
export function RoomFilters({ rooms, preferences }) {
  return <div className="room-preferences"><label>Room classification<select value={preferences.classification} onChange={event => preferences.setClassification(event.target.value)}><option value="">All classifications</option>{[...new Set(rooms.map(room => room.name))].sort().map(name => <option key={name}>{name}</option>)}</select></label><button type="button" className="room-favourites-filter" aria-pressed={preferences.onlyFavourites} onClick={() => preferences.setOnlyFavourites(value => !value)}><Heart size={17} />Favourites{preferences.ids.length > 0 ? ` (${preferences.ids.length})` : ''}</button>{preferences.error && <p role="alert">{preferences.error}</p>}</div>;
}
export function FavouriteRoom({ room, preferences }) {
  const saved = preferences.ids.includes(room.id);
  return <button type="button" className="room-favourite" aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${room.name} ${saved ? 'from' : 'to'} favourites`} disabled={preferences.pending !== null} onClick={() => preferences.toggle(room.id)}><Heart size={20} fill={saved ? 'currentColor' : 'none'} /></button>;
}

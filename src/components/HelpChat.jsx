import { useState } from 'react';
import { Link } from 'react-router-dom';
const topics = [ ['Find a room', '/rooms', 'Browse rooms, compare amenities and choose your stay.'], ['Book a stay', '/booking', 'Choose your dates and room, then send a request. Our team replies by email.'], ['Browse photographs', '/gallery', 'Explore the property and use the photograph controls to browse images.'], ['Booking updates', '/contact', 'Reply to your booking email or contact our team for an update.'], ['Contact the hotel', '/contact', 'Find hotel contact details and get help from our team.'] ];
export default function HelpChat() {
 const [open, setOpen] = useState(false);
 const [selected, setSelected] = useState(null);
 return <div className="help-chat">{open && <section id="help-chat-panel" aria-label="Navigation assistant"><header><strong>Elparaiso guide</strong><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></header><p>Welcome! Choose what you’d like help finding.</p><small>Automated navigation guide</small><div className="help-topics">{topics.map(([label, path, description]) => <button key={path} onClick={() => setSelected({label, path, description})}>{label}</button>)}</div>{selected && <div role="status"><p>{selected.description}</p><Link to={selected.path} onClick={() => setOpen(false)}>{selected.label} →</Link></div>}</section>}<button className="help-toggle" aria-expanded={open} aria-controls="help-chat-panel" onClick={() => setOpen(v => !v)}> {open ? 'Close guide' : 'Chat · Need help?'}</button></div>;
}

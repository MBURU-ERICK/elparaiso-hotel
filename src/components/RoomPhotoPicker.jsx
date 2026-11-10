import { useEffect, useState } from 'react';
import { UploadCloud, X, ImagePlus } from 'lucide-react';
import { validateRoomPhotos } from '../utils/roomPhotos';
function LocalPreview({ file, onRemove, disabled }) {
  const [url] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <article className="room-photo-preview"><img src={url} alt={`Selected photo: ${file.name}`} /><button type="button" disabled={disabled} onClick={onRemove} aria-label={`Remove selected photo ${file.name}`}><X size={15} /></button><small>{file.name}</small></article>;
}
export default function RoomPhotoPicker({ files, onChange, disabled = false, existingCount = 0, multiple = true }) {
  const [error, setError] = useState('');
  function choose(event) {
    const next = Array.from(event.target.files || []);
    const all = multiple ? [...files, ...next] : next.slice(0, 1);
    const message = validateRoomPhotos(all, multiple ? 12 - existingCount : 1);
    setError(message); if (!message) onChange(all);
    event.target.value = '';
  }
  return <div className="room-photo-picker"><label className="room-photo-dropzone"><UploadCloud size={28} /><strong>{multiple ? 'Upload room photos from your device' : 'Upload a room photo from your device'}</strong><span>Choose JPEG, PNG or WebP · up to 8 MiB per photo</span><input aria-label={multiple ? 'Choose room photos' : 'Choose room photo'} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={choose} disabled={disabled || (multiple && existingCount + files.length >= 12)} /><span className="room-photo-browse"><ImagePlus size={16} /> Browse photos</span></label><small>At least 200px per side. Photos are saved when you save the room.</small>{error && <p role="alert" className="portal-alert">{error}</p>}{files.length > 0 && <div className="room-photo-preview-grid">{files.map((file, index) => <LocalPreview key={`${file.name}:${file.lastModified}:${index}`} file={file} disabled={disabled} onRemove={() => onChange(files.filter((_, n) => n !== index))} />)}</div>}</div>;
}

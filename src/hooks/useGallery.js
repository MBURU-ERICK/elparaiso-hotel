import { useEffect, useState } from 'react';
import { galleryApi } from '../services/galleryApi';
export function useGallery({ category = '', featured = false, page = 1 } = {}) {
  const [state, setState] = useState({ images: [], count: 0, loading: true, error: '', key: '' });
  const [revision, setRevision] = useState(0);
  const queryKey = `${category}:${featured}:${page}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    galleryApi.list({ category, featured, page, signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setState({ images: data.results, count: data.count, loading: false, error: '', key: queryKey }); })
      .catch(error => { if (!controller.signal.aborted) setState({ images: [], count: 0, loading: false, error: error.message, key: queryKey }); });
    return () => controller.abort();
  }, [category, featured, page, revision, queryKey]);
  const visible = state.key === queryKey ? { images: state.images, count: state.count, loading: state.loading, error: state.error } : { images: [], count: 0, loading: true, error: '' };
  return { ...visible, retry: () => setRevision(n => n + 1) };
}

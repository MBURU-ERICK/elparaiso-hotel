import { useEffect, useState } from 'react';
import { galleryApi } from '../services/galleryApi';
export function useGallery({ category = '', featured = false, page = 1 } = {}) {
  const [state, setState] = useState({ images: [], count: 0, loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    galleryApi.list({ category, featured, page, signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setState({ images: data.results, count: data.count, loading: false, error: '' }); })
      .catch(error => { if (!controller.signal.aborted) setState({ images: [], count: 0, loading: false, error: error.message }); });
    return () => controller.abort();
  }, [category, featured, page, revision]);
  return { ...state, retry: () => { setState(s => ({ ...s, loading: true })); setRevision(n => n + 1); } };
}

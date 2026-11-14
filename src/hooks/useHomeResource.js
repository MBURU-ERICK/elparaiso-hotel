import { useEffect, useState } from 'react';
const cache = new Map();
/** Public catalogue only. Stale data is retained during refresh; never used to confirm availability. */
export function useHomeResource(key, loader) {
  const [state, setState] = useState(() => ({ data: cache.get(key)?.data, error: false }));
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      const cached = cache.get(key);
      if (!cached?.pending) {
        const pending = Promise.resolve().then(loader).then(data => { cache.set(key, { data }); return data; }, error => { cache.set(key, { data: cached?.data }); throw error; });
        cache.set(key, { data: cached?.data, pending });
      }
      cache.get(key).pending.then(data => { if (active) setState({ data, error: false }); }, () => { if (active) setState(old => ({ ...old, error: true })); });
    };
    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); window.removeEventListener('online', refresh); window.removeEventListener('focus', refresh); };
  }, [key, loader, revision]);
  return { ...state, retry: () => setRevision(n => n + 1) };
}

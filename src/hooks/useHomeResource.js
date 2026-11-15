import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { createPublicResourceCache } from '../utils/publicResourceCache';
const cache = createPublicResourceCache();
/** Shared public catalogue only; submission endpoints always validate current data. */
export function useHomeResource(key, loader) {
  const subscribe = useCallback(listener => cache.subscribe(key, listener), [key]);
  const getSnapshot = useCallback(() => cache.getSnapshot(key), [key]);
  const state = useSyncExternalStore(subscribe, getSnapshot, cache.getServerSnapshot);
  useEffect(() => {
    const refresh = () => { if (!document.hidden) cache.load(key, loader); };
    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => { window.clearInterval(timer); window.removeEventListener('online', refresh); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [key, loader]);
  const retry = useCallback(() => cache.load(key, loader, { force: true }), [key, loader]);
  return { ...state, retry };
}

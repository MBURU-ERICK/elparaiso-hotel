const emptySnapshot = Object.freeze({ data: undefined, error: false });

/** Read-only public catalogue data. Never use this cache to confirm availability. */
export function createPublicResourceCache({ maxAge = 60000, now = Date.now } = {}) {
  const entries = new Map();
  function entry(key) {
    if (!entries.has(key)) entries.set(key, { snapshot: emptySnapshot, listeners: new Set(), updatedAt: null, pending: null });
    return entries.get(key);
  }
  function publish(record, snapshot) {
    record.snapshot = snapshot;
    for (const listener of record.listeners) listener();
  }
  return {
    getSnapshot: key => entry(key).snapshot,
    getServerSnapshot: () => emptySnapshot,
    subscribe(key, listener) {
      const record = entry(key);
      record.listeners.add(listener);
      return () => record.listeners.delete(listener);
    },
    load(key, loader, { force = false } = {}) {
      const record = entry(key);
      if (record.pending) return record.pending;
      if (!force && record.updatedAt !== null && now() - record.updatedAt < maxAge) return Promise.resolve(record.snapshot.data);
      record.pending = Promise.resolve().then(loader).then(data => {
        record.updatedAt = now();
        publish(record, { data, error: false });
        return data;
      }, () => {
        publish(record, { data: record.snapshot.data, error: true });
        return record.snapshot.data;
      }).finally(() => { record.pending = null; });
      return record.pending;
    },
  };
}

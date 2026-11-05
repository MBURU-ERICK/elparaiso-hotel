import { useEffect, useState } from 'react';
import { customerApi } from './customerApi';
export function usePortalResource(resource, page = 1, staff = false, id = null) {
  const [state, setState] = useState({ data: null, error: '', key: '' }); const [revision, setRevision] = useState(0);
  const key = `${resource}:${page}:${staff}:${id}:${revision}`;
  useEffect(() => {
    let active = true;
    (id ? customerApi.detail(resource, id, staff) : customerApi.list(resource, page, staff))
      .then(data => { if (active) setState({ data, error: '', key }); })
      .catch(err => { if (active) setState({ data: null, error: err.message, key }); });
    return () => { active = false; };
  }, [resource, page, staff, id, revision, key]);
  return { data: state.key === key ? state.data : null, error: state.key === key ? state.error : '', loading: state.key !== key, retry: () => setRevision(n => n + 1) };
}

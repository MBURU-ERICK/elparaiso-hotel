import { useEffect, useState } from 'react';
import { CustomerContext } from './context';
import { customerApi } from './customerApi';
export default function CustomerProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true, error: '' });
  async function refresh() {
    try { const user = await customerApi.me(); setState({ user, loading: false, error: '' }); return user; }
    catch (err) { setState({ user: null, loading: false, error: err.status === 401 ? '' : err.message }); return null; }
  }
  useEffect(() => {
    let active = true;
    customerApi.me().then(user => { if (active) setState({ user, loading: false, error: '' }); })
      .catch(err => { if (active) setState({ user: null, loading: false, error: err.status === 401 ? '' : err.message }); });
    return () => { active = false; };
  }, []);
  return <CustomerContext value={{ ...state, refresh }}>{children}</CustomerContext>;
}

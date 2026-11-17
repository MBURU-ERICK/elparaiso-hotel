import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import WorkspaceHeader from '../components/WorkspaceHeader';
import { staffApi, staffRequest } from '../services/staffApi';

export default function StaffUserRights() {
  const { user } = useOutletContext();
  const [data, setData] = useState(null), [selected, setSelected] = useState(''), [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user.is_superuser) return;
    let active = true;
    staffRequest('/api/staff/admin/user-rights/').then(result => { if (active) setData(result); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [user.is_superuser]);
  if (!user.is_superuser) return <p role="alert">Administrator access required.</p>;
  const account = data?.users.find(item => String(item.id) === selected);
  function choose(id) {
    setSelected(id); setNotice(''); setError('');
    setAssignments(data.users.find(item => String(item.id) === id)?.assignments.map(item => ({ ...item })) || []);
  }
  function update(index, field, value) { setAssignments(rows => rows.map((row, i) => i === index ? { ...row, [field]: value } : row)); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await staffApi.csrf();
      const result = await staffRequest(`/api/staff/admin/user-rights/${selected}/`, { method: 'PUT', body: JSON.stringify(assignments) });
      setData(result); setNotice('User rights saved. Removed assignments revoke facility access immediately.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main><WorkspaceHeader eyebrow="STAFF ACCESS" title="User rights" description="Assign a role at each facility. Staff can only access records for their assigned facilities." actions={<Link to="/staff/admin">Create staff account →</Link>} />
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {!data ? <p role="status">Loading staff rights…</p> : <form className="portal-form workspace-panel" onSubmit={save}>
      <label>Staff account<select value={selected} disabled={busy} onChange={e => choose(e.target.value)} required><option value="">Choose a staff account</option>{data.users.map(item => <option key={item.id} value={item.id}>{item.name || item.username} ({item.username}){item.is_superuser ? ' · Administrator' : ''}{!item.is_active ? ' · Inactive' : ''}</option>)}</select></label>
      {account?.is_superuser ? <p>Administrators have access to all facilities.</p> : account && <>
        {!account.is_active && <p>This account is inactive. Rights cannot be changed.</p>}
        <fieldset disabled={busy || !account.is_active}><legend>Facility assignments</legend>
          {!assignments.length && <p>No facility access assigned.</p>}
          {assignments.map((row, index) => <fieldset key={index}><legend>Assignment {index + 1}</legend>
            <label>Facility<select value={row.facility_id} onChange={e => update(index, 'facility_id', Number(e.target.value))} required><option value="">Choose a facility</option>{data.facilities.filter(f => f.is_active || f.id === row.facility_id).map(f => <option key={f.id} value={f.id}>{f.name}{!f.is_active ? ' · Inactive' : ''}</option>)}</select></label>
            <label>Role<select value={row.role} onChange={e => update(index, 'role', e.target.value)}>{data.roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
            <p>Allowed actions: {data.roles.find(role => role.value === row.role)?.actions.map(action => action.replaceAll('_', ' ')).join(', ')}.</p>
            <label><input type="checkbox" checked={row.is_active} onChange={e => update(index, 'is_active', e.target.checked)} /> Access enabled</label>
            <button type="button" onClick={() => setAssignments(rows => rows.filter((_, i) => i !== index))}>Remove assignment</button>
          </fieldset>)}
          <button type="button" onClick={() => setAssignments(rows => [...rows, { facility_id: '', role: 'reception', is_active: true }])}>Add facility assignment</button>
        </fieldset><button disabled={busy || !account.is_active}>{busy ? 'Saving…' : 'Save user rights'}</button>
      </>}
    </form>}
  </main>;
}

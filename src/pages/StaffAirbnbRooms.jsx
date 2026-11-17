import { useOutletContext } from 'react-router-dom';
import StaffUnitManager from '../components/StaffUnitManager';
export default function StaffAirbnbRooms() {
  const { user } = useOutletContext();
  const canManage = user.is_superuser || user.facilities?.some(f => ['airbnb', 'mixed'].includes(f.facility_type) && f.actions?.includes('manage'));
  return <main><header className="workspace-page-heading"><div><span className="eyebrow">YOUR PRIVATE-STAY COLLECTION</span><h1>Private-stay room management</h1><p>{canManage ? 'Manage rooms, prices and photos for your assigned private-stay facilities.' : 'View rooms, availability and details for your assigned private-stay facilities.'}</p></div></header><StaffUnitManager /></main>;
}

import { useEffect, useState } from 'react';
import { todayInNairobi } from '../utils/stayDates';
export function useNairobiToday() {
  const [today, setToday] = useState(todayInNairobi);
  useEffect(() => {
    const refresh = () => setToday(todayInNairobi());
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return today;
}

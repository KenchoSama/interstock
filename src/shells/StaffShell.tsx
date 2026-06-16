import { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import Shell from '../components/layout/Shell';
import PageRouter from '../pages/PageRouter';

export default function StaffShell() {
  const { dispatch } = useApp();
  useEffect(() => { dispatch({ type: 'LOGIN', role: 'staff' }); }, []);
  return <Shell><PageRouter /></Shell>;
}

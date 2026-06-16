import { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import Shell from '../components/layout/Shell';
import PageRouter from '../pages/PageRouter';

export default function PartnerShell() {
  const { dispatch } = useApp();
  useEffect(() => { dispatch({ type: 'LOGIN', role: 'partner' }); }, []);
  return <Shell><PageRouter /></Shell>;
}

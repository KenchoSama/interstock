import { useApp } from '../state/AppContext';
import Shell from '../components/layout/Shell';
import PageRouter from '../pages/PageRouter';
import Assessment from '../pages/Assessment';

export default function StudentShell() {
  const { state } = useApp();
  const user = state.u[state.role];

  if (!user.hasAssessment) {
    return <Assessment />;
  }

  return <Shell><PageRouter /></Shell>;
}

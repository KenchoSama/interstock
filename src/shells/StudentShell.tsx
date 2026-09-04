import { useApp } from '../state/AppContext';
import Shell from '../components/layout/Shell';
import PageRouter from '../pages/PageRouter';
import Assessment from '../pages/Assessment';
import CodeOfConduct from '../pages/CodeOfConduct';
import OnboardingTour from '../components/OnboardingTour';

export default function StudentShell() {
  const { state } = useApp();
  const user = state.u[state.role];

  if (!user.hasAgreedToCoC) {
    return <CodeOfConduct />;
  }

  if (!user.hasAssessment) {
    return <Assessment />;
  }

  return (
    <>
      <Shell><PageRouter /></Shell>
      <OnboardingTour />
    </>
  );
}

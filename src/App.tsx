import { AppProvider, useApp } from './state/AppContext';
import Login from './pages/Login';
import Shell from './components/layout/Shell';
import './styles/global.css';

function AppInner() {
  const { state } = useApp();
  return state.screen === 'login' ? <Login /> : <Shell />;
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { supabase } from '../lib/supabase';
import { hydrateUser } from '../hooks/useAuthSync';
import interstockLogo from '../assets/interstock-logo.png';

export default function ResetPassword() {
  const { dispatch } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await hydrateUser(session.user.id, dispatch);
    } else {
      dispatch({ type: 'SET_SCREEN', screen: 'login' });
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <img className="login-logo" src={interstockLogo} alt="InterStock" />
        <div className="login-tagline">Set a new password</div>

        <label className="login-label">New Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          autoFocus
        />
        <label className="login-label">Confirm Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
        />

        <button className="login-btn" onClick={handleUpdatePassword} disabled={loading}>
          {loading ? 'Updating...' : 'Update Password →'}
        </button>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}

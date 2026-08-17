import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { supabase } from '../lib/supabase';
import { hydrateUser } from '../hooks/useAuthSync';
import interstockLogo from '../assets/interstock-logo.png';

export default function Login() {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleEmailAuth() {
    setError('');
    setMessage('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'student' } }
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email to confirm your account, then sign in.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await hydrateUser(data.user.id, dispatch);
      }
    }
    setLoading(false);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <img className="login-logo" src={interstockLogo} alt="InterStock" />
        <div className="login-tagline">Financial Literacy for the Next Generation</div>

        {isSignUp && (
          <>
            <label className="login-label">Full Name</label>
            <input
              className="login-input"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </>
        )}
        <label className="login-label">Email</label>
        <input
          className="login-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          autoFocus
        />
        <label className="login-label">Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
        />
        <button className="login-btn" onClick={handleEmailAuth} disabled={loading}>
          {loading ? 'Please wait...' : isSignUp ? 'Create Account →' : 'Sign In →'}
        </button>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', marginTop: 8 }}
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>

        {error && <div className="login-error">{error}</div>}
        {message && <div style={{ color: '#4ade80', fontSize: 13, marginTop: 8 }}>{message}</div>}
      </div>
    </div>
  );
}

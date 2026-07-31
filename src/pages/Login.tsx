import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { supabase } from '../lib/supabase';
import { hydrateUser } from '../hooks/useAuthSync';
import type { Role } from '../types';

const ROLE_LABELS: Record<Role, string> = {
  student: 'Student',
  school_admin: 'School Admin',
  parent: 'Parent',
  partner: 'Partner',
  admin: 'Admin',
  staff: 'Staff',
};

export default function Login() {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [demoRole, setDemoRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function handleDemo() {
    dispatch({ type: 'LOGIN', role: demoRole });
  }

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
        <div className="login-logo">InterStock</div>
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

        {/* Demo section */}
        <div style={{ marginTop: 28, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
            Demo — sign in as:
          </div>
          <div className="login-roles">
            {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
              <button
                key={r}
                className={`role-chip ${demoRole === r ? 'active' : ''}`}
                onClick={() => setDemoRole(r)}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={handleDemo}
          >
            Enter as {ROLE_LABELS[demoRole]}
          </button>
        </div>
      </div>
    </div>
  );
}

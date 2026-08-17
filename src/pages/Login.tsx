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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleForgotPassword() {
    setError('');
    if (!email) {
      setError('Enter your email above first, then click "Forgot password?"');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setResetSent(true);
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
        <img className="login-logo" src={interstockLogo} alt="InterStock" />
        <div className="login-tagline">Financial Literacy for the Next Generation</div>

        {showForgotPassword ? (
          <>
            {resetSent ? (
              <div style={{ color: '#4ade80', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                If an account exists for {email}, a password reset link has been sent. Check your inbox.
              </div>
            ) : (
              <>
                <label className="login-label">Email</label>
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  autoFocus
                />
                <button className="login-btn" onClick={handleForgotPassword} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </>
            )}
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', marginTop: 8 }}
              onClick={() => { setShowForgotPassword(false); setResetSent(false); setError(''); }}
            >
              ← Back to sign in
            </button>
            {error && <div className="login-error">{error}</div>}
          </>
        ) : (
          <>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer' }}
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>

              {!isSignUp && (
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer' }}
                  onClick={() => { setShowForgotPassword(true); setError(''); setMessage(''); }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {error && <div className="login-error">{error}</div>}
            {message && <div style={{ color: '#4ade80', fontSize: 13, marginTop: 8 }}>{message}</div>}
          </>
        )}
      </div>
    </div>
  );
}

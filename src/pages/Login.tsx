import { useState } from 'react';
import { useApp } from '../state/AppContext';
import type { Role } from '../types';

const ROLE_CODES: Record<string, Role> = {
  interstock2025: 'admin',
  student2025: 'student',
  school2025: 'school_admin',
  parent2025: 'parent',
  partner2025: 'partner',
  staff2025: 'staff',
};

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
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [demoRole, setDemoRole] = useState<Role>('student');

  function handleLogin() {
    const role = ROLE_CODES[code.trim().toLowerCase()];
    if (role) {
      dispatch({ type: 'LOGIN', role });
    } else {
      setError('Invalid access code. Try student2025, school2025, parent2025, partner2025, staff2025, or interstock2025.');
    }
  }

  function handleDemo() {
    dispatch({ type: 'LOGIN', role: demoRole });
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">Inter<span>Stock</span></div>
        <div className="login-tagline">Financial Literacy for the Next Generation</div>

        <label className="login-label">Access Code</label>
        <input
          className="login-input"
          type="password"
          placeholder="Enter your access code"
          value={code}
          onChange={e => { setCode(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoFocus
        />

        <button className="login-btn" onClick={handleLogin}>
          Sign In →
        </button>

        {error && <div className="login-error">{error}</div>}

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

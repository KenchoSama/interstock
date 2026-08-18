import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { useStudentDirectory } from '../hooks/useStudentDirectory';

export default function StudentDirectory() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const [query, setQuery] = useState('');
  const { students, loading } = useStudentDirectory(query);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Student Directory</div>
          <div className="page-subtitle">Search for a fellow student to view their profile</div>
        </div>
      </div>

      <div className="page-body">
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '10px 14px',
            fontSize: 14,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            marginBottom: 16,
            boxSizing: 'border-box',
          }}
        />

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>
              Searching...
            </div>
          )}

          {!loading && students.length === 0 && (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>
              No students found.
            </div>
          )}

          {!loading && students.map(s => (
            <div
              key={s.id}
              onClick={() =>
                dispatch(
                  s.id === user.supabaseId
                    ? { type: 'SET_VIEW', view: 'profile' }
                    : { type: 'VIEW_STUDENT_PROFILE', studentId: s.id }
                )
              }
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gr2), #00e676)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, color: 'var(--bg)', flexShrink: 0,
              }}>
                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                  {s.name}
                  {s.id === user.supabaseId && (
                    <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 20, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                      YOU
                    </span>
                  )}
                </div>
                {s.school && (
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.school}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

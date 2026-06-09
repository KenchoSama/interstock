import { useState } from 'react';

const STUDENTS = ['Marcus Rivera', 'Sofia Castillo', 'Diego Fernandez', 'Layla Hassan', 'Tyler Brooks', 'Ana Gutierrez', 'Jordan Smith'];
const LEVEL_OPTIONS = ['Level 1', 'Level 2', 'All Levels'];

interface RecentItem { title: string; due: string; subs: number }

const RECENT_ISSUED: RecentItem[] = [
  { title: 'Market Analysis', due: 'May 9',  subs: 0 },
  { title: 'Budget Worksheet', due: 'Mar 28', subs: 7 },
  { title: 'Stock Pitch',      due: 'Apr 10', subs: 5 },
];

export default function StaffAssign() {
  const [title, setTitle]     = useState('');
  const [instr, setInstr]     = useState('');
  const [due, setDue]         = useState('');
  const [level, setLevel]     = useState('Level 1');
  const [who, setWho]         = useState('all');
  const [issued, setIssued]   = useState<RecentItem[]>([]);
  const [modal, setModal]     = useState<{ title: string; count: number } | null>(null);

  function issueAssignment() {
    if (!title.trim()) return;
    const count = who === 'all' ? STUDENTS.length : 1;
    const newItem: RecentItem = { title, due: due || '—', subs: 0 };
    setIssued(prev => [newItem, ...prev]);
    setModal({ title, count });
    setTitle(''); setInstr(''); setDue('');
  }

  const allRecent = [...issued, ...RECENT_ISSUED];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>

          {/* Main form */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Issue New Assignment
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                STAFF TOOL
              </span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Tip */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 6, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ flexShrink: 0 }}>📋</span>
                <span>Assignments appear immediately in students' tabs with a blue "STAFF ASSIGNED" badge.</span>
              </div>

              {/* Title */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Assignment Title</div>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Market Analysis: Tech Sector" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>

              {/* Instructions */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Instructions</div>
                <textarea value={instr} onChange={e => setInstr(e.target.value)} rows={4} placeholder="Describe what students should do and how it will be graded..." style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              {/* Due Date + Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Due Date</div>
                  <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Level</div>
                  <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                    {LEVEL_OPTIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Assign To */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Assign To</div>
                <select value={who} onChange={e => setWho(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="all">All students ({STUDENTS.length})</option>
                  {STUDENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Submit */}
              <button
                onClick={issueAssignment}
                style={{ width: '100%', padding: '12px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                📤 Issue Assignment →
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Recent Issued
            </div>
            <div style={{ padding: '4px 0' }}>
              {allRecent.map((a, i) => (
                <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5 }}>{a.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text3)' }}>Due: {a.due}</span>
                    <span style={{ fontFamily: 'monospace', color: '#00e676' }}>{a.subs}/{STUDENTS.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', maxWidth: 360, width: '100%' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📤</div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 10 }}>ASSIGNMENT ISSUED!</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              "{modal.title}" sent to <strong style={{ color: 'var(--text)' }}>{modal.count} student{modal.count > 1 ? 's' : ''}</strong>
            </div>
            <button
              onClick={() => setModal(null)}
              style={{ width: '100%', padding: 11, fontSize: 13, fontWeight: 700, background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Done →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

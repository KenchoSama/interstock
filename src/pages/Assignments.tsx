import { useState } from 'react';
import { useApp } from '../state/AppContext';

interface Assignment {
  id: string;
  title: string;
  due: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  description: string;
  xpReward: number;
}

const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1', title: 'Build a Diversified Portfolio', due: '2026-06-10', status: 'pending',
    description: 'Invest your virtual $100,000 across at least 5 different sectors. Write a 200-word thesis explaining your selections.',
    xpReward: 75,
  },
  {
    id: 'a2', title: 'Analyze a Company\'s Fundamentals', due: '2026-06-17', status: 'submitted',
    description: 'Choose any stock from our universe. Research its P/E ratio, earnings growth, debt levels, and competitive position. Present in a 300-word report.',
    xpReward: 100,
  },
  {
    id: 'a3', title: 'Options Strategy Proposal', due: '2026-05-30', status: 'graded', grade: 92,
    description: 'Describe a real-world scenario where you would use a covered call strategy. Include the setup, risk/reward, and outcome scenarios.',
    xpReward: 125,
  },
];

export default function Assignments() {
  const { dispatch } = useApp();
  const [submissions, setSubmissions] = useState<Record<string, string>>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Assignments 📝</div>
          <div className="page-subtitle">School projects and teacher-assigned tasks</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {DEMO_ASSIGNMENTS.map(a => (
            <div key={a.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Due: {a.due}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="xp-tag">+{a.xpReward} XP</span>
                  <span className={`badge ${a.status === 'graded' ? 'badge-green' : a.status === 'submitted' ? 'badge-blue' : 'badge-yellow'}`}>
                    {a.status === 'graded' ? `Graded: ${a.grade}%` : a.status === 'submitted' ? 'Submitted' : 'Pending'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>{a.description}</div>
              {a.status === 'pending' && (
                <div>
                  <textarea
                    style={{ width: '100%', height: 100, marginBottom: 8 }}
                    placeholder="Type your response here…"
                    value={submissions[a.id] ?? ''}
                    onChange={e => setSubmissions(p => ({ ...p, [a.id]: e.target.value }))}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      dispatch({ type: 'ADD_XP', amount: a.xpReward });
                    }}
                    disabled={!submissions[a.id]?.trim()}
                  >
                    Submit Assignment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

interface DemoMentor {
  id: string;
  name: string;
  title: string;
  co: string;
  bio: string;
  partner: string;
  school?: string;
  student?: string;
}

const MY_MENTORS: DemoMentor[] = [
  {
    id: 'm1',
    name: 'Sarah Mitchell',
    title: 'Capital Markets Professional',
    co: 'Financial Partner',
    bio: 'Harvard MBA. Equity capital markets specialist.',
    partner: 'financial-partner',
    student: 'Layla Hassan',
  },
];

const ALL_MENTORS: DemoMentor[] = [
  { id: 'm2', name: 'David Park',    title: 'Senior Analyst',   co: 'Partner Institution', partner: 'partner-inst', school: 'Lincoln High School' },
  { id: 'm1', name: 'Sarah Mitchell', title: 'Capital Markets Professional', co: 'Financial Partner', partner: 'financial-partner', student: 'Layla Hassan', bio: '' },
  { id: 'm3', name: 'Carlos Vega',   title: 'Portfolio Manager', co: 'Partner Institution', partner: 'partner-inst', school: 'Westlake HS' },
];

const SCHOOL_NAMES = ['Lincoln High School', 'Westlake HS', 'Riverside HS', 'St. Joseph Academy'];
const TOP_STUDENTS = ['Layla Hassan', 'Jordan Smith', 'Marcus Rivera', 'Ana Gutierrez', 'Sofia Castillo'];

function initials(name: string) {
  return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
}

export default function Mentors() {
  const [assignType, setAssignType] = useState<'school' | 'student'>('school');
  const [mentorName, setMentorName] = useState('');
  const [mentorTitle, setMentorTitle] = useState('');
  const [school, setSchool] = useState(SCHOOL_NAMES[0]);
  const [student, setStudent] = useState(TOP_STUDENTS[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Info tip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
          <span>🤝</span>
          <span>Assign mentors from your organization to students or schools. They appear in the student's dashboard with a "Book a Meeting" calendar button.</span>
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* Left — active mentors */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Your Active Mentors</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                {MY_MENTORS.length} ASSIGNED
              </span>
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MY_MENTORS.map(m => (
                <div key={m.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,230,118,0.3), rgba(0,230,118,0.1))', border: '2px solid rgba(0,230,118,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#00e676', flexShrink: 0 }}>
                      {initials(m.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.title} · {m.co}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                      {m.student ? 'STUDENT' : 'SCHOOL'}
                    </span>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '10px 14px' }}>
                    {m.bio && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{m.bio}</div>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {m.student && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.25)' }}>
                          ↑ {m.student}
                        </span>
                      )}
                      {m.school && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                          🏫 {m.school}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Assign New Mentor form */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Assign New Mentor
              </div>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Mentor Name</div>
                  <input value={mentorName} onChange={e => setMentorName(e.target.value)} placeholder="Dr. Jane Smith" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Title</div>
                  <input value={mentorTitle} onChange={e => setMentorTitle(e.target.value)} placeholder="VP, Capital Markets" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Assign To</div>
                  <select value={assignType} onChange={e => setAssignType(e.target.value as 'school' | 'student')} style={{ width: '100%', boxSizing: 'border-box' }}>
                    <option value="school">Entire School</option>
                    <option value="student">Specific Student</option>
                  </select>
                </div>
                {assignType === 'school' && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>School</div>
                    <select value={school} onChange={e => setSchool(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                      {SCHOOL_NAMES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {assignType === 'student' && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Student</div>
                    <select value={student} onChange={e => setStudent(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                      {TOP_STUDENTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}>
                  Assign Mentor →
                </button>
              </div>
            </div>

            {/* All Platform Mentors */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                All Platform Mentors
              </div>
              <div style={{ padding: '6px 0' }}>
                {ALL_MENTORS.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,230,118,0.3), rgba(0,230,118,0.1))', border: '1px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: '#00e676', flexShrink: 0 }}>
                      {initials(m.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.co}</div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>
                      {m.student ?? m.school ?? 'Unassigned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

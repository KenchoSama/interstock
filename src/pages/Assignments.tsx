import { useRef, useState } from 'react';
import { useApp } from '../state/AppContext';

interface Assignment {
  id: number;
  title: string;
  cls: string;
  due: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  instr?: string;
  file?: string;
  src: 'student' | 'staff';
  sub?: string;
  by?: string;
  xpReward: number;
}

const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: 'Build a Diversified Portfolio',
    cls: 'Portfolio Management',
    due: 'Jun 10, 2026',
    status: 'pending',
    src: 'student',
    xpReward: 75,
    instr: 'Invest your virtual $100,000 across at least 5 different sectors. Write a 200-word thesis explaining your selections.',
  },
  {
    id: 2,
    title: "Analyze a Company's Fundamentals",
    cls: 'Equity Research',
    due: 'Jun 17, 2026',
    status: 'submitted',
    src: 'staff',
    file: 'apple_analysis.docx',
    sub: 'Jun 8, 2026',
    by: 'Ms. Lewis',
    xpReward: 100,
    instr: 'Choose any stock from our universe. Research its P/E ratio, earnings growth, debt levels, and competitive position.',
  },
  {
    id: 3,
    title: 'Options Strategy Proposal',
    cls: 'Derivatives',
    due: 'May 30, 2026',
    status: 'graded',
    grade: '92%',
    src: 'student',
    file: 'options_strategy.pdf',
    sub: 'May 28, 2026',
    xpReward: 125,
    instr: 'Describe a real-world scenario where you would use a covered call strategy. Include the setup, risk/reward, and outcome scenarios.',
  },
];

const ACCEPTED_FORMATS = [
  { f: 'PDF', u: 'Reports & Essays' },
  { f: 'DOCX', u: 'Word Documents' },
  { f: 'PPTX', u: 'Presentations' },
  { f: 'XLSX', u: 'Spreadsheets' },
];

function AssignmentCard({
  assignment: a,
  onFileSubmit,
}: {
  assignment: Assignment;
  onFileSubmit: (id: number, filename: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusColor =
    a.status === 'graded'
      ? 'var(--gr)'
      : a.status === 'submitted'
      ? 'var(--blue)'
      : 'var(--yellow)';

  const statusBg =
    a.status === 'graded'
      ? 'var(--gr-dim)'
      : a.status === 'submitted'
      ? 'var(--blue-dim)'
      : 'rgba(249,199,79,0.12)';

  const borderColor =
    a.status === 'pending' && a.src === 'staff'
      ? 'rgba(77,159,255,0.35)'
      : a.status === 'graded'
      ? 'rgba(0,212,168,0.25)'
      : 'var(--border)';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius)',
        padding: 14,
        marginBottom: 10,
      }}
    >
      {/* Status badge + grade row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: statusBg,
              color: statusColor,
            }}
          >
            {a.status.toUpperCase()}
          </span>
          {a.src === 'staff' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background: 'var(--blue-dim)',
                color: 'var(--blue)',
              }}
            >
              STAFF ASSIGNED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {a.grade && (
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gr)' }}>{a.grade}</span>
          )}
          <span className="xp-tag">+{a.xpReward} XP</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        {a.title}
      </div>

      {/* Meta line */}
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: a.instr ? 10 : 0 }}>
        {a.cls} · Due: {a.due}
        {a.sub && ` · Submitted: ${a.sub}`}
        {a.by && ` · From: ${a.by}`}
      </div>

      {/* Instructions box */}
      {a.instr && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text2)',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 10,
            marginBottom: 10,
            lineHeight: 1.6,
          }}
        >
          {a.instr}
        </div>
      )}

      {/* Upload zone or file display */}
      {a.status === 'pending' ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '1.5px dashed var(--border2)',
            borderRadius: 8,
            padding: '16px 12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: 'var(--surface2)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gr)';
            (e.currentTarget as HTMLDivElement).style.background = 'var(--gr-dim)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)';
            (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)';
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 6 }}>📁</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Drop file or click to upload
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>PDF, DOCX, PPTX, XLSX</div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".pdf,.docx,.pptx,.xlsx"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onFileSubmit(a.id, f.name);
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>
            {(a.file ?? '').endsWith('.pdf') ? '📄' : '📝'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.file}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              {a.status === 'graded' ? 'Graded ✓' : 'Awaiting review'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Assignments() {
  const { dispatch } = useApp();
  const [assigns, setAssigns] = useState<Assignment[]>(DEMO_ASSIGNMENTS);

  function submitFile(id: number, filename: string) {
    setAssigns(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'submitted', file: filename } : a))
    );
    dispatch({ type: 'ADD_XP', amount: 15 });
  }

  const pendingCount = assigns.filter(a => a.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Assignments</div>
          <div className="page-subtitle">School projects and teacher-assigned tasks</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* Main — assignments list */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div className="section-title" style={{ marginBottom: 0 }}>My Assignments</div>
              <span className="badge badge-red">{pendingCount} PENDING</span>
            </div>
            {assigns.map(a => (
              <AssignmentCard key={a.id} assignment={a} onFileSubmit={submitFile} />
            ))}
          </div>

          {/* Sidebar — accepted formats */}
          <div className="card card-sm">
            <div className="card-title">Accepted Formats</div>
            {ACCEPTED_FORMATS.map(f => (
              <div
                key={f.f}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'rgba(0,212,168,0.10)',
                    color: 'var(--gr)',
                  }}
                >
                  {f.f}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{f.u}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.65, marginTop: 10 }}>
              Graded within 48 hours. Staff assignments show a blue badge.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

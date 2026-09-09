import { useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { useAssignments } from '../hooks/useAssignments';
import { supabase } from '../lib/supabase';

interface Assignment {
  id: string;
  title: string;
  cls: string;
  due: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  instr?: string;
  file?: string;
  fileUrl?: string;
  attachmentUrl?: string;
  src: 'student' | 'staff';
  sub?: string;
  by?: string;
  xpReward: number;
}

const ACCEPTED_FORMATS = [
  { f: 'PDF', u: 'Reports & Essays' },
  { f: 'DOCX', u: 'Word Documents' },
  { f: 'PPTX', u: 'Presentations' },
  { f: 'XLSX', u: 'Spreadsheets' },
];

function AssignmentCard({
  assignment: a,
  onFileSubmit,
  submitting,
  submitError,
}: {
  assignment: Assignment;
  onFileSubmit: (id: string, file: File) => void;
  submitting: boolean;
  submitError?: string;
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

      {/* Attachment from the assignment itself, provided by admin/staff */}
      {a.attachmentUrl && (
        <a
          href={a.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600,
            color: 'var(--blue)', textDecoration: 'none',
            background: 'var(--blue-dim)', border: '1px solid var(--blue)', borderRadius: 6,
            padding: 8, marginBottom: 10,
          }}
        >
          📄 View Assignment Attachment
        </a>
      )}

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
          onClick={() => !submitting && fileInputRef.current?.click()}
          style={{
            border: '1.5px dashed var(--border2)',
            borderRadius: 8,
            padding: '16px 12px',
            textAlign: 'center',
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            transition: 'var(--transition)',
            background: 'var(--surface2)',
          }}
          onMouseEnter={e => {
            if (submitting) return;
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
            {submitting ? 'Uploading...' : 'Drop file or click to upload'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>PDF, DOCX, PPTX, XLSX</div>
          {submitError && (
            <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{submitError}</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".pdf,.docx,.pptx,.xlsx"
            disabled={submitting}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onFileSubmit(a.id, f);
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
            {a.fileUrl ? (
              <a
                href={a.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}
              >
                {a.file ?? 'View submission'}
              </a>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.file ?? 'Submitted'}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              {a.status === 'graded' ? 'Graded ✓' : 'Awaiting review'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function filenameFromUrl(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop() ?? url);
  } catch {
    return url;
  }
}

export default function Assignments() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { assignments, loading, submitAssignment } = useAssignments(
    user.supabaseId,
    user.school_id ?? null
  );
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});

  async function submitFile(assignmentId: string, file: File) {
    if (!user.supabaseId) return;
    setSubmittingId(assignmentId);
    setSubmitErrors(prev => ({ ...prev, [assignmentId]: '' }));

    const xpReward = assignments.find(a => a.id === assignmentId)?.xp_reward ?? 0;
    const { error } = await submitAssignment(assignmentId, user.supabaseId, file);
    setSubmittingId(null);

    if (error) {
      setSubmitErrors(prev => ({ ...prev, [assignmentId]: error }));
      return;
    }

    dispatch({ type: 'ADD_XP', amount: xpReward });
    await supabase.rpc('increment_xp', { user_id: user.supabaseId, amount: xpReward });
  }

  const pendingCount = assignments.filter(a => a.status === 'pending').length;

  // Map AssignmentRow to the shape AssignmentCard expects
  const assigns: Assignment[] = assignments.map(a => ({
    id: a.id,
    title: a.title,
    cls: 'Assignment',
    due: a.due_date
      ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No due date',
    status: a.status,
    grade: a.grade != null ? `${a.grade}%` : undefined,
    instr: a.description ?? undefined,
    file: a.submission_file_url ? filenameFromUrl(a.submission_file_url) : undefined,
    fileUrl: a.submission_file_url ?? undefined,
    attachmentUrl: a.file_url ?? undefined,
    src: 'staff',
    sub: a.submitted_at
      ? new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined,
    xpReward: a.xp_reward,
  }));

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

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
                Loading assignments...
              </div>
            )}

            {!loading && assigns.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
                No assignments yet.
              </div>
            )}

            {!loading && assigns.map(a => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onFileSubmit={submitFile}
                submitting={submittingId === a.id}
                submitError={submitErrors[a.id] || undefined}
              />
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

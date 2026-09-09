import { useMemo, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { useAdminAssignments } from '../hooks/useAdminAssignments';
import { useAdminAssignmentRoster } from '../hooks/useAdminAssignmentRoster';
import { downloadCsv, toCsv } from '../lib/csv';

function formatDate(iso: string | null): string {
  if (!iso) return 'No due date';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

type RosterFilter = 'all' | 'submitted' | 'missing';

function RosterModal({ assignmentId, assignmentTitle, onClose }: {
  assignmentId: string;
  assignmentTitle: string;
  onClose: () => void;
}) {
  const { roster, loading, error } = useAdminAssignmentRoster(assignmentId);
  const [filter, setFilter] = useState<RosterFilter>('all');
  const [search, setSearch] = useState('');

  const submittedCount = roster.filter(r => r.submitted).length;

  const visible = useMemo(() => {
    return roster.filter(r => {
      if (filter === 'submitted' && !r.submitted) return false;
      if (filter === 'missing' && r.submitted) return false;
      if (search.trim() && !r.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [roster, filter, search]);

  function handleExport() {
    const csv = toCsv(
      ['Student', 'School', 'Status', 'Grade', 'Submitted At', 'Attachment URL'],
      visible.map(r => [
        r.name,
        r.schoolName ?? '',
        r.submitted ? (r.status === 'graded' ? 'Graded' : 'Submitted') : 'Not Submitted',
        r.grade ?? '',
        r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
        r.fileUrl ?? '',
      ])
    );
    const safeTitle = assignmentTitle.trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'assignment';
    downloadCsv(`${safeTitle}_roster.csv`, csv);
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 520, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Roster</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>{assignmentTitle}</div>
          </div>
          {!loading && !error && roster.length > 0 && (
            <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, flexShrink: 0 }} onClick={handleExport}>
              ⬇ Export CSV
            </button>
          )}
        </div>

        {!loading && !error && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['all', 'submitted', 'missing'] as RosterFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${filter === f ? 'var(--gr)' : 'var(--border)'}`,
                  background: filter === f ? 'var(--gr-dim)' : 'var(--surface2)',
                  color: filter === f ? 'var(--gr)' : '#fff',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'missing' ? 'Not Submitted' : f} {f === 'submitted' ? `(${submittedCount})` : f === 'missing' ? `(${roster.length - submittedCount})` : `(${roster.length})`}
              </button>
            ))}
          </div>
        )}

        {!loading && !error && (
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            style={{ width: '100%', boxSizing: 'border-box', marginBottom: 12, color: '#fff' }}
          />
        )}

        {loading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Loading roster...</div>}
        {!loading && error && <div style={{ textAlign: 'center', padding: 24, color: 'var(--red)', fontSize: 13 }}>Couldn't load roster. {error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No students match.</div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visible.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {r.schoolName ?? 'No school'}
                    {r.submitted && r.submittedAt && ` · Submitted ${formatDate(r.submittedAt)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {r.fileUrl && (
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}
                    >
                      View
                    </a>
                  )}
                  {r.submitted ? (
                    <span className={`badge ${r.status === 'graded' ? 'badge-blue' : 'badge-green'}`}>
                      {r.status === 'graded' ? `Graded${r.grade != null ? ` ${r.grade}%` : ''}` : 'Submitted'}
                    </span>
                  ) : (
                    <span className="badge badge-red">Not Submitted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function AdminAssignments() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { assignments, totalStudents, loading, error, createAssignment, deleteAssignment, updateXpReward } = useAdminAssignments();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [xpReward, setXpReward] = useState(15);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [rosterTarget, setRosterTarget] = useState<{ id: string; title: string } | null>(null);

  function pickFile(f: File | undefined | null) {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setSubmitError('Only PDF files are supported.');
      return;
    }
    setSubmitError(null);
    setFile(f);
  }

  async function handleAssign() {
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await createAssignment({
      title,
      description,
      dueDate,
      file,
      createdBy: user.supabaseId,
      xpReward,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSuccessCount(totalStudents);
    setTitle('');
    setDescription('');
    setDueDate('');
    setXpReward(15);
    setFile(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteAssignment(deleteTarget.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteTarget(null);
  }

  const canSubmit = title.trim().length > 0 && !submitting;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Assignments</div>
          <div className="page-subtitle">Assign work to every student on the platform</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* New assignment form */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              New Assignment
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 6, fontSize: 12, color: '#fff' }}>
                <span style={{ flexShrink: 0 }}>📋</span>
                <span>This will be assigned to all {totalStudents} student{totalStudents === 1 ? '' : 's'} on InterStock.</span>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Assignment Title
                </div>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Market Analysis"
                  style={{ width: '100%', boxSizing: 'border-box', color: '#fff' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Description
                </div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what students should do and how it will be graded..."
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                    Due Date
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', color: '#fff', colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                    XP Reward
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={xpReward}
                    onChange={e => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', boxSizing: 'border-box', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Attachment (optional)
                </div>
                {file ? (
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)',
                      border: '1px solid var(--border)', borderRadius: 6, padding: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#fff' }}>{file.name}</div>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => setFile(null)}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOver(false);
                      pickFile(e.dataTransfer.files?.[0]);
                    }}
                    style={{
                      border: `1.5px dashed ${dragOver ? 'var(--gr)' : 'var(--border2)'}`,
                      borderRadius: 8,
                      padding: '16px 12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? 'var(--gr-dim)' : 'var(--surface2)',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>📁</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      Drop PDF or click to upload
                    </div>
                    <div style={{ fontSize: 11, color: '#fff' }}>PDF only, up to 15MB</div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      onChange={e => pickFile(e.target.files?.[0])}
                    />
                  </div>
                )}
              </div>

              {submitError && (
                <div style={{ fontSize: 12, color: 'var(--red)' }}>{submitError}</div>
              )}

              <button
                onClick={handleAssign}
                disabled={!canSubmit}
                style={{
                  width: '100%', padding: 12, fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8,
                  background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)',
                  cursor: canSubmit ? 'pointer' : 'default', opacity: canSubmit ? 1 : 0.5,
                }}
              >
                {submitting ? 'Assigning...' : '📤 Assign to All Students →'}
              </button>
            </div>
          </div>

          {/* Issued assignments list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Issued Assignments
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: 30, color: '#fff', fontSize: 13 }}>
                Loading...
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--red)', fontSize: 13 }}>
                Couldn't load assignments. {error}
              </div>
            )}

            {!loading && !error && assignments.length === 0 && (
              <div style={{ textAlign: 'center', padding: 30, color: '#fff', fontSize: 13 }}>
                No assignments issued yet.
              </div>
            )}

            {!loading && !error && assignments.map(a => (
              <div key={a.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{a.title}</div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 10, padding: '2px 8px', color: 'var(--red)', flexShrink: 0 }}
                    onClick={() => { setDeleteTarget({ id: a.id, title: a.title }); setDeleteError(null); }}
                  >
                    Delete
                  </button>
                </div>
                {a.file_url && (
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}
                  >
                    📄 View attachment
                  </a>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: '#fff' }}>Due: {formatDate(a.due_date)}</span>
                  <button
                    onClick={() => setRosterTarget({ id: a.id, title: a.title })}
                    style={{
                      fontFamily: 'monospace', color: '#00e676', background: 'none', border: 'none',
                      cursor: 'pointer', padding: 0, textDecoration: 'underline',
                    }}
                    title="View roster"
                  >
                    {a.submissionCount}/{totalStudents}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: '#fff' }}>XP Reward</span>
                  <input
                    type="number"
                    min={0}
                    defaultValue={a.xp_reward}
                    onBlur={e => {
                      const v = Math.max(0, parseInt(e.target.value) || 0);
                      if (v !== a.xp_reward) updateXpReward(a.id, v);
                    }}
                    style={{ width: 60, fontSize: 11, padding: '2px 6px', color: '#fff' }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Roster modal */}
      {rosterTarget && (
        <RosterModal
          assignmentId={rosterTarget.id}
          assignmentTitle={rosterTarget.title}
          onClose={() => setRosterTarget(null)}
        />
      )}

      {/* Success modal */}
      {successCount !== null && (
        <div
          onClick={() => setSuccessCount(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', maxWidth: 360, width: '100%' }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>📤</div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 10, color: '#fff' }}>ASSIGNMENT ISSUED!</div>
            <div style={{ fontSize: 13, color: '#fff', marginBottom: 20 }}>
              Sent to <strong style={{ color: '#fff' }}>{successCount} student{successCount === 1 ? '' : 's'}</strong>
            </div>
            <button
              onClick={() => setSuccessCount(null)}
              style={{ width: '100%', padding: 11, fontSize: 13, fontWeight: 700, background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Done →
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 440, width: '100%', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
              Delete "{deleteTarget.title}"?
            </div>
            <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.6, marginBottom: 16 }}>
              This removes the assignment for every student. This cannot be undone.
            </div>
            {deleteError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{deleteError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: 'var(--red)', color: '#fff', opacity: deleting ? 0.4 : 1 }}
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { useAdminAssignments } from '../hooks/useAdminAssignments';

function formatDate(iso: string | null): string {
  if (!iso) return 'No due date';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default function AdminAssignments() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { assignments, totalStudents, loading, error, createAssignment, deleteAssignment } = useAdminAssignments();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              New Assignment
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 6, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ flexShrink: 0 }}>📋</span>
                <span>This will be assigned to all {totalStudents} student{totalStudents === 1 ? '' : 's'} on InterStock.</span>
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Assignment Title
                </div>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Market Analysis"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Description
                </div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what students should do and how it will be graded..."
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Due Date
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
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
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{file.name}</div>
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
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                      Drop PDF or click to upload
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>PDF only, up to 15MB</div>
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
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Issued Assignments
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>
                Loading...
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--red)', fontSize: 13 }}>
                Couldn't load assignments. {error}
              </div>
            )}

            {!loading && !error && assignments.length === 0 && (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>
                No assignments issued yet.
              </div>
            )}

            {!loading && !error && assignments.map(a => (
              <div key={a.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{a.title}</div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: 'var(--text3)' }}>Due: {formatDate(a.due_date)}</span>
                  <span style={{ fontFamily: 'monospace', color: '#00e676' }}>
                    {a.submissionCount}/{totalStudents}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

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
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 10 }}>ASSIGNMENT ISSUED!</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              Sent to <strong style={{ color: 'var(--text)' }}>{successCount} student{successCount === 1 ? '' : 's'}</strong>
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
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
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

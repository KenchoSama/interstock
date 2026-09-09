import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { useAdminAnnouncements } from '../hooks/useAdminAnnouncements';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default function AdminAnnouncements() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { announcements, schools, totalStudents, loading, error, createAnnouncement, deleteAnnouncement } = useAdminAnnouncements();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'schools'>('all');
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSchool(schoolId: string) {
    setSelectedSchoolIds(prev => {
      const next = new Set(prev);
      if (next.has(schoolId)) next.delete(schoolId);
      else next.add(schoolId);
      return next;
    });
  }

  const recipientCount =
    target === 'all'
      ? totalStudents
      : schools.filter(s => selectedSchoolIds.has(s.id)).reduce((sum, s) => sum + s.studentCount, 0);

  async function handleSend() {
    setSubmitting(true);
    setSubmitError(null);
    const schoolIds = target === 'all' ? [] : Array.from(selectedSchoolIds);
    if (target === 'schools' && schoolIds.length === 0) {
      setSubmitting(false);
      setSubmitError('Select at least one school.');
      return;
    }
    const { error } = await createAnnouncement({ title, body, createdBy: user.supabaseId, schoolIds });
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSuccessCount(recipientCount);
    setTitle('');
    setBody('');
    setTarget('all');
    setSelectedSchoolIds(new Set());
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteAnnouncement(deleteTarget.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteTarget(null);
  }

  const canSubmit =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    !submitting &&
    (target === 'all' || selectedSchoolIds.size > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Announcements</div>
          <div className="page-subtitle">Broadcast a message to every student, or target specific schools</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* New announcement form */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              New Announcement
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 6, fontSize: 12, color: '#fff' }}>
                <span style={{ flexShrink: 0 }}>📣</span>
                <span>
                  This will appear in the inbox of {target === 'all' ? 'all' : ''} {recipientCount} student{recipientCount === 1 ? '' : 's'}
                  {target === 'all' ? ' on InterStock.' : ' at the selected school(s).'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Send To
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setTarget('all')}
                    style={{
                      flex: 1, padding: '8px 10px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer',
                      border: `1px solid ${target === 'all' ? 'var(--gr)' : 'var(--border)'}`,
                      background: target === 'all' ? 'var(--gr-dim)' : 'var(--surface2)',
                      color: target === 'all' ? 'var(--gr)' : '#fff',
                    }}
                  >
                    All Schools
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget('schools')}
                    style={{
                      flex: 1, padding: '8px 10px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer',
                      border: `1px solid ${target === 'schools' ? 'var(--gr)' : 'var(--border)'}`,
                      background: target === 'schools' ? 'var(--gr-dim)' : 'var(--surface2)',
                      color: target === 'schools' ? 'var(--gr)' : '#fff',
                    }}
                  >
                    Specific Schools
                  </button>
                </div>

                {target === 'schools' && (
                  <div style={{ marginTop: 10, maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid var(--border)', borderRadius: 6, padding: 8 }}>
                    {schools.length === 0 && (
                      <div style={{ fontSize: 12, color: '#fff', padding: '4px 2px' }}>No schools yet.</div>
                    )}
                    {schools.map(s => (
                      <label
                        key={s.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#fff', padding: '4px 2px', cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSchoolIds.has(s.id)}
                          onChange={() => toggleSchool(s.id)}
                        />
                        <span style={{ flex: 1 }}>{s.name}</span>
                        <span style={{ color: 'var(--text3)' }}>{s.studentCount} student{s.studentCount === 1 ? '' : 's'}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Title
                </div>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Spring Tournament Starts Monday"
                  style={{ width: '100%', boxSizing: 'border-box', color: '#fff' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  Message
                </div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  placeholder="Write the announcement..."
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', color: '#fff' }}
                />
              </div>

              {submitError && (
                <div style={{ fontSize: 12, color: 'var(--red)' }}>{submitError}</div>
              )}

              <button
                onClick={handleSend}
                disabled={!canSubmit}
                style={{
                  width: '100%', padding: 12, fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8,
                  background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)',
                  cursor: canSubmit ? 'pointer' : 'default', opacity: canSubmit ? 1 : 0.5,
                }}
              >
                {submitting ? 'Sending...' : target === 'all' ? '📣 Send to All Students →' : '📣 Send to Selected Schools →'}
              </button>
            </div>
          </div>

          {/* Sent announcements list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Sent Announcements
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: 30, color: '#fff', fontSize: 13 }}>
                Loading...
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--red)', fontSize: 13 }}>
                Couldn't load announcements. {error}
              </div>
            )}

            {!loading && !error && announcements.length === 0 && (
              <div style={{ textAlign: 'center', padding: 30, color: '#fff', fontSize: 13 }}>
                No announcements sent yet.
              </div>
            )}

            {!loading && !error && announcements.map(a => (
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
                <div style={{ fontSize: 11, color: '#fff', marginBottom: 4, lineHeight: 1.5 }}>
                  {a.body.length > 120 ? `${a.body.slice(0, 120)}…` : a.body}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#fff' }}>{formatDate(a.created_at)}</span>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: a.schoolNames ? 'var(--blue-dim)' : 'rgba(0,212,168,0.10)',
                      color: a.schoolNames ? 'var(--blue)' : 'var(--gr)',
                    }}
                    title={a.schoolNames ? a.schoolNames.join(', ') : undefined}
                  >
                    {a.schoolNames ? (a.schoolNames.length === 1 ? a.schoolNames[0] : `${a.schoolNames.length} schools`) : 'All Schools'}
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
            <div style={{ fontSize: 52, marginBottom: 14 }}>📣</div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 10, color: '#fff' }}>ANNOUNCEMENT SENT!</div>
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
              This removes the announcement from every student's inbox. This cannot be undone.
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

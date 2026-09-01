import { useState } from 'react';
import { useAdminCompetitions } from '../hooks/useAdminCompetitions';
import { useAdminTournamentSchools } from '../hooks/useAdminTournamentSchools';

const STATUSES = ['upcoming', 'active', 'completed'];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ManageSchoolsModal({ competitionId, competitionName, onClose }: {
  competitionId: string;
  competitionName: string;
  onClose: () => void;
}) {
  const { schools, loading, error, enterSchool } = useAdminTournamentSchools(competitionId);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [enterError, setEnterError] = useState<string | null>(null);

  async function handleEnter(schoolId: string) {
    setEnteringId(schoolId);
    setEnterError(null);
    const { error } = await enterSchool(schoolId);
    setEnteringId(null);
    if (error) setEnterError(error);
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Manage Schools</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{competitionName}</div>

        {loading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Loading schools...</div>}
        {!loading && error && <div style={{ textAlign: 'center', padding: 24, color: 'var(--red)', fontSize: 13 }}>Couldn't load schools. {error}</div>}
        {!loading && !error && schools.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No schools yet.</div>
        )}

        {!loading && !error && schools.length > 0 && (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schools.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                {s.entered ? (
                  <span className="badge badge-green">Entered</span>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={enteringId === s.id}
                    onClick={() => handleEnter(s.id)}
                  >
                    {enteringId === s.id ? 'Entering...' : 'Enter'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {enterError && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 12 }}>{enterError}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Competitions() {
  const { competitions, loading, error, createCompetition, updateStatus, deleteCompetition } = useAdminCompetitions();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [prize, setPrize] = useState('');
  const [startingCash, setStartingCash] = useState(10000);
  const [xpRequired, setXpRequired] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [manageTarget, setManageTarget] = useState<{ id: string; name: string } | null>(null);

  function resetForm() {
    setName('');
    setType('');
    setPrize('');
    setStartingCash(10000);
    setXpRequired(0);
    setStartDate('');
    setDeadline('');
    setCreateError(null);
  }

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    const { error } = await createCompetition({ name, type, prize, startingCash, startDate, deadline, xpRequired });
    setCreating(false);
    if (error) {
      setCreateError(error);
      return;
    }
    setShowCreate(false);
    resetForm();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteCompetition(deleteTarget.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteTarget(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Tournaments</div>
          <div className="page-subtitle">Create tournaments and enter schools — every student at an entered school gets a tournament portfolio</div>
        </div>
        <button
          className="btn btn-primary"
          style={{ background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}
          onClick={() => { setShowCreate(true); resetForm(); }}
        >
          + New Tournament
        </button>
      </div>

      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              Loading tournaments...
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--red)', fontSize: 13 }}>
              Couldn't load tournaments. {error}
            </div>
          )}
          {!loading && !error && competitions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              No tournaments yet.
            </div>
          )}
          {!loading && !error && competitions.length > 0 && (
            <div className="table-wrap">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Prize</th>
                    <th>Starting Cash</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Schools</th>
                    <th>Students</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {competitions.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <select
                          value={c.status}
                          onChange={e => updateStatus(c.id, e.target.value)}
                          style={{ fontSize: 11, padding: '3px 6px' }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ color: 'var(--text2)', fontSize: 12 }}>{c.prize ?? '—'}</td>
                      <td style={{ fontFamily: 'monospace' }}>${c.startingCash.toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(c.startDate)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(c.deadline)}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.schoolCount}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.studentCount}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => setManageTarget({ id: c.id, name: c.name })}
                          >
                            Manage Schools
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, color: 'var(--red)' }}
                            onClick={() => { setDeleteTarget({ id: c.id, name: c.name }); setDeleteError(null); }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div
          onClick={() => !creating && setShowCreate(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 460, width: '100%', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>New Tournament</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Name</div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fall Trading Championship" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Type</div>
                  <input value={type} onChange={e => setType(e.target.value)} placeholder="Trading Challenge" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Prize</div>
                  <input value={prize} onChange={e => setPrize(e.target.value)} placeholder="$500 gift card" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Starting Cash ($)</div>
                  <input type="number" min={0} value={startingCash} onChange={e => setStartingCash(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>XP Required to Enter</div>
                  <input type="number" min={0} value={xpRequired} onChange={e => setXpRequired(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Start Date</div>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', colorScheme: 'dark' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>End Date</div>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', colorScheme: 'dark' }} />
                </div>
              </div>
            </div>

            {createError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 12 }}>{createError}</div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ opacity: name.trim() && !creating ? 1 : 0.4 }}
                disabled={!name.trim() || creating}
                onClick={handleCreate}
              >
                {creating ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 420, width: '100%', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
              Delete "{deleteTarget.name}"?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
              This removes the tournament. Students' tournament portfolios and history for it will no longer be reachable. This cannot be undone.
            </div>
            {deleteError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{deleteError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
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

      {manageTarget && (
        <ManageSchoolsModal
          competitionId={manageTarget.id}
          competitionName={manageTarget.name}
          onClose={() => setManageTarget(null)}
        />
      )}
    </div>
  );
}

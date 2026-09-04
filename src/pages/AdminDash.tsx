import { useState } from 'react';
import { useAdminOverview } from '../hooks/useAdminOverview';
import { useAllStudents } from '../hooks/useAllStudents';
import { useAdminFeedback } from '../hooks/useAdminFeedback';
import { useSchoolLeaderboard } from '../hooks/useSchoolLeaderboard';
import { useSignupAccessCode } from '../hooks/useSignupAccessCode';
import { useAdminClassFunds } from '../hooks/useAdminClassFunds';
import { supabase } from '../lib/supabase';

function downloadCsv(rows: ReturnType<typeof useAllStudents>['students']) {
  const header = ['Name', 'School', 'Grade', 'Level', 'XP', 'Rank'];
  const lines = rows.map(s => [
    s.name,
    s.school ?? '',
    s.grade ?? '',
    s.level,
    s.xp,
    s.rank ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDash() {
  const { schools, totalStudents, totalCompetitions, activeCompetitions, loading: overviewLoading, error: overviewError, addSchool, deleteSchool } = useAdminOverview();
  const { students, loading: studentsLoading, error: studentsError, deleteStudent, promoteToAdmin } = useAllStudents();
  const { feedback, loading: feedbackLoading, error: feedbackError } = useAdminFeedback();
  const { entries: schoolRanks } = useSchoolLeaderboard();
  const { code: signupCode, loading: codeLoading, updateCode } = useSignupAccessCode();
  const { funds: classFunds, loading: classFundsLoading, createFund, deleteFund } = useAdminClassFunds();

  const [showCreateFund, setShowCreateFund] = useState(false);
  const [fundName, setFundName] = useState('');
  const [fundCode, setFundCode] = useState('');
  const [fundStartingCash, setFundStartingCash] = useState(10000);
  const [creatingFund, setCreatingFund] = useState(false);
  const [createFundError, setCreateFundError] = useState<string | null>(null);

  const [deleteFundTarget, setDeleteFundTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletingFund, setDeletingFund] = useState(false);
  const [deleteFundError, setDeleteFundError] = useState<string | null>(null);

  const [editingCode, setEditingCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [addingSchool, setAddingSchool] = useState(false);
  const [addSchoolError, setAddSchoolError] = useState<string | null>(null);

  const [deleteSchoolTarget, setDeleteSchoolTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletingSchool, setDeletingSchool] = useState(false);
  const [deleteSchoolError, setDeleteSchoolError] = useState<string | null>(null);

  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  const [promoteTarget, setPromoteTarget] = useState<{ id: string; name: string } | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [promoteDone, setPromoteDone] = useState(false);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteStudent(deleteTarget.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteTarget(null);
    setConfirmText('');
  }

  async function handleConfirmReset() {
    if (!resetTarget) return;
    setResetting(true);
    setResetError(null);
    const { error } = await supabase.rpc('reset_student_portfolio', { p_user_id: resetTarget.id });
    setResetting(false);
    if (error) {
      setResetError(error.message);
      return;
    }
    setResetDone(true);
  }

  async function handleAddSchool() {
    setAddingSchool(true);
    setAddSchoolError(null);
    const { error } = await addSchool(newSchoolName);
    setAddingSchool(false);
    if (error) {
      setAddSchoolError(error);
      return;
    }
    setShowAddSchool(false);
    setNewSchoolName('');
  }

  async function handleConfirmPromote() {
    if (!promoteTarget) return;
    setPromoting(true);
    setPromoteError(null);
    const { error } = await promoteToAdmin(promoteTarget.id);
    setPromoting(false);
    if (error) {
      setPromoteError(error);
      return;
    }
    setPromoteDone(true);
  }

  async function handleCreateFund() {
    setCreatingFund(true);
    setCreateFundError(null);
    const { error } = await createFund({ name: fundName, code: fundCode, startingCash: fundStartingCash });
    setCreatingFund(false);
    if (error) {
      setCreateFundError(error);
      return;
    }
    setShowCreateFund(false);
    setFundName('');
    setFundCode('');
    setFundStartingCash(10000);
  }

  async function handleConfirmDeleteFund() {
    if (!deleteFundTarget) return;
    setDeletingFund(true);
    setDeleteFundError(null);
    const { error } = await deleteFund(deleteFundTarget.id);
    setDeletingFund(false);
    if (error) {
      setDeleteFundError(error);
      return;
    }
    setDeleteFundTarget(null);
  }

  async function handleSaveCode() {
    setSavingCode(true);
    setCodeError(null);
    const { error } = await updateCode(codeInput);
    setSavingCode(false);
    if (error) {
      setCodeError(error);
      return;
    }
    setEditingCode(false);
  }

  async function handleConfirmDeleteSchool() {
    if (!deleteSchoolTarget) return;
    setDeletingSchool(true);
    setDeleteSchoolError(null);
    const { error } = await deleteSchool(deleteSchoolTarget.id);
    setDeletingSchool(false);
    if (error) {
      setDeleteSchoolError(error);
      return;
    }
    setDeleteSchoolTarget(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Schools</div>
            <div className="stat-value">{overviewLoading ? '—' : schools.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Students</div>
            <div className="stat-value">{overviewLoading ? '—' : totalStudents}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Competitions</div>
            <div className="stat-value">{overviewLoading ? '—' : totalCompetitions}</div>
            <div className="stat-sub" style={{ color: 'var(--blue)' }}>
              {overviewLoading ? '' : `${activeCompetitions} active`}
            </div>
          </div>
        </div>

        {overviewError && (
          <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 16 }}>
            Couldn't load school stats. {overviewError}
          </div>
        )}

        {/* Student sign-up access code */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="section-title" style={{ margin: 0 }}>Student Sign-Up Code</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                Students must enter this code when creating an account. Share it with the schools you work with.
              </div>
            </div>

            {!editingCode ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--gr)' }}>
                  {codeLoading ? '—' : signupCode}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setCodeInput(signupCode ?? ''); setEditingCode(true); setCodeError(null); }}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  autoFocus
                  style={{
                    fontFamily: 'monospace', padding: '6px 10px', borderRadius: 8,
                    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                  }}
                />
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingCode(false)} disabled={savingCode}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ opacity: codeInput.trim() && !savingCode ? 1 : 0.4 }}
                  disabled={!codeInput.trim() || savingCode}
                  onClick={handleSaveCode}
                >
                  {savingCode ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          {codeError && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{codeError}</div>}
        </div>

        {/* Class Funds */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Class Funds
            </span>
            <button
              className="btn btn-primary"
              style={{ fontSize: 11, padding: '4px 14px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}
              onClick={() => { setShowCreateFund(true); setCreateFundError(null); }}
            >
              + New Class Fund
            </button>
          </div>

          {classFundsLoading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>Loading class funds...</div>
          )}

          {!classFundsLoading && classFunds.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              No class funds yet — create one and share its code with a class.
            </div>
          )}

          {!classFundsLoading && classFunds.length > 0 && (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Cash Balance</th>
                  <th>Members</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {classFunds.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.name}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gr)' }}>{f.code}</td>
                    <td style={{ fontFamily: 'monospace' }}>${f.cashBalance.toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace' }}>{f.memberCount}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, color: 'var(--red)' }}
                        onClick={() => { setDeleteFundTarget({ id: f.id, name: f.name }); setDeleteFundError(null); }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Schools Overview table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Schools Overview
            </span>
            <button
              className="btn btn-primary"
              style={{ fontSize: 11, padding: '4px 14px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}
              onClick={() => { setShowAddSchool(true); setNewSchoolName(''); setAddSchoolError(null); }}
            >
              + Add School
            </button>
          </div>

          {overviewLoading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              Loading schools...
            </div>
          )}

          {!overviewLoading && !overviewError && (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>School</th>
                  <th>Students</th>
                  <th>Avg Return</th>
                  <th>Quiz Avg</th>
                  <th>Avg Lessons Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schools.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
                      No schools yet.
                    </td>
                  </tr>
                )}
                {schools.map(s => {
                  const rankEntry = schoolRanks.find(r => r.schoolId === s.school_id);
                  return (
                  <tr key={s.school_id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>{rankEntry ? `#${rankEntry.rank}` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{s.school_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.student_count}</td>
                    <td style={{ fontFamily: 'monospace', color: rankEntry ? (rankEntry.avgReturnPct >= 0 ? '#00e676' : 'var(--red)') : 'var(--text3)' }}>
                      {rankEntry ? `${rankEntry.avgReturnPct >= 0 ? '+' : ''}${rankEntry.avgReturnPct.toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{s.avg_quiz_score !== null ? `${s.avg_quiz_score}%` : '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.avg_lessons_completed ?? '—'}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, color: 'var(--red)' }}
                        onClick={() => { setDeleteSchoolTarget({ id: s.school_id, name: s.school_name }); setDeleteSchoolError(null); }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* All Students table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              All Students {!studentsLoading && `(${students.length})`}
            </span>
            <button
              className="btn btn-primary"
              style={{ fontSize: 11, padding: '4px 14px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}
              disabled={studentsLoading || students.length === 0}
              onClick={() => downloadCsv(students)}
            >
              Export CSV
            </button>
          </div>

          {studentsLoading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              Loading students...
            </div>
          )}

          {!studentsLoading && studentsError && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--red)', fontSize: 13 }}>
              Couldn't load students. {studentsError}
            </div>
          )}

          {!studentsLoading && !studentsError && (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>School</th>
                  <th>Grade</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Rank</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
                      No students yet.
                    </td>
                  </tr>
                )}
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>{s.school ?? '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.grade ? `${s.grade}th` : '—'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                        L{s.level}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#00e676', fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.rank ? `#${s.rank}` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => { setResetTarget({ id: s.id, name: s.name }); setResetError(null); setResetDone(false); }}
                        >
                          Reset Portfolio
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => { setPromoteTarget({ id: s.id, name: s.name }); setPromoteError(null); setPromoteDone(false); }}
                        >
                          Make Admin
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, color: 'var(--red)' }}
                          onClick={() => { setDeleteTarget({ id: s.id, name: s.name }); setConfirmText(''); setDeleteError(null); }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Student Feedback */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Student Feedback {!feedbackLoading && `(${feedback.length})`}
          </div>

          {feedbackLoading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              Loading feedback...
            </div>
          )}

          {!feedbackLoading && feedbackError && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--red)', fontSize: 13 }}>
              Couldn't load feedback. {feedbackError}
            </div>
          )}

          {!feedbackLoading && !feedbackError && feedback.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              No feedback submitted yet.
            </div>
          )}

          {!feedbackLoading && !feedbackError && feedback.map(f => (
            <div key={f.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.subject}</div>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                  {new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 6 }}>{f.studentName}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{f.description}</div>
            </div>
          ))}
        </div>

      </div>

      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 440, width: '100%', padding: 24 }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
              Delete {deleteTarget.name}'s account?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
              This permanently deletes their profile, portfolio, trade history, assessments, badges, and every
              other record tied to this account. This cannot be undone.
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
              Type <strong style={{ color: 'var(--text)' }}>{deleteTarget.name}</strong> to confirm:
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, marginBottom: 12,
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
                boxSizing: 'border-box',
              }}
            />
            {deleteError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{deleteError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: 'var(--red)', color: '#fff', opacity: confirmText === deleteTarget.name && !deleting ? 1 : 0.4 }}
                disabled={confirmText !== deleteTarget.name || deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSchool && (
        <div
          onClick={() => !addingSchool && setShowAddSchool(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 440, width: '100%', padding: 24 }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
              Add School
            </div>
            <input
              type="text"
              placeholder="School name"
              value={newSchoolName}
              onChange={e => setNewSchoolName(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, marginBottom: 12,
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
                boxSizing: 'border-box',
              }}
            />
            {addSchoolError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{addSchoolError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddSchool(false)}
                disabled={addingSchool}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ opacity: newSchoolName.trim() && !addingSchool ? 1 : 0.4 }}
                disabled={!newSchoolName.trim() || addingSchool}
                onClick={handleAddSchool}
              >
                {addingSchool ? 'Adding...' : 'Add School'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSchoolTarget && (
        <div
          onClick={() => !deletingSchool && setDeleteSchoolTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 440, width: '100%', padding: 24 }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
              Delete {deleteSchoolTarget.name}?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
              This cannot be undone. Schools with students still enrolled can't be deleted — reassign or
              remove those students first.
            </div>
            {deleteSchoolError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{deleteSchoolError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteSchoolTarget(null)}
                disabled={deletingSchool}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: 'var(--red)', color: '#fff', opacity: deletingSchool ? 0.4 : 1 }}
                disabled={deletingSchool}
                onClick={handleConfirmDeleteSchool}
              >
                {deletingSchool ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetTarget && (
        <div
          onClick={() => !resetting && setResetTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 440, width: '100%', padding: 24 }}
          >
            {resetDone ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gr)', marginBottom: 8 }}>
                  Portfolio reset
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                  {resetTarget.name}'s general portfolio is back to $10,000 with no holdings or trade history.
                  Any tournament portfolio they have was not touched.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => setResetTarget(null)}>Done</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
                  Reset {resetTarget.name}'s general portfolio?
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                  This wipes their general portfolio's holdings and trade history and restores it to $10,000
                  cash. Their tournament portfolio (if any) is not affected. This cannot be undone.
                </div>
                {resetError && (
                  <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{resetError}</div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setResetTarget(null)}
                    disabled={resetting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn"
                    style={{ background: 'var(--red)', color: '#fff', opacity: resetting ? 0.4 : 1 }}
                    disabled={resetting}
                    onClick={handleConfirmReset}
                  >
                    {resetting ? 'Resetting...' : 'Reset Portfolio'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCreateFund && (
        <div
          onClick={() => !creatingFund && setShowCreateFund(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 420, width: '100%', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>New Class Fund</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Name</div>
                <input value={fundName} onChange={e => setFundName(e.target.value)} placeholder="e.g. Period 3 Fund" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Code</div>
                <input
                  value={fundCode}
                  onChange={e => setFundCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PERIOD3"
                  style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Starting Cash ($)</div>
                <input
                  type="number"
                  min={0}
                  value={fundStartingCash}
                  onChange={e => setFundStartingCash(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {createFundError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 12 }}>{createFundError}</div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateFund(false)} disabled={creatingFund}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ opacity: fundName.trim() && fundCode.trim() && !creatingFund ? 1 : 0.4 }}
                disabled={!fundName.trim() || !fundCode.trim() || creatingFund}
                onClick={handleCreateFund}
              >
                {creatingFund ? 'Creating...' : 'Create Class Fund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFundTarget && (
        <div
          onClick={() => !deletingFund && setDeleteFundTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 420, width: '100%', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
              Delete "{deleteFundTarget.name}"?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
              This removes the fund and its holdings/trade history for every member. This cannot be undone.
            </div>
            {deleteFundError && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{deleteFundError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteFundTarget(null)} disabled={deletingFund}>Cancel</button>
              <button
                className="btn"
                style={{ background: 'var(--red)', color: '#fff', opacity: deletingFund ? 0.4 : 1 }}
                disabled={deletingFund}
                onClick={handleConfirmDeleteFund}
              >
                {deletingFund ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {promoteTarget && (
        <div
          onClick={() => !promoting && setPromoteTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 440, width: '100%', padding: 24 }}
          >
            {promoteDone ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gr)', marginBottom: 8 }}>
                  {promoteTarget.name} is now an admin
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                  They'll get full admin dashboard access next time they sign in.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => setPromoteTarget(null)}>Done</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
                  Make {promoteTarget.name} an admin?
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                  This grants full admin dashboard access — managing every student and school, resetting
                  portfolios, creating tournaments, and changing the sign-up code. Only do this for someone
                  you trust with that level of access.
                </div>
                {promoteError && (
                  <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{promoteError}</div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPromoteTarget(null)}
                    disabled={promoting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn"
                    style={{ background: 'var(--red)', color: '#fff', opacity: promoting ? 0.4 : 1 }}
                    disabled={promoting}
                    onClick={handleConfirmPromote}
                  >
                    {promoting ? 'Promoting...' : 'Make Admin'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

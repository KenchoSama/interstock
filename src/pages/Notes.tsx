import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { useStudentNotes, type StudentNote } from '../hooks/useStudentNotes';

function snippetOf(content: string): string {
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : 'No content yet';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Notes() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { notes, loading, error, createNote, saveNote, deleteNote } = useStudentNotes(user.supabaseId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [deleteTarget, setDeleteTarget] = useState<StudentNote | null>(null);
  const [deleting, setDeleting] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedSelection = useRef(false);

  useEffect(() => {
    if (hasLoadedSelection.current) return;
    if (loading) return;
    hasLoadedSelection.current = true;
    if (notes.length > 0) selectNote(notes[0]);
  }, [loading, notes]);

  function selectNote(note: StudentNote) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSelectedId(note.id);
    setTitleDraft(note.title);
    setContentDraft(note.content);
    setSaveState('idle');
  }

  function scheduleSave(nextTitle: string, nextContent: string) {
    if (!selectedId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(async () => {
      await saveNote(selectedId, { title: nextTitle.trim() || 'Untitled Note', content: nextContent });
      setSaveState('saved');
    }, 700);
  }

  async function handleNewNote() {
    const { note } = await createNote();
    if (note) selectNote(note);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteNote(deleteTarget.id);
    setDeleting(false);
    if (selectedId === deleteTarget.id) {
      const remaining = notes.filter(n => n.id !== deleteTarget.id);
      if (remaining.length > 0) selectNote(remaining[0]);
      else {
        setSelectedId(null);
        setTitleDraft('');
        setContentDraft('');
      }
    }
    setDeleteTarget(null);
  }

  const selectedNote = notes.find(n => n.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Notepad</div>
          <div className="page-subtitle">Jot down anything — private notes just for you</div>
        </div>
        <button className="btn btn-primary" onClick={handleNewNote}>
          + New Note
        </button>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            Loading notes...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--red)' }}>
            Couldn't load your notes. {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: '100%' }}>

            {/* Notes list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                My Notes ({notes.length})
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 30, fontSize: 12, color: 'var(--text3)' }}>
                    No notes yet. Create your first one!
                  </div>
                )}
                {notes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: note.id === selectedId ? 'var(--gr-dim)' : 'transparent',
                      borderLeft: note.id === selectedId ? '3px solid var(--gr)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {note.title || 'Untitled Note'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {snippetOf(note.content)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{formatDate(note.updatedAt)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {selectedNote ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <input
                      value={titleDraft}
                      onChange={e => { setTitleDraft(e.target.value); scheduleSave(e.target.value, contentDraft); }}
                      placeholder="Note title"
                      style={{
                        flex: 1, fontSize: 18, fontWeight: 700, color: 'var(--text)',
                        background: 'transparent', border: 'none', outline: 'none', padding: '4px 0',
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                      {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : ''}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--red)', flexShrink: 0 }}
                      onClick={() => setDeleteTarget(selectedNote)}
                    >
                      Delete
                    </button>
                  </div>
                  <textarea
                    value={contentDraft}
                    onChange={e => { setContentDraft(e.target.value); scheduleSave(titleDraft, e.target.value); }}
                    placeholder="Start typing..."
                    style={{
                      flex: 1, width: '100%', resize: 'none', fontSize: 14, lineHeight: 1.7,
                      color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  Select a note or create a new one to get started.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 400, width: '100%', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
              Delete "{deleteTarget.title || 'Untitled Note'}"?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
              This cannot be undone.
            </div>
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
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

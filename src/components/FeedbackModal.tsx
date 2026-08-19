import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  studentId: string | null;
  onClose: () => void;
}

export default function FeedbackModal({ studentId, onClose }: Props) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!studentId || !subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('feedback').insert({
      student_id: studentId,
      subject: subject.trim(),
      description: description.trim(),
    });

    setSubmitting(false);
    if (error) {
      setError('Could not send your feedback. Please try again.');
      return;
    }
    setSubmitted(true);
  }

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0 && !submitting;

  return (
    <div
      onClick={() => !submitting && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 460, width: '100%', padding: 24 }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Feedback Sent!</div>
            <div style={{ fontSize: 13, color: '#fff' }}>
              Thanks for letting us know — an admin will review your feedback.
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              Send Feedback
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                Subject
              </div>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="What's this about?"
                autoFocus
                style={{ width: '100%', boxSizing: 'border-box', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                Description
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                placeholder="Tell us more..."
                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', color: '#fff' }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ opacity: canSubmit ? 1 : 0.4 }}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

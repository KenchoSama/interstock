import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { supabase } from '../lib/supabase';

// Bump this whenever the policy text changes below — every student, including
// those who already agreed to an older version, will be required to re-agree.
export const CURRENT_COC_VERSION = 1;

export default function CodeOfConduct() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];

  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAgree() {
    if (!checked || !user.supabaseId) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('code_of_conduct_agreements').insert({
      student_id: user.supabaseId,
      version: CURRENT_COC_VERSION,
    });

    setSubmitting(false);
    if (error) {
      setError('Something went wrong saving your agreement. Please try again.');
      return;
    }

    dispatch({ type: 'AGREE_TO_CODE_OF_CONDUCT' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 640, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            InterStock Code of Conduct
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
            Please read and agree before continuing.
          </div>
        </div>

        <div style={{ padding: '0 24px', overflowY: 'auto', flex: 1, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
          <p>
            Welcome to InterStock. This platform is a learning environment for students to build real
            financial literacy skills through simulated trading, lessons, and mentorship. By creating an
            account, you agree to the following:
          </p>

          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>1. Respectful Communication</p>
          <p>
            Treat other students, mentors, and staff with respect in messages, scenario discussions, and
            mentor meetings. Harassment, hate speech, bullying, or inappropriate language of any kind will
            not be tolerated and may result in suspension or removal from the platform.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>2. Academic Integrity</p>
          <p>
            Complete quizzes, assessments, and diploma exams honestly using your own knowledge. Do not
            share answers with other students or attempt to bypass assessment requirements. All trading
            activity on InterStock uses simulated money — you may not misrepresent your performance or
            manipulate the platform to gain an unfair advantage on leaderboards or competitions.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>3. Appropriate Use of FinBot (AI Tutor)</p>
          <p>
            FinBot is provided to help you learn about investing, markets, and personal finance. Use it for
            its intended educational purpose. Attempting to use FinBot for unrelated, harmful, or
            inappropriate requests is not permitted.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>4. Mentor &amp; Field Trip Conduct</p>
          <p>
            If you are matched with a mentor or attend a partner field trip, represent yourself and
            InterStock professionally. Show up on time for scheduled meetings, communicate respectfully, and
            notify your mentor as early as possible if you need to reschedule.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>5. Account Safety</p>
          <p>
            Keep your login credentials private. Do not share your account with another student or access
            another student's account. Report any suspicious activity or safety concerns to your school
            administrator or through the Support page.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>6. Consequences</p>
          <p>
            Violations of this Code of Conduct may result in a warning, temporary suspension, or permanent
            removal from InterStock, depending on severity, at the discretion of InterStock staff and your
            school administrator.
          </p>

          <p style={{ color: 'var(--text3)', fontSize: 12 }}>
            This is a starter policy and may be revised. You will be asked to review and re-agree any time
            it is meaningfully updated.
          </p>
        </div>

        <div style={{ padding: 24 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span style={{ fontSize: 13, color: 'var(--text)' }}>
              I have read and agree to the InterStock Code of Conduct.
            </span>
          </label>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: 12, fontSize: 14, opacity: checked && !submitting ? 1 : 0.4 }}
            disabled={!checked || submitting}
            onClick={handleAgree}
          >
            {submitting ? 'Saving...' : 'I Agree — Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

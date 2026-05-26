import { useState } from 'react';

export default function Support() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });

  if (submitted) {
    return (
      <div>
        <div className="page-header"><div className="page-title">Support 💬</div></div>
        <div className="page-body">
          <div className="card" style={{ textAlign: 'center', padding: 48, maxWidth: 480 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ticket Submitted!</div>
            <div style={{ color: 'var(--text2)', marginBottom: 20 }}>
              We'll get back to you within 24 hours at your registered email address.
            </div>
            <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Support 💬</div>
          <div className="page-subtitle">Get help from the InterStock team</div>
        </div>
      </div>
      <div className="page-body">
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div className="card">
            <div className="card-title">Submit a Support Request</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Subject</label>
              <input
                style={{ width: '100%' }}
                placeholder="Brief description of your issue"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Priority</label>
              <select
                style={{ width: '100%' }}
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">Low — General question</option>
                <option value="normal">Normal — I need help soon</option>
                <option value="high">High — Blocking my progress</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Message</label>
              <textarea
                style={{ width: '100%', height: 120 }}
                placeholder="Describe your issue in detail…"
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!form.subject || !form.message}
              onClick={() => setSubmitted(true)}
            >
              Submit Ticket
            </button>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Contact Options</div>
              {[
                { icon: '📧', label: 'Email', value: 'support@interstock.edu', note: 'Response within 24h' },
                { icon: '💬', label: 'Live Chat', value: 'Available M–F, 9am–5pm ET', note: 'Fastest response' },
                { icon: '📞', label: 'Phone', value: '1-800-INTERSTOCK', note: 'Urgent issues only' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title">Common Topics</div>
              {['Portfolio reset request', 'Can\'t access a locked feature', 'Technical issue with the app', 'Question about my diploma exam', 'Reporting a bug'].map(t => (
                <div
                  key={t}
                  style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13, cursor: 'pointer', color: 'var(--text2)' }}
                  onClick={() => setForm(p => ({ ...p, subject: t }))}
                >
                  → {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

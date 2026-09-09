import { useApp } from '../state/AppContext';
import { useAnnouncements } from '../hooks/useAnnouncements';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Announcements() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { announcements, loading, markAsRead } = useAnnouncements(user.supabaseId);

  const unreadCount = announcements.filter(a => !a.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Announcements</div>
          <div className="page-subtitle">Messages from InterStock admins</div>
        </div>
      </div>

      <div className="page-body">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>Inbox</div>
          {unreadCount > 0 && <span className="badge badge-red">{unreadCount} NEW</span>}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            Loading announcements...
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            No announcements yet.
          </div>
        )}

        {!loading && announcements.map(a => (
          <div
            key={a.id}
            onClick={() => { if (!a.read) markAsRead(a.id); }}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${a.read ? 'var(--border)' : 'var(--gr)'}`,
              borderRadius: 'var(--radius)',
              padding: 14,
              marginBottom: 10,
              cursor: a.read ? 'default' : 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {!a.read && (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: 'var(--gr-dim)', color: 'var(--gr)',
                    }}
                  >
                    NEW
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatDate(a.created_at)}</span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              {a.title}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {a.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

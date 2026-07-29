import { useAchievements } from '../hooks/useAchievements';

export default function Achievements() {
  const { badges, loading, error, earnedCount } = useAchievements();

  const totalCount = badges.length;
  const completePct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            Loading achievements…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13, padding: '40px 0' }}>
            Couldn't load achievements. {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary card */}
            <div className="stat-card" style={{ marginBottom: 16, display: 'inline-block', minWidth: 160 }}>
              <div className="stat-label">Badges Earned</div>
              <div className="stat-value">{earnedCount}/{totalCount}</div>
              <div className="stat-sub" style={{ color: '#00e676' }}>{completePct}% complete</div>
            </div>

            {/* Badge grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: badge.earned ? 1 : 0.4,
                    borderColor: badge.earned ? 'rgba(0,230,118,0.25)' : undefined,
                    background: badge.earned ? 'rgba(0,230,118,0.06)' : undefined,
                  }}
                >
                  {/* Icon box */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      background: badge.earned ? 'rgba(0,230,118,0.15)' : 'var(--surface2)',
                      border: `1px solid ${badge.earned ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
                    }}
                  >
                    {badge.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                      {badge.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {badge.description}
                    </div>
                  </div>

                  {/* Earned / locked indicator */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      background: badge.earned ? 'rgba(0,230,118,0.15)' : 'var(--surface2)',
                      border: `1px solid ${badge.earned ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
                    }}
                  >
                    {badge.earned ? (
                      <span style={{ color: '#00e676' }}>✓</span>
                    ) : (
                      <span style={{ color: 'var(--text3)' }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

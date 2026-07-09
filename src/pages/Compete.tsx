import { useApp } from '../state/AppContext';
import { useCompetitions } from '../hooks/useCompetitions';
import { usePartners } from '../hooks/usePartners';

export default function Compete() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { competitions, loading, register } = useCompetitions(user.supabaseId);
  const { partners, loading: partnersLoading } = usePartners();

  const active = competitions.filter(c => c.status === 'active');
  const upcoming = competitions.filter(c => c.status === 'upcoming');

  async function handleRegister(competitionId: string, xpRequired: number) {
    if (!user.supabaseId) return;
    if (user.xp < xpRequired) {
      alert(`You need ${xpRequired} XP to register. You have ${user.xp} XP.`);
      return;
    }
    await register(competitionId, user.supabaseId);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Compete 🏆</div>
          <div className="page-subtitle">Tournaments and competitions with schools nationwide</div>
        </div>
      </div>

      <div className="page-body">

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            Loading competitions...
          </div>
        )}

        {!loading && (
          <>
            {/* Active competitions */}
            <div className="section-title">Active Competitions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {active.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>No active competitions right now.</div>
              )}
              {active.map(comp => (
                <div key={comp.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{comp.name}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{comp.type}</span>
                        {comp.prize && <span style={{ color: 'var(--yellow)' }}>🏆 {comp.prize}</span>}
                        {comp.deadline && (
                          <span style={{ color: 'var(--text3)' }}>
                            📅 Deadline: {new Date(comp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        <span style={{ color: 'var(--text3)' }}>👥 {comp.participants} registered</span>
                        {comp.xp_required > 0 && (
                          <span style={{ color: user.xp >= comp.xp_required ? 'var(--gr)' : 'var(--red)' }}>
                            ⚡ {comp.xp_required} XP required
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${comp.registered ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={comp.registered || user.xp < comp.xp_required}
                      onClick={() => handleRegister(comp.id, comp.xp_required)}
                    >
                      {comp.registered ? '✓ Registered' : 'Register'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming competitions */}
            {upcoming.length > 0 && (
              <>
                <div className="section-title">Upcoming Competitions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {upcoming.map(comp => (
                    <div key={comp.id} className="card" style={{ opacity: 0.75 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{comp.name}</div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
                            <span className="badge badge-yellow">UPCOMING</span>
                            {comp.prize && <span style={{ color: 'var(--yellow)' }}>🏆 {comp.prize}</span>}
                            {comp.deadline && (
                              <span style={{ color: 'var(--text3)' }}>
                                📅 Opens: {new Date(comp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            {comp.xp_required > 0 && (
                              <span style={{ color: 'var(--text3)' }}>⚡ {comp.xp_required} XP required</span>
                            )}
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" disabled>
                          Coming Soon
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Partner Companies */}
            <div className="section-title">Partner Companies Sponsoring</div>
            {partnersLoading && (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading partners...</div>
            )}
            <div className="grid-3">
              {partners.map(p => (
                <div key={p.id} className="card">
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{p.type}</div>
                  {p.contact && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
                      Contact: {p.contact}
                    </div>
                  )}
                  <span className={`badge ${p.status === 'Active' ? 'badge-green' : 'badge-yellow'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

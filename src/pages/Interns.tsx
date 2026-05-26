import { useApp } from '../state/AppContext';
import { INTERNS } from '../data';

export default function Interns() {
  const { state } = useApp();
  const xp = state.u[state.role].xp;
  const certPassed = state.u[state.role].certPassed;
  const diplomasEarned = state.u[state.role].diplomas.filter(d => d.earned).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Internships 💼</div>
          <div className="page-subtitle">Real-world finance opportunities with our partner firms</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ marginBottom: 20, background: 'var(--gr-dim)', borderColor: 'var(--gr2)' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 Eligibility Requirements</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <span style={{ color: xp >= 2000 ? 'var(--gr)' : 'var(--text2)' }}>
              {xp >= 2000 ? '✓' : '○'} 2,000+ XP ({xp.toLocaleString()} earned)
            </span>
            <span style={{ color: diplomasEarned >= 1 ? 'var(--gr)' : 'var(--text2)' }}>
              {diplomasEarned >= 1 ? '✓' : '○'} At least 1 diploma ({diplomasEarned} earned)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {INTERNS.map(intern => {
            const eligible = xp >= intern.xpRequired && diplomasEarned >= 1;
            return (
              <div key={intern.id} className="card" style={{ opacity: eligible ? 1 : 0.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{intern.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>{intern.company}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                      <span style={{ color: 'var(--text3)' }}>⏱ {intern.duration}</span>
                      <span style={{ color: 'var(--gr)' }}>💰 {intern.stipend}</span>
                      <span style={{ color: 'var(--text3)' }}>🔒 {intern.xpRequired.toLocaleString()} XP required</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!eligible}
                  >
                    {eligible ? 'Apply Now' : 'Locked'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../state/AppContext';

export default function PortfolioSwitcher() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const [open, setOpen] = useState(false);

  if (user.tournamentPortfolios.length === 0) return null;

  const active = user.activeCompetitionId
    ? user.tournamentPortfolios.find(t => t.competitionId === user.activeCompetitionId)
    : null;
  const label = active ? active.competitionName : 'General Portfolio';

  function select(competitionId: string | null) {
    dispatch({ type: 'SWITCH_PORTFOLIO', competitionId });
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-secondary btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ color: 'var(--text3)', fontWeight: 400 }}>Viewing:</span>
        <strong>{label}</strong>
        <span style={{ fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 20, minWidth: 220,
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
            padding: 4, boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
          }}>
            <div
              onClick={() => select(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px',
                fontSize: 12, color: 'var(--text)', cursor: 'pointer', borderRadius: 6,
                background: !user.activeCompetitionId ? 'var(--gr-dim)' : 'transparent',
              }}
              onMouseEnter={e => { if (user.activeCompetitionId) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { if (user.activeCompetitionId) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              General Portfolio
              {!user.activeCompetitionId && <span style={{ color: 'var(--gr)' }}>✓</span>}
            </div>
            {user.tournamentPortfolios.map(tp => {
              const isActive = user.activeCompetitionId === tp.competitionId;
              return (
                <div
                  key={tp.competitionId}
                  onClick={() => select(tp.competitionId)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px',
                    fontSize: 12, color: 'var(--text)', cursor: 'pointer', borderRadius: 6,
                    background: isActive ? 'var(--gr-dim)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <span>{tp.competitionName}</span>
                  {isActive && <span style={{ color: 'var(--gr)' }}>✓</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

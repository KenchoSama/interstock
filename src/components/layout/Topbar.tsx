import { useApp, getLevelName, getNextLevelXP } from '../../state/AppContext';
import { useTickerQuotes } from '../../hooks/useTickerQuotes';
import { TOP_TICKERS } from '../../data/sp500';
import interstockLogo from '../../assets/interstock-logo.png';

export default function Topbar() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const xp = user.xp;
  const nextLvl = getNextLevelXP(xp);
  const prevLvl = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500].filter(t => t <= xp).at(-1) ?? 0;
  const pct = Math.min(100, Math.round(((xp - prevLvl) / (nextLvl - prevLvl)) * 100));

  const { quotes, loading } = useTickerQuotes();

  // Duplicate the list so the marquee loops seamlessly
  const tickerItems = [...quotes, ...quotes];

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <img src={interstockLogo} alt="InterStock" style={{ height: 22, width: 'auto' }} />
      </div>

      <div className="topbar-ticker-wrap">
        <div
          className="topbar-ticker-track"
          style={{ animationDuration: `${TOP_TICKERS.length * 4}s` }}
        >
          {tickerItems.map((q, i) => (
            <div key={`${q.sym}-${i}`} className="ticker-item">
              <span className="ticker-sym">{q.sym}</span>
              <span className="ticker-price">${q.price.toFixed(2)}</span>
              <span className={`ticker-chg ${q.chg >= 0 ? 'up' : 'dn'}`}>
                {q.chg >= 0 ? '+' : ''}{q.chgPct.toFixed(2)}%
              </span>
              <span className="ticker-sep">·</span>
            </div>
          ))}
        </div>
        {loading && quotes.length === 0 && (
          <span style={{ position: 'absolute', right: 8, fontSize: 10, color: 'var(--text3)' }}>
            loading market data…
          </span>
        )}
      </div>

      <div className="topbar-right">
        {state.role === 'student' && (
          <div className="status-bar">
            <div className="xp-bar-wrap">
              <span className="xp-label">⚡ {xp.toLocaleString()} XP</span>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>
              {getLevelName(xp)}
            </span>
          </div>
        )}
        <div
          className="avatar-btn"
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'profile' })}
          title={user.name}
          style={user.avatarUrl ? { padding: 0, overflow: 'hidden' } : undefined}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user.avatar || user.name[0]
          )}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => dispatch({ type: 'LOGOUT' })}
          style={{ fontSize: 11 }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data';

export default function ETF() {
  const { state, dispatch } = useApp();
  const xp = state.u[state.role].xp;
  const [etfName, setEtfName] = useState('');
  const [ticker, setTicker] = useState('');
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  if (xp < 1500) {
    return (
      <div>
        <div className="page-header"><div className="page-title">Build an ETF 🏦</div></div>
        <div className="page-body">
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1,500 XP Required</div>
            <div style={{ color: 'var(--text2)' }}>You have {xp.toLocaleString()} XP. Keep learning to unlock ETF Builder!</div>
          </div>
        </div>
      </div>
    );
  }

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
  const selectedStocks = STOCKS.filter(s => (weights[s.sym] ?? 0) > 0);

  function setWeight(sym: string, val: number) {
    setWeights(p => ({ ...p, [sym]: Math.max(0, Math.min(100, val)) }));
    setSaved(false);
  }

  function saveETF() {
    dispatch({
      type: 'SET_ETF',
      etf: {
        name: etfName || 'My ETF',
        ticker: ticker.toUpperCase() || 'MYETF',
        holdings: Object.entries(weights).filter(([, w]) => w > 0).map(([sym, weight]) => ({ sym, weight })),
      },
    });
    dispatch({ type: 'ADD_XP', amount: 100 });
    setSaved(true);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Build an ETF 🏦</div>
          <div className="page-subtitle">Create your own Exchange-Traded Fund by selecting stocks and weights</div>
        </div>
      </div>
      <div className="page-body">
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">ETF Details</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Fund Name</label>
                <input
                  style={{ width: '100%' }}
                  placeholder="e.g. NextGen Technology Fund"
                  value={etfName}
                  onChange={e => setEtfName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Ticker Symbol</label>
                <input
                  style={{ width: '100%', textTransform: 'uppercase' }}
                  placeholder="e.g. NGTF"
                  maxLength={5}
                  value={ticker}
                  onChange={e => setTicker(e.target.value)}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-title">Stock Weights</div>
              <div style={{ fontSize: 12, color: totalWeight === 100 ? 'var(--gr)' : totalWeight > 100 ? 'var(--red)' : 'var(--text2)', marginBottom: 12 }}>
                Total allocation: {totalWeight}% {totalWeight === 100 ? '✓ Perfect!' : totalWeight > 100 ? '⚠ Over 100%' : '(must equal 100%)'}
              </div>
              {STOCKS.map(s => (
                <div key={s.sym} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ width: 52, fontWeight: 600, fontSize: 13 }}>{s.sym}</span>
                  <input
                    type="number"
                    min={0} max={100}
                    style={{ width: 70 }}
                    value={weights[s.sym] ?? ''}
                    placeholder="0"
                    onChange={e => setWeight(s.sym, Number(e.target.value))}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>%</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${weights[s.sym] ?? 0}%` }} />
                  </div>
                </div>
              ))}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                onClick={saveETF}
                disabled={totalWeight !== 100 || !etfName}
              >
                {saved ? '✓ ETF Saved!' : 'Save My ETF (+100 XP)'}
              </button>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-title">Preview</div>
              {selectedStocks.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>Add stock weights to preview your ETF composition.</div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{etfName || 'Untitled ETF'}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 16 }}>{ticker.toUpperCase() || 'TICKER'} · {selectedStocks.length} holdings</div>
                  {selectedStocks.map(s => (
                    <div key={s.sym} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                        <span>{s.sym} — {s.name}</span>
                        <span style={{ color: 'var(--gr)', fontWeight: 600 }}>{weights[s.sym]}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${weights[s.sym]}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="divider" />
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                    Weighted avg P/E: {(selectedStocks.reduce((s, stk) => s + stk.pe * (weights[stk.sym] / 100), 0)).toFixed(1)}
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title">What is an ETF?</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                An Exchange-Traded Fund (ETF) holds a basket of securities and trades on an exchange like a single stock.
                ETFs provide instant diversification, often at very low cost. Popular examples include SPY (S&P 500),
                QQQ (Nasdaq 100), and sector ETFs like XLK (Technology) or XLF (Financials).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

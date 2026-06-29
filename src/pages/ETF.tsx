import { useMemo, useState, useRef } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { lineChart, donutChart } from '../utils/charts';
import { useEtfLeaderboard } from '../hooks/useEtfLeaderboard';
import { useSpxReturn } from '../hooks/useSpxReturn';

const COLS = ['#00d4a8', '#4d9fff', '#f9c74f', '#a855f7', '#ff4d6d', '#22d3ee', '#f97316', '#ec4899'];

interface LbEntry { r: number; n: string; s: string; rt: number; me?: boolean }


type Holding = { sym: string; weight: number };

export default function ETF() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { spxReturn, spxPoints, spxDates } = useSpxReturn();

  const [etfName, setEtfName]     = useState(() => state.etf?.name ?? '');
  const [holdings, setHoldings]   = useState<Holding[]>(
    () => state.etf?.holdings.map(h => ({ sym: h.sym, weight: h.weight })) ?? []
  );
  const [addSym, setAddSym]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tooltip, setTooltip]     = useState<{ x: number; spx: number; dateLabel: string } | null>(null);
  const wrapRef                   = useRef<HTMLDivElement>(null);

  const total           = holdings.reduce((s, h) => s + h.weight, 0);
  const availableStocks = STOCKS.filter(s => !holdings.find(h => h.sym === s.sym));
  const currentAddSym   = addSym || availableStocks[0]?.sym || '';

  const etfReturn = useMemo(() => {
    if (!holdings.length) return 8.4;
    const weighted = holdings.reduce((sum, h) => {
      const stock = STOCKS.find(s => s.sym === h.sym);
      return sum + (stock ? stock.chgPct * (h.weight / 100) * 8 : 0);
    }, 0);
    return parseFloat((weighted + 8).toFixed(1));
  }, [holdings]);

  const alpha = parseFloat((etfReturn - spxReturn).toFixed(1));

  const chartSvg = useMemo(() => {
    if (spxPoints.length > 1) {
      return lineChart(spxPoints.slice(-90), 520, 160, 'var(--gr)');
    }
    return lineChart(Array(30).fill(100), 520, 160, 'var(--gr)');
  }, [spxPoints]);

  const donutSegments = holdings.map((h, i) => ({
    label: h.sym,
    value: h.weight,
    color: COLS[i % COLS.length],
  }));
  const donutSvg = holdings.length
    ? donutChart(donutSegments, 160).replace('<svg ', '<svg width="160" height="160" ')
    : '';

  const { entries, loading: lbLoading } = useEtfLeaderboard(user.supabaseId);
  const lbEntries: LbEntry[] = entries.length > 0
    ? entries.map((e, i) => ({
        r: i + 1,
        n: e.name,
        s: e.student_name ?? 'Student',
        rt: e.return_pct,
        me: e.user_id === user.supabaseId,
      }))
    : submitted
    ? [{ r: 1, n: etfName || 'My ETF', s: user.name, rt: etfReturn, me: true }]
    : [];

  function handleChartMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    const slice = spxPoints.slice(-90);
    if (!rect || slice.length === 0) return;
    const relX = e.clientX - rect.left;
    const idx = Math.round((relX / rect.width) * (slice.length - 1));
    const clamped = Math.max(0, Math.min(slice.length - 1, idx));
    const dateTs = spxDates.slice(-90)[clamped];
    setTooltip({
      x: relX,
      spx: +((slice[clamped] / slice[0] - 1) * 100).toFixed(2),
      dateLabel: dateTs
        ? new Date(dateTs * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '',
    });
  }

  function handlePctChange(i: number, val: string) {
    const n = Math.max(0, Math.min(100, Number(val) || 0));
    setHoldings(prev => prev.map((h, idx) => idx === i ? { ...h, weight: n } : h));
  }

  function handleRemove(i: number) {
    setHoldings(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleAdd() {
    if (!currentAddSym) return;
    setHoldings(prev => [...prev, { sym: currentAddSym, weight: 0 }]);
    const next = availableStocks.filter(s => s.sym !== currentAddSym)[0];
    setAddSym(next?.sym ?? '');
  }

  function handleSubmit() {
    dispatch({
      type: 'SET_ETF',
      etf: {
        name: etfName || 'My ETF',
        ticker: (etfName || 'My ETF').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5) || 'MYETF',
        holdings: holdings.filter(h => h.weight > 0).map(h => ({ sym: h.sym, weight: h.weight })),
      },
    });
    dispatch({ type: 'ADD_XP', amount: 100 });
    setSubmitted(true);
  }


  const panelHeader = (title: string) => (
    <div style={{
      background: 'var(--surface)', padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' as const, letterSpacing: '0.6px' }}>
        {title}
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Build an ETF 🏦</div>
          <div className="page-subtitle">Create your own Exchange-Traded Fund by selecting stocks and weights</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* ── Left column ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Holdings panel */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                background: 'var(--surface)', padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  MY ETF — "{etfName || 'Untitled'}"
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: total === 100 ? 'var(--gr-dim)' : 'var(--red-dim)',
                  color: total === 100 ? 'var(--gr)' : 'var(--red)',
                  border: `1px solid ${total === 100 ? 'var(--gr)' : 'var(--red)'}`,
                }}>
                  {total === 100 ? '✓ 100%' : `⚠ ${total}%`}
                </span>
              </div>

              <div style={{ padding: '14px 16px' }}>
                {/* ETF Name input */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                    ETF Name
                  </label>
                  <input
                    style={{ width: '100%' }}
                    placeholder="e.g. Growth & Income ETF"
                    value={etfName}
                    onChange={e => setEtfName(e.target.value)}
                  />
                </div>

                {/* Holdings rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {holdings.map((h, i) => {
                    const stock = STOCKS.find(s => s.sym === h.sym);
                    const color = COLS[i % COLS.length];
                    return (
                      <div key={h.sym} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 48, fontFamily: 'monospace' }}>
                          {h.sym}
                        </span>
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {stock?.name ?? h.sym}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={h.weight || ''}
                          placeholder="0"
                          onChange={e => handlePctChange(i, e.target.value)}
                          style={{ width: 72, padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace', fontSize: 13 }}
                        />
                        <div style={{ width: 90 }}>
                          <div className="progress-bar" style={{ height: 5 }}>
                            <div className="progress-fill" style={{ width: `${Math.min(100, h.weight)}%`, background: color }} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(i)}
                          style={{
                            width: 24, height: 24, borderRadius: 5, padding: 0, flexShrink: 0,
                            background: 'var(--red-dim)', color: 'var(--red)',
                            border: '1px solid var(--red)', fontSize: 14, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add stock row */}
                <div style={{ display: 'flex', gap: 8, marginTop: holdings.length ? 14 : 0 }}>
                  <select
                    value={currentAddSym}
                    onChange={e => setAddSym(e.target.value)}
                    style={{ flex: 1, fontSize: 12 }}
                    disabled={!availableStocks.length}
                  >
                    {availableStocks.map(s => (
                      <option key={s.sym} value={s.sym}>{s.sym} — {s.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAdd}
                    disabled={!availableStocks.length}
                  >
                    + Add Stock
                  </button>
                </div>
              </div>
            </div>

            {/* Performance panel */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
              {panelHeader('Performance vs S&P 500')}

              <div style={{ padding: '20px 24px' }}>
                {/* 3 metric cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'My ETF Return', value: `+${etfReturn}%`,                                          color: 'var(--gr)'  },
                    { label: 'S&P 500 YTD',    value: `${spxReturn >= 0 ? '+' : ''}${spxReturn}%`,            color: 'var(--gr)'  },
                    { label: 'Alpha',           value: `${alpha >= 0 ? '+' : ''}${alpha}%`, color: alpha >= 0 ? 'var(--gr)' : 'var(--red)' },
                  ].map(m => (
                    <div key={m.label} style={{
                      background: 'var(--bg3)', borderRadius: 'var(--radius)',
                      padding: '10px 12px', border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Line chart with crosshair tooltip */}
                <div
                  ref={wrapRef}
                  style={{ position: 'relative', cursor: 'crosshair', height: 160, overflow: 'hidden' }}
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div
                    className="chart-wrap"
                    style={{ height: 160, overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: chartSvg }}
                  />
                  {tooltip && (
                    <>
                      <div style={{
                        position: 'absolute', top: 8,
                        left: tooltip.x > 300 ? tooltip.x - 150 : tooltip.x + 12,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 12px', pointerEvents: 'none',
                        minWidth: 150, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10,
                      }}>
                        {tooltip.dateLabel && (
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontFamily: 'monospace' }}>
                            {tooltip.dateLabel}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>S&P 500</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: tooltip.spx >= 0 ? 'var(--gr)' : 'var(--red)' }}>
                            {tooltip.spx >= 0 ? '+' : ''}{tooltip.spx}%
                          </span>
                        </div>
                      </div>
                      <div style={{
                        position: 'absolute', top: 0, left: tooltip.x,
                        width: 1, height: '100%', background: 'rgba(255,255,255,0.15)',
                        pointerEvents: 'none',
                      }} />
                    </>
                  )}
                </div>

                {/* Submit button */}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 14, padding: 13, fontSize: 13, fontWeight: 600 }}
                  onClick={handleSubmit}
                >
                  {submitted
                    ? '✓ ETF Submitted — Partners can see your work'
                    : 'Submit ETF to Competition → (+100 XP)'}
                </button>
              </div>
            </div>

          </div>

          {/* ── Right sidebar ── */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Allocation panel */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {panelHeader('Allocation')}
              <div style={{ padding: 14 }}>
                {holdings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '24px 0' }}>
                    Add holdings to see allocation
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 14px' }}>
                      <div dangerouslySetInnerHTML={{ __html: donutSvg }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: 12, fontWeight: 700, color: 'var(--text3)',
                        pointerEvents: 'none',
                      }}>ETF</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {holdings.map((h, i) => (
                        <div key={h.sym} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 9, height: 9, borderRadius: 2, background: COLS[i % COLS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text2)' }}>
                            {h.sym} {h.weight}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Top ETFs leaderboard */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {panelHeader('Top ETFs')}
              <div style={{ padding: '4px 14px' }}>
                {lbLoading && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--text3)' }}>
                    Loading...
                  </div>
                )}
                {!lbLoading && lbEntries.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--text3)' }}>
                    No ETFs submitted yet. Be the first!
                  </div>
                )}
                {!lbLoading && lbEntries.map(e => {
                  const RANK_STYLES: Record<number, { bg: string; color: string }> = {
                    1: { bg: '#f9c74f', color: '#07111c' },
                    2: { bg: '#adb5bd', color: '#07111c' },
                    3: { bg: '#cd7f32', color: '#07111c' },
                  };
                  const rs = RANK_STYLES[e.r] ?? { bg: 'var(--surface2)', color: 'var(--text2)' };
                  return (
                    <div
                      key={e.r}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: e.me ? '9px 6px' : '9px 0',
                        borderBottom: '1px solid var(--border)',
                        background: e.me ? 'var(--gr-dim)' : 'transparent',
                        borderRadius: e.me ? 6 : 0,
                        margin: e.me ? '0 -6px' : 0,
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: rs.bg, color: rs.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {e.r}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {e.n}
                          </span>
                          {e.me && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                              background: 'var(--gr)', color: 'var(--bg)', flexShrink: 0,
                            }}>YOU</span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{e.s}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gr)', fontFamily: 'monospace', flexShrink: 0 }}>
                        +{e.rt}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

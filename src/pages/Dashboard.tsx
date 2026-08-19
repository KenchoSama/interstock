import { useMemo, useState, useEffect } from 'react';
import { useApp, getLevelName, getNextLevelXP, isLocked } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { useLeaderboard } from '../hooks/useLeaderboard';
import MentorBookingModal from '../components/MentorBookingModal';
import MonthCalendar from '../components/MonthCalendar';
import { useAvailableMentors } from '../hooks/useAvailableMentors';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { DIPLOMA_COURSES } from '../data/courses';
import { lineChart, alignDailySnapshots, lineChartWithPlaceholder } from '../utils/charts';
import { usePortfolioHistory } from '../hooks/usePortfolioHistory';
import { useStockQuotes } from '../hooks/useStockQuotes';
import ChartWithTooltip from '../components/ChartWithTooltip';

const LEVEL_THRESHOLDS = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];
const ETF_COLORS = ['var(--gr)', '#4d9fff', '#f9c74f', '#a855f7', '#f97316'];
const SP500_YTD = 10.8;

const TF_OPTIONS = ['1D', '1W', '1M', '6M', 'YTD', '1Y'] as const;
type TfOption = typeof TF_OPTIONS[number];

const FEATURE_LIST: { label: string; view: string }[] = [
  // { label: 'AI Tutor', view: 'ai' },
  // { label: 'Scenario Game', view: 'game' },
  // { label: 'Competitions', view: 'compete' },
  // { label: 'Options', view: 'options' },
  // { label: 'ETF Builder', view: 'etf' },
];

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];

  const { mentors, loading: mentorsLoading } = useAvailableMentors();
  const { events: calendarEvents, loading: calendarLoading } = useCalendarEvents(user.supabaseId);
  const { quotes } = useStockQuotes();

  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const customHoldings = user.portfolio.filter(
      h => !STOCKS.find(s => s.sym === h.sym)
    );
    customHoldings.forEach(async h => {
      try {
        const res = await fetch(`/api/chart/${h.sym}?interval=1d&range=1d`);
        if (!res.ok) return;
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return;
        const price: number = meta.regularMarketPrice ?? 0;
        setCustomPrices(prev => ({ ...prev, [h.sym]: price }));
      } catch { /* ignore */ }
    });
  }, [user.portfolio]);

  const getLivePrice = (sym: string) =>
    quotes.find(q => q.sym === sym)?.price
    ?? STOCKS.find(s => s.sym === sym)?.price
    ?? customPrices[sym]
    ?? 0;

  const [chartTf, setChartTf] = useState<TfOption>('1D');
  const { chartPoints, flatLine, snapshots } = usePortfolioHistory(user.portfolioId, 10000, chartTf);
  const [bookingMentor, setBookingMentor] = useState<typeof mentors[number] | null>(null);

  const startDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const holdingsValue = useMemo(() => {
    return user.portfolio.reduce((sum, h) => sum + h.shares * getLivePrice(h.sym), 0);
  }, [user.portfolio, quotes, customPrices]);

  const totalValue = holdingsValue + user.cash;
  const levelName = getLevelName(user.xp);
  const nextXP = getNextLevelXP(user.xp);
  const prevThresholds = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];
  const prevThreshold = [...prevThresholds].reverse().find(t => t <= user.xp) ?? 0;
  const xpProgress = nextXP > prevThreshold
    ? ((user.xp - prevThreshold) / (nextXP - prevThreshold)) * 100
    : 100;

  const diplomasEarned = user.diplomas.filter(d => d.earned).length;
  const diplomasTotal = DIPLOMA_COURSES.length;
  const diplomaPct = Math.round((diplomasEarned / diplomasTotal) * 100);

  const isDailyTf = chartTf === '1M' || chartTf === '6M' || chartTf === 'YTD' || chartTf === '1Y';

  const chartCutoffDate = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    switch (chartTf) {
      case '1D': cutoff.setDate(now.getDate() - 1); break;
      case '1W': cutoff.setDate(now.getDate() - 7); break;
      case '1M': cutoff.setMonth(now.getMonth() - 1); break;
      case '6M': cutoff.setMonth(now.getMonth() - 6); break;
      case 'YTD': cutoff.setMonth(0, 1); break;
      case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
    }
    return cutoff;
  }, [chartTf]);

  const filteredChartPoints = useMemo(() => {
    if (snapshots.length === 0) return [];
    return snapshots.map(s => Number(s.total_value));
  }, [snapshots]);

  const filteredChartDates = useMemo(() => {
    if (snapshots.length === 0) return [];
    return snapshots.map(s => s.recorded_at);
  }, [snapshots]);

  const alignedDailySeries = useMemo(() => {
    if (!isDailyTf) return { values: [], dates: [] };
    return alignDailySnapshots(snapshots, chartCutoffDate, new Date());
  }, [isDailyTf, snapshots, chartCutoffDate]);

  const displayPoints = isDailyTf ? alignedDailySeries.values : filteredChartPoints;
  const displayDates = isDailyTf ? alignedDailySeries.dates : filteredChartDates;

  const filteredStartDate = useMemo(() => {
    if (flatLine || snapshots.length === 0) return startDate;
    return chartCutoffDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [chartCutoffDate, snapshots, flatLine, startDate]);

  const chartSvg = useMemo(() => {
    if (isDailyTf) {
      if (alignedDailySeries.values.length === 0) return '';
      return lineChartWithPlaceholder(alignedDailySeries.values, 530, 120);
    }
    const points = filteredChartPoints;
    if (points.length === 0) return '';
    return lineChart(
      points,
      530, 120,
      points[points.length - 1] >= points[0] ? 'var(--gr)' : 'var(--red)'
    );
  }, [filteredChartPoints, isDailyTf, alignedDailySeries]);

  const portfolioChange = holdingsValue > 0
    ? user.portfolio.reduce((sum, h) => sum + (getLivePrice(h.sym) - h.avg) * h.shares, 0)
    : 0;

  const totalCost = user.portfolio.reduce((sum, h) => sum + h.avg * h.shares, 0);
  const myReturnPct = totalCost > 0 ? (portfolioChange / totalCost) * 100 : 0;

  const startValue = 10000;
  const returnPct = ((totalValue - startValue) / startValue) * 100;
  const returnAmt = totalValue - startValue;

  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= user.xp).length;
  const { top5, myEntry } = useLeaderboard();

  const etfReturn = state.etf
    ? parseFloat((state.etf.holdings.reduce((sum, h) => {
        const stock = STOCKS.find(s => s.sym === h.sym);
        return sum + (stock ? stock.chgPct * (h.weight / 100) * 8 : 0);
      }, 0) + 8).toFixed(1))
    : 0;
  const etfAlpha = parseFloat((etfReturn - SP500_YTD).toFixed(1));

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Full-width top section */}
      <div>
        {/* Welcome header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              Here&apos;s your financial learning dashboard
            </div>
          </div>
          <span className="level-badge">{levelName}</span>
        </div>

        {/* Four KPI cards — full width */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-label">Portfolio Value</div>
            <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`stat-sub ${portfolioChange >= 0 ? 'up' : 'dn'}`}>
              {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} P&amp;L
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cash Balance</div>
            <div className="stat-value">${user.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-sub">Available to invest</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total XP</div>
            <div className="stat-value" style={{ color: 'var(--gr)' }}>{user.xp.toLocaleString()}</div>
            <div className="stat-sub">{levelName}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Diploma Progress</div>
            <div className="stat-value">{diplomasEarned}/{diplomasTotal}</div>
            <div className="stat-sub up">{diplomaPct}% complete</div>
          </div>
        </div>

        <MonthCalendar events={calendarEvents} loading={calendarLoading} />

      </div>

      {/* Two-column section below */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Portfolio Performance card */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="card-title" style={{ margin: 0 }}>PORTFOLIO PERFORMANCE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {TF_OPTIONS.map(tf => (
                      <button key={tf} onClick={() => setChartTf(tf)}
                        style={{
                          padding: '3px 9px', fontSize: 11, borderRadius: 6,
                          background: chartTf === tf ? 'var(--gr)' : 'var(--surface)',
                          color: chartTf === tf ? '#000' : 'var(--text2)',
                          fontWeight: chartTf === tf ? 700 : 400,
                        }}>
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Value + return */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 13, color: returnPct >= 0 ? 'var(--gr)' : 'var(--red)' }}>
                  {returnPct >= 0 ? '+' : '-'}${Math.abs(returnAmt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%)
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>
                  Holdings: ${holdingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Chart with tooltip overlay */}
              <ChartWithTooltip
                chartSvg={chartSvg}
                chartPoints={displayPoints}
                flatLine={flatLine}
                totalValue={totalValue}
                dates={displayDates}
              />

              {/* Date range */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
                <span>{filteredStartDate}</span>
                <span>{today}</span>
              </div>
            </div>

            <div className="card">
              <div className="section-title">Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', gap: 8, padding: '12px 16px', color: 'var(--gr)', borderColor: 'var(--gr)' }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'portfolio' })}
                >
                  Trade Stocks
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', gap: 8, padding: '12px 16px' }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'assignments' })}
                >
                  Assignments
                </button>
              </div>
            </div>

            {/* Available Mentors widget */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="card-title" style={{ margin: 0 }}>AVAILABLE MENTORS</div>
                {!mentorsLoading && (
                  <span className="badge badge-green">{mentors.length} AVAILABLE</span>
                )}
              </div>

              {mentorsLoading && (
                <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '10px 0' }}>
                  Loading mentors...
                </div>
              )}

              {!mentorsLoading && mentors.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '10px 0' }}>
                  No mentors available right now.
                </div>
              )}

              {!mentorsLoading && mentors.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {mentors.map(m => (
                    <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--surface2)', border: '2px solid var(--gr)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, color: 'var(--gr)', flexShrink: 0,
                      }}>
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{m.title}</div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 12, flexShrink: 0 }}
                        onClick={() => setBookingMentor(m)}
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Build an ETF card
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="section-title" style={{ margin: 0 }}>Build an ETF</div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'etf' })}
                >
                  {state.etf ? 'Edit →' : 'Open →'}
                </button>
              </div>

              {state.etf ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>"{state.etf.name}"</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {state.etf.ticker} · {state.etf.holdings.length} holdings
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'ETF Return', value: `+${etfReturn}%`, color: 'var(--gr)' },
                      { label: 'S&P 500', value: `+${SP500_YTD}%`, color: 'var(--gr)' },
                      { label: 'Alpha', value: `${etfAlpha >= 0 ? '+' : ''}${etfAlpha}%`, color: etfAlpha >= 0 ? 'var(--gr)' : 'var(--red)' },
                    ].map(m => (
                      <div key={m.label} style={{
                        background: 'var(--bg3)', borderRadius: 'var(--radius)',
                        padding: '8px 10px', border: '1px solid var(--border)',
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{m.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {state.etf.holdings.slice(0, 4).map((h, i) => {
                      const stock = STOCKS.find(s => s.sym === h.sym);
                      const color = ETF_COLORS[i % ETF_COLORS.length];
                      return (
                        <div key={h.sym}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 42, fontFamily: 'monospace' }}>{h.sym}</span>
                              {stock && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{stock.name}</span>}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: 'monospace' }}>{h.weight}%</span>
                          </div>
                          <div className="progress-bar" style={{ height: 4 }}>
                            <div className="progress-fill" style={{ width: `${h.weight}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                    {state.etf.holdings.length > 4 && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' as const }}>
                        +{state.etf.holdings.length - 4} more holdings
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14 }}>
                    Build your own virtual ETF — set stock allocations, track performance vs the S&amp;P 500, and compete for review by institutional partners.
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 14 }}>
                    {[
                      { label: 'Diversification', bg: 'var(--gr-dim)', border: 'var(--gr)', color: 'var(--gr)' },
                      { label: 'vs S&P 500', bg: 'var(--blue-dim)', border: 'var(--blue)', color: 'var(--blue)' },
                      { label: 'Compete', bg: 'rgba(249,199,79,0.12)', border: 'var(--yellow)', color: 'var(--yellow)' },
                    ].map(tag => (
                      <span key={tag.label} style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 500,
                        background: tag.bg, border: `1px solid ${tag.border}`, color: tag.color,
                      }}>{tag.label}</span>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: 13 }}
                    onClick={() => dispatch({ type: 'SET_VIEW', view: 'etf' })}
                  >
                    Create Your ETF (+100 XP)
                  </button>
                </>
              )}
            </div>
            */}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* XP Progress widget */}
          <div className="card">
            <div className="card-title">XP PROGRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gr2), var(--gr))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: 'var(--bg)', flexShrink: 0,
              }}>
                L{levelNum}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Level {levelNum}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {user.xp.toLocaleString()} / {nextXP.toLocaleString()} XP
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginBottom: 16 }}>
              <div className="progress-fill" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {FEATURE_LIST.map(f => {
                const locked = isLocked(f.view, user.xp);
                return (
                  <div key={f.view} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: locked ? 'var(--text3)' : 'var(--text)' }}>{f.label}</span>
                    {locked ? (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>Locked</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--gr)', fontWeight: 600 }}>Unlocked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard mini widget */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="card-title" style={{ margin: 0 }}>LEADERBOARD</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'leaderboard' })}
              >
                Full →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {top5.map((entry, i) => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i < 3 ? 'var(--gr-dim)' : 'var(--surface2)',
                    border: `1px solid ${i < 3 ? 'var(--gr)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    color: i < 3 ? 'var(--gr)' : 'var(--text2)',
                    flexShrink: 0,
                  }}>
                    {entry.global_rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.full_name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.school_name ?? '—'}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: entry.return_pct >= 0 ? 'var(--gr)' : 'var(--red)', flexShrink: 0 }}>
                    {entry.return_pct >= 0 ? '+' : ''}{entry.return_pct.toFixed(1)}%
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'var(--text2)', flexShrink: 0,
                }}>
                  {myEntry?.global_rank ?? '—'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </span>
                    <span className="badge badge-blue" style={{ fontSize: 9, padding: '1px 5px', flexShrink: 0 }}>YOU</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>—</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: (myEntry?.return_pct ?? 0) >= 0 ? 'var(--gr)' : 'var(--red)', flexShrink: 0 }}>
                  {(myEntry?.return_pct ?? 0) >= 0 ? '+' : ''}{(myEntry?.return_pct ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {bookingMentor && (
        <MentorBookingModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />
      )}
    </div>
  );
}

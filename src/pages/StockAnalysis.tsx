import { useState, useEffect } from 'react';
import { STOCKS } from '../data/stocks';
import { useStockCandles } from '../hooks/useStockCandles';
import type { Stock } from '../types';
import { useStockNews } from '../hooks/useStockNews';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { useEarningsCalendar } from '../hooks/useEarningsCalendar';
import { useStockFundamentals } from '../hooks/useStockFundamentals';
import { sma, rsi, supportResistance } from '../utils/technicals';
import { useStockLookup } from '../hooks/useStockLookup';

const SECTOR_PE: Record<string, number> = {
  'Technology': 28.5,
  'Consumer Discretionary': 24.1,
  'Communication Services': 19.8,
  'Financials': 13.2,
  'Health Care': 22.4,
  'Energy': 11.8,
  'Utilities': 17.2,
  'Industrials': 20.1,
  'Materials': 16.5,
  'Real Estate': 35.2,
};



function StockSelector({ selected, onChange }: {
  selected: Stock;
  onChange: (sym: string, overrideData?: { name: string; price: number; chg: number; chgPct: number }) => void;
}) {
  const { quotes } = useStockQuotes();
  const { result, loading, error, lookup, clear } = useStockLookup();
  const [searchInput, setSearchInput] = useState(selected.sym);

  const liveQuote = quotes.find(q => q.sym === selected.sym);
  const livePrice = result?.sym === selected.sym ? result.price : liveQuote?.price ?? selected.price;
  const liveChg = result?.sym === selected.sym ? result.chg : liveQuote?.chg ?? selected.chg;
  const liveChgPct = result?.sym === selected.sym ? result.chgPct : liveQuote?.chgPct ?? selected.chgPct;
  const displayName = result?.sym === selected.sym ? result.name : selected.name;

  useEffect(() => {
    if (result) {
      onChange(result.sym, { name: result.name, price: result.price, chg: result.chg, chgPct: result.chgPct });
      setSearchInput(result.sym);
    }
  }, [result]);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffc107' }}>{selected.sym}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{displayName}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>${livePrice.toFixed(2)}</span>
          <span className={liveChg >= 0 ? 'up' : 'dn'} style={{ fontSize: 14 }}>
            {liveChg >= 0 ? '+' : ''}{liveChg.toFixed(2)} ({liveChgPct.toFixed(2)}%)
          </span>
          <span className="badge badge-blue">{selected.sector ?? '—'}</span>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Search any ticker..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter') lookup(searchInput); }}
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
            />
            <button
              onClick={() => lookup(searchInput)}
              disabled={loading}
              style={{
                padding: '0 14px', borderRadius: 8,
                background: 'var(--gr)', color: '#000',
                fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}
            >
              {loading ? '...' : 'GO'}
            </button>
          </div>

          {error && (
            <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {STOCKS.map(s => (
              <button
                key={s.sym}
                onClick={() => { setSearchInput(s.sym); lookup(s.sym); clear(); onChange(s.sym); }}
                style={{
                  padding: '2px 8px', fontSize: 10, borderRadius: 4,
                  background: selected.sym === s.sym ? 'var(--gr-dim)' : 'var(--surface)',
                  border: `1px solid ${selected.sym === s.sym ? 'var(--gr)' : 'var(--border)'}`,
                  color: selected.sym === s.sym ? 'var(--gr)' : 'var(--text3)',
                  fontWeight: selected.sym === s.sym ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {s.sym}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FundamentalsPanel({ ticker }: { ticker: string }) {
  const { fundamentals, loading, error } = useStockFundamentals(ticker);

  const headerBadge = (bg: string, color: string, label: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div className="section-title" style={{ margin: 0 }}>Fundamentals</div>
      <span style={{ fontSize: 10, padding: '2px 8px', background: bg, color, borderRadius: 4, fontWeight: 700, letterSpacing: 1 }}>{label}</span>
    </div>
  );

  if (loading) return (
    <div className="card" style={{ marginBottom: 16 }}>
      {headerBadge('var(--gr-dim)', 'var(--gr)', 'LIVE')}
      <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--text3)' }}>
        Loading fundamentals...
      </div>
    </div>
  );

  if (error) return (
    <div className="card" style={{ marginBottom: 16 }}>
      {headerBadge('var(--red-dim)', 'var(--red)', 'ERROR')}
      <div style={{ padding: '12px', background: 'var(--red-dim)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
        Failed to load fundamentals for {ticker}. Check your Finnhub API key or try again.
      </div>
    </div>
  );

  const f = fundamentals!;
  const metrics = [
    { label: 'P/E Ratio',  value: f.pe     != null ? `${f.pe.toFixed(1)}x`              : 'N/A' },
    { label: 'EPS',        value: f.eps    != null ? `$${f.eps.toFixed(2)}`              : 'N/A' },
    { label: 'Dividend',   value: f.div    != null && f.div > 0 ? `$${f.div.toFixed(2)}` : 'None' },
    { label: 'Beta',       value: f.beta   != null ? f.beta.toFixed(2)                   : 'N/A' },
    { label: 'Market Cap', value: f.mktCap != null ? f.mktCap                            : 'N/A' },
    { label: '52W High',   value: f.weekHigh52 != null ? `$${f.weekHigh52.toFixed(2)}`  : 'N/A' },
    { label: '52W Low',    value: f.weekLow52  != null ? `$${f.weekLow52.toFixed(2)}`   : 'N/A' },
    { label: 'Avg Volume', value: f.vol    != null ? `${f.vol.toFixed(1)}M`              : 'N/A' },
  ];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {headerBadge('var(--gr-dim)', 'var(--gr)', 'LIVE')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div><span style={{ color: 'var(--gr)', fontWeight: 600 }}>P/E Ratio:</span> Higher P/E suggests investors expect higher future growth.</div>
        <div><span style={{ color: 'var(--gr)', fontWeight: 600 }}>EPS:</span> Earnings per Share. Higher EPS signals a more profitable company.</div>
        <div><span style={{ color: 'var(--gr)', fontWeight: 600 }}>Beta:</span> Measures volatility vs. the market. Beta &gt; 1 means more volatile.</div>
        <div><span style={{ color: 'var(--gr)', fontWeight: 600 }}>52W Range:</span> The highest and lowest price in the past 52 weeks.</div>
      </div>
    </div>
  );
}

function NewsPanel({ ticker, stock }: { ticker: string; stock: Stock }) {
  const { news, loading, error } = useStockNews(ticker);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Latest News — {stock.sym}</div>
        <span style={{
          fontSize: 10, padding: '2px 8px',
          background: 'var(--gr-dim)', color: 'var(--gr)',
          borderRadius: 4, fontWeight: 700, letterSpacing: 1,
        }}>LIVE</span>
      </div>

      {loading && (
        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
          Loading news...
        </div>
      )}

      {error && (
        <div style={{ padding: '12px', background: 'var(--red-dim)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
          Unable to load news. Check your Finnhub API key.
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
          No recent news found for {ticker}.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {news.map((n, i) => (
          <div
            key={i}
            style={{
              display: 'block',
              padding: '10px 12px',
              background: 'var(--bg3)',
              borderRadius: 'var(--radius)',
              borderLeft: '3px solid var(--gr)',
            }}
          >
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
                {n.title}
              </div>
            </a>
            {n.summary && (
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5, lineHeight: 1.5 }}>
                {n.summary}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <a
                href={n.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gr)', fontWeight: 600, textDecoration: 'none', fontSize: 11 }}
              >
                {n.source}
              </a>
              <span>·</span>
              <span>{n.time}</span>
              <span>·</span>
              <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                Read full article →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValuationPanel({ stock, ticker }: { stock: Stock; ticker: string }) {
  const { fundamentals, loading, error } = useStockFundamentals(ticker);

  if (loading) return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Valuation</div>
      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--text3)' }}>Loading...</div>
    </div>
  );

  if (error) return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Valuation</div>
      <div style={{ padding: '12px', background: 'var(--red-dim)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
        Failed to load valuation data for {ticker}.
      </div>
    </div>
  );

  const pe = fundamentals?.pe ?? null;
  const eps = fundamentals?.eps ?? null;
  const evEbitda = fundamentals?.evEbitda ?? null;
  const bookValue = fundamentals?.bookValuePerShare ?? null;
  const sectorAvgPe = SECTOR_PE[stock.sector] ?? 20.0;

  const priceBook = bookValue && bookValue > 0
    ? (stock.price / bookValue).toFixed(2)
    : eps ? (stock.price / (eps * 8)).toFixed(2)
    : null;

  const fairValue = eps ? (eps * 20).toFixed(2) : null;
  const upsidePct = fairValue
    ? (((Number(fairValue) - stock.price) / stock.price) * 100).toFixed(1)
    : null;
  const undervalued = fairValue ? Number(fairValue) > stock.price : null;

  if (pe === null && eps === null) return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Valuation</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
        Valuation data unavailable for {ticker}.
      </div>
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Valuation</div>
        <span style={{
          fontSize: 10, padding: '2px 8px',
          background: 'var(--gr-dim)', color: 'var(--gr)',
          borderRadius: 4, fontWeight: 700, letterSpacing: 1,
        }}>LIVE</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
        {[
          { label: 'P/E Ratio',      value: pe ? `${pe.toFixed(1)}x` : 'N/A' },
          { label: 'Sector Avg P/E', value: `${sectorAvgPe.toFixed(1)}x` },
          { label: 'Price / Book',   value: priceBook ? `${priceBook}x` : 'N/A' },
          { label: 'EV / EBITDA',    value: evEbitda ? `${evEbitda.toFixed(1)}x` : 'N/A' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text3)' }}>{r.label}</span>
            <span style={{ fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text3)' }}>DCF Est. Fair Value</span>
          <span style={{ fontWeight: 700 }}>{fairValue ? `$${fairValue}` : 'N/A'}</span>
        </div>

        {undervalued !== null && upsidePct !== null && (
          <div style={{
            padding: '8px 10px', borderRadius: 8,
            background: undervalued ? 'var(--gr-dim)' : 'var(--red-dim)',
            color: undervalued ? 'var(--gr)' : 'var(--red)',
            fontSize: 12, fontWeight: 600, textAlign: 'center',
          }}>
            {undervalued
              ? `▲ Undervalued by ${upsidePct}%`
              : `▼ Overvalued by ${Math.abs(Number(upsidePct))}%`}
          </div>
        )}

        <div style={{
          fontSize: 10, color: 'var(--text3)', lineHeight: 1.5,
          padding: '8px 10px', background: 'var(--surface)',
          borderRadius: 6, borderLeft: '2px solid var(--border)',
        }}>
          ⚠️ DCF estimate uses simplified model (EPS × 20). Not investment advice —
          for educational purposes only.
        </div>
      </div>
    </div>
  );
}

function TechnicalLevelsPanel({ stock, ticker }: { stock: Stock; ticker: string }) {
  const { candles, loading, error } = useStockCandles(ticker);

  if (loading) return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Technical Levels</div>
      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--text3)' }}>
        Loading...
      </div>
    </div>
  );

  if (error || candles.length === 0) return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Technical Levels</div>
      <div style={{ padding: '12px', background: 'var(--red-dim)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
        Failed to load technical data for {ticker}.
      </div>
    </div>
  );

  const p = stock.price;
  const ma50  = sma(candles, 50);
  const ma200 = sma(candles, 200);
  const rsiVal = rsi(candles, 14);
  const { support1, support2, resistance1, resistance2 } = supportResistance(candles, 20);

  const rsiSignal = rsiVal === null ? '' : rsiVal >= 70 ? '— Overbought' : rsiVal <= 30 ? '— Oversold' : '— Neutral';
  const rsiColor = rsiVal === null ? 'var(--text)' : rsiVal >= 70 ? 'var(--red)' : rsiVal <= 30 ? 'var(--gr)' : 'var(--text)';

  const rows = [
    { label: 'Resistance 2', value: `$${resistance2.toFixed(2)}`, cls: 'dn', bold: false },
    { label: 'Resistance 1', value: `$${resistance1.toFixed(2)}`, cls: 'dn', bold: false },
    { label: 'Current Price', value: `$${p.toFixed(2)}`, cls: '', bold: true },
    { label: 'Support 1',    value: `$${support1.toFixed(2)}`,    cls: 'up', bold: false },
    { label: 'Support 2',    value: `$${support2.toFixed(2)}`,    cls: 'up', bold: false },
    { label: '50-Day MA',    value: ma50  ? `$${ma50.toFixed(2)}`  : 'N/A (need more data)', cls: 'up', bold: false },
    { label: '200-Day MA',   value: ma200 ? `$${ma200.toFixed(2)}` : 'N/A (need more data)', cls: 'up', bold: false },
    { label: `RSI (14) ${rsiSignal}`, value: rsiVal !== null ? String(rsiVal) : 'N/A', cls: '', bold: false },
  ];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Technical Levels</div>
        <span style={{
          fontSize: 10, padding: '2px 8px',
          background: 'var(--gr-dim)', color: 'var(--gr)',
          borderRadius: 4, fontWeight: 700, letterSpacing: 1,
        }}>LIVE</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13 }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text3)' }}>{r.label}</span>
            <span
              className={r.cls}
              style={{
                fontWeight: r.bold ? 700 : 500,
                color: r.label.startsWith('RSI') ? rsiColor : undefined,
              }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
      {(!ma50 || !ma200) && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
          * 50/200-day MA requires more historical data than the current 3-month range.
        </div>
      )}
    </div>
  );
}

function EarningsCalendar() {
  const SYMBOLS = STOCKS.map(s => s.sym);
  const { earnings, loading } = useEarningsCalendar(SYMBOLS);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Earnings Calendar</div>
        <span style={{
          fontSize: 10, padding: '2px 8px',
          background: 'var(--gr-dim)', color: 'var(--gr)',
          borderRadius: 4, fontWeight: 700, letterSpacing: 1,
        }}>LIVE</span>
      </div>

      {loading && (
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
          Loading...
        </div>
      )}

      {!loading && earnings.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
          No upcoming earnings in next 90 days.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {earnings.map(e => (
          <div key={e.sym} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 10px', background: 'var(--bg3)', borderRadius: 8,
          }}>
            <span style={{ fontWeight: 700, color: '#ffc107', fontSize: 13, width: 50 }}>{e.sym}</span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{e.date}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Est. {e.est}</div>
              {e.actual && (
                <div style={{ fontSize: 11, color: 'var(--gr)', fontWeight: 600 }}>Act. {e.actual}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Fundamentals() {
  const [selectedTicker, setSelectedTicker] = useState(STOCKS[0].sym);
  const [customData, setCustomData] = useState<{ name: string; price: number; chg: number; chgPct: number } | null>(null);
  const [tvSym, setTvSym] = useState('AAPL');
  const [tvSearchInput, setTvSearchInput] = useState('');

  function handleTvSearch() {
    const sym = tvSearchInput.trim().toUpperCase();
    if (sym) setTvSym(sym);
    setTvSearchInput('');
  }
  const { quotes } = useStockQuotes();

  const baseStock = STOCKS.find(s => s.sym === selectedTicker);
  const liveQuote = quotes.find(q => q.sym === selectedTicker);

  const stockWithLivePrice: Stock = baseStock
    ? {
        ...baseStock,
        price: liveQuote?.price ?? baseStock.price,
        chg: liveQuote?.chg ?? baseStock.chg,
        chgPct: liveQuote?.chgPct ?? baseStock.chgPct,
      }
    : {
        sym: selectedTicker,
        name: customData?.name ?? selectedTicker,
        price: customData?.price ?? 0,
        chg: customData?.chg ?? 0,
        chgPct: customData?.chgPct ?? 0,
        mktCap: '—',
        pe: 0,
        eps: 0,
        div: 0,
        beta: 0,
        vol: 0,
        sector: '—',
      };

  function handleChange(sym: string, overrideData?: { name: string; price: number; chg: number; chgPct: number }) {
    setSelectedTicker(sym);
    setCustomData(overrideData ?? null);
  }

  return (
    <div className="page-body">
      {/* Live Chart - TradingView */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>LIVE CHART — TRADINGVIEW</div>
          <span style={{
            fontSize: 11, padding: '2px 8px',
            background: 'var(--red)', color: '#fff',
            borderRadius: 4, fontWeight: 700, letterSpacing: 1,
          }}>
            LIVE
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Search any ticker..."
            value={tvSearchInput}
            onChange={e => setTvSearchInput(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') handleTvSearch(); }}
            style={{ flex: 1, maxWidth: 220, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
          />
          <button
            onClick={handleTvSearch}
            style={{
              padding: '0 14px', borderRadius: 8,
              background: 'var(--gr)', color: '#000',
              fontWeight: 700, fontSize: 12, flexShrink: 0,
            }}
          >
            GO
          </button>
        </div>
        <iframe
          key={tvSym}
          src={`https://s.tradingview.com/widgetembed/?symbol=${tvSym}&interval=D&theme=dark&style=1&locale=en&toolbar_bg=0c1a27&hide_side_toolbar=0`}
          style={{ width: '100%', height: 560, border: 'none', borderRadius: 8 }}
          allowFullScreen
        />
      </div>

      <StockSelector
        selected={stockWithLivePrice}
        onChange={handleChange}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FundamentalsPanel ticker={selectedTicker} />
          <NewsPanel ticker={selectedTicker} stock={stockWithLivePrice} />
        </div>

        <div style={{ width: 258, flexShrink: 0 }}>
          <ValuationPanel stock={stockWithLivePrice} ticker={selectedTicker} />
          <TechnicalLevelsPanel stock={stockWithLivePrice} ticker={selectedTicker} />
          <EarningsCalendar />
        </div>
      </div>
    </div>
  );
}

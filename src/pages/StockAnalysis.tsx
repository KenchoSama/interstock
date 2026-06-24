import { useMemo, useState } from 'react';
import { STOCKS } from '../data/stocks';
import { genCandles, candleChart } from '../utils/charts';
import type { Stock } from '../types';
import { useStockNews } from '../hooks/useStockNews';
import { useStockQuotes } from '../hooks/useStockQuotes';


const EARNINGS = [
  { sym: 'AAPL', date: 'Jul 30', est: '$1.42' },
  { sym: 'MSFT', date: 'Jul 24', est: '$3.01' },
  { sym: 'GOOGL', date: 'Jul 23', est: '$1.85' },
  { sym: 'META', date: 'Jul 31', est: '$5.24' },
  { sym: 'NVDA', date: 'Aug 21', est: '$6.73' },
  { sym: 'AMZN', date: 'Aug 1', est: '$1.03' },
];

function StockSelector({ stocks, selected, onChange }: {
  stocks: Stock[];
  selected: Stock;
  onChange: (sym: string) => void;
}) {
  const { quotes } = useStockQuotes();

  const livePrice = quotes.find(q => q.sym === selected.sym)?.price ?? selected.price;
  const liveChg = quotes.find(q => q.sym === selected.sym)?.chg ?? selected.chg;
  const liveChgPct = quotes.find(q => q.sym === selected.sym)?.chgPct ?? selected.chgPct;

  return (
    <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#ffc107' }}>{selected.sym}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{selected.name}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24, fontWeight: 700 }}>${livePrice.toFixed(2)}</span>
        <span className={liveChg >= 0 ? 'up' : 'dn'} style={{ fontSize: 14 }}>
          {liveChg >= 0 ? '+' : ''}{liveChg.toFixed(2)} ({liveChgPct.toFixed(2)}%)
        </span>
        <span className="badge badge-blue">{selected.sector}</span>
      </div>
      <select value={selected.sym} onChange={e => onChange(e.target.value)} style={{ width: 230 }}>
        {stocks.map(s => {
          const q = quotes.find(q => q.sym === s.sym);
          const price = q?.price ?? s.price;
          const chgPct = q?.chgPct ?? s.chgPct;
          return (
            <option key={s.sym} value={s.sym}>
              {s.sym} — ${price.toFixed(2)} ({chgPct >= 0 ? '+' : ''}{chgPct.toFixed(2)}%)
            </option>
          );
        })}
      </select>
    </div>
  );
}

function CandleChart({ stock }: { stock: Stock }) {
  const candles = useMemo(() => genCandles(stock.price, 60, 0.025), [stock.sym]);
  const svg = candleChart(candles, 540, 160);
  const lo = Math.min(...candles.map(c => c.low)).toFixed(2);
  const hi = Math.max(...candles.map(c => c.high)).toFixed(2);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>{stock.sym} — Candle Chart (60D)</div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          L: ${lo} &nbsp;·&nbsp; H: ${hi}
        </div>
      </div>
      <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

function FundamentalsPanel({ stock }: { stock: Stock }) {
  const metrics = [
    { label: 'P/E Ratio', value: `${stock.pe}x` },
    { label: 'EPS', value: `$${stock.eps.toFixed(2)}` },
    { label: 'Dividend', value: stock.div > 0 ? `$${stock.div.toFixed(2)}` : 'None' },
    { label: 'Beta', value: stock.beta.toFixed(2) },
    { label: 'Market Cap', value: stock.mktCap },
    { label: 'Sector', value: stock.sector.split(' ')[0] },
    { label: 'Volume', value: `${stock.vol}M` },
    { label: 'Day Change', value: `${stock.chgPct >= 0 ? '+' : ''}${stock.chgPct.toFixed(2)}%` },
  ];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Fundamentals</div>
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
        <div><span style={{ color: 'var(--gr)', fontWeight: 600 }}>Volume:</span> Shares traded in millions. Higher volume means more liquidity.</div>
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
          <a
            key={i}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '10px 12px',
              background: 'var(--bg3)',
              borderRadius: 'var(--radius)',
              borderLeft: '3px solid var(--gr)',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
              {n.title}
            </div>
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
                onClick={e => e.stopPropagation()}
                style={{ color: 'var(--gr)', fontWeight: 600, textDecoration: 'none', fontSize: 11 }}
              >
                {n.source}
              </a>
              <span>·</span>
              <span>{n.time}</span>
              <span>·</span>
              <span style={{ color: 'var(--blue)' }}>Read full article →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ValuationPanel({ stock }: { stock: Stock }) {
  const fairValue = (stock.eps * 20).toFixed(2);
  const upsidePct = (((Number(fairValue) - stock.price) / stock.price) * 100).toFixed(1);
  const undervalued = Number(fairValue) > stock.price;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Valuation</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
        {[
          { label: 'P/E Ratio', value: `${stock.pe}x` },
          { label: 'Sector Avg P/E', value: '24.0x' },
          { label: 'Price / Book', value: `${(stock.price / (stock.eps * 8)).toFixed(2)}x` },
          { label: 'EV / EBITDA', value: `${(stock.pe * 0.7).toFixed(1)}x` },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text3)' }}>{r.label}</span>
            <span style={{ fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text3)' }}>DCF Est. Fair Value</span>
          <span style={{ fontWeight: 700 }}>${fairValue}</span>
        </div>
        <div style={{
          padding: '8px 10px',
          borderRadius: 8,
          background: undervalued ? 'var(--gr-dim)' : 'var(--red-dim)',
          color: undervalued ? 'var(--gr)' : 'var(--red)',
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {undervalued
            ? `▲ Undervalued by ${upsidePct}%`
            : `▼ Overvalued by ${Math.abs(Number(upsidePct))}%`}
        </div>
      </div>
    </div>
  );
}

function TechnicalLevelsPanel({ stock }: { stock: Stock }) {
  const p = stock.price;
  const rsi = Math.min(85, Math.max(25, Math.round(50 + stock.chgPct * 4)));

  const rows = [
    { label: 'Resistance 2', value: `$${(p * 1.12).toFixed(2)}`, cls: 'dn' },
    { label: 'Resistance 1', value: `$${(p * 1.05).toFixed(2)}`, cls: 'dn' },
    { label: 'Current Price', value: `$${p.toFixed(2)}`, bold: true },
    { label: 'Support 1',    value: `$${(p * 0.95).toFixed(2)}`, cls: 'up' },
    { label: 'Support 2',    value: `$${(p * 0.88).toFixed(2)}`, cls: 'up' },
    { label: '50-Day MA',    value: `$${(p * 0.97).toFixed(2)}`, cls: 'up' },
    { label: '200-Day MA',   value: `$${(p * 0.91).toFixed(2)}`, cls: 'up' },
    { label: 'RSI (14)',     value: String(rsi) },
  ];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Technical Levels</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13 }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text3)' }}>{r.label}</span>
            <span className={r.cls} style={{ fontWeight: r.bold ? 700 : 500 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EarningsCalendar() {
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 12 }}>Earnings Calendar</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {EARNINGS.map(e => (
          <div key={e.sym} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 10px', background: 'var(--bg3)', borderRadius: 8,
          }}>
            <span style={{ fontWeight: 700, color: '#ffc107', fontSize: 13, width: 50 }}>{e.sym}</span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{e.date}</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Est. EPS {e.est}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Fundamentals() {
  const [selectedTicker, setSelectedTicker] = useState(STOCKS[0].sym);
  const { quotes } = useStockQuotes();

  const selectedStock = STOCKS.find(s => s.sym === selectedTicker) ?? STOCKS[0];
  const liveQuote = quotes.find(q => q.sym === selectedTicker);
  const stockWithLivePrice = {
    ...selectedStock,
    price: liveQuote?.price ?? selectedStock.price,
    chg: liveQuote?.chg ?? selectedStock.chg,
    chgPct: liveQuote?.chgPct ?? selectedStock.chgPct,
  };

  return (
    <div className="page-body">
      <StockSelector
        stocks={STOCKS}
        selected={stockWithLivePrice}
        onChange={setSelectedTicker}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CandleChart stock={stockWithLivePrice} />
          <FundamentalsPanel stock={stockWithLivePrice} />
          <NewsPanel ticker={selectedTicker} stock={stockWithLivePrice} />
        </div>

        <div style={{ width: 258, flexShrink: 0 }}>
          <ValuationPanel stock={stockWithLivePrice} />
          <TechnicalLevelsPanel stock={stockWithLivePrice} />
          <EarningsCalendar />
        </div>
      </div>
    </div>
  );
}

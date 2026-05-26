import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import type { Stock } from '../types';
import { genPrices, lineChart } from '../utils/charts';

function StockDetail({ stock }: { stock: Stock }) {
  const prices = useMemo(() => genPrices(stock.price, 60, 0.025), [stock.sym]);
  const svg = lineChart(prices, 400, 140);

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{stock.sym}</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 2 }}>{stock.name}</div>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>${stock.price.toFixed(2)}</span>
            <span className={stock.chg >= 0 ? 'up' : 'dn'} style={{ marginLeft: 10, fontSize: 14 }}>
              {stock.chg >= 0 ? '+' : ''}{stock.chg.toFixed(2)} ({stock.chgPct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <span className="badge badge-blue">{stock.sector}</span>
      </div>

      <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: svg }} style={{ marginBottom: 20 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'P/E Ratio', value: `${stock.pe}x` },
          { label: 'EPS', value: `$${stock.eps.toFixed(2)}` },
          { label: 'Dividend Yield', value: stock.div > 0 ? `$${stock.div.toFixed(2)}` : 'None' },
          { label: 'Beta', value: stock.beta.toFixed(2) },
          { label: 'Market Cap', value: stock.mktCap },
          { label: 'Sector', value: stock.sector },
          { label: 'Volume', value: `${stock.vol}M` },
          { label: 'Day Change', value: `${stock.chgPct >= 0 ? '+' : ''}${stock.chgPct.toFixed(2)}%` },
        ].map(item => (
          <div key={item.label} style={{
            background: 'var(--bg3)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 13 }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Understanding the Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text2)' }}>
          <div>
            <span style={{ color: 'var(--gr)', fontWeight: 600 }}>P/E Ratio:</span> Price-to-Earnings ratio. Higher P/E suggests investors expect higher future growth.
          </div>
          <div>
            <span style={{ color: 'var(--gr)', fontWeight: 600 }}>EPS:</span> Earnings per Share. A higher EPS often signals a more profitable company.
          </div>
          <div>
            <span style={{ color: 'var(--gr)', fontWeight: 600 }}>Beta:</span> Measures volatility vs. the market. Beta &gt; 1 means more volatile than the market.
          </div>
          <div>
            <span style={{ color: 'var(--gr)', fontWeight: 600 }}>Volume:</span> Number of shares traded in millions. Higher volume means more liquidity.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Fundamentals() {
  const { state } = useApp();
  const user = state.u[state.role];
  const [selected, setSelected] = useState<Stock | null>(null);

  if (user.xp < 100) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Fundamentals Locked
          </div>
          <div style={{ color: 'var(--text2)', marginBottom: 16 }}>
            You need 100 XP to access Stock Fundamentals.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ padding: '4px 12px', background: 'var(--gr-dim)', color: 'var(--gr)', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {user.xp} / 100 XP
            </div>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>
              {100 - user.xp} more XP needed
            </span>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            Earn XP by completing lessons, playing the Scenario Challenge, and trading.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          Explore key financial metrics for each stock. Click a card to view detailed fundamentals.
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: selected ? 0 : 0 }}>
        {STOCKS.map(stock => (
          <div
            key={stock.sym}
            className="stock-card"
            style={{ border: selected?.sym === stock.sym ? '1px solid var(--gr)' : undefined }}
            onClick={() => setSelected(selected?.sym === stock.sym ? null : stock)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stock-sym">{stock.sym}</div>
                <div className="stock-name">{stock.name}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>
                {stock.sector.split(' ')[0]}
              </span>
            </div>
            <div className="stock-price">${stock.price.toFixed(2)}</div>
            <div className={`stock-chg ${stock.chg >= 0 ? 'up' : 'dn'}`}>
              {stock.chg >= 0 ? '+' : ''}{stock.chg.toFixed(2)} ({stock.chgPct.toFixed(2)}%)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: 10, fontSize: 11 }}>
              <span style={{ color: 'var(--text3)' }}>P/E</span>
              <span style={{ textAlign: 'right', color: 'var(--text2)' }}>{stock.pe}x</span>
              <span style={{ color: 'var(--text3)' }}>Mkt Cap</span>
              <span style={{ textAlign: 'right', color: 'var(--text2)' }}>{stock.mktCap}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && <StockDetail stock={selected} />}
    </div>
  );
}

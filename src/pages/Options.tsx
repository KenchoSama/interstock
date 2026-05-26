import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { genPrices, lineChart } from '../utils/charts';

const STRATEGIES = [
  {
    name: 'Covered Call',
    icon: '📞',
    description: 'Own shares of a stock and sell a call option against them. You collect the premium and agree to sell your shares at the strike price if the option is exercised. Best when you expect the stock to stay flat or rise slightly.',
    risk: 'Limited upside beyond strike price',
    reward: 'Premium income + any stock appreciation up to strike',
    outlook: 'Neutral to slightly bullish',
  },
  {
    name: 'Protective Put',
    icon: '🛡️',
    description: 'Buy a put option on a stock you already own. Acts like insurance — if the stock falls below the strike price, your put gains value, offsetting the loss. You pay a premium for this protection.',
    risk: 'Cost of the premium (insurance premium)',
    reward: 'Unlimited upside with downside protection',
    outlook: 'Bullish with downside hedge',
  },
  {
    name: 'Iron Condor',
    icon: '🦅',
    description: 'Sell an out-of-the-money call spread and an out-of-the-money put spread simultaneously. Profits when the underlying stock stays within a defined range. Collects premium from both sides.',
    risk: 'Defined maximum loss if stock moves outside the range',
    reward: 'Maximum profit = net premium collected',
    outlook: 'Neutral (range-bound market)',
  },
];

export default function Options() {
  const { state } = useApp();
  const user = state.u[state.role];

  const [stockPrice, setStockPrice] = useState(190);
  const [strikePrice, setStrikePrice] = useState(195);
  const [premium, setPremium] = useState(4.5);
  const [expiry, setExpiry] = useState(30);
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');

  const intrinsicValue = useMemo(() => {
    if (optionType === 'call') return Math.max(0, stockPrice - strikePrice);
    return Math.max(0, strikePrice - stockPrice);
  }, [stockPrice, strikePrice, optionType]);

  const timeValue = Math.max(0, premium - intrinsicValue);

  const breakeven = optionType === 'call'
    ? strikePrice + premium
    : strikePrice - premium;

  const pnlPoints = useMemo(() => {
    const prices: number[] = [];
    const pnl: number[] = [];
    const low = Math.max(1, stockPrice * 0.7);
    const high = stockPrice * 1.3;
    const step = (high - low) / 40;
    for (let p = low; p <= high; p += step) {
      prices.push(p);
      const intrinsic = optionType === 'call'
        ? Math.max(0, p - strikePrice)
        : Math.max(0, strikePrice - p);
      pnl.push(intrinsic - premium);
    }
    return { prices, pnl };
  }, [stockPrice, strikePrice, premium, optionType]);

  const pnlMin = Math.min(...pnlPoints.pnl);
  const pnlMax = Math.max(...pnlPoints.pnl);
  const pnlRange = pnlMax - pnlMin || 1;

  const svgWidth = 400;
  const svgHeight = 140;
  const pad = 8;
  const w = svgWidth - pad * 2;
  const h = svgHeight - pad * 2;

  const pnlSvg = useMemo(() => {
    const pts = pnlPoints.pnl.map((v, i) => {
      const x = pad + (i / (pnlPoints.pnl.length - 1)) * w;
      const y = pad + h - ((v - pnlMin) / pnlRange) * h;
      return `${x},${y}`;
    });
    const zeroY = pad + h - ((0 - pnlMin) / pnlRange) * h;
    return `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="${pad}" y1="${zeroY}" x2="${svgWidth - pad}" y2="${zeroY}" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4,4"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="#4d9fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }, [pnlPoints, pnlMin, pnlRange]);

  const chartPrices = useMemo(() => genPrices(stockPrice, 40, 0.02), [stockPrice]);
  const chartSvg = lineChart(chartPrices, 400, 100);

  if (user.xp < 200) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Options Trading Locked
          </div>
          <div style={{ color: 'var(--text2)', marginBottom: 16 }}>
            You need 200 XP to access Options Trading.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ padding: '4px 12px', background: 'var(--gr-dim)', color: 'var(--gr)', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {user.xp} / 200 XP
            </div>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>
              {200 - user.xp} more XP needed
            </span>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            Earn XP by completing lessons, trading, and playing the Scenario Challenge.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Calls vs. Puts</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
          Options are contracts giving you the right, but not the obligation, to buy or sell a stock at a set price (the strike) before a specific date. You pay a premium for this right.
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th style={{ color: 'var(--gr)' }}>Call Option</th>
                <th style={{ color: 'var(--red)' }}>Put Option</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Right to</td>
                <td className="up">Buy shares at strike price</td>
                <td className="dn">Sell shares at strike price</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Profit when</td>
                <td className="up">Stock price rises above strike + premium</td>
                <td className="dn">Stock price falls below strike - premium</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Market outlook</td>
                <td className="up">Bullish</td>
                <td className="dn">Bearish</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Max loss</td>
                <td>Premium paid</td>
                <td>Premium paid</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Max gain</td>
                <td className="up">Unlimited (stock keeps rising)</td>
                <td className="dn">Strike price minus premium (stock to zero)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Options Calculator</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Option Type</label>
            <select
              style={{ width: '100%' }}
              value={optionType}
              onChange={e => setOptionType(e.target.value as 'call' | 'put')}
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Stock Price ($)</label>
            <input
              type="number"
              style={{ width: '100%' }}
              value={stockPrice}
              onChange={e => setStockPrice(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Strike Price ($)</label>
            <input
              type="number"
              style={{ width: '100%' }}
              value={strikePrice}
              onChange={e => setStrikePrice(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Premium ($)</label>
            <input
              type="number"
              step="0.01"
              style={{ width: '100%' }}
              value={premium}
              onChange={e => setPremium(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Days to Expiry</label>
            <input
              type="number"
              style={{ width: '100%' }}
              value={expiry}
              onChange={e => setExpiry(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Intrinsic Value', value: `$${intrinsicValue.toFixed(2)}`, color: intrinsicValue > 0 ? 'var(--gr)' : 'var(--text3)' },
            { label: 'Time Value', value: `$${timeValue.toFixed(2)}`, color: 'var(--blue)' },
            { label: 'Breakeven Price', value: `$${breakeven.toFixed(2)}`, color: 'var(--yellow)' },
            { label: 'Contract Value', value: `$${(premium * 100).toFixed(2)}`, color: 'var(--text)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
            P&amp;L at Expiration — {optionType === 'call' ? 'Call' : 'Put'} Option
          </div>
          <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: pnlSvg }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            <span>${(stockPrice * 0.7).toFixed(0)}</span>
            <span>Stock Price at Expiration</span>
            <span>${(stockPrice * 1.3).toFixed(0)}</span>
          </div>
        </div>

        <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text2)' }}>
            <div>
              At expiry, {optionType === 'call' ? 'call' : 'put'} is{' '}
              <strong style={{ color: intrinsicValue > 0 ? 'var(--gr)' : 'var(--red)' }}>
                {intrinsicValue > 0 ? 'in-the-money (ITM)' : strikePrice === stockPrice ? 'at-the-money (ATM)' : 'out-of-the-money (OTM)'}
              </strong>
            </div>
            <div>
              Max loss: <strong style={{ color: 'var(--red)' }}>${(premium * 100).toFixed(2)}</strong> per contract ({expiry} days remaining)
            </div>
          </div>
        </div>
      </div>

      <div className="section-title">Options Strategies</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {STRATEGIES.map(strat => (
          <div key={strat.name} className="card">
            <div style={{ fontSize: 28, marginBottom: 10 }}>{strat.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{strat.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
              {strat.description}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--red)', fontWeight: 600, flexShrink: 0 }}>Risk:</span>
                <span style={{ color: 'var(--text2)' }}>{strat.risk}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--gr)', fontWeight: 600, flexShrink: 0 }}>Reward:</span>
                <span style={{ color: 'var(--text2)' }}>{strat.reward}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <span className="badge badge-blue">{strat.outlook}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

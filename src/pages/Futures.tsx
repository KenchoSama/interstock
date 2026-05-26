import { useApp } from '../state/AppContext';

const FUTURES_DATA = [
  { name: 'Crude Oil', ticker: 'CL', price: 78.42, chg: -0.87, chgPct: -1.10, unit: 'bbl', exchange: 'NYMEX' },
  { name: 'Gold', ticker: 'GC', price: 2342.60, chg: 8.30, chgPct: 0.36, unit: 'oz', exchange: 'COMEX' },
  { name: 'S&P 500', ticker: 'ES', price: 5218.75, chg: 12.25, chgPct: 0.24, unit: 'index', exchange: 'CME' },
  { name: 'Corn', ticker: 'ZC', price: 452.25, chg: -3.50, chgPct: -0.77, unit: 'bu', exchange: 'CBOT' },
  { name: 'Natural Gas', ticker: 'NG', price: 2.184, chg: 0.042, chgPct: 1.96, unit: 'MMBtu', exchange: 'NYMEX' },
];

const KEY_TERMS = [
  {
    term: 'Contango',
    definition: 'A market condition where futures prices are higher than the current spot price. Common in commodities with storage costs. The futures curve slopes upward, meaning traders expect higher prices in the future.',
    icon: '📈',
  },
  {
    term: 'Backwardation',
    definition: 'The opposite of contango — futures prices are lower than the current spot price. Often signals high immediate demand or supply disruptions. The futures curve slopes downward.',
    icon: '📉',
  },
  {
    term: 'Margin',
    definition: 'The good-faith deposit required to open a futures position. Much smaller than the full contract value — typically 3–10%. This creates significant leverage but also amplifies both gains and losses.',
    icon: '💵',
  },
  {
    term: 'Leverage',
    definition: 'Futures allow control of large contract values with a small margin deposit. A $10,000 margin deposit might control $150,000 in crude oil. A 5% price move could double your money — or wipe out your account.',
    icon: '⚡',
  },
  {
    term: 'Settlement',
    definition: 'At expiration, futures contracts are settled either physically (actual delivery of the commodity) or in cash. Most financial futures (like S&P 500) settle in cash; most commodity futures settle physically.',
    icon: '📋',
  },
  {
    term: 'Roll Over',
    definition: 'Closing an expiring futures position and opening an equivalent position in a later-dated contract. Traders who want ongoing exposure must roll before expiration to avoid physical delivery.',
    icon: '🔄',
  },
];

const HEDGING_EXAMPLES = [
  {
    title: 'Corn Farmer',
    icon: '🌽',
    scenario: 'Planting Season Hedge',
    description: 'A corn farmer plants 100,000 bushels in spring and worries corn prices will fall by harvest time in fall. To lock in current prices, the farmer sells (shorts) corn futures contracts at $4.50/bushel. If prices fall to $3.80 at harvest, the farmer earns a profit on the futures position that offsets the lower cash price — effectively locking in $4.50/bushel regardless of market moves.',
    benefit: 'Price certainty for planning and operations',
    risk: 'Misses out if corn prices rise significantly',
  },
  {
    title: 'Airline Company',
    icon: '✈️',
    scenario: 'Fuel Cost Hedge',
    description: 'An airline knows it will need 10 million gallons of jet fuel over the next 6 months. Worried about rising oil prices, the airline buys (longs) crude oil futures to lock in today\'s price of $78/barrel. If oil rises to $95, the gain on futures contracts offsets the higher fuel costs. This is why airlines report "hedging gains" during oil price spikes.',
    benefit: 'Predictable operating costs, easier financial planning',
    risk: 'If oil falls, the airline pays more than market price',
  },
  {
    title: 'Investment Fund',
    icon: '🏦',
    scenario: 'Portfolio Hedge (S&P 500)',
    description: 'A fund manager holds $50 million in US stocks and fears a short-term market downturn ahead of an uncertain economic report. Rather than selling all positions (costly in fees and taxes), the manager shorts S&P 500 futures. If the market falls 5%, the futures gain offsets portfolio losses. This is called a "macro hedge" — protecting against broad market risk.',
    benefit: 'Downside protection without liquidating positions',
    risk: 'Reduces upside if market rallies instead',
  },
];

export default function Futures() {
  const { state } = useApp();
  const user = state.u[state.role];

  if (user.xp < 500) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Futures Trading Locked
          </div>
          <div style={{ color: 'var(--text2)', marginBottom: 16 }}>
            You need 500 XP to access Futures Trading.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ padding: '4px 12px', background: 'var(--gr-dim)', color: 'var(--gr)', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {user.xp} / 500 XP
            </div>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>
              {500 - user.xp} more XP needed
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
        <div className="section-title">What Are Futures?</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
          A futures contract is a legal agreement to buy or sell a specific commodity or financial asset at a predetermined price at a specified time in the future. Both parties are obligated to fulfill the contract — unlike options, where the buyer has a choice.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '📦', label: 'Standardized', desc: 'Each contract specifies exact quantity, quality, and delivery terms set by the exchange.' },
            { icon: '🔄', label: 'Two-Sided', desc: 'Every futures buyer (long) is matched with a seller (short). One profits while the other loses.' },
            { icon: '🏛️', label: 'Exchange-Traded', desc: 'Traded on regulated exchanges like CME, NYMEX, and CBOT with central clearing for safety.' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Key Terms</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {KEY_TERMS.map(item => (
            <div key={item.term} style={{ display: 'flex', gap: 12, padding: '14px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gr)', marginBottom: 4 }}>{item.term}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{item.definition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Commodity Futures Overview</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          These are simulated placeholder prices for educational purposes.
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Ticker</th>
                <th>Exchange</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Day Change</th>
              </tr>
            </thead>
            <tbody>
              {FUTURES_DATA.map(f => (
                <tr key={f.ticker}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                      {f.ticker}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{f.exchange}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>/{f.unit}</td>
                  <td style={{ fontWeight: 700 }}>
                    ${f.price.toLocaleString('en-US', { minimumFractionDigits: f.price < 10 ? 3 : 2, maximumFractionDigits: f.price < 10 ? 3 : 2 })}
                  </td>
                  <td>
                    <div className={f.chg >= 0 ? 'up' : 'dn'} style={{ fontWeight: 600 }}>
                      {f.chg >= 0 ? '+' : ''}{f.chg.toFixed(f.price < 10 ? 3 : 2)}
                    </div>
                    <div className={f.chgPct >= 0 ? 'up' : 'dn'} style={{ fontSize: 11 }}>
                      {f.chgPct >= 0 ? '+' : ''}{f.chgPct.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--blue-dim)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--blue)' }}>
          Note: Prices shown are simulated for educational purposes. Real futures prices update continuously during market hours.
        </div>
      </div>

      <div className="section-title">Hedging Examples</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {HEDGING_EXAMPLES.map(ex => (
          <div key={ex.title} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{ex.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{ex.title}</div>
                <span className="badge badge-blue" style={{ marginTop: 4 }}>{ex.scenario}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              {ex.description}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 14px', background: 'var(--gr-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,212,168,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gr)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Benefit
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{ex.benefit}</div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--red-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,77,109,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Trade-off
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{ex.risk}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../state/AppContext';

const STEPS = [
  {
    icon: '💰',
    title: 'Your Cash Balance',
    body: "Every student starts with $10,000 in virtual cash. You'll see your balance on the Dashboard and Portfolio pages — it's what you have available to invest.",
  },
  {
    icon: '🔍',
    title: 'Search a Stock',
    body: 'Use the search box on Stock Analysis (or Portfolio, Options, Futures) to look up any ticker and see its live price and chart.',
  },
  {
    icon: '📈',
    title: 'Place Your First Order',
    body: "Head to Portfolio, search a stock, choose Buy or Sell, set a quantity (or dollar amount), and place the trade. It's all simulated — no real money moves.",
  },
  {
    icon: '⚡',
    title: 'Check Your XP',
    body: 'Trading, completing lessons, and other activity earns XP, shown at the top of every page. XP levels you up and unlocks new features like Options and Futures.',
  },
];

function storageKey(userId: string) {
  return `onboarding_tour_seen_${userId}`;
}

export default function OnboardingTour() {
  const { state } = useApp();
  const user = state.u[state.role];
  const userId = user.supabaseId;

  const [dismissed, setDismissed] = useState(() => {
    if (!userId) return true;
    try {
      return localStorage.getItem(storageKey(userId)) === 'true';
    } catch {
      return true;
    }
  });
  const [step, setStep] = useState(0);

  if (dismissed || !userId) return null;

  function finish() {
    try {
      localStorage.setItem(storageKey(userId!), 'true');
    } catch { /* ignore */ }
    setDismissed(true);
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{current.icon}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{current.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>{current.body}</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === step ? 'var(--gr)' : 'var(--border)',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={finish}>Skip</button>
          <button
            className="btn btn-primary"
            style={{ background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: '#000', fontWeight: 700 }}
            onClick={() => (isLast ? finish() : setStep(s => s + 1))}
          >
            {isLast ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

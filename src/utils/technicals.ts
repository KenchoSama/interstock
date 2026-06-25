import type { Candle } from '../hooks/useStockCandles';

export function sma(candles: Candle[], period: number): number | null {
  const closes = candles.map(c => c.close);
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function rsi(candles: Candle[], period = 14): number | null {
  const closes = candles.map(c => c.close);
  if (closes.length < period + 1) return null;

  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? -c : 0));

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - 100 / (1 + rs));
}

export function supportResistance(candles: Candle[], lookback = 20): {
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
} {
  const recent = candles.slice(-lookback);
  const highs = recent.map(c => c.high).sort((a, b) => b - a);
  const lows  = recent.map(c => c.low).sort((a, b) => a - b);

  return {
    resistance1: highs[Math.floor(highs.length * 0.1)] ?? highs[0],
    resistance2: highs[Math.floor(highs.length * 0.05)] ?? highs[0],
    support1:    lows[Math.floor(lows.length * 0.1)] ?? lows[0],
    support2:    lows[Math.floor(lows.length * 0.05)] ?? lows[0],
  };
}

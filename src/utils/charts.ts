export function genPrices(base: number, count = 60, volatility = 0.02): number[] {
  const prices: number[] = [base];
  for (let i = 1; i < count; i++) {
    const change = prices[i - 1] * (Math.random() * volatility * 2 - volatility);
    prices.push(Math.max(prices[i - 1] + change, 1));
  }
  return prices;
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export function genCandles(base: number, count = 30, volatility = 0.025): Candle[] {
  const candles: Candle[] = [];
  let prev = base;
  for (let i = 0; i < count; i++) {
    const open = prev;
    const move = prev * (Math.random() * volatility * 2 - volatility);
    const close = Math.max(prev + move, 1);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    candles.push({ open, high, low, close });
    prev = close;
  }
  return candles;
}

export function lineChart(
  prices: number[],
  width = 400,
  height = 120,
  color = '#00d4a8',
): string {
  if (prices.length < 2) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * w;
    const y = pad + h - ((p - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = pts.join(' ');
  const firstPt = pts[0].split(',');
  const lastPt = pts[pts.length - 1].split(',');

  const area = `M${firstPt[0]},${height} L${polyline} L${lastPt[0]},${height} Z`;

  const isUp = prices[prices.length - 1] >= prices[0];
  const lineColor = isUp ? '#00d4a8' : '#ff4d6d';
  const fillColor = isUp ? 'rgba(0,212,168,0.08)' : 'rgba(255,77,109,0.08)';

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="${area}" fill="url(#lg)" />
  <polyline points="${polyline}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;
}

export function donutChart(
  segments: { label: string; value: number; color: string }[],
  size = 120,
): string {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return '';

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const inner = size * 0.24;

  let startAngle = -Math.PI / 2;
  const paths: string[] = [];

  for (const seg of segments) {
    const slice = (seg.value / total) * Math.PI * 2;
    const endAngle = startAngle + slice;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + inner * Math.cos(endAngle);
    const iy1 = cy + inner * Math.sin(endAngle);
    const ix2 = cx + inner * Math.cos(startAngle);
    const iy2 = cy + inner * Math.sin(startAngle);

    const large = slice > Math.PI ? 1 : 0;
    const d = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix1},${iy1} A${inner},${inner} 0 ${large},0 ${ix2},${iy2} Z`;
    paths.push(`<path d="${d}" fill="${seg.color}" />`);

    startAngle = endAngle;
  }

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${paths.join('')}</svg>`;
}

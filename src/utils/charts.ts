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

export function bucketSnapshotsToCandles(
  snapshots: { total_value: number | string; recorded_at: string }[],
  bucketBy: '15min' | 'hour' | 'day'
): { candles: Candle[]; dates: string[] } {
  const buckets = new Map<string, number[]>();

  for (const s of snapshots) {
    const d = new Date(s.recorded_at);
    let key: string;
    if (bucketBy === '15min') {
      const quarterMinute = Math.floor(d.getMinutes() / 15) * 15;
      key = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), quarterMinute).toISOString();
    } else if (bucketBy === 'hour') {
      key = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).toISOString();
    } else {
      key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    }

    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(Number(s.total_value));
  }

  const candles: Candle[] = [];
  const dates: string[] = [];

  for (const [key, values] of buckets) {
    candles.push({
      open: values[0],
      close: values[values.length - 1],
      high: Math.max(...values),
      low: Math.min(...values),
    });
    dates.push(key);
  }

  return { candles, dates };
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

export function candleChart(
  candles: Candle[],
  width = 540,
  height = 160,
): string {
  if (candles.length === 0) return '';
  const pad = { top: 8, bottom: 8, left: 4, right: 4 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const allLows  = candles.map(c => c.low);
  const allHighs = candles.map(c => c.high);
  const min = Math.min(...allLows);
  const max = Math.max(...allHighs);
  const range = max - min || 1;

  const n = candles.length;
  const slotW = w / n;
  const bodyW = Math.max(2, slotW * 0.55);

  const toY = (v: number) => pad.top + h - ((v - min) / range) * h;

  const rects: string[] = [];
  const wicks: string[] = [];

  candles.forEach((c, i) => {
    const x = pad.left + i * slotW + slotW / 2;
    const isUp = c.close >= c.open;
    const color = isUp ? '#00d4a8' : '#ff4d6d';

    const bodyTop    = toY(Math.max(c.open, c.close));
    const bodyBottom = toY(Math.min(c.open, c.close));
    const bodyH      = Math.max(1, bodyBottom - bodyTop);

    wicks.push(
      `<line x1="${x}" y1="${toY(c.high)}" x2="${x}" y2="${toY(c.low)}" stroke="${color}" stroke-width="1.2"/>`
    );
    rects.push(
      `<rect x="${(x - bodyW / 2).toFixed(1)}" y="${bodyTop.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${bodyH.toFixed(1)}" fill="${color}" rx="1"/>`
    );
  });

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${wicks.join('\n  ')}
  ${rects.join('\n  ')}
</svg>`;
}

function businessDaysBetween(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function alignDailySnapshots(
  snapshots: { total_value: number | string; recorded_at: string }[],
  fromDate: Date,
  toDate: Date
): { values: (number | null)[]; dates: string[] } {
  const days = businessDaysBetween(fromDate, toDate);

  const byDay = new Map<string, number>();
  for (const s of snapshots) {
    const d = new Date(s.recorded_at);
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    byDay.set(key, Number(s.total_value));
  }

  const values: (number | null)[] = [];
  const dates: string[] = [];
  for (const day of days) {
    const key = day.toISOString();
    values.push(byDay.has(key) ? byDay.get(key)! : null);
    dates.push(key);
  }
  return { values, dates };
}

export interface ComparisonOverlay {
  values: number[]; // raw series (e.g. index closing prices), any scale
  color: string;
}

// Plots a primary series (e.g. portfolio value, may contain leading nulls for
// days without a snapshot) as a % change line from its first real value,
// alongside 0+ overlay series each normalized to their own % change from
// their first value — so a portfolio and one or more market indexes can be
// compared on a shared percentage axis regardless of their native scale.
export function comparisonChart(
  primary: (number | null)[],
  overlays: ComparisonOverlay[],
  width = 580,
  height = 160,
): string {
  const firstRealIdx = primary.findIndex(v => v !== null && v !== undefined);
  if (firstRealIdx === -1) return '';

  const baseline = primary[firstRealIdx] as number;
  const primaryPct = primary.map(v => (v === null || v === undefined ? null : ((v - baseline) / baseline) * 100));
  const n = primaryPct.length;

  const resample = (vals: number[], count: number): number[] => {
    if (vals.length === 0 || count <= 1) return vals.length ? [vals[0]] : [];
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      const srcIdx = Math.min(vals.length - 1, Math.round((i / (count - 1)) * (vals.length - 1)));
      out.push(vals[srcIdx]);
    }
    return out;
  };

  const overlayPct = overlays
    .filter(o => o.values.length > 0)
    .map(o => {
      const resampled = resample(o.values, n);
      const base = resampled[0];
      return { color: o.color, pct: base ? resampled.map(v => ((v - base) / base) * 100) : resampled.map(() => 0) };
    });

  const primaryReal = primaryPct.filter((v): v is number => v !== null);
  const allValues = [0, ...primaryReal, ...overlayPct.flatMap(o => o.pct)];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const xAt = (i: number) => pad + (n <= 1 ? 0 : (i / (n - 1)) * w);
  const yAt = (v: number) => pad + h - ((v - min) / range) * h;
  const zeroY = yAt(0);

  const isUp = primaryReal.length > 0 && primaryReal[primaryReal.length - 1] >= primaryReal[0];
  const primaryColor = isUp ? '#00d4a8' : '#ff4d6d';

  const parts: string[] = [
    `<line x1="${pad}" y1="${zeroY}" x2="${pad + w}" y2="${zeroY}" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="4,4"/>`,
  ];

  if (firstRealIdx > 0) {
    const dashY = yAt(primaryPct[firstRealIdx] as number);
    parts.push(
      `<line x1="${xAt(0)}" y1="${dashY}" x2="${xAt(firstRealIdx)}" y2="${dashY}" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="5 4"/>`
    );
  }

  const realPts: string[] = [];
  for (let i = firstRealIdx; i < n; i++) {
    const v = primaryPct[i];
    if (v === null) continue;
    realPts.push(`${xAt(i)},${yAt(v)}`);
  }
  const polyline = realPts.join(' ');
  const firstPt = realPts[0]?.split(',');
  const lastPt = realPts[realPts.length - 1]?.split(',');
  const area = firstPt && lastPt ? `M${firstPt[0]},${zeroY} L${polyline} L${lastPt[0]},${zeroY} Z` : '';

  const overlayLines = overlayPct
    .map(o => {
      const pts = o.pct.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="${o.color}" stroke-width="1.75" stroke-dasharray="5,3" stroke-linejoin="round" stroke-linecap="round"/>`;
    })
    .join('\n  ');

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lgc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${parts.join('\n  ')}
  ${area ? `<path d="${area}" fill="url(#lgc)" />` : ''}
  <polyline points="${polyline}" fill="none" stroke="${primaryColor}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>
  ${overlayLines}
</svg>`;
}

export function lineChartWithPlaceholder(
  series: (number | null)[],
  width = 400,
  height = 120,
  color?: string,
): string {
  if (series.length === 0) return '';

  const realValues = series.filter((v): v is number => v !== null);

  // No real data anywhere yet — full dashed placeholder
  if (realValues.length === 0) {
    const pad = 8;
    const w = width - pad * 2;
    const midY = height / 2;
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="${pad}" y1="${midY}" x2="${pad + w}" y2="${midY}" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="5 4"/>
</svg>`;
  }

  const firstRealIdx = series.findIndex(v => v !== null);
  const min = Math.min(...realValues);
  const max = Math.max(...realValues);
  const range = max - min || 1;
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const n = series.length;

  const xAt = (i: number) => pad + (n === 1 ? 0 : (i / (n - 1)) * w);
  const yAt = (v: number) => pad + h - ((v - min) / range) * h;

  const firstRealValue = series[firstRealIdx] as number;
  const isUp = realValues[realValues.length - 1] >= realValues[0];
  const lineColor = color ?? (isUp ? '#00d4a8' : '#ff4d6d');

  const parts: string[] = [];

  // Dashed placeholder for the stretch before real data begins
  if (firstRealIdx > 0) {
    const dashY = yAt(firstRealValue);
    parts.push(
      `<line x1="${xAt(0)}" y1="${dashY}" x2="${xAt(firstRealIdx)}" y2="${dashY}" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="5 4"/>`
    );
  }

  // Solid real segment
  const realPts: string[] = [];
  for (let i = firstRealIdx; i < n; i++) {
    const v = series[i];
    if (v === null) continue;
    realPts.push(`${xAt(i)},${yAt(v)}`);
  }
  const polyline = realPts.join(' ');
  const firstPt = realPts[0].split(',');
  const lastPt = realPts[realPts.length - 1].split(',');
  const area = `M${firstPt[0]},${height} L${polyline} L${lastPt[0]},${height} Z`;

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lgp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${parts.join('\n  ')}
  <path d="${area}" fill="url(#lgp)" />
  <polyline points="${polyline}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;
}

export function lineChart(
  prices: number[],
  width = 400,
  height = 120,
  color?: string,
): string {
  if (prices.length < 2) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const pad = 8;

  // Flat line (no portfolio value) — draw a centered dashed rule
  if (range === 0) {
    const w = width - pad * 2;
    const midY = height / 2;
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="${pad}" y1="${midY}" x2="${pad + w}" y2="${midY}" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="5 4"/>
</svg>`;
  }
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
  const lineColor = color ?? (isUp ? '#00d4a8' : '#ff4d6d');
  const fillColor = color ? 'rgba(0,230,118,0.08)' : (isUp ? 'rgba(0,212,168,0.08)' : 'rgba(255,77,109,0.08)');

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
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

export function dualLineChart(
  points1: number[],
  points2: number[],
  w = 520, h = 160,
  color1 = '#00d4a8',
  color2 = 'rgba(255,255,255,0.25)'
): string {
  if (points1.length < 2 && points2.length < 2) return '';

  const norm = (pts: number[]) => {
    const base = pts[0];
    return pts.map(p => (p / base) * 100);
  };

  const n1 = norm(points1.filter(Boolean));
  const n2 = norm(points2.filter(Boolean));

  const allVals = [...n1, ...n2];
  const minV = Math.min(...allVals) * 0.998;
  const maxV = Math.max(...allVals) * 1.002;
  const range = maxV - minV || 1;

  const pad = 8;
  const W = w - pad * 2;
  const H = h - pad * 2;

  const toPath = (pts: number[]) =>
    pts.map((v, i) => {
      const x = pad + (i / (pts.length - 1)) * W;
      const y = pad + H - ((v - minV) / range) * H;
      return `${x},${y}`;
    }).join(' ');

  const p1 = toPath(n1);
  const p2 = toPath(n2);

  const firstX = pad;
  const lastX  = pad + W;
  const baseY  = pad + H;

  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="etfGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color1}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${color1}" stop-opacity="0.01"/>
      </linearGradient>
    </defs>
    <polygon points="${firstX},${baseY} ${p1} ${lastX},${baseY}" fill="url(#etfGrad)"/>
    <polyline points="${p2}" fill="none" stroke="${color2}" stroke-width="1.5" stroke-dasharray="4,3" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="${p1}" fill="none" stroke="${color1}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
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
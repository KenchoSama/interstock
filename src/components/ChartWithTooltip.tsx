import { useRef, useState } from 'react';
import type { Candle } from '../utils/charts';

interface Props {
  chartSvg: string;
  chartPoints: (number | null)[];
  flatLine?: boolean;
  totalValue?: number;
  dates?: string[];
  mode?: 'line' | 'candle';
  candles?: Candle[];
}

export default function ChartWithTooltip({ chartSvg, chartPoints, dates, mode = 'line', candles = [] }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; index: number } | null>(null);

  const itemCount = mode === 'candle' ? candles.length : chartPoints.length;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || itemCount === 0) return;

    const relX = e.clientX - rect.left;
    const pct = relX / rect.width;
    const index = Math.round(pct * (itemCount - 1));
    const clamped = Math.max(0, Math.min(itemCount - 1, index));

    setTooltip({ x: relX, y: e.clientY - rect.top, index: clamped });
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  const startValue = 10000;
  const tooltipValue = tooltip && mode === 'line' ? chartPoints[tooltip.index] : undefined;
  const hasPlaceholderValue = tooltipValue === null;
  const tooltipReturn =
    tooltipValue !== undefined && tooltipValue !== null ? ((tooltipValue - startValue) / startValue) * 100 : 0;
  const tooltipPositive = tooltipReturn >= 0;

  const tooltipCandle = tooltip && mode === 'candle' ? candles[tooltip.index] : undefined;
  const candleUp = tooltipCandle ? tooltipCandle.close >= tooltipCandle.open : false;
  const candleChangePct = tooltipCandle
    ? ((tooltipCandle.close - tooltipCandle.open) / tooltipCandle.open) * 100
    : 0;

  const tooltipDateStr = tooltip ? dates?.[tooltip.index] : undefined;
  const tooltipDate = tooltipDateStr
    ? new Date(tooltipDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const tooltipTime = tooltipDateStr
    ? new Date(tooltipDateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Chart SVG */}
      <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: chartSvg }} />

      {/* Vertical crosshair line */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: tooltip.x,
          width: 1,
          height: '100%',
          background: 'var(--text3)',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />
      )}

      {/* Tooltip box */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: tooltip.x > 300 ? tooltip.x - 140 : tooltip.x + 12,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 12px',
          pointerEvents: 'none',
          minWidth: 130,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}>
          {mode === 'candle' && tooltipCandle ? (
            <>
              <div style={{ fontSize: 12, color: candleUp ? 'var(--gr)' : 'var(--red)', fontWeight: 700, marginBottom: 4 }}>
                {candleUp ? '+' : ''}{candleChangePct.toFixed(2)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span>Open: ${tooltipCandle.open.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>High: ${tooltipCandle.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>Low: ${tooltipCandle.low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>Close: ${tooltipCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : hasPlaceholderValue ? (
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              No data recorded yet
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                ${(tooltipValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 12, color: tooltipPositive ? 'var(--gr)' : 'var(--red)', marginTop: 2 }}>
                {tooltipPositive ? '+' : ''}{tooltipReturn.toFixed(2)}%
              </div>
            </>
          )}
          {(tooltipDate || tooltipTime) && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              {tooltipDate && <div>{tooltipDate}</div>}
              {tooltipTime && <div>{tooltipTime}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

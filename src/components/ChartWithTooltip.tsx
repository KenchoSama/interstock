import { useRef, useState } from 'react';

interface Props {
  chartSvg: string;
  chartPoints: number[];
  flatLine: boolean;
  totalValue: number;
  dates?: string[];
}

export default function ChartWithTooltip({ chartSvg, chartPoints, flatLine, totalValue, dates }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; index: number } | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = e.clientX - rect.left;
    const pct = relX / rect.width;
    const index = Math.round(pct * (chartPoints.length - 1));
    const clamped = Math.max(0, Math.min(chartPoints.length - 1, index));
    const value = chartPoints[clamped];

    setTooltip({ x: relX, y: e.clientY - rect.top, value, index: clamped });
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  const startValue = 10000;
  const tooltipReturn = tooltip ? ((tooltip.value - startValue) / startValue) * 100 : 0;
  const tooltipPositive = tooltipReturn >= 0;

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
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            ${tooltip.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: tooltipPositive ? 'var(--gr)' : 'var(--red)', marginTop: 2 }}>
            {tooltipPositive ? '+' : ''}{tooltipReturn.toFixed(2)}%
          </div>
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

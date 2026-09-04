// Top 10 US companies by market capitalization, used for the topbar's
// rotating stock carousel (kept separate from `STOCKS` in stocks.ts, which
// stays a small curated set used for actual trading/lookups elsewhere in the
// app). Curated, not fetched live — Yahoo Finance's market-cap-bearing quote
// endpoint requires auth we don't have (only the chart/price endpoint this
// app already uses is open), so rankings will drift out of date over time
// and should be spot-checked/refreshed periodically rather than assumed
// exact.
export const TOP_TICKERS: string[] = [
  'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AVGO', 'TSLA', 'BRK.B', 'LLY',
];

// Yahoo Finance uses hyphens instead of dots for share-class tickers.
export function toYahooSymbol(sym: string): string {
  return sym.replace('.', '-');
}

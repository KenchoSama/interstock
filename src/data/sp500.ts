// Top ~50 US companies by market capitalization, used for the topbar's
// rotating stock carousel (kept separate from `STOCKS` in stocks.ts, which
// stays a small curated set used for actual trading/lookups elsewhere in the
// app). Curated, not fetched live — Yahoo Finance's market-cap-bearing quote
// endpoint requires auth we don't have (only the chart/price endpoint this
// app already uses is open), so rankings will drift out of date over time
// and should be spot-checked/refreshed periodically rather than assumed
// exact.
export const TOP_TICKERS: string[] = [
  'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AVGO', 'TSLA', 'BRK.B', 'LLY',
  'WMT', 'JPM', 'V', 'MA', 'ORCL', 'NFLX', 'XOM', 'COST', 'PG', 'JNJ',
  'HD', 'ABBV', 'BAC', 'PLTR', 'CVX', 'KO', 'AMD', 'CSCO', 'WFC', 'MCD',
  'IBM', 'UNH', 'CRM', 'TMUS', 'PM', 'GE', 'MRK', 'ABT', 'LIN', 'INTU',
  'TXN', 'QCOM', 'DIS', 'VZ', 'AXP', 'MS', 'GS', 'PEP', 'NOW', 'ADBE',
];

// Yahoo Finance uses hyphens instead of dots for share-class tickers.
export function toYahooSymbol(sym: string): string {
  return sym.replace('.', '-');
}

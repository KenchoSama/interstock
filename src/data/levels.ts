import type { GameLevel } from '../types';

export const PASS_THRESHOLD = 67; // %

export function calcStars(pct: number): number {
  if (pct === 100) return 3;
  if (pct >= 67)   return 2;
  if (pct >= 50)   return 1;
  return 0;
}

export const LEVEL_GAME: GameLevel[] = [
  {
    id: 1,
    name: 'Market Basics',
    description: 'Master the fundamentals of stocks and markets',
    icon: '📊', type: 'normal', difficulty: 'easy',
    xpReward: 100,
    questions: [
      {
        text: 'What does NYSE stand for?',
        options: ['New York Stock Exchange', 'National Youth Securities Exchange', 'New York Securities Exchange', 'National York Stock Exchange'],
        answer: 0,
      },
      {
        text: 'A "bull market" describes:',
        options: ['A market where prices are falling', 'A market where prices are rising', 'A market that only trades commodities', 'A market with no volatility'],
        answer: 1,
      },
      {
        text: 'What does "IPO" stand for?',
        options: ['International Purchase Order', 'Initial Public Offering', 'Investor Portfolio Optimization', 'Income Per Operation'],
        answer: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Reading the Tape',
    description: 'Learn to interpret stock quotes and market data',
    icon: '📈', type: 'normal', difficulty: 'easy',
    xpReward: 150,
    questions: [
      {
        text: 'The "bid" price is:',
        options: ['The price sellers want', 'The highest price a buyer is willing to pay', 'The last trade price', 'The daily high price'],
        answer: 1,
      },
      {
        text: 'Market capitalization is calculated as:',
        options: ['Share price + shares outstanding', 'Share price × shares outstanding', 'Annual revenue × profit margin', 'Total assets − total liabilities'],
        answer: 1,
      },
      {
        text: 'A stock\'s 52-week high is:',
        options: ['The average price over 52 weeks', 'The highest price in the past year', 'The price 52 weeks ago', 'The target price set by analysts'],
        answer: 1,
      },
    ],
  },
  {
    id: 3,
    name: 'Fundamental Analysis',
    description: 'Evaluate companies using financial metrics',
    icon: '🔍', type: 'normal', difficulty: 'medium',
    xpReward: 200,
    questions: [
      {
        text: 'A lower P/E ratio generally suggests:',
        options: ['The stock is more expensive relative to earnings', 'The stock may be undervalued relative to earnings', 'The company has no profits', 'The dividend yield is low'],
        answer: 1,
      },
      {
        text: 'EPS stands for:',
        options: ['Equity Per Share', 'Earnings Per Share', 'Exchange Price Signal', 'Economic Price Standard'],
        answer: 1,
      },
      {
        text: 'A company with a debt-to-equity ratio of 0.2 is:',
        options: ['Highly leveraged', 'Conservatively financed with little debt', 'In financial distress', 'About to go public'],
        answer: 1,
      },
    ],
  },
  {
    id: 4,
    name: 'Technical Analysis',
    description: 'Read charts and identify patterns',
    icon: '📉', type: 'normal', difficulty: 'medium',
    xpReward: 250,
    questions: [
      {
        text: 'Support levels in a stock chart represent:',
        options: ['Price levels where selling pressure historically increases', 'Price levels where buying interest has historically prevented further declines', 'The average daily volume', 'The dividend payment dates'],
        answer: 1,
      },
      {
        text: 'A moving average crossover (50-day crossing above 200-day) is called:',
        options: ['Death cross', 'Golden cross — a bullish signal', 'Resistance break', 'Volume surge'],
        answer: 1,
      },
      {
        text: 'RSI above 70 typically indicates:',
        options: ['The stock is oversold', 'The stock may be overbought', 'Strong institutional buying', 'A dividend announcement'],
        answer: 1,
      },
    ],
  },
  {
    id: 5,
    name: 'Risk & Diversification',
    description: 'Manage portfolio risk like a pro',
    icon: '🛡️', type: 'normal', difficulty: 'medium',
    xpReward: 300,
    questions: [
      {
        text: 'Systematic risk is:',
        options: ['Risk specific to one company', 'Market-wide risk that cannot be diversified away', 'Risk from poor management', 'Cryptocurrency risk'],
        answer: 1,
      },
      {
        text: 'Diversification primarily helps reduce:',
        options: ['Systematic risk', 'Unsystematic (company-specific) risk', 'Inflation risk', 'Liquidity risk'],
        answer: 1,
      },
      {
        text: 'The Sharpe ratio measures:',
        options: ['Total portfolio return', 'Risk-adjusted return (return per unit of risk)', 'Dividend yield vs. bond yield', 'Stock price momentum'],
        answer: 1,
      },
    ],
  },
  {
    id: 6,
    name: 'Options Basics',
    description: 'Understand calls, puts, and derivatives',
    icon: '📋', type: 'boss', difficulty: 'hard',
    xpReward: 400,
    questions: [
      {
        text: 'Buying a put option gives you the right to:',
        options: ['Buy shares at the strike price', 'Sell shares at the strike price', 'Receive dividends', 'Vote on company decisions'],
        answer: 1,
      },
      {
        text: 'Options "expire worthless" when:',
        options: ['The company declares bankruptcy', 'They are out of the money at expiration', 'You sell them early', 'Interest rates rise'],
        answer: 1,
      },
      {
        text: 'Implied volatility (IV) in options pricing represents:',
        options: ['Historical price fluctuation', 'The market\'s expectation of future price movement', 'The option\'s intrinsic value', 'The risk-free interest rate'],
        answer: 1,
      },
    ],
  },
  {
    id: 7,
    name: 'Portfolio Management',
    description: 'Build and rebalance like a fund manager',
    icon: '💼', type: 'advanced', difficulty: 'hard',
    xpReward: 500,
    questions: [
      {
        text: 'Asset allocation refers to:',
        options: ['Picking individual stocks', 'Distributing investments across asset classes (stocks, bonds, cash)', 'Timing the market', 'Maximizing dividend income'],
        answer: 1,
      },
      {
        text: 'Rebalancing a portfolio means:',
        options: ['Selling all positions and starting over', 'Restoring target allocations after market movements shift them', 'Adding new money every month', 'Changing brokers'],
        answer: 1,
      },
      {
        text: 'A 60/40 portfolio contains:',
        options: ['60% bonds, 40% cash', '60% stocks, 40% bonds', '60% US stocks, 40% international', '60% growth, 40% value stocks'],
        answer: 1,
      },
    ],
  },
  {
    id: 8,
    name: 'Futures & Commodities',
    description: 'Explore futures contracts and commodity markets',
    icon: '⚡', type: 'advanced', difficulty: 'hard',
    xpReward: 600,
    questions: [
      {
        text: 'A futures contract obligates the buyer to:',
        options: ['Sell an asset at a future date', 'Buy an asset at a predetermined price on a future date', 'Pay dividends quarterly', 'Maintain a margin account only'],
        answer: 1,
      },
      {
        text: 'Contango in futures markets means:',
        options: ['Futures prices are below the spot price', 'Futures prices are above the current spot price', 'The market is in a bull trend', 'Commodity prices are falling'],
        answer: 1,
      },
      {
        text: 'Hedging with futures is primarily used to:',
        options: ['Maximize speculative profits', 'Reduce or eliminate price risk for the underlying asset', 'Increase leverage in a portfolio', 'Avoid paying taxes on gains'],
        answer: 1,
      },
    ],
  },
  {
    id: 9,
    name: 'Macro & Economics',
    description: 'Connect global economics to market movements',
    icon: '🌍', type: 'boss', difficulty: 'hard',
    xpReward: 750,
    questions: [
      {
        text: 'Quantitative easing (QE) involves the Fed:',
        options: ['Raising the federal funds rate', 'Buying securities to inject money into the economy', 'Reducing government spending', 'Tightening bank lending standards'],
        answer: 1,
      },
      {
        text: 'GDP growth above 3% typically signals:',
        options: ['Recession risk', 'A healthy, expanding economy', 'Deflation', 'Currency devaluation'],
        answer: 1,
      },
      {
        text: 'Which sector typically outperforms during recessions?',
        options: ['Technology', 'Consumer Discretionary', 'Consumer Staples — defensive sector with stable demand', 'Energy'],
        answer: 2,
      },
    ],
  },
  {
    id: 10,
    name: 'Wall Street Pro',
    description: 'Advanced strategies used by institutional investors',
    icon: '🏆', type: 'boss', difficulty: 'expert',
    xpReward: 1000,
    questions: [
      {
        text: 'What is a leveraged buyout (LBO)?',
        options: ['Buying stocks on margin', 'Acquiring a company primarily using borrowed funds, using the target\'s assets as collateral', 'A government bailout of a failing bank', 'A company buying back its own shares'],
        answer: 1,
      },
      {
        text: 'Value at Risk (VaR) measures:',
        options: ['The maximum possible gain in a portfolio', 'The potential loss in a portfolio over a time period at a given confidence level', 'The average return over 10 years', 'Beta multiplied by portfolio size'],
        answer: 1,
      },
      {
        text: 'An activist investor typically:',
        options: ['Passively tracks an index', 'Takes a large stake in a company to push for strategic or operational changes', 'Only invests in government bonds', 'Short-sells entire sectors'],
        answer: 1,
      },
    ],
  },
];

export const XP_REQ: Record<string, number> = {
  fundamentals: 100,
  options: 200,
  futures: 500,
  game: 0,
  diplomas: 1200,
  etf: 1500,
  assignments: 1000,
  compete: 2000,
  leaderboard: 2500,
  'field-trips': 3000,
  interns: 2500,
  achievements: 0,
  profile: 0,
  ai: 0,
  help: 0,
};

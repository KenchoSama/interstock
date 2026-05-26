import { useState } from 'react';
import { useApp } from '../state/AppContext';

interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  xpReward: number;
  content: string;
}

const LESSONS: Lesson[] = [
  { id: 'l1', title: 'How the Stock Market Works', category: 'Basics', duration: '8 min', xpReward: 25, content: 'The stock market is a marketplace where buyers and sellers trade shares of publicly listed companies. When a company wants to raise money, it sells ownership stakes called shares through an Initial Public Offering (IPO). Investors buy these shares hoping the company grows in value over time.\n\nThe two major US exchanges are the NYSE (New York Stock Exchange) and NASDAQ. Prices change constantly based on supply and demand — when more people want to buy a stock than sell it, the price rises.\n\nMarket hours are 9:30 AM to 4:00 PM Eastern Time, Monday through Friday. Pre-market and after-hours trading also exists but with lower liquidity.\n\nKey players: retail investors (individuals), institutional investors (hedge funds, mutual funds), market makers (provide liquidity), and regulators like the SEC who enforce rules.' },
  { id: 'l2', title: 'Reading a Stock Quote', category: 'Basics', duration: '6 min', xpReward: 20, content: 'A stock quote gives you a snapshot of a stock\'s current status. Key fields:\n\n• Price: The last traded price\n• Change ($/%): How much the price moved today\n• Open: First trade price of the day\n• High/Low: Day\'s trading range\n• 52-Week High/Low: Annual trading range\n• Volume: Number of shares traded today\n• Market Cap: Total company value (price × shares outstanding)\n• P/E Ratio: Price divided by earnings per share\n• Dividend Yield: Annual dividend as % of stock price\n• Beta: Volatility relative to the market\n\nPractice reading these on any financial website for your favorite companies!' },
  { id: 'l3', title: 'Understanding P/E Ratios', category: 'Fundamentals', duration: '7 min', xpReward: 30, content: 'The Price-to-Earnings (P/E) ratio is one of the most important valuation metrics. It answers: how much are you paying for $1 of company earnings?\n\nFormula: P/E = Stock Price ÷ Earnings Per Share (EPS)\n\nExample: A stock at $50 with EPS of $2.50 has a P/E of 20.\n\nWhat it means:\n• Low P/E (under 15): May be undervalued or a slow-growth company\n• Average P/E (15-25): Fairly valued for most sectors\n• High P/E (25+): Market expects high future growth\n\nContext matters! A tech company at P/E 40 may be reasonable; a utility at P/E 40 would be expensive. Always compare to industry peers.' },
  { id: 'l4', title: 'Candlestick Charts', category: 'Technical Analysis', duration: '10 min', xpReward: 35, content: 'Candlestick charts originated in 18th-century Japan for tracking rice prices. Each candle shows 4 data points for a time period:\n\n• Open: Price at the start\n• High: Highest price reached\n• Low: Lowest price reached\n• Close: Price at the end\n\nThe "body" shows the open-to-close range. Green/white = price went up (close > open). Red/black = price went down (close < open). The "wicks" (thin lines) show the high and low.\n\nCommon patterns:\n• Doji: Open ≈ Close, signals indecision\n• Hammer: Small body, long lower wick — potential reversal up\n• Shooting Star: Small body, long upper wick — potential reversal down\n• Engulfing: Large candle "swallows" previous — strong reversal signal' },
  { id: 'l5', title: 'Diversification & Risk', category: 'Investing Strategy', duration: '8 min', xpReward: 30, content: 'Don\'t put all your eggs in one basket — this age-old wisdom is the foundation of diversification.\n\nSystematic risk (market risk) affects all stocks and cannot be diversified away — recessions, pandemics, interest rate changes.\n\nUnsystematic risk (specific risk) is unique to one company or sector. By holding 20+ uncorrelated stocks, you can nearly eliminate this.\n\nDiversification strategies:\n• Asset classes: Mix stocks, bonds, real estate, commodities\n• Sectors: Spread across tech, healthcare, financials, consumer goods\n• Geography: US, international developed, emerging markets\n• Size: Large-cap stability + small-cap growth potential\n\nThe modern portfolio theory by Harry Markowitz showed mathematically that diversification improves risk-adjusted returns.' },
  { id: 'l6', title: 'Dollar-Cost Averaging', category: 'Investing Strategy', duration: '6 min', xpReward: 25, content: 'Dollar-cost averaging (DCA) is investing a fixed dollar amount at regular intervals, regardless of market conditions.\n\nExample: Invest $200 every month into an S&P 500 index fund.\n\nWhen prices are HIGH → you buy fewer shares\nWhen prices are LOW → you buy more shares\n\nOver time, this averages your cost basis and removes the pressure of trying to "time the market."\n\nBenefits:\n• Removes emotional decision-making\n• Takes advantage of market dips automatically\n• Builds discipline and a consistent savings habit\n• Reduces impact of volatility on long-term returns\n\nWarren Buffett recommends DCA into low-cost index funds for most investors. Studies show most professional fund managers underperform index funds over 15+ years.' },
  { id: 'l7', title: 'How Dividends Work', category: 'Income Investing', duration: '7 min', xpReward: 25, content: 'A dividend is a portion of a company\'s profits paid directly to shareholders, typically quarterly.\n\nKey dates:\n• Declaration Date: Company announces the dividend\n• Ex-Dividend Date: Must own shares before this date to receive the dividend\n• Record Date: Company checks its books\n• Payment Date: Money arrives in your account\n\nDividend yield = Annual dividend ÷ Stock price × 100\nExample: $2 annual dividend on a $50 stock = 4% yield\n\nDividend reinvestment (DRIP) automatically buys more shares with your dividends, compounding your returns over time.\n\nHigh-yield dividend stocks: utilities, REITs, consumer staples\nGrowth-oriented companies often pay no dividend, reinvesting profits instead.' },
  { id: 'l8', title: 'Introduction to ETFs', category: 'Passive Investing', duration: '8 min', xpReward: 30, content: 'An Exchange-Traded Fund (ETF) is a basket of securities that trades on an exchange like a stock.\n\nHow it works: An ETF provider (like Vanguard or BlackRock) buys hundreds of stocks matching an index. They sell shares of this basket to investors. Each share represents a small piece of every stock in the basket.\n\nPopular ETFs:\n• SPY / VOO: Track the S&P 500 (500 largest US companies)\n• QQQ: Nasdaq 100 (tech-heavy)\n• VTI: Total US stock market\n• BND: US bond market\n• GLD: Gold price\n\nAdvantages over individual stocks:\n• Instant diversification\n• Low fees (expense ratios as low as 0.03%)\n• Tax efficiency\n• Trade anytime during market hours\n\nThe average actively managed fund underperforms its benchmark index. ETFs are the low-cost alternative.' },
];

export default function Lessons() {
  const { dispatch } = useApp();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  function completeLesson(lesson: Lesson) {
    if (!completed.has(lesson.id)) {
      setCompleted(prev => new Set([...prev, lesson.id]));
      dispatch({ type: 'ADD_XP', amount: lesson.xpReward });
    }
    setActiveLesson(null);
  }

  if (activeLesson) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">{activeLesson.title}</div>
            <div className="page-subtitle">{activeLesson.category} · {activeLesson.duration}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveLesson(null)}>
            ← Back to Lessons
          </button>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 720 }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: 15, color: 'var(--text)' }}>
              {activeLesson.content}
            </div>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="xp-tag">+{activeLesson.xpReward} XP</span>
              <button
                className="btn btn-primary"
                onClick={() => completeLesson(activeLesson)}
              >
                {completed.has(activeLesson.id) ? '✓ Completed' : 'Mark Complete & Earn XP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(LESSONS.map(l => l.category))];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Lessons 📚</div>
          <div className="page-subtitle">{completed.size}/{LESSONS.length} completed</div>
        </div>
      </div>
      <div className="page-body">
        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div className="section-title">{cat}</div>
            <div className="grid-2" style={{ gap: 12 }}>
              {LESSONS.filter(l => l.category === cat).map(lesson => (
                <div
                  key={lesson.id}
                  className="card"
                  style={{ cursor: 'pointer', position: 'relative', borderColor: completed.has(lesson.id) ? 'var(--gr2)' : undefined }}
                  onClick={() => setActiveLesson(lesson)}
                >
                  {completed.has(lesson.id) && (
                    <span style={{ position: 'absolute', top: 12, right: 12, color: 'var(--gr)', fontSize: 16 }}>✓</span>
                  )}
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{lesson.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
                    ⏱ {lesson.duration}
                  </div>
                  <span className="xp-tag">+{lesson.xpReward} XP</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

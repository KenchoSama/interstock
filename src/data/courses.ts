import type { DiplomaExam } from '../types';

export const DIPLOMA_COURSES: DiplomaExam[] = [
  {
    id: 'stock-basics',
    course: 'Stock Market Fundamentals',
    xpRequired: 500,
    passingScore: 70,
    questions: [
      {
        q: 'What is a stock?',
        options: ['A type of bond', 'A share of ownership in a company', 'A government security', 'A commodity'],
        answer: 1,
      },
      {
        q: 'The Dow Jones Industrial Average tracks how many stocks?',
        options: ['100', '500', '30', '50'],
        answer: 2,
      },
      {
        q: 'What happens to shareholders when a company pays a dividend?',
        options: ['Shares are split', 'They receive a cash payment', 'Their shares are repurchased', 'The stock price doubles'],
        answer: 1,
      },
      {
        q: 'A "bear market" is defined as:',
        options: ['A market rise of more than 20%', 'A market decline of 20% or more from a recent high', 'A market with low trading volume', 'A market for commodity futures'],
        answer: 1,
      },
      {
        q: 'Market order vs. limit order: A limit order:',
        options: ['Executes immediately at the best available price', 'Executes only at a specified price or better', 'Is only available pre-market', 'Applies only to options'],
        answer: 1,
      },
      {
        q: 'What is the role of the SEC?',
        options: ['Set interest rates', 'Regulate and oversee securities markets to protect investors', 'Manage the national debt', 'Control commodity prices'],
        answer: 1,
      },
      {
        q: 'Stock float refers to:',
        options: ['Total shares authorized', 'Shares available for public trading after insiders\' shares are excluded', 'Shares held by the CEO', 'The stock\'s daily trading range'],
        answer: 1,
      },
      {
        q: 'What does "going long" on a stock mean?',
        options: ['Holding a stock for more than one year', 'Buying a stock expecting the price to rise', 'Shorting a stock', 'Investing in long-duration bonds'],
        answer: 1,
      },
      {
        q: 'Circuit breakers in stock markets are designed to:',
        options: ['Increase trading speed', 'Temporarily halt trading during extreme market declines', 'Prevent short selling', 'Allow after-hours trading'],
        answer: 1,
      },
      {
        q: 'A company\'s book value per share represents:',
        options: ['The market price per share', 'Net assets per share (assets minus liabilities divided by shares)', 'The annual dividend per share', 'The earnings per share'],
        answer: 1,
      },
    ],
  },
  {
    id: 'technical-analysis',
    course: 'Technical Analysis',
    xpRequired: 1000,
    passingScore: 70,
    questions: [
      {
        q: 'Candlestick charts display which four data points?',
        options: ['Open, High, Low, Close', 'High, Low, Average, Volume', 'Previous Close, Open, High, Low', 'Open, Close, Volume, P/E'],
        answer: 0,
      },
      {
        q: 'MACD stands for:',
        options: ['Market Adjusted Cash Dividends', 'Moving Average Convergence Divergence', 'Momentum And Cycle Detector', 'Multi-Asset Correlation Data'],
        answer: 1,
      },
      {
        q: 'A "doji" candlestick pattern suggests:',
        options: ['Strong bullish momentum', 'Indecision in the market — open and close nearly equal', 'A guaranteed reversal', 'High trading volume'],
        answer: 1,
      },
      {
        q: 'Bollinger Bands expand when:',
        options: ['Volume decreases', 'Price volatility increases', 'The moving average flattens', 'Interest rates rise'],
        answer: 1,
      },
      {
        q: 'A "double top" pattern typically signals:',
        options: ['A bullish breakout', 'A bearish reversal after two failed attempts to break resistance', 'An upcoming earnings beat', 'A dividend increase'],
        answer: 1,
      },
      {
        q: 'Volume in technical analysis is important because:',
        options: ['Higher volume reduces stock price', 'Volume confirms price moves — high volume on a breakout adds conviction', 'Volume determines dividend eligibility', 'Low volume signals institutional buying'],
        answer: 1,
      },
      {
        q: 'A stock trading at its 200-day moving average support:',
        options: ['Should be immediately sold', 'Is at a historically significant support level that traders watch closely', 'Has no statistical significance', 'Will definitely bounce'],
        answer: 1,
      },
      {
        q: 'Fibonacci retracement levels are drawn between:',
        options: ['Two consecutive earnings dates', 'A significant high and a significant low', 'The stock\'s 52-week high and low', 'The IPO price and current price'],
        answer: 1,
      },
      {
        q: 'Stochastic oscillator values above 80 indicate:',
        options: ['Strong upward momentum to continue buying', 'Potentially overbought conditions', 'A bearish divergence is confirmed', 'The stock will split'],
        answer: 1,
      },
      {
        q: 'What does "price action" analysis focus on?',
        options: ['Company financials and earnings', 'Raw price movement and chart patterns without indicators', 'Macroeconomic data', 'News and social media sentiment'],
        answer: 1,
      },
    ],
  },
  {
    id: 'options-trading',
    course: 'Options & Derivatives',
    xpRequired: 2000,
    passingScore: 75,
    questions: [
      {
        q: 'The "premium" of an option is:',
        options: ['The strike price', 'The price paid to buy the option contract', 'The profit from exercising the option', 'The annual fee charged by brokers'],
        answer: 1,
      },
      {
        q: 'Delta in options measures:',
        options: ['Time decay per day', 'How much the option price changes per $1 move in the underlying', 'Volatility sensitivity', 'The risk-free rate impact'],
        answer: 1,
      },
      {
        q: 'A covered call strategy involves:',
        options: ['Buying calls to protect a long position', 'Selling calls against shares you already own', 'Buying puts and calls simultaneously', 'Writing puts on a stock you want to own'],
        answer: 1,
      },
      {
        q: 'Theta in options trading is known as:',
        options: ['Volatility risk', 'Time decay — the daily loss in option value as expiration approaches', 'The rate of delta change', 'Market direction sensitivity'],
        answer: 1,
      },
      {
        q: 'An option with high implied volatility (IV) compared to historical volatility is considered:',
        options: ['Cheap — a good buy', 'Expensive — sellers are compensated more for the risk', 'At fair value', 'Guaranteed to expire worthless'],
        answer: 1,
      },
      {
        q: 'A put-call parity relationship means:',
        options: ['Puts and calls always have the same price', 'There\'s a mathematical relationship between put/call prices, the stock, and risk-free rate', 'Implied volatility is always equal', 'Exercise style doesn\'t affect pricing'],
        answer: 1,
      },
      {
        q: 'A protective put strategy is similar to:',
        options: ['A short position', 'Insurance on a stock you own against downside risk', 'A covered call', 'A straddle'],
        answer: 1,
      },
      {
        q: 'An iron condor strategy profits when:',
        options: ['The stock makes a large move up or down', 'The stock remains within a defined range until expiration', 'Implied volatility surges', 'The company pays a special dividend'],
        answer: 1,
      },
      {
        q: 'Options assignment occurs when:',
        options: ['You sell an option before expiration', 'An in-the-money option is exercised and the seller must fulfill the obligation', 'You close a position at a loss', 'The broker decides to exercise your option'],
        answer: 1,
      },
      {
        q: 'Gamma measures:',
        options: ['Daily time decay', 'The rate of change of delta for a $1 move in the underlying', 'Volatility exposure', 'The moneyness of an option'],
        answer: 1,
      },
    ],
  },
  {
    id: 'crypto-defi',
    course: 'Crypto & DeFi Fundamentals',
    xpRequired: 1500,
    passingScore: 70,
    questions: [
      {
        q: 'Bitcoin\'s blockchain uses what consensus mechanism?',
        options: ['Proof of Stake', 'Proof of Work', 'Delegated Proof of Stake', 'Proof of Authority'],
        answer: 1,
      },
      {
        q: 'DeFi stands for:',
        options: ['Digital Financial Infrastructure', 'Decentralized Finance', 'Diversified Financial Index', 'Distributed Fiat Integration'],
        answer: 1,
      },
      {
        q: 'A "smart contract" is:',
        options: ['A legally binding paper contract for crypto trades', 'Self-executing code on a blockchain that runs when conditions are met', 'A type of hardware wallet', 'A government-approved cryptocurrency'],
        answer: 1,
      },
      {
        q: 'Ethereum\'s native token is:',
        options: ['Bitcoin (BTC)', 'Ether (ETH)', 'Solana (SOL)', 'Binance Coin (BNB)'],
        answer: 1,
      },
      {
        q: 'What is a "liquidity pool" in DeFi?',
        options: ['A bank account for crypto', 'A smart contract holding crypto pairs that enable decentralized trading', 'A group of miners pooling resources', 'A cold storage vault'],
        answer: 1,
      },
      {
        q: 'NFT stands for:',
        options: ['New Financial Token', 'Non-Fungible Token', 'Network Fee Transfer', 'Normalized Fund Transaction'],
        answer: 1,
      },
      {
        q: 'Bitcoin\'s maximum supply is:',
        options: ['Unlimited', '21 million BTC', '100 million BTC', '1 billion BTC'],
        answer: 1,
      },
      {
        q: 'A "hard fork" in blockchain results in:',
        options: ['Faster transaction speeds', 'A permanent divergence creating two separate blockchains', 'Higher mining rewards', 'Reduced transaction fees'],
        answer: 1,
      },
      {
        q: 'Stablecoins are designed to:',
        options: ['Appreciate faster than Bitcoin', 'Maintain a stable value, often pegged to the US dollar', 'Replace central bank digital currencies', 'Only be used for NFT purchases'],
        answer: 1,
      },
      {
        q: 'Gas fees on Ethereum compensate:',
        options: ['Regulators for oversight', 'Validators/miners for processing and securing transactions', 'DeFi protocol developers', 'NFT marketplace operators'],
        answer: 1,
      },
    ],
  },
];

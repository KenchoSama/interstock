import type { TrainingModule, CertQuestion } from '../types';

export const TRAINING: TrainingModule[] = [
  {
    id: 'tm1',
    title: 'Introduction to InterStock Platform',
    description: 'Overview of the platform, mission, and your role as an educator.',
    duration: '20 min',
    category: 'Onboarding',
    lessons: [
      { id: 'tm1-l1', title: 'Our Mission & Impact', content: 'InterStock is a financial literacy platform designed to bring investment education to underserved communities. Our mission is to close the wealth gap by equipping the next generation with real-world financial skills...' },
      { id: 'tm1-l2', title: 'Platform Overview', content: 'The platform includes paper trading simulation, gamified learning modules, AI tutoring, diploma programs, and community features. Students earn XP as they complete activities...' },
      { id: 'tm1-l3', title: 'Your Role as Staff', content: 'As an InterStock staff member, you facilitate student learning, support schools and administrators, and represent the brand. You have access to all student data and school analytics...' },
    ],
  },
  {
    id: 'tm2',
    title: 'Student Engagement Best Practices',
    description: 'How to motivate students and maximize learning outcomes.',
    duration: '35 min',
    category: 'Pedagogy',
    lessons: [
      { id: 'tm2-l1', title: 'Understanding the XP System', content: 'The XP gamification system is central to student motivation. Students unlock new features at key XP milestones (100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000 XP)...' },
      { id: 'tm2-l2', title: 'Running Scenario Challenges', content: 'The Scenario Challenge is a 15-question timed quiz covering market concepts. Students who score above 80% earn bonus XP. Facilitate group discussions after each session...' },
      { id: 'tm2-l3', title: 'Diploma Program Strategy', content: 'The four diploma tracks (Stock Basics, Technical Analysis, Options, Crypto) represent certification milestones. Encourage students to complete at least two diplomas before graduation...' },
    ],
  },
  {
    id: 'tm3',
    title: 'School Administrator Relations',
    description: 'Building and maintaining strong school partnerships.',
    duration: '25 min',
    category: 'Partnerships',
    lessons: [
      { id: 'tm3-l1', title: 'School Onboarding Process', content: 'New school onboarding involves an initial meeting with the principal or financial literacy coordinator, setting up class rosters, and training the school admin on the dashboard...' },
      { id: 'tm3-l2', title: 'Monthly Check-ins', content: 'Regular monthly check-ins with school admins ensure program health. Review engagement metrics, identify struggling students, and celebrate top performers through the leaderboard...' },
      { id: 'tm3-l3', title: 'CRA Reporting', content: 'Community Reinvestment Act (CRA) partners require quarterly impact reports. Document student outcomes, school demographics, and financial literacy metrics for compliance...' },
    ],
  },
  {
    id: 'tm4',
    title: 'Financial Literacy Curriculum',
    description: 'Deep dive into the core curriculum concepts you\'ll teach.',
    duration: '60 min',
    category: 'Content',
    lessons: [
      { id: 'tm4-l1', title: 'Stock Market Basics Module', content: 'This covers equities, how markets work, reading stock quotes, understanding market cap, P/E ratios, and basic trading mechanics. Prerequisite for all other modules...' },
      { id: 'tm4-l2', title: 'Technical Analysis Module', content: 'Covers candlestick charts, moving averages, RSI, MACD, support/resistance, and common patterns. Requires 100 XP to unlock. Use the live chart tool to demonstrate patterns...' },
      { id: 'tm4-l3', title: 'Options & Derivatives', content: 'Advanced module covering calls, puts, the Greeks, options strategies. Requires 200 XP. Emphasize risk management — options can amplify both gains and losses...' },
      { id: 'tm4-l4', title: 'Crypto & DeFi', content: 'Covers Bitcoin, Ethereum, blockchain basics, DeFi protocols, NFTs, and stablecoins. Discuss both opportunities and significant risks associated with crypto assets...' },
    ],
  },
  {
    id: 'tm5',
    title: 'Using the AI Tutor (FinBot)',
    description: 'Leverage AI to personalize student learning.',
    duration: '20 min',
    category: 'Tools',
    lessons: [
      { id: 'tm5-l1', title: 'FinBot Overview', content: 'FinBot is powered by Claude AI (Anthropic) and acts as a personalized finance tutor. Students can ask any investing or markets question and receive detailed, age-appropriate explanations...' },
      { id: 'tm5-l2', title: 'Facilitating AI Sessions', content: 'Encourage students to use FinBot to explore topics beyond the curriculum. Model good prompting behavior by asking specific, context-rich questions about market scenarios...' },
    ],
  },
  {
    id: 'tm6',
    title: 'Paper Trading Simulation',
    description: 'Guide students through the virtual trading experience.',
    duration: '30 min',
    category: 'Tools',
    lessons: [
      { id: 'tm6-l1', title: 'Portfolio Setup', content: 'Each student starts with $100,000 in virtual cash. Walk them through placing their first buy order: finding a stock, entering quantity, reviewing the trade panel...' },
      { id: 'tm6-l2', title: 'Reading the Portfolio', content: 'Teach students to interpret gain/loss, portfolio allocation, and sector exposure. Discuss cost basis vs. current value and what unrealized vs. realized gains mean...' },
      { id: 'tm6-l3', title: 'Assignment Projects', content: 'Use the portfolio for structured assignments: "Build a diversified 5-stock portfolio" or "Research a sector and invest $20,000 with a written thesis"...' },
    ],
  },
  {
    id: 'tm7',
    title: 'Compliance & Data Privacy',
    description: 'Protecting student data and meeting legal requirements.',
    duration: '30 min',
    category: 'Compliance',
    lessons: [
      { id: 'tm7-l1', title: 'FERPA & COPPA Basics', content: 'All student data is protected under FERPA (Family Educational Rights and Privacy Act). Students under 13 require additional COPPA protections. Never share identifiable student data externally...' },
      { id: 'tm7-l2', title: 'Data Handling Policies', content: 'Only access student data you need for your role. Do not export or share student portfolios, XP records, or contact information without written authorization from the school admin...' },
    ],
  },
  {
    id: 'tm8',
    title: 'CRA Impact Reporting',
    description: 'Documenting and reporting community impact for CRA partners.',
    duration: '40 min',
    category: 'Compliance',
    lessons: [
      { id: 'tm8-l1', title: 'What is the CRA?', content: 'The Community Reinvestment Act encourages banks to help meet the credit needs of communities they serve, including low-to-moderate income neighborhoods. InterStock partners with CRA-motivated institutions...' },
      { id: 'tm8-l2', title: 'Collecting Impact Metrics', content: 'Key metrics: total students served, schools reached, average XP earned, diplomas issued, field trips completed, internships placed. Collect these quarterly from the admin dashboard...' },
      { id: 'tm8-l3', title: 'Writing the Impact Report', content: 'CRA reports should include: community demographics, quantified outcomes, student success stories (anonymized), partner contributions, and future program goals...' },
    ],
  },
  {
    id: 'tm9',
    title: 'Field Trips & Internships',
    description: 'Coordinating experiential learning opportunities.',
    duration: '25 min',
    category: 'Programs',
    lessons: [
      { id: 'tm9-l1', title: 'Field Trip Coordination', content: 'Field trips to NYSE, investment firms, and the Federal Reserve are flagship experiences. Coordinate logistics 6-8 weeks in advance. Students must have 500+ XP to participate in most trips...' },
      { id: 'tm9-l2', title: 'Internship Placement', content: 'Partner firm internships are the ultimate outcome of the program. Only students with 2000+ XP and a relevant diploma are eligible. Work with partner firm HR contacts for placement...' },
    ],
  },
];

export const CERT_Q: CertQuestion[] = [
  { q: 'What does InterStock\'s mission focus on?', options: ['Maximizing student profits', 'Closing the wealth gap through financial literacy education', 'Training professional traders', 'Selling investment products'], answer: 1 },
  { q: 'At what XP level does the Options trading module unlock?', options: ['100 XP', '200 XP', '500 XP', '1000 XP'], answer: 1 },
  { q: 'FERPA protects:', options: ['Investor financial records', 'Student education records and privacy', 'Staff salary information', 'School financial disclosures'], answer: 1 },
  { q: 'CRA stands for:', options: ['Corporate Reinvestment Allowance', 'Community Reinvestment Act', 'Capital Risk Assessment', 'Curriculum Review Authority'], answer: 1 },
  { q: 'What is the starting virtual cash amount for student portfolios?', options: ['$10,000', '$50,000', '$100,000', '$250,000'], answer: 2 },
  { q: 'How many diploma courses are available on the platform?', options: ['2', '3', '4', '5'], answer: 2 },
  { q: 'FinBot is powered by:', options: ['GPT-4', 'Claude AI (Anthropic)', 'Google Gemini', 'InterStock\'s proprietary AI'], answer: 1 },
  { q: 'Field trips typically require students to have at least:', options: ['Any XP', '100 XP', '500 XP', '2000 XP'], answer: 2 },
  { q: 'CRA impact reports should be submitted:', options: ['Monthly', 'Weekly', 'Quarterly', 'Annually'], answer: 2 },
  { q: 'A covered call involves:', options: ['Buying calls on a short position', 'Selling calls against shares you own', 'Buying calls and puts simultaneously', 'Covering losses with call premiums'], answer: 1 },
  { q: 'The Scenario Challenge contains how many questions?', options: ['10', '15', '20', '25'], answer: 1 },
  { q: 'Students must complete how many diploma courses before graduation eligibility?', options: ['At least 1', 'At least 2 (recommended)', 'All 4', 'None required'], answer: 1 },
  { q: 'What consensus mechanism does Bitcoin use?', options: ['Proof of Stake', 'Proof of Work', 'Proof of Authority', 'Delegated Proof of Stake'], answer: 1 },
  { q: 'The passing score for the Technical Analysis diploma is:', options: ['60%', '65%', '70%', '75%'], answer: 2 },
  { q: 'Internship eligibility requires:', options: ['Any student can apply', '500+ XP', '2000+ XP and a relevant diploma', 'School admin approval only'], answer: 2 },
];

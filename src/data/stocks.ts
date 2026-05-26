import type { Stock, Holding, LeaderboardEntry, Student, School, Company, FieldTrip, Intern, FAQ } from '../types';

export const STOCKS: Stock[] = [
  { sym: 'AAPL', name: 'Apple Inc.', price: 189.84, chg: 1.23, chgPct: 0.65, mktCap: '2.94T', pe: 29.8, eps: 6.42, div: 0.96, beta: 1.19, vol: 58.4, sector: 'Technology' },
  { sym: 'TSLA', name: 'Tesla Inc.', price: 242.15, chg: -3.87, chgPct: -1.57, mktCap: '771B', pe: 62.1, eps: 3.90, div: 0, beta: 2.31, vol: 94.2, sector: 'Consumer Discretionary' },
  { sym: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, chg: 12.60, chgPct: 1.46, mktCap: '2.15T', pe: 68.9, eps: 12.70, div: 0.04, beta: 1.78, vol: 42.1, sector: 'Technology' },
  { sym: 'MSFT', name: 'Microsoft Corp.', price: 415.32, chg: 2.15, chgPct: 0.52, mktCap: '3.09T', pe: 36.2, eps: 11.47, div: 3.00, beta: 0.87, vol: 23.8, sector: 'Technology' },
  { sym: 'AMZN', name: 'Amazon.com Inc.', price: 182.75, chg: -1.23, chgPct: -0.67, mktCap: '1.90T', pe: 43.5, eps: 4.20, div: 0, beta: 1.12, vol: 38.6, sector: 'Consumer Discretionary' },
  { sym: 'META', name: 'Meta Platforms', price: 512.63, chg: 7.84, chgPct: 1.55, mktCap: '1.31T', pe: 27.4, eps: 18.70, div: 2.00, beta: 1.24, vol: 17.3, sector: 'Communication Services' },
  { sym: 'GOOGL', name: 'Alphabet Inc.', price: 166.41, chg: 0.58, chgPct: 0.35, mktCap: '2.05T', pe: 22.8, eps: 7.30, div: 0, beta: 0.99, vol: 27.4, sector: 'Communication Services' },
  { sym: 'JPM', name: 'JPMorgan Chase', price: 198.82, chg: -0.94, chgPct: -0.47, mktCap: '573B', pe: 12.4, eps: 16.05, div: 5.00, beta: 0.92, vol: 12.1, sector: 'Financials' },
  { sym: 'NFLX', name: 'Netflix Inc.', price: 625.18, chg: 9.43, chgPct: 1.53, mktCap: '268B', pe: 41.6, eps: 15.03, div: 0, beta: 1.46, vol: 8.7, sector: 'Communication Services' },
  { sym: 'AMD', name: 'Advanced Micro Devices', price: 158.72, chg: 3.21, chgPct: 2.06, mktCap: '257B', pe: 171.8, eps: 0.92, div: 0, beta: 1.91, vol: 52.3, sector: 'Technology' },
];

export const PORT: Holding[] = [
  { sym: 'AAPL', shares: 10, avg: 178.50, price: 189.84 },
  { sym: 'NVDA', shares: 5, avg: 820.00, price: 875.40 },
  { sym: 'TSLA', shares: 8, avg: 248.00, price: 242.15 },
  { sym: 'MSFT', shares: 3, avg: 400.00, price: 415.32 },
];

export const LB: LeaderboardEntry[] = [
  { rank: 1, name: 'Marcus Johnson', school: 'Lincoln High School', xp: 3240, level: 'Wall Street Pro' },
  { rank: 2, name: 'Priya Patel', school: 'Jefferson Academy', xp: 2980, level: 'Fund Manager' },
  { rank: 3, name: 'DeShawn Williams', school: 'MLK Jr. High', xp: 2750, level: 'Fund Manager' },
  { rank: 4, name: 'Aaliyah Chen', school: 'Eastside Prep', xp: 2340, level: 'Senior Analyst' },
  { rank: 5, name: 'Carlos Rivera', school: 'City View Academy', xp: 1980, level: 'Junior Analyst' },
  { rank: 6, name: 'Jasmine Brooks', school: 'Westfield High', xp: 1620, level: 'Junior Analyst' },
  { rank: 7, name: 'Tyler Nguyen', school: 'Lincoln High School', xp: 1200, level: 'Trader' },
];

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Marcus Johnson', school: 'Lincoln High School', grade: '11th', xp: 3240, level: 'Wall Street Pro', progress: 94 },
  { id: 's2', name: 'Priya Patel', school: 'Lincoln High School', grade: '10th', xp: 2980, level: 'Fund Manager', progress: 88 },
  { id: 's3', name: 'DeShawn Williams', school: 'Lincoln High School', grade: '12th', xp: 2750, level: 'Fund Manager', progress: 82 },
  { id: 's4', name: 'Aaliyah Chen', school: 'Lincoln High School', grade: '10th', xp: 2340, level: 'Senior Analyst', progress: 71 },
  { id: 's5', name: 'Carlos Rivera', school: 'Lincoln High School', grade: '11th', xp: 1980, level: 'Junior Analyst', progress: 58 },
  { id: 's6', name: 'Jasmine Brooks', school: 'Lincoln High School', grade: '9th', xp: 1620, level: 'Junior Analyst', progress: 46 },
  { id: 's7', name: 'Tyler Nguyen', school: 'Lincoln High School', grade: '9th', xp: 1200, level: 'Trader', progress: 34 },
];

export const SCHOOLS: School[] = [
  { id: 'sch1', name: 'Lincoln High School', city: 'Chicago', state: 'IL', students: 42, active: 38 },
  { id: 'sch2', name: 'Jefferson Academy', city: 'Detroit', state: 'MI', students: 35, active: 29 },
  { id: 'sch3', name: 'MLK Jr. High', city: 'Atlanta', state: 'GA', students: 58, active: 51 },
  { id: 'sch4', name: 'Eastside Prep', city: 'Baltimore', state: 'MD', students: 27, active: 22 },
  { id: 'sch5', name: 'City View Academy', city: 'Houston', state: 'TX', students: 63, active: 57 },
  { id: 'sch6', name: 'Westfield High', city: 'Los Angeles', state: 'CA', students: 49, active: 43 },
];

export const COMPS: Company[] = [
  { id: 'c1', name: 'Goldman Sachs', type: 'Investment Bank', contact: 'Lisa Park', status: 'Active' },
  { id: 'c2', name: 'BlackRock', type: 'Asset Management', contact: 'James Osei', status: 'Active' },
  { id: 'c3', name: 'JP Morgan Chase', type: 'Investment Bank', contact: 'Sandra Mills', status: 'Pending' },
];

export const TRIPS: FieldTrip[] = [
  { id: 't1', title: 'NYSE Trading Floor Visit', company: 'NYSE Group', date: '2026-06-15', spots: 20, enrolled: 14, type: 'In-Person' },
  { id: 't2', title: 'BlackRock HQ Tour', company: 'BlackRock', date: '2026-06-28', spots: 15, enrolled: 15, type: 'In-Person' },
  { id: 't3', title: 'Virtual Fed Reserve Briefing', company: 'Federal Reserve', date: '2026-07-10', spots: 50, enrolled: 31, type: 'Virtual' },
];

export const INTERNS: Intern[] = [
  { id: 'i1', title: 'Summer Finance Analyst', company: 'Goldman Sachs', duration: '8 weeks', stipend: '$2,500', xpRequired: 2000 },
  { id: 'i2', title: 'Investment Research Intern', company: 'BlackRock', duration: '10 weeks', stipend: '$3,000', xpRequired: 2500 },
];

export const FAQS: FAQ[] = [
  { q: 'How do I earn XP?', a: 'Complete lessons, play the Scenario Challenge, pass level ups, earn diplomas, and complete assignments to earn XP.' },
  { q: 'What is paper trading?', a: 'Paper trading is simulated investing with virtual money ($100,000) so you can practice without risking real funds.' },
  { q: 'How do diplomas work?', a: 'Each diploma course has a final exam. Pass with 70% or higher to earn your diploma and a PDF certificate.' },
  { q: 'Can I reset my portfolio?', a: 'Portfolio resets are available once per month. Contact your school admin or use the support page to request a reset.' },
  { q: 'What is the FinBot AI tutor?', a: 'FinBot is an AI-powered tutor that answers finance and investing questions in real time using Claude AI.' },
];

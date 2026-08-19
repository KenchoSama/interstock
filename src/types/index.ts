export type Role = 'student' | 'school_admin' | 'parent' | 'partner' | 'admin' | 'staff';
export type Screen = 'login' | 'main' | 'reset-password';
export type TradeAction = 'buy' | 'sell';

export interface Stock {
  sym: string;
  name: string;
  price: number;
  chg: number;
  chgPct: number;
  mktCap: string;
  pe: number;
  eps: number;
  div: number;
  beta: number;
  vol: number;
  sector: string;
}

export interface Holding {
  sym: string;
  shares: number;
  avg: number;
  price: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  xp: number;
  level: string;
  returnPct?: number;
}

export interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  xp: number;
  level: string;
  progress: number;
}

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  students: number;
  active: number;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  contact: string;
  status: string;
}

export interface FieldTrip {
  id: string;
  title: string;
  company: string;
  date: string;
  spots: number;
  enrolled: number;
  type: string;
}

export interface Intern {
  id: string;
  title: string;
  company: string;
  duration: string;
  stipend: string;
  xpRequired: number;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface ScenarioOption {
  text: string;
}

export interface Scenario {
  id: number;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
  category: string;
}

export interface ExamQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface DiplomaExam {
  id: string;
  course: string;
  xpRequired: number;
  questions: ExamQuestion[];
  passingScore: number;
}

export interface DiplomaRecord {
  courseId: string;
  courseName: string;
  earned: boolean;
  score?: number;
  date?: string;
}

export interface TrainingLesson {
  id: string;
  title: string;
  content: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  lessons: TrainingLesson[];
}

export interface CertQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LevelQuestion {
  text: string;
  options: string[];
  answer: number;
}

export interface GameLevel {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: 'normal' | 'boss' | 'bonus' | 'advanced';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  xpReward: number;
  questions: LevelQuestion[];
}

export interface GameState {
  active: boolean;
  scenarioIdx: number;
  score: number;
  answers: (number | null)[];
  timeLeft: number;
  totalTime: number;
  finished: boolean;
}

export interface LevelGameState {
  active: boolean;
  view: 'map' | 'play' | 'result';
  currentLevel: number;
  questionIdx: number;
  score: number;
  lives: number;
  timeLeft: number;
  finished: boolean;
  passed: boolean;
  unlockedLevel: number;
}

export interface TrainingState {
  moduleId: string | null;
  lessonId: string | null;
  completed: string[];
  certScore: number | null;
  certPassed: boolean;
  certView: 'list' | 'lesson' | 'exam' | 'result';
  currentQ: number;
  examAnswers: (number | null)[];
}

export interface EtfHolding {
  sym: string;
  weight: number;
}

export interface EtfPortfolio {
  name: string;
  ticker: string;
  holdings: EtfHolding[];
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string;
  available: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  isPrivate: boolean;
  xp: number;
  cash: number;
  portfolio: Holding[];
  diplomas: DiplomaRecord[];
  certPassed: boolean;
  achievements: string[];
  createdAt: string;
  supabaseId: string | null;
  portfolioId: string | null;
  hasAssessment: boolean;
  hasAgreedToCoC: boolean;
  school_id: string | null;
  grade: number | null;
  age: number | null;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  xpRequired?: number;
}

export interface AppState {
  screen: Screen;
  role: Role;
  view: string;
  modal: string | null;
  tradeAction: TradeAction;
  sym: string;
  qty: number;
  chartTf: string;
  aiMsgs: AiMessage[];
  game: GameState;
  levelGame: LevelGameState;
  training: TrainingState;
  etf: EtfPortfolio | null;
  mentors: Mentor[];
  diplomas: DiplomaRecord[];
  u: Record<Role, UserProfile>;
  viewedProfileId: string | null;
}
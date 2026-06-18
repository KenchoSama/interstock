import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, Role, AiMessage, TradeAction } from '../types';
import { PORT } from '../data';
import { DIPLOMA_COURSES } from '../data/courses';
import { CERT_Q } from '../data/training';

const INITIAL_DIPLOMAS = DIPLOMA_COURSES.map(c => ({
  courseId: c.id,
  courseName: c.course,
  earned: false,
}));

function makeUser(name: string, xp = 0): AppState['u'][Role] {
  return {
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@interstock.edu`,
    avatar: name[0].toUpperCase(),
    xp,
    cash: 10000,
    portfolio: PORT,
    diplomas: INITIAL_DIPLOMAS,
    certPassed: false,
    achievements: ['first-trade', 'first-lesson'],
    createdAt: new Date().toISOString(),
    supabaseId: null as string | null,
    portfolioId: null as string | null,
  };
}

const initialState: AppState = {
  screen: 'login',
  role: 'student',
  view: 'dashboard',
  modal: null,
  tradeAction: 'buy',
  sym: 'AAPL',
  qty: 1,
  chartTf: '1D',
  aiMsgs: [],
  game: {
    active: false,
    scenarioIdx: 0,
    score: 0,
    answers: [],
    timeLeft: 120,
    totalTime: 120,
    finished: false,
  },
  levelGame: {
    active: false,
    view: 'map',
    currentLevel: 1,
    questionIdx: 0,
    score: 0,
    lives: 3,
    timeLeft: 30,
    finished: false,
    passed: false,
    unlockedLevel: 1,
  },
  training: {
    moduleId: null,
    lessonId: null,
    completed: [],
    certScore: null,
    certPassed: false,
    certView: 'list',
    currentQ: 0,
    examAnswers: [],
  },
  etf: null,
  mentors: [
    { id: 'm1', name: 'Dr. Angela Foster', title: 'Chief Investment Officer', company: 'Foster Capital', expertise: 'Portfolio Management', available: true },
    { id: 'm2', name: 'Marcus Webb', title: 'Head of Equity Research', company: 'Goldman Sachs', expertise: 'Fundamental Analysis', available: false },
    { id: 'm3', name: 'Sandra Kim', title: 'Quantitative Strategist', company: 'BlackRock', expertise: 'Technical Analysis', available: true },
  ],
  diplomas: INITIAL_DIPLOMAS,
  u: {
    student: makeUser('Jordan Williams', 1450),
    school_admin: makeUser('Ms. Patricia Lewis', 0),
    parent: makeUser('Robert Williams', 0),
    partner: makeUser('James Osei', 0),
    admin: makeUser('Admin User', 0),
    staff: makeUser('Staff Member', 0),
  },
};

type Action =
  | { type: 'SET_SCREEN'; screen: AppState['screen'] }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_VIEW'; view: string }
  | { type: 'SET_MODAL'; modal: string | null }
  | { type: 'SET_TRADE_ACTION'; action: TradeAction }
  | { type: 'SET_SYM'; sym: string }
  | { type: 'SET_QTY'; qty: number }
  | { type: 'SET_CHART_TF'; tf: string }
  | { type: 'ADD_AI_MSG'; msg: AiMessage }
  | { type: 'SET_AI_MSGS'; msgs: AiMessage[] }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'BUY_STOCK'; sym: string; shares: number; price: number }
  | { type: 'SELL_STOCK'; sym: string; shares: number; price: number }
  | { type: 'START_GAME' }
  | { type: 'ANSWER_GAME'; answerIdx: number; correct: boolean }
  | { type: 'TICK_GAME'; elapsed: number }
  | { type: 'END_GAME' }
  | { type: 'START_LEVEL_GAME'; levelId: number }
  | { type: 'ANSWER_LEVEL'; answerIdx: number; correct: boolean }
  | { type: 'TICK_LEVEL'; elapsed: number }
  | { type: 'END_LEVEL_GAME'; passed: boolean }
  | { type: 'SET_LEVEL_VIEW'; view: AppState['levelGame']['view'] }
  | { type: 'SET_TRAINING_MODULE'; moduleId: string | null }
  | { type: 'SET_TRAINING_LESSON'; lessonId: string | null }
  | { type: 'COMPLETE_LESSON'; lessonId: string }
  | { type: 'SET_CERT_VIEW'; view: AppState['training']['certView'] }
  | { type: 'ANSWER_CERT'; qIdx: number; answer: number }
  | { type: 'SUBMIT_CERT' }
  | { type: 'SET_CERT_RESULT'; score: number; passed: boolean }
  | { type: 'EARN_DIPLOMA'; courseId: string; score: number }
  | { type: 'SET_ETF'; etf: AppState['etf'] }
  | { type: 'LOGIN'; role: Role; studentData?: { name: string; xp: number; cash: number; achievements: string[]; createdAt?: string; supabaseId?: string; portfolioId?: string; portfolio: AppState['u']['student']['portfolio'] } }
  | { type: 'LOGOUT' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN': {
      const base = { ...state, screen: 'main' as const, role: action.role, view: defaultView(action.role) };
      if (action.role === 'student' && action.studentData) {
        const d = action.studentData;
        return {
          ...base,
          u: {
            ...state.u,
            student: { ...state.u.student, name: d.name, xp: d.xp, cash: d.cash, achievements: d.achievements, portfolio: d.portfolio, createdAt: d.createdAt ?? new Date().toISOString(), supabaseId: d.supabaseId ?? null, portfolioId: d.portfolioId ?? null },
          },
        };
      }
      return base;
    }

    case 'LOGOUT':
      return { ...initialState };

    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SET_ROLE':
      return { ...state, role: action.role, view: defaultView(action.role) };

    case 'SET_VIEW':
      return { ...state, view: action.view, modal: null };

    case 'SET_MODAL':
      return { ...state, modal: action.modal };

    case 'SET_TRADE_ACTION':
      return { ...state, tradeAction: action.action };

    case 'SET_SYM':
      return { ...state, sym: action.sym };

    case 'SET_QTY':
      return { ...state, qty: action.qty };

    case 'SET_CHART_TF':
      return { ...state, chartTf: action.tf };

    case 'ADD_AI_MSG':
      return { ...state, aiMsgs: [...state.aiMsgs, action.msg] };

    case 'SET_AI_MSGS':
      return { ...state, aiMsgs: action.msgs };

    case 'ADD_XP': {
      const u = { ...state.u };
      const roleUser = { ...u[state.role], xp: u[state.role].xp + action.amount };
      u[state.role] = roleUser;
      return { ...state, u };
    }

    case 'BUY_STOCK': {
      const u = { ...state.u };
      const user = { ...u[state.role] };
      const cost = action.shares * action.price;
      if (user.cash < cost) return state;
      user.cash -= cost;
      const existing = user.portfolio.find(h => h.sym === action.sym);
      if (existing) {
        const totalShares = existing.shares + action.shares;
        const avgCost = (existing.avg * existing.shares + action.price * action.shares) / totalShares;
        user.portfolio = user.portfolio.map(h =>
          h.sym === action.sym ? { ...h, shares: totalShares, avg: avgCost } : h
        );
      } else {
        user.portfolio = [...user.portfolio, { sym: action.sym, shares: action.shares, avg: action.price, price: action.price }];
      }
      u[state.role] = user;
      return { ...state, u };
    }

    case 'SELL_STOCK': {
      const u = { ...state.u };
      const user = { ...u[state.role] };
      const holding = user.portfolio.find(h => h.sym === action.sym);
      if (!holding || holding.shares < action.shares) return state;
      user.cash += action.shares * action.price;
      if (holding.shares === action.shares) {
        user.portfolio = user.portfolio.filter(h => h.sym !== action.sym);
      } else {
        user.portfolio = user.portfolio.map(h =>
          h.sym === action.sym ? { ...h, shares: h.shares - action.shares } : h
        );
      }
      u[state.role] = user;
      return { ...state, u };
    }

    case 'START_GAME':
      return {
        ...state,
        view: 'game-play',
        game: {
          active: true,
          scenarioIdx: 0,
          score: 0,
          answers: [],
          timeLeft: 120,
          totalTime: 120,
          finished: false,
        },
      };

    case 'ANSWER_GAME': {
      const game = { ...state.game };
      game.answers = [...game.answers, action.answerIdx];
      if (action.correct) game.score += 1;
      const nextIdx = game.scenarioIdx + 1;
      if (nextIdx >= 15) {
        game.finished = true;
        game.active = false;
        return { ...state, game, view: 'game-result' };
      }
      game.scenarioIdx = nextIdx;
      game.timeLeft = 120;
      return { ...state, game };
    }

    case 'TICK_GAME': {
      const game = { ...state.game };
      game.timeLeft = Math.max(0, game.timeLeft - action.elapsed);
      if (game.timeLeft === 0) {
        game.answers = [...game.answers, -1];
        const nextIdx = game.scenarioIdx + 1;
        if (nextIdx >= 15) {
          game.finished = true;
          game.active = false;
          return { ...state, game, view: 'game-result' };
        }
        game.scenarioIdx = nextIdx;
        game.timeLeft = 120;
      }
      return { ...state, game };
    }

    case 'END_GAME':
      return { ...state, game: { ...state.game, active: false, finished: true }, view: 'game-result' };

    case 'START_LEVEL_GAME':
      return {
        ...state,
        levelGame: {
          ...state.levelGame,
          active: true,
          view: 'play',
          currentLevel: action.levelId,
          questionIdx: 0,
          score: 0,
          lives: 3,
          timeLeft: 30,
          finished: false,
          passed: false,
        },
      };

    case 'ANSWER_LEVEL': {
      const lg = { ...state.levelGame };
      if (!action.correct) lg.lives = lg.lives - 1;
      else lg.score += 1;
      if (lg.lives === 0) {
        lg.finished = true;
        lg.passed = false;
        lg.active = false;
        lg.view = 'result';
        return { ...state, levelGame: lg };
      }
      lg.questionIdx += 1;
      lg.timeLeft = 30;
      return { ...state, levelGame: lg };
    }

    case 'TICK_LEVEL': {
      const lg = { ...state.levelGame };
      lg.timeLeft = Math.max(0, lg.timeLeft - action.elapsed);
      if (lg.timeLeft === 0) {
        lg.lives = lg.lives - 1;
        if (lg.lives === 0) {
          lg.finished = true;
          lg.passed = false;
          lg.active = false;
          lg.view = 'result';
          return { ...state, levelGame: lg };
        }
        lg.questionIdx += 1;
        lg.timeLeft = 30;
      }
      return { ...state, levelGame: lg };
    }

    case 'END_LEVEL_GAME': {
      const lg = { ...state.levelGame, finished: true, passed: action.passed, active: false, view: 'result' as const };
      if (action.passed && lg.currentLevel >= lg.unlockedLevel) {
        lg.unlockedLevel = lg.currentLevel + 1;
      }
      return { ...state, levelGame: lg };
    }

    case 'SET_LEVEL_VIEW':
      return { ...state, levelGame: { ...state.levelGame, view: action.view } };

    case 'SET_TRAINING_MODULE':
      return {
        ...state,
        training: {
          ...state.training,
          moduleId: action.moduleId,
          lessonId: null,
          certView: action.moduleId ? 'lesson' : 'list',
        },
      };

    case 'SET_TRAINING_LESSON':
      return { ...state, training: { ...state.training, lessonId: action.lessonId } };

    case 'COMPLETE_LESSON': {
      const completed = state.training.completed.includes(action.lessonId)
        ? state.training.completed
        : [...state.training.completed, action.lessonId];
      return { ...state, training: { ...state.training, completed } };
    }

    case 'SET_CERT_VIEW': {
      const examAnswers = action.view === 'exam'
        ? new Array(15).fill(null)
        : state.training.examAnswers;
      return {
        ...state,
        training: { ...state.training, certView: action.view, currentQ: 0, examAnswers },
      };
    }

    case 'ANSWER_CERT': {
      const answers = [...state.training.examAnswers];
      answers[action.qIdx] = action.answer;
      return { ...state, training: { ...state.training, examAnswers: answers } };
    }

    case 'SUBMIT_CERT': {
      const correct = state.training.examAnswers.filter((a, i) => a === CERT_Q[i].answer).length;
      const score = Math.round((correct / 15) * 100);
      const passed = score >= 70;
      const u = { ...state.u };
      if (passed) u[state.role] = { ...u[state.role], certPassed: true };
      return {
        ...state,
        u,
        training: { ...state.training, certScore: score, certPassed: passed, certView: 'result' },
      };
    }

    case 'SET_CERT_RESULT': {
      const u = { ...state.u };
      if (action.passed) u[state.role] = { ...u[state.role], certPassed: true };
      return {
        ...state,
        u,
        training: { ...state.training, certScore: action.score, certPassed: action.passed, certView: 'result' },
      };
    }

    case 'EARN_DIPLOMA': {
      const diplomas = state.diplomas.map(d =>
        d.courseId === action.courseId
          ? { ...d, earned: true, score: action.score, date: new Date().toLocaleDateString() }
          : d
      );
      const u = { ...state.u };
      u[state.role] = {
        ...u[state.role],
        diplomas: u[state.role].diplomas.map(d =>
          d.courseId === action.courseId
            ? { ...d, earned: true, score: action.score, date: new Date().toLocaleDateString() }
            : d
        ),
      };
      return { ...state, diplomas, u };
    }

    case 'SET_ETF':
      return { ...state, etf: action.etf };

    default:
      return state;
  }
}

function defaultView(role: Role): string {
  const defaults: Record<Role, string> = {
    student: 'dashboard',
    school_admin: 'school-dash',
    parent: 'parent',
    partner: 'partner-dash',
    admin: 'admin-dash',
    staff: 'staff-training',
  };
  return defaults[role];
}

export function isLocked(_view: string, _xp: number): boolean {
  return false;
}

export function getLevelName(xp: number): string {
  if (xp >= 3000) return 'Wall Street Pro';
  if (xp >= 2500) return 'Fund Manager';
  if (xp >= 2000) return 'Senior Analyst';
  if (xp >= 1500) return 'Junior Analyst';
  if (xp >= 1200) return 'Trader';
  if (xp >= 1000) return 'Investor';
  if (xp >= 500) return 'Analyst Trainee';
  if (xp >= 200) return 'Market Watcher';
  if (xp >= 100) return 'Rookie';
  return 'Beginner';
}

export function getNextLevelXP(xp: number): number {
  const thresholds = [100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];
  return thresholds.find(t => t > xp) ?? 3000;
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

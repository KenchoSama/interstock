import { useApp, isLocked } from '../../state/AppContext';
import type { Role } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  section?: string;
}

const NAV: Record<Role, NavItem[]> = {
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', section: 'Home' },
    { id: 'portfolio', label: 'Portfolio', icon: '📊', section: 'Trading' },
    { id: 'fundamentals', label: 'Fundamentals', icon: '🔍' },
    { id: 'options', label: 'Options', icon: '📈' },
    { id: 'futures', label: 'Futures', icon: '⚡' },
    { id: 'lessons', label: 'Lessons', icon: '📚', section: 'Learn' },
    { id: 'game', label: 'Scenario Challenge', icon: '🎯' },
    { id: 'level-game', label: 'Level Up Game', icon: '🗺️' },
    { id: 'diplomas', label: 'Diplomas', icon: '🎓' },
    { id: 'etf', label: 'Build an ETF', icon: '🏦' },
    { id: 'assignments', label: 'Assignments', icon: '📝', section: 'School' },
    { id: 'compete', label: 'Compete', icon: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '📋' },
    { id: 'field-trips', label: 'Field Trips', icon: '✈️' },
    { id: 'interns', label: 'Internships', icon: '💼' },
    { id: 'achievements', label: 'Achievements', icon: '🏅', section: 'Profile' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'ai', label: 'FinBot AI', icon: '🤖' },
    { id: 'help', label: 'Help & FAQ', icon: '❓' },
  ],
  school_admin: [
    { id: 'school-dash', label: 'Dashboard', icon: '🏫', section: 'School' },
    { id: 'school-perf', label: 'Performance', icon: '📊' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'support', label: 'Support', icon: '💬', section: 'Help' },
  ],
  parent: [
    { id: 'parent', label: 'My Child', icon: '👨‍👧', section: 'Overview' },
    { id: 'support', label: 'Support', icon: '💬', section: 'Help' },
  ],
  partner: [
    { id: 'partner-dash', label: 'Dashboard', icon: '🤝', section: 'Partner' },
    { id: 'mentors', label: 'Mentors', icon: '👩‍🏫' },
    { id: 'sponsorships', label: 'Sponsorships', icon: '💰' },
    { id: 'support', label: 'Support', icon: '💬', section: 'Help' },
  ],
  admin: [
    { id: 'admin-dash', label: 'Dashboard', icon: '⚙️', section: 'Admin' },
    { id: 'cra', label: 'CRA Report', icon: '📋' },
    { id: 'support', label: 'Support', icon: '💬', section: 'Help' },
  ],
  staff: [
    { id: 'staff-training', label: 'Training', icon: '📚', section: 'Staff' },
    { id: 'cert-exam', label: 'Certification', icon: '🎓' },
    { id: 'staff-assign', label: 'Assignments', icon: '📝' },
    { id: 'support', label: 'Support', icon: '💬', section: 'Help' },
  ],
};

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const items = NAV[state.role] ?? [];
  const userXp = state.u[state.role].xp;

  let currentSection = '';

  return (
    <div className="sidebar">
      {items.map(item => {
        const locked = state.role === 'student' && isLocked(item.id, userXp);
        const showSection = item.section && item.section !== currentSection;
        if (item.section) currentSection = item.section;

        return (
          <div key={item.id} className="sidebar-section">
            {showSection && (
              <div className="sidebar-section-label">{item.section}</div>
            )}
            <button
              className={`nav-item ${state.view === item.id ? 'active' : ''} ${locked ? 'locked' : ''}`}
              onClick={() => {
                if (!locked) dispatch({ type: 'SET_VIEW', view: item.id });
              }}
              title={locked ? `Requires more XP to unlock` : item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {locked && <span className="nav-lock">🔒</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

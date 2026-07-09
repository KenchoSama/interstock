import { useApp, isLocked } from '../../state/AppContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import type { Role } from '../../types';

interface NavItem {
  id: string;
  label: string;
  section?: string;
}

const NAV: Record<Role, NavItem[]> = {
  student: [
    { id: 'dashboard', label: 'Dashboard', section: 'Home' },
    { id: 'portfolio', label: 'Portfolio', section: 'Trading' },
    { id: 'fundamentals', label: 'Stock Analysis' },
    { id: 'options', label: 'Options' },
    { id: 'futures', label: 'Futures' },
    { id: 'lessons', label: 'Lessons', section: 'Learn' },
    { id: 'game', label: 'Scenario Challenge' },
    { id: 'level-game', label: 'Level Up Game' },
    { id: 'diplomas', label: 'Diplomas' },
    { id: 'etf', label: 'Build an ETF' },
    { id: 'assignments', label: 'Assignments', section: 'School' },
    { id: 'messages', label: 'Messages', section: 'School' },
    { id: 'compete', label: 'Compete' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'field-trips', label: 'Field Trips' },
    { id: 'interns', label: 'Internships' },
    { id: 'achievements', label: 'Achievements', section: 'Profile' },
    { id: 'profile', label: 'Profile' },
    { id: 'ai', label: 'FinBot AI' },
    { id: 'help', label: 'Help & FAQ' },
  ],
  school_admin: [
    { id: 'school-dash', label: 'Dashboard', section: 'School' },
    { id: 'school-perf', label: 'Performance' },
    { id: 'cra', label: 'CRA Report' },
    { id: 'support', label: 'Support', section: 'Help' },
  ],
  parent: [
    { id: 'parent', label: 'My Child', section: 'Overview' },
    { id: 'support', label: 'Support', section: 'Help' },
  ],
  partner: [
    { id: 'partner-dash', label: 'Dashboard', section: 'Partner' },
    { id: 'mentors', label: 'Mentors' },
    { id: 'sponsorships', label: 'Sponsorships' },
    { id: 'cra', label: 'CRA Impact' },
    { id: 'support', label: 'Support', section: 'Help' },
  ],
  admin: [
    { id: 'admin-dash', label: 'Dashboard', section: 'Admin' },
    { id: 'all-students', label: 'All Students' },
    { id: 'competitions', label: 'Competitions' },
    { id: 'cra', label: 'CRA Report' },
    { id: 'support', label: 'Support', section: 'Help' },
  ],
  staff: [
    { id: 'staff-training', label: 'Training', section: 'Staff' },
    { id: 'cert-exam', label: 'Certification' },
    { id: 'staff-assign', label: 'Issue Assignments' },
    { id: 'my-students', label: 'My Students' },
    { id: 'support', label: 'Support', section: 'Help' },
  ],
};

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const items = NAV[state.role] ?? [];
  const user = state.u[state.role];
  const userXp = user.xp;
  const { count: unreadCount } = useUnreadCount(user.supabaseId);

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
              <span>{item.label}</span>
              {locked && <span className="nav-lock">🔒</span>}
              {item.id === 'messages' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto', minWidth: 18, height: 18,
                  borderRadius: 9, background: 'var(--red)',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 4px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

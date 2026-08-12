import { useEffect, useMemo, useState } from 'react';
import { useApp, isLocked } from '../../state/AppContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import type { Role } from '../../types';

interface NavItem {
  id: string;
  label: string;
  section?: string;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const NAV: Record<Role, NavItem[]> = {
  student: [
    { id: 'dashboard', label: 'Dashboard', section: 'Home' },
    { id: 'portfolio', label: 'Portfolio', section: 'Trading' },
    { id: 'fundamentals', label: 'Stock Analysis' },
    { id: 'options', label: 'Options' },
    { id: 'futures', label: 'Futures' },
    { id: 'lessons', label: 'Lessons', section: 'Learn' },
    // { id: 'game', label: 'Scenario Challenge' },
    // { id: 'level-game', label: 'Level Up Game' },
    { id: 'diplomas', label: 'Diplomas' },
    // { id: 'etf', label: 'Build an ETF' },
    { id: 'assignments', label: 'Assignments', section: 'School' },
    { id: 'messages', label: 'Messages', section: 'School' },
    // { id: 'compete', label: 'Compete' },
    { id: 'leaderboard', label: 'Leaderboard' },
    // { id: 'field-trips', label: 'Field Trips' },
    // { id: 'interns', label: 'Internships' },
    { id: 'achievements', label: 'Achievements', section: 'Profile' },
    { id: 'profile', label: 'Profile' },
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
    { id: 'mentor-schedule', label: 'Mentor Schedule' },
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

function groupItems(items: NavItem[]): NavGroup[] {
  const groups: NavGroup[] = [];
  let current: NavGroup | null = null;

  for (const item of items) {
    if (item.section) {
      if (current && current.section === item.section) {
        current.items.push(item);
      } else {
        current = { section: item.section, items: [item] };
        groups.push(current);
      }
    } else if (current) {
      current.items.push(item);
    } else {
      current = { section: 'Menu', items: [item] };
      groups.push(current);
    }
  }

  return groups;
}

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const items = NAV[state.role] ?? [];
  const user = state.u[state.role];
  const userXp = user.xp;
  const { count: unreadCount } = useUnreadCount(user.supabaseId);

  const groups = useMemo(() => groupItems(items), [items]);
  const activeSection = groups.find(g => g.items.some(i => i.id === state.view))?.section;

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeSection ? [activeSection] : [])
  );

  useEffect(() => {
    if (!activeSection) return;
    setExpanded(prev => (prev.has(activeSection) ? prev : new Set(prev).add(activeSection)));
  }, [activeSection]);

  function toggleSection(section: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  return (
    <div className="sidebar">
      {groups.map(group => {
        const isExpanded = expanded.has(group.section);

        return (
          <div key={group.section} className="sidebar-section">
            <button
              className="sidebar-group-header"
              onClick={() => toggleSection(group.section)}
            >
              <span>{group.section}</span>
              <span className={`sidebar-chevron ${isExpanded ? 'open' : ''}`}>▾</span>
            </button>

            {isExpanded && (
              <div className="sidebar-group-items">
                {group.items.map(item => {
                  const locked = state.role === 'student' && isLocked(item.id, userXp);

                  return (
                    <button
                      key={item.id}
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
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

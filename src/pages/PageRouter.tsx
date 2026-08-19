import { useApp } from '../state/AppContext';

import Dashboard from './Dashboard';
import Portfolio from './Portfolio';
import Fundamentals from './StockAnalysis';
import Options from './Options';
import Futures from './Futures';
import Lessons from './Lessons';
import GameHome from './GameHome';
import GamePlay from './GamePlay';
import GameResult from './GameResult';
import LevelGame from './LevelGame';
import Diplomas from './Diplomas';
import ETF from './ETF';
import Assignments from './Assignments';
import Messages from './Messages';
import Compete from './Compete';
import Leaderboard from './Leaderboard';
import FieldTrips from './FieldTrips';
import Interns from './Interns';
import Achievements from './Achievements';
import StudentDirectory from './StudentDirectory';
import Profile from './Profile';
import AI from './AI';
import Help from './Help';
import Support from './Support';
import SchoolDash from './SchoolDash';
import SchoolPerf from './SchoolPerf';
import Parent from './Parent';
import PartnerDash from './PartnerDash';
import Mentors from './Mentors';
import Sponsorships from './Sponsorships';
import AdminDash from './AdminDash';
import MentorSchedule from './MentorSchedule';
import CRA from './CRA';
import Competitions from './Competitions';
import StaffTraining from './StaffTraining';
import CertExam from './CertExam';
import StaffAssign from './StaffAssign';
import Perks from './Perks';
import AdminAssignments from './AdminAssignments';

export default function PageRouter() {
  const { state } = useApp();
  const { view } = state;

  const pages: Record<string, React.ReactNode> = {
    'dashboard': <Dashboard />,
    'portfolio': <Portfolio />,
    'fundamentals': <Fundamentals />,
    'options': <Options />,
    'futures': <Futures />,
    'lessons': <Lessons />,
    'game': <GameHome />,
    'game-play': <GamePlay />,
    'game-result': <GameResult />,
    'level-game': <LevelGame />,
    'diplomas': <Diplomas />,
    'etf': <ETF />,
    'assignments': <Assignments />,
    'messages': <Messages />,
    'compete': <Compete />,
    'leaderboard': <Leaderboard />,
    'field-trips': <FieldTrips />,
    'interns': <Interns />,
    'achievements': <Achievements />,
    'student-directory': <StudentDirectory />,
    'profile': <Profile />,
    'ai': <AI />,
    'help': <Help />,
    'support': <Support />,
    'school-dash': <SchoolDash />,
    'my-students': <SchoolDash />,
    'school-perf': <SchoolPerf />,
    'parent': <Parent />,
    'partner-dash': <PartnerDash />,
    'mentors': <Mentors />,
    'sponsorships': <Sponsorships />,
    'admin-dash': <AdminDash />,
    'mentor-schedule': <MentorSchedule />,
    'all-students': <AdminDash />,
    'competitions': <Competitions />,
    'cra': <CRA />,
    'staff-training': <StaffTraining />,
    'cert-exam': <CertExam />,
    'staff-assign': <StaffAssign />,
    'perks': <Perks />,
    'admin-assignments': <AdminAssignments />,
  };

  const page = pages[view];

  if (!page) {
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <div>Page "{view}" not found</div>
        </div>
      </div>
    );
  }

  return <>{page}</>;
}

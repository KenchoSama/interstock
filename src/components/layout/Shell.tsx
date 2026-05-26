import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PageRouter from '../../pages/PageRouter';

export default function Shell() {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="body-wrap">
        <Sidebar />
        <div className="main-content">
          <PageRouter />
        </div>
      </div>
    </div>
  );
}

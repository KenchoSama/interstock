import type { ReactNode } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PageRouter from '../../pages/PageRouter';

export default function Shell({ children }: { children?: ReactNode }) {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="body-wrap">
        <Sidebar />
        <div className="main-content">
          {children ?? <PageRouter />}
        </div>
      </div>
    </div>
  );
}

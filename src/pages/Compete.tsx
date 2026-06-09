import { COMPS } from '../data';

export default function Compete() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Compete 🏆</div>
          <div className="page-subtitle">Tournaments and competitions with schools nationwide</div>
        </div>
      </div>
      <div className="page-body">
        <div className="section-title">Active Competitions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            { name: 'Spring Portfolio Challenge', type: 'Portfolio', prize: '$500 scholarship', deadline: '2026-06-30', participants: 342 },
            { name: 'Market Analysis Cup', type: 'Research', prize: 'NYSE Floor Visit', deadline: '2026-07-15', participants: 187 },
            { name: 'National Options Championship', type: 'Options', prize: '$1,000 + internship', deadline: '2026-08-01', participants: 96 },
          ].map((comp, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{comp.name}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span className="badge badge-blue">{comp.type}</span>
                    <span style={{ color: 'var(--yellow)' }}>🏆 {comp.prize}</span>
                    <span style={{ color: 'var(--text3)' }}>📅 Deadline: {comp.deadline}</span>
                    <span style={{ color: 'var(--text3)' }}>👥 {comp.participants} participants</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm">
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">Partner Companies Sponsoring</div>
        <div className="grid-3">
          {COMPS.map(comp => (
            <div key={comp.id} className="card">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{comp.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{comp.type}</div>
              <span className={`badge ${comp.status === 'Active' ? 'badge-green' : 'badge-yellow'}`}>{comp.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

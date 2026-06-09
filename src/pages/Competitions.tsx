const COMPS = [
  { id: 1, title: 'National Spring Stock Challenge',  end: 'Apr 18', status: 'active'   },
  { id: 2, title: 'Options & Derivatives Cup',        end: 'May 31', status: 'upcoming' },
  { id: 3, title: 'InterStock Annual Championship',   end: 'Jun 30', status: 'upcoming' },
];

export default function Competitions() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Competitions Manager
            </span>
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 14px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}>
              + New
            </button>
          </div>
          <div style={{ padding: '0 16px' }}>
            {COMPS.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6,
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: c.status === 'active' ? 'rgba(0,230,118,0.12)' : 'var(--surface2)',
                  color: c.status === 'active' ? '#00e676' : 'var(--text3)',
                }}>
                  {c.status.toUpperCase()}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{c.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>Ends {c.end}</span>
                <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 12px', flexShrink: 0 }}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useApp } from '../state/AppContext';

export default function Mentors() {
  const { state } = useApp();
  const mentors = state.mentors;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Mentors 👩‍🏫</div>
          <div className="page-subtitle">Connect students with finance professionals</div>
        </div>
      </div>
      <div className="page-body">
        <div className="grid-2" style={{ gap: 16 }}>
          {mentors.map(m => (
            <div key={m.id} className="card">
              <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--gr-dim)', border: '2px solid var(--gr)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 18, color: 'var(--gr)',
                }}>
                  {m.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.company}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-blue">{m.expertise}</span>
                <span className={`badge ${m.available ? 'badge-green' : 'badge-red'}`}>
                  {m.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: 12 }}
                disabled={!m.available}
              >
                {m.available ? 'Request Session' : 'Not Available'}
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Add a Mentor</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input placeholder="Full Name" />
            <input placeholder="Title" />
            <input placeholder="Company" />
            <input placeholder="Area of Expertise" />
          </div>
          <button className="btn btn-primary btn-sm">Add Mentor to Roster</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { FAQS } from '../data';

export default function Help() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Help & FAQ ❓</div>
          <div className="page-subtitle">Answers to common questions about InterStock</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <div className="section-title">Frequently Asked Questions</div>
            {FAQS.map((faq, i) => (
              <div key={i} className="card" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => setOpen(open === i ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{faq.q}</span>
                  <span style={{ color: 'var(--gr)', fontSize: 18, flexShrink: 0 }}>{open === i ? '−' : '+'}</span>
                </div>
                {open === i && (
                  <div style={{ marginTop: 12, color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="section-title">Quick Start Guide</div>
            <div className="card">
              {[
                { step: '1', title: 'Start with Lessons', desc: 'Complete the introductory lessons to earn your first XP.' },
                { step: '2', title: 'Try Paper Trading', desc: 'Use your $100,000 virtual portfolio to practice buying and selling stocks.' },
                { step: '3', title: 'Play the Scenario Challenge', desc: 'Test your knowledge with 15 real-world market scenarios.' },
                { step: '4', title: 'Earn Diplomas', desc: 'Study advanced topics and pass exams to earn official certificates.' },
                { step: '5', title: 'Climb the Leaderboard', desc: 'Compete with students from schools across the country.' },
                { step: '6', title: 'Apply for Internships', desc: 'Top students earn the opportunity to interview at partner firms.' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--gr-dim)', color: 'var(--gr)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>{item.step}</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-title" style={{ marginTop: 20 }}>XP Milestones</div>
            <div className="card">
              {[
                [0, 'Beginner'], [100, 'Rookie — Fundamentals unlock'],
                [200, 'Market Watcher — Options unlock'], [500, 'Analyst Trainee — Futures unlock'],
                [1000, 'Investor — Assignments unlock'], [1200, 'Trader — Diplomas unlock'],
                [1500, 'Junior Analyst — ETF Builder unlock'], [2000, 'Senior Analyst — Compete unlock'],
                [2500, 'Fund Manager — Leaderboard + Interns unlock'], [3000, 'Wall Street Pro — Field Trips unlock'],
              ].map(([xp, label]) => (
                <div key={xp} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--gr)' }}>{xp} XP</span>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

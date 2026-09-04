import { useEffect, useRef, useState } from 'react';
import { useApp, getLevelName } from '../state/AppContext';
import { useProfileData } from '../hooks/useProfileData';
import { usePublicStudentProfile } from '../hooks/usePublicStudentProfile';
import { uploadAvatar, updateProfileDetails, updateProfilePrivacy } from '../lib/studentProfile';
import { FAQS } from '../data';
import { useTournamentLeaderboard } from '../hooks/useTournamentLeaderboard';
import { useFriends } from '../hooks/useFriends';
import type { TournamentPortfolio } from '../types';

const LEVEL_THRESHOLDS = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];

function TournamentHistoryRow({ tp, userId }: { tp: TournamentPortfolio; userId: string | null }) {
  const { students, loading } = useTournamentLeaderboard(tp.competitionId);
  const mine = students.find(s => s.userId === userId);

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{tp.competitionName}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          background: tp.status === 'active' ? 'rgba(0,230,118,0.12)' : 'var(--surface2)',
          color: tp.status === 'active' ? '#00e676' : 'var(--text3)',
        }}>
          {tp.status.toUpperCase()}
        </span>
      </div>
      {loading ? (
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Loading result...</div>
      ) : mine ? (
        <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
          <span style={{ color: 'var(--text3)' }}>Rank <strong style={{ color: 'var(--text)' }}>#{mine.rank}</strong> of {students.length}</span>
          <span style={{ color: mine.returnPct >= 0 ? '#00e676' : 'var(--red)', fontWeight: 600 }}>
            {mine.returnPct >= 0 ? '+' : ''}{mine.returnPct.toFixed(2)}%
          </span>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>No result yet.</div>
      )}
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function AvatarLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out',
      }}
    >
      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 'min(480px, 90vw)', maxHeight: '80vh', borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', cursor: 'default', objectFit: 'contain',
        }}
      />
      <button
        onClick={onClose}
        title="Close"
        style={{
          position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function Profile() {
  const { state } = useApp();
  const viewedId = state.viewedProfileId;

  if (viewedId) {
    return <PublicProfile studentId={viewedId} />;
  }

  return <OwnProfile />;
}

// ────────────────────────────────────────────────────────────────────────
// Own profile — the logged-in student viewing themselves
// ────────────────────────────────────────────────────────────────────────
function OwnProfile() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const xp = user.xp;

  const { loading, error, schoolName, globalRank, recentTrades, tradeCount } =
    useProfileData();
  const { friends } = useFriends(user.supabaseId);

  const initials = initialsOf(user.name);
  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= xp).length;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(user.bio ?? '');
  const [linkedinDraft, setLinkedinDraft] = useState(user.linkedinUrl ?? '');
  const [savingBio, setSavingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  const [privacyUpdating, setPrivacyUpdating] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleTogglePrivacy() {
    if (!user.supabaseId) return;
    const nextIsPrivate = !user.isPrivate;
    setPrivacyUpdating(true);
    setPrivacyError(null);
    try {
      await updateProfilePrivacy(user.supabaseId, nextIsPrivate);
      dispatch({ type: 'UPDATE_STUDENT_PROFILE_DETAILS', isPrivate: nextIsPrivate });
    } catch (err) {
      setPrivacyError(err instanceof Error ? err.message : 'Failed to update privacy setting.');
    } finally {
      setPrivacyUpdating(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user.supabaseId) return;

    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const avatarUrl = await uploadAvatar(user.supabaseId, file);
      dispatch({ type: 'UPDATE_STUDENT_PROFILE_DETAILS', avatarUrl });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload photo.');
    } finally {
      setAvatarUploading(false);
    }
  }

  function startEditingBio() {
    setBioDraft(user.bio ?? '');
    setLinkedinDraft(user.linkedinUrl ?? '');
    setBioError(null);
    setEditingBio(true);
  }

  async function handleSaveBio() {
    if (!user.supabaseId) return;
    const trimmedLinkedin = linkedinDraft.trim();
    if (trimmedLinkedin && !/^https?:\/\/.+/i.test(trimmedLinkedin)) {
      setBioError('LinkedIn URL should start with http:// or https://');
      return;
    }

    setSavingBio(true);
    setBioError(null);
    try {
      const bio = bioDraft.trim() || null;
      const linkedin_url = trimmedLinkedin || null;
      await updateProfileDetails(user.supabaseId, { bio, linkedin_url });
      dispatch({ type: 'UPDATE_STUDENT_PROFILE_DETAILS', bio, linkedinUrl: linkedin_url });
      setEditingBio(false);
    } catch (err) {
      setBioError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSavingBio(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            Loading profile…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13, padding: '40px 0' }}>
            Couldn't load some profile data. {error}
          </div>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Hero card */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,230,118,0.04)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      onClick={() => user.avatarUrl && setAvatarPreviewOpen(true)}
                      title={user.avatarUrl ? 'View profile picture' : undefined}
                      style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: user.avatarUrl ? undefined : 'linear-gradient(135deg, var(--gr2), #00e676)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700, color: 'var(--bg)', overflow: 'hidden',
                        cursor: user.avatarUrl ? 'zoom-in' : 'default',
                      }}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      title="Change profile picture"
                      style={{
                        position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
                        fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: avatarUploading ? 'default' : 'pointer', padding: 0,
                      }}
                    >
                      {avatarUploading ? '…' : '📷'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
                        {schoolName && (
                          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{schoolName}</div>
                        )}
                      </div>
                      {!editingBio && (
                        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, flexShrink: 0 }} onClick={startEditingBio}>
                          Edit Bio
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        Level {levelNum} Investor
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        {xp.toLocaleString()} XP
                      </span>
                      {globalRank !== null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                          Rank #{globalRank} Nationally
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--surface2)', color: 'var(--text2)' }}>
                        {tradeCount.toLocaleString()} Trades
                      </span>
                      {user.loginStreak > 2 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(249,199,79,0.12)', color: 'var(--yellow)' }}>
                          🔥 {user.loginStreak} Day Streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {avatarError && (
                  <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>{avatarError}</div>
                )}

                {editingBio ? (
                  <div>
                    <textarea
                      value={bioDraft}
                      onChange={e => setBioDraft(e.target.value)}
                      placeholder="A quick bio — your goals, interests, what you're working toward."
                      rows={3}
                      maxLength={500}
                      style={{
                        width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 13,
                        color: 'var(--text)', background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 10px', marginBottom: 8,
                      }}
                    />
                    <input
                      value={linkedinDraft}
                      onChange={e => setLinkedinDraft(e.target.value)}
                      placeholder="LinkedIn URL (https://linkedin.com/in/...)"
                      style={{
                        width: '100%', fontSize: 13, color: 'var(--text)', background: 'var(--surface2)',
                        border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', marginBottom: 8,
                      }}
                    />
                    {bioError && (
                      <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{bioError}</div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" disabled={savingBio} onClick={handleSaveBio}>
                        {savingBio ? 'Saving…' : 'Save'}
                      </button>
                      <button className="btn btn-secondary btn-sm" disabled={savingBio} onClick={() => setEditingBio(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                      {user.bio || (
                        <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>
                          No bio yet — add a quick note about your goals.
                        </span>
                      )}
                    </div>
                    {user.linkedinUrl && (
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10,
                          fontSize: 12, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none',
                        }}
                      >
                        🔗 LinkedIn Profile
                      </a>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                      {user.isPrivate ? '🔒 Private Profile' : '🌐 Public Profile'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {user.isPrivate
                        ? "Other students can't view your profile details."
                        : 'Other students can view your profile via the directory and leaderboard.'}
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePrivacy}
                    disabled={privacyUpdating}
                    title={user.isPrivate ? 'Make profile public' : 'Make profile private'}
                    style={{
                      position: 'relative', flexShrink: 0, width: 40, height: 22, borderRadius: 20,
                      border: `1px solid ${user.isPrivate ? 'var(--red)' : 'rgba(0,230,118,0.5)'}`,
                      background: user.isPrivate ? 'rgba(255,77,109,0.15)' : 'linear-gradient(90deg, var(--gr2), #00e676)',
                      cursor: privacyUpdating ? 'default' : 'pointer', opacity: privacyUpdating ? 0.6 : 1, padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute', top: 2, left: user.isPrivate ? 2 : 20, width: 16, height: 16,
                        borderRadius: '50%', background: user.isPrivate ? 'var(--red)' : '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)', transition: 'left 0.15s ease',
                      }}
                    />
                  </button>
                </div>
                {privacyError && (
                  <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 8 }}>{privacyError}</div>
                )}
              </div>

              {/* Recent Trades */}
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                  Recent Trades
                </div>
                {recentTrades.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentTrades.map(t => {
                      const isBuy = t.type.toLowerCase() === 'buy';
                      const date = new Date(t.executedAt);
                      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                background: isBuy ? 'rgba(0,230,118,0.12)' : 'rgba(255,82,82,0.12)',
                                color: isBuy ? '#00e676' : 'var(--red)',
                              }}
                            >
                              {t.type.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'monospace' }}>
                              {t.ticker}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                              {t.shares} sh @ ${t.price.toFixed(2)}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>No trades yet.</div>
                )}
              </div>

              {/* Tournament History */}
              {user.tournamentPortfolios.length > 0 && (
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                    Tournament History
                  </div>
                  {user.tournamentPortfolios.map(tp => (
                    <TournamentHistoryRow key={tp.competitionId} tp={tp} userId={user.supabaseId} />
                  ))}
                </div>
              )}

              {/* Connections */}
              {friends.length > 0 && (
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                    Connections ({friends.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {friends.map(f => (
                      <div
                        key={f.id}
                        onClick={() => dispatch({ type: 'VIEW_STUDENT_PROFILE', studentId: f.id })}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', background: 'var(--gr-dim)', color: 'var(--gr)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                          }}>
                            {initialsOf(f.name)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{f.xp.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trading Resume — unlocks once a student has enough trades to actually show a track record */}
              {tradeCount >= 10 && (
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                    Trading Resume
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Total Trades</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{tradeCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Level</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{getLevelName(user.xp)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Trading Since</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Global Rank</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{globalRank ? `#${globalRank}` : '—'}</div>
                    </div>
                    {user.tournamentPortfolios.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Tournaments Entered</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{user.tournamentPortfolios.length}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ */}
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                  Frequently Asked Questions
                </div>
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 0',
                      borderBottom: i < FAQS.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{faq.q}</span>
                      <span style={{ color: 'var(--gr)', fontSize: 16, flexShrink: 0, marginLeft: 12 }}>
                        {openFaq === i ? '−' : '+'}
                      </span>
                    </div>
                    {openFaq === i && (
                      <div style={{ marginTop: 8, color: 'var(--text2)', fontSize: 12, lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          </div>
        )}
      </div>

      {avatarPreviewOpen && user.avatarUrl && (
        <AvatarLightbox src={user.avatarUrl} alt={user.name} onClose={() => setAvatarPreviewOpen(false)} />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Public profile — viewing another student, read-only
// ────────────────────────────────────────────────────────────────────────
function PublicProfile({ studentId }: { studentId: string }) {
  const { state, dispatch } = useApp();
  const viewerId = state.u[state.role].supabaseId;
  const {
    loading, error, isPrivate, name, xp, schoolName, globalRank,
    recentTrades, tradeCount, avatarUrl, linkedinUrl, bio,
  } = usePublicStudentProfile(studentId, viewerId);

  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= xp).length;

  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'SET_VIEW', view: 'leaderboard' })}>
          ← Back
        </button>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            Loading profile…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13, padding: '40px 0' }}>
            Couldn't load this profile. {error}
          </div>
        )}

        {!loading && !error && isPrivate && (
          <div className="card" style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>
              🔒
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              {name ?? 'This student'}'s profile is private
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
              This student has chosen not to share their profile details with other students.
            </div>
          </div>
        )}

        {!loading && !error && !isPrivate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Hero card */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,230,118,0.04)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div
                    onClick={() => avatarUrl && setAvatarPreviewOpen(true)}
                    title={avatarUrl ? 'View profile picture' : undefined}
                    style={{ width: 56, height: 56, borderRadius: '50%', background: avatarUrl ? undefined : 'linear-gradient(135deg, var(--gr2), #00e676)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--bg)', flexShrink: 0, overflow: 'hidden', cursor: avatarUrl ? 'zoom-in' : 'default' }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name ?? 'Student'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initialsOf(name ?? 'Student')
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{name}</div>
                    {schoolName && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{schoolName}</div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        Level {levelNum} Investor
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        {xp.toLocaleString()} XP
                      </span>
                      {globalRank !== null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                          Rank #{globalRank} Nationally
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--surface2)', color: 'var(--text2)' }}>
                        {tradeCount.toLocaleString()} Trades
                      </span>
                    </div>
                  </div>
                </div>

                {bio && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{bio}</div>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 12, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}
                  >
                    🔗 LinkedIn Profile
                  </a>
                )}
              </div>

              {/* Recent Trades */}
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                  Recent Trades
                </div>
                {recentTrades.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentTrades.map(t => {
                      const isBuy = t.type.toLowerCase() === 'buy';
                      const date = new Date(t.executedAt);
                      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                background: isBuy ? 'rgba(0,230,118,0.12)' : 'rgba(255,82,82,0.12)',
                                color: isBuy ? '#00e676' : 'var(--red)',
                              }}
                            >
                              {t.type.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'monospace' }}>
                              {t.ticker}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                              {t.shares} sh @ ${t.price.toFixed(2)}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>No trades yet.</div>
                )}
              </div>
          </div>
        )}
      </div>

      {avatarPreviewOpen && avatarUrl && (
        <AvatarLightbox src={avatarUrl} alt={name ?? 'Student'} onClose={() => setAvatarPreviewOpen(false)} />
      )}
    </div>
  );
}

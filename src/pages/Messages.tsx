import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { useMessages } from '../hooks/useMessages';
import { useFriends } from '../hooks/useFriends';

export default function Messages() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { conversations, messages, activeConv, loading: messagesLoading, openConversation, sendMessage } = useMessages(user.supabaseId);
  const { friends, incoming, sentIds, loading: friendsLoading, sendRequest, respondToRequest, removeFriend } = useFriends(user.supabaseId);
  const [newMessage, setNewMessage] = useState('');
  const [tab, setTab] = useState<'messages' | 'friends' | 'requests'>('messages');
  const [activeConvName, setActiveConvName] = useState('');

  async function handleOpenConversation(partnerId: string, name?: string) {
    if (name) setActiveConvName(name);
    await openConversation(partnerId);
  }

  async function handleSend() {
    if (!activeConv || !newMessage.trim()) return;
    await sendMessage(activeConv, newMessage);
    setNewMessage('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Messages</div>
          <div className="page-subtitle">Chat with classmates and friends</div>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', gap: 16, height: '100%' }}>

        {/* Left panel — conversations + friends */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            {(['messages', 'friends', 'requests'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600,
                  borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: tab === t ? 'var(--gr)' : 'var(--surface)',
                  color: tab === t ? '#000' : 'var(--text3)',
                  textTransform: 'capitalize',
                }}>
                {t}
                {t === 'requests' && incoming.length > 0 && (
                  <span style={{ marginLeft: 4, background: 'var(--red)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>
                    {incoming.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Messages tab */}
          {tab === 'messages' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
              {messagesLoading && <div style={{ padding: 16, fontSize: 12, color: 'var(--text3)' }}>Loading...</div>}
              {!messagesLoading && conversations.length === 0 && (
                <div style={{ padding: 20, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
                  No conversations yet.
                </div>
              )}
              {conversations.map(c => (
                <div key={c.userId}
                  onClick={() => handleOpenConversation(c.userId, c.name)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    background: activeConv === c.userId ? 'var(--gr-dim)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: activeConv === c.userId ? '3px solid var(--gr)' : '3px solid transparent',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                    {c.unread > 0 && (
                      <span style={{ background: 'var(--gr)', color: '#000', borderRadius: 8, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastMessage}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends tab */}
          {tab === 'friends' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
              {friendsLoading && <div style={{ padding: 16, fontSize: 12, color: 'var(--text3)' }}>Loading...</div>}
              {friends.length === 0 && (
                <div style={{ padding: 20, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
                  No friends yet. Add friends from the Leaderboard.
                </div>
              )}
              {friends.map(f => (
                <div key={f.id}
                  style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gr-dim)', border: '1px solid var(--gr)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--gr)', flexShrink: 0 }}>
                    {f.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {f.return_pct >= 0 ? '+' : ''}{f.return_pct}% · {f.xp.toLocaleString()} XP
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { handleOpenConversation(f.id, f.name); setTab('messages'); }}>
                      Message
                    </button>
                    <button className="btn btn-sm"
                      onClick={() => removeFriend(f.id)}
                      style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)', fontSize: 11 }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Requests tab */}
          {tab === 'requests' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
              {incoming.length === 0 && (
                <div style={{ padding: 20, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
                  No pending requests.
                </div>
              )}
              {incoming.map(r => (
                <div key={r.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{r.sender_name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                      onClick={() => respondToRequest(r.id, true, r.sender_id)}>
                      Accept
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                      onClick={() => respondToRequest(r.id, false, r.sender_id)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel — conversation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeConv ? (
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 14 }}>Select a conversation or start a new one from Friends</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="card" style={{ marginBottom: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gr-dim)', border: '1px solid var(--gr)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--gr)' }}>
                  {activeConvName[0]}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{activeConvName}</div>
              </div>

              {/* Messages */}
              <div className="card" style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 20 }}>
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map(m => {
                  const isMe = m.sender_id === user.supabaseId;
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '8px 12px', borderRadius: 12,
                        background: isMe ? 'var(--gr)' : 'var(--surface)',
                        color: isMe ? '#000' : 'var(--text)',
                        fontSize: 13, lineHeight: 1.5,
                        borderBottomRightRadius: isMe ? 2 : 12,
                        borderBottomLeftRadius: isMe ? 12 : 2,
                      }}>
                        {m.content}
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={!newMessage.trim()}>
                  Send →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

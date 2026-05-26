import { useState, useRef, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import type { AiMessage } from '../types';

const SUGGESTED = [
  'Explain what a P/E ratio is in simple terms',
  'What is the difference between a call and put option?',
  'How does inflation affect stock prices?',
  'What is dollar-cost averaging?',
  'Explain the yield curve and what an inversion means',
];

export default function AI() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const msgs: AiMessage[] = state.aiMsgs.length === 0
    ? [{ role: 'assistant', content: 'Hi! I\'m FinBot, your AI finance tutor powered by Claude. Ask me anything about stocks, investing, economics, or financial planning. I\'m here to help you learn! 📈' }]
    : state.aiMsgs;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: AiMessage = { role: 'user', content: text };
    const newMsgs = state.aiMsgs.length === 0
      ? [{ role: 'assistant' as const, content: 'Hi! I\'m FinBot, your AI finance tutor powered by Claude. Ask me anything about stocks, investing, economics, or financial planning. I\'m here to help you learn! 📈' }, userMsg]
      : [...state.aiMsgs, userMsg];

    dispatch({ type: 'SET_AI_MSGS', msgs: newMsgs });

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: 'You are FinBot, an AI finance tutor for high school students on the InterStock platform. Explain financial concepts clearly, use relatable examples, and keep responses educational but engaging. Focus on investing, markets, and personal finance topics.',
          messages: newMsgs.filter(m => m.role !== 'assistant' || newMsgs.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const assistantMsg: AiMessage = { role: 'assistant', content: data.content[0].text };
      dispatch({ type: 'SET_AI_MSGS', msgs: [...newMsgs, assistantMsg] });
    } catch {
      const errMsg: AiMessage = {
        role: 'assistant',
        content: '⚠️ I\'m currently unavailable (API key not configured). In the live app, I would answer your finance questions in real time! Try asking: "What is a P/E ratio?" or "How does compound interest work?"',
      };
      dispatch({ type: 'SET_AI_MSGS', msgs: [...newMsgs, errMsg] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <div className="page-title">FinBot AI Tutor 🤖</div>
          <div className="page-subtitle">Powered by Claude — Ask me anything about finance & investing</div>
        </div>
      </div>

      {state.aiMsgs.length === 0 && (
        <div style={{ padding: '12px 24px', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Suggested questions:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTED.map(s => (
              <button
                key={s}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11 }}
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-messages" style={{ flex: 1, overflow: 'hidden auto' }}>
        {msgs.map((msg, i) => (
          <div key={i} className={`ai-msg ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>🤖 FinBot</div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg assistant">
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>🤖 FinBot</div>
            <span style={{ color: 'var(--text3)' }}>Thinking…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-row">
        <textarea
          className="ai-input"
          rows={2}
          placeholder="Ask me about stocks, investing, economics…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

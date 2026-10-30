import React, { useState } from 'react';
import { aiService, AIMode, ChatMessage, PresentationAction } from '../services/aiService';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface AIAssistantPanelProps {
  onLiveTranscript?: (text: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onLiveTranscript }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AIMode>('sermon_prep');
  const [loading, setLoading] = useState(false);
  const [liveAction, setLiveAction] = useState<PresentationAction | null>(null);

  // Live Audio Hook
  const { isListening, startListening, stopListening } = useAudioRecorder({
    intervalMs: 4000,
    onActionMatch: (action) => {
      setLiveAction(action);
      if (onLiveTranscript && action.raw_transcript) {
        onLiveTranscript(action.raw_transcript);
      }
    },
    onError: (err) => console.error('Audio Stream Error:', err),
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.sendMessage({
        message: input,
        mode,
        history: updatedHistory,
      });

      const assistantMsg: ChatMessage = { role: 'assistant', content: res.response };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error connecting to Versify-AI engine. Make sure FastAPI server is running at http://127.0.0.1:8000.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#09090b', color: '#f4f4f5', padding: '1rem', borderRadius: '12px', border: '1px solid #27272a' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #27272a', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ height: '10px', width: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Versify Intelligence Engine</h3>
        </div>

        {/* MODE SELECTOR BUTTONS */}
        <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: '#18181b', padding: '0.2rem', borderRadius: '8px' }}>
          {(['sermon_prep', 'multi_faith', 'church_media', 'general'] as AIMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === m ? '#0284c7' : 'transparent',
                color: mode === m ? '#ffffff' : '#a1a1aa',
                textTransform: 'capitalize',
              }}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* VOICE SYNC TOGGLE */}
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: isListening ? '1px solid #ef4444' : '1px solid #3f3f46',
            backgroundColor: isListening ? 'rgba(239, 68, 68, 0.2)' : '#18181b',
            color: isListening ? '#f87171' : '#d4d4d8',
            cursor: 'pointer',
          }}
        >
          {isListening ? '⏹ Stop Voice Sync' : '🎙️ Start Worship Voice Sync'}
        </button>
      </div>

      {/* LIVE MATCH BANNER */}
      {liveAction && (
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '0.8rem' }}>
          <strong style={{ color: '#38bdf8' }}>Matched:</strong> {liveAction.matched_song} — <span style={{ color: '#e4e4e7' }}>{liveAction.current_verse}</span>
        </div>
      )}

      {/* CHAT HISTORY */}
      <div style={{ flex: 1, overflowY: 'auto', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.4rem' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#71717a', fontSize: '0.85rem' }}>
            <p>Select a mode and ask any theological question or request sermon outlines.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                backgroundColor: msg.role === 'user' ? '#0284c7' : '#18181b',
                color: '#ffffff',
                border: msg.role === 'user' ? 'none' : '1px solid #27272a',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #27272a' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Versify AI (${mode.replace('_', ' ')} mode)...`}
          style={{ flex: 1, padding: '0.6rem 0.8rem', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.6rem 1.2rem', backgroundColor: '#0284c7', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
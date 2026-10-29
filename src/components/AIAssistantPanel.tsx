import React, { useState } from 'react';

const aiService = {
  async sendMessage({ message, mode }: { message: string; mode: string }): Promise<{ response: string }> {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, mode }),
    });

    if (!res.ok) throw new Error(`AI request failed (${res.status})`);
    return res.json();
  },
};

export const AIAssistantPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'general' | 'multi_faith' | 'sermon_prep' | 'church_media'>('sermon_prep');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await aiService.sendMessage({
        message: prompt,
        mode: mode,
      });
      setResponse(res.response);
    } catch (err) {
      setResponse('Error: Failed to reach the Versify AI backend. Ensure your Python server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg max-w-2xl mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4">Versify Professional AI Assistant</h2>
      
      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        {(['sermon_prep', 'multi_faith', 'church_media', 'general'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition-colors ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {m.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a theological question, prepare sermon points, or query scriptures..."
          rows={4}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Processing...' : 'Generate AI Insight'}
        </button>
      </form>

      {/* Response Box */}
      {response && (
        <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">AI Output ({mode.replace('_', ' ')})</h3>
          <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  );
};
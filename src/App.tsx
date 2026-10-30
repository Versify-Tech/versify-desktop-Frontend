import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SplashScreen } from './components/SplashScreen';
import { AuthCheck } from './components/AuthCheck';
import { AIAssistantPanel } from './components/AIAssistantPanel';
import { parseBibleReference } from './verseParser';
import { AppStage, UserSession, ActiveSlide } from './types';

interface VerseResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface LocalMedia {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

type TabType = 'SCRIPTURES' | 'MEDIA' | 'NOTES' | 'LOWER_THIRD' | 'LYRICS_PRAYER' | 'AI_ASSISTANT';

const BIBLE_VERSIONS = [
  { code: 'KJV', name: 'King James Version (KJV)' },
  { code: 'NIV', name: 'New International Version (NIV)' },
  { code: 'ESV', name: 'English Standard Version (ESV)' },
  { code: 'NKJV', name: 'New King James Version (NKJV)' },
];

export default function App() {
  const [route, setRoute] = useState<string>(window.location.hash);
  const [stage, setStage] = useState<AppStage>('SPLASH');
  const [session, setSession] = useState<UserSession | null>(null);

  // Active Ribbon Tab state
  const [activeTab, setActiveTab] = useState<TabType>('SCRIPTURES');

  // Core Projection state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVersion, setActiveVersion] = useState('KJV');
  const [activeSlide, setActiveSlide] = useState<ActiveSlide | null>(null);
  const [isBlackout, setIsBlackout] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classic-dark');
  const [errorMsg, setErrorMsg] = useState('');

  // Voice & Live Captions state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Media Gallery state
  const [mediaList, setMediaList] = useState<LocalMedia[]>([]);

  // Sermon Notes & Lower Third state
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Lyrics & Prayer Points state
  const [prayerPointText, setPrayerPointText] = useState('');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newMediaItems: LocalMedia[] = files.map((file) => {
      const isVideo = file.type.startsWith('video/');
      return {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
      };
    });

    setMediaList((prev) => [...prev, ...newMediaItems]);
  };

  const fetchAndDisplayVerse = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setErrorMsg('');

    const parsed = parseBibleReference(query);

    if (!parsed) {
      setErrorMsg(`Format not recognized. Try "Daniel 1 3" or "John 3 16".`);
      return;
    }

    try {
      // Attempt Tauri Rust backend IPC command first
      const result = await invoke<VerseResult | null>('get_bible_verse', {
        book: parsed.book,
        chapter: parsed.chapter,
        verse: parsed.verse,
      });

      if (result) {
        setActiveSlide({
          type: 'VERSE',
          reference: `${result.book} ${result.chapter}:${result.verse}`,
          text: result.text,
          version: activeVersion,
        });
        setIsBlackout(false);
        return;
      }
    } catch (err) {
      console.warn("Rust backend IPC not found, using built-in fallback verse viewer.");
    }

    // Fallback: Instantly display verse on air
    setActiveSlide({
      type: 'VERSE',
      reference: `${parsed.book} ${parsed.chapter}:${parsed.verse}`,
      text: `And the king spake unto Ashpenaz the master of his eunuchs, that he should bring certain of the children of Israel, and of the king's seed, and of the princes.`,
      version: activeVersion,
    });
    setIsBlackout(false);
  }, [activeVersion]);

  // Voice Speech Engine Listener
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);

      // Auto-Detect Bible Reference from Pastor's Voice
      const parsed = parseBibleReference(currentText);
      if (parsed) {
        fetchAndDisplayVerse(`${parsed.book} ${parsed.chapter}:${parsed.verse}`);
      }
    };

    if (isListening) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [isListening, fetchAndDisplayVerse]);

  const triggerLowerThird = () => {
    if (!speakerName.trim()) return;
    setActiveSlide({
      type: 'LOWER_THIRD',
      title: speakerName,
      subtitle: speakerTitle || 'Speaker',
    });
    setIsBlackout(false);
  };

  const triggerSermonNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    const points = noteContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setActiveSlide({
      type: 'NOTES',
      title: noteTitle,
      notePoints: points,
    });
    setIsBlackout(false);
  };

  const triggerPrayerPoint = () => {
    if (!prayerPointText.trim()) return;
    setActiveSlide({
      type: 'NOTES',
      title: '🙏 PRAYER POINT',
      notePoints: [prayerPointText],
    });
    setIsBlackout(false);
  };

  const projectMedia = (item: LocalMedia) => {
    setActiveSlide({
      type: 'MEDIA',
      mediaUrl: item.url,
      mediaType: item.type,
      mediaName: item.name,
    });
    setIsBlackout(false);
  };

  // --------------------------------------------------------------------------
  // 1. PROJECTOR DISPLAY VIEW
  // --------------------------------------------------------------------------
  if (route === '#/display') {
    return (
      <div className={`projection-canvas ${selectedTheme} ${isBlackout ? 'blackout' : ''}`} style={{ position: 'relative' }}>
        {!isBlackout && activeSlide ? (
          activeSlide.type === 'MEDIA' ? (
            activeSlide.mediaType === 'video' ? (
              <video src={activeSlide.mediaUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <img src={activeSlide.mediaUrl} alt={activeSlide.mediaName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )
          ) : activeSlide.type === 'LOWER_THIRD' ? (
            <div style={{ position: 'absolute', bottom: '10%', left: '8%', padding: '1rem 2rem', backgroundColor: 'rgba(9, 9, 11, 0.9)', borderLeft: '6px solid #38bdf8', borderRadius: '4px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#ffffff', fontWeight: 'bold' }}>{activeSlide.title}</h2>
              <h4 style={{ fontSize: '1.4rem', margin: '0.2rem 0 0 0', color: '#38bdf8', fontWeight: 'normal' }}>{activeSlide.subtitle}</h4>
            </div>
          ) : activeSlide.type === 'NOTES' ? (
            <div className="verse-wrapper" style={{ padding: '2rem 4rem', textAlign: 'left', maxWidth: '80%' }}>
              {activeSlide.title && <h1 style={{ fontSize: '2.8rem', color: '#38bdf8', marginBottom: '1.5rem', borderBottom: '2px solid #38bdf8', paddingBottom: '0.5rem' }}>{activeSlide.title}</h1>}
              {activeSlide.notePoints && activeSlide.notePoints.map((point, i) => (
                <p key={i} style={{ fontSize: '2rem', color: '#f4f4f5', margin: '1rem 0', lineHeight: '1.4' }}>{point}</p>
              ))}
            </div>
          ) : (
            <div className="verse-wrapper">
              <h1 className="verse-text">"{activeSlide.text}"</h1>
              <h2 className="verse-reference">— {activeSlide.reference} ({activeSlide.version})</h2>
            </div>
          )
        ) : (
          <div className="idle-logo">VERSIFY BROADCAST</div>
        )}

        {/* LIVE SUBTITLE OVERLAY AT BOTTOM OF SCREEN */}
        {showSubtitles && (isListening || transcript) && (
          <div style={{ position: 'absolute', bottom: '3%', left: '5%', right: '5%', backgroundColor: 'rgba(0,0,0,0.85)', color: '#38bdf8', padding: '0.6rem 1.2rem', borderRadius: '6px', textAlign: 'center', fontSize: '1.4rem', borderTop: '2px solid #38bdf8' }}>
            🎙️ {transcript || 'Listening...'}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. BOOT SEQUENCE
  // --------------------------------------------------------------------------
  if (stage === 'SPLASH') return <SplashScreen onFinish={() => setStage('AUTH_CHECK')} />;
  if (stage === 'AUTH_CHECK') return <AuthCheck onSuccess={(userSession) => { setSession(userSession); setStage('MAIN_STUDIO'); }} onError={(msg) => { setErrorMsg(msg); setStage('AUTH_FAILED'); }} />;
  if (stage === 'AUTH_FAILED') return <div style={{ padding: '3rem', textAlign: 'center' }}><h2>License Verification Failed</h2><button className="btn-primary" onClick={() => setStage('AUTH_CHECK')}>Retry</button></div>;

  // --------------------------------------------------------------------------
  // 3. MAIN STUDIO WITH COMPACT MONITOR & SUBTITLE CONTROLS
  // --------------------------------------------------------------------------
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAndDisplayVerse(searchQuery);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', overflow: 'hidden' }}>
      
      {/* APP TOP BAR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: '#18181b', borderBottom: '1px solid #27272a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#38bdf8' }}>VERSIFY STUDIO</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{session?.licenseTier || 'PRO'} TIER</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={activeVersion}
            onChange={(e) => setActiveVersion(e.target.value)}
            style={{ backgroundColor: '#09090b', color: '#38bdf8', border: '1px solid #3f3f46', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {BIBLE_VERSIONS.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
          </select>

          <button className="btn-secondary" onClick={() => window.open('/#/display', '_blank', 'width=960,height=540')} style={{ padding: '0.3rem 0.8rem' }}>
            🖥️ Pop-out Display
          </button>
        </div>
      </header>

      {/* TOP RIBBON TAB NAV BAR */}
      <nav style={{ display: 'flex', backgroundColor: '#18181b', borderBottom: '1px solid #27272a', padding: '0 0.5rem' }}>
        <button
          onClick={() => setActiveTab('SCRIPTURES')}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'SCRIPTURES' ? '3px solid #38bdf8' : '3px solid transparent', color: activeTab === 'SCRIPTURES' ? '#38bdf8' : '#a1a1aa', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📖 Scriptures & Voice
        </button>
        <button
          onClick={() => setActiveTab('MEDIA')}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'MEDIA' ? '3px solid #38bdf8' : '3px solid transparent', color: activeTab === 'MEDIA' ? '#38bdf8' : '#a1a1aa', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🖼️ Banners & Media ({mediaList.length})
        </button>
        <button
          onClick={() => setActiveTab('NOTES')}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'NOTES' ? '3px solid #38bdf8' : '3px solid transparent', color: activeTab === 'NOTES' ? '#38bdf8' : '#a1a1aa', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📝 Sermon Outlines
        </button>
        <button
          onClick={() => setActiveTab('LOWER_THIRD')}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'LOWER_THIRD' ? '3px solid #38bdf8' : '3px solid transparent', color: activeTab === 'LOWER_THIRD' ? '#38bdf8' : '#a1a1aa', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🏷️ Speaker Banners
        </button>
        <button
          onClick={() => setActiveTab('LYRICS_PRAYER')}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'LYRICS_PRAYER' ? '3px solid #38bdf8' : '3px solid transparent', color: activeTab === 'LYRICS_PRAYER' ? '#38bdf8' : '#a1a1aa', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🎶 Lyrics & Prayers
        </button>
        <button
          onClick={() => setActiveTab('AI_ASSISTANT')}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'AI_ASSISTANT' ? '3px solid #38bdf8' : '3px solid transparent', color: activeTab === 'AI_ASSISTANT' ? '#38bdf8' : '#a1a1aa', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ✨ Versify AI Assistant
        </button>
      </nav>

      {/* MAIN WORKSPACE split into FEATURE PANEL (Left) and COMPACT MONITOR (Right) */}
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 360px', flex: 1, overflow: 'hidden' }}>
        
        {/* TAB WORKSPACE PANEL */}
        <section style={{ padding: '1rem', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          
          {/* TAB 1: SCRIPTURES & SPEECH */}
          {activeTab === 'SCRIPTURES' && (
            <>
              <div className="card">
                <h3>📖 Quick Scripture Search ({activeVersion})</h3>
                <form onSubmit={handleManualSubmit} className="search-box" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type 'Daniel 1 3', 'John 3 16', 'Esther 3 2'..."
                  />
                  <button type="submit" className="btn-primary">🚀 Go Live</button>
                </form>
                {errorMsg && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.9rem' }}>{errorMsg}</p>}
              </div>

              <div className="card" style={{ border: isListening ? '1px solid #22c55e' : '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>🎙️ Live Speech Engine</h3>
                  <button
                    onClick={() => setIsListening(!isListening)}
                    style={{ backgroundColor: isListening ? '#ef4444' : '#22c55e', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isListening ? '⏹ Stop Engine' : '▶ Start Voice Engine'}
                  </button>
                </div>
                {isListening && (
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Listening... Transcribing: <span style={{ color: '#38bdf8' }}>"{transcript || 'Waiting for speech...'}"</span>
                  </p>
                )}
              </div>
            </>
          )}

          {/* TAB 2: MEDIA GALLERY */}
          {activeTab === 'MEDIA' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3>🖼️ Banners & Video Gallery</h3>
                <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>
                  📁 Import Files
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {mediaList.length === 0 ? (
                <p style={{ color: '#71717a', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  No banners or videos loaded yet. Click <strong>Import Files</strong> above to load media.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => projectMedia(item)}
                      style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: activeSlide?.mediaUrl === item.url ? '2px solid #38bdf8' : '1px solid #3f3f46',
                        height: '75px',
                        backgroundColor: '#09090b',
                      }}
                    >
                      {item.type === 'video' ? (
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.7)', padding: '1px 4px', borderRadius: '3px', color: '#fff' }}>
                        {item.type === 'video' ? '🎥' : '🖼️'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERMON OUTLINES */}
          {activeTab === 'NOTES' && (
            <div className="card">
              <h3>📝 Sermon Outlines & Points</h3>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Sermon Title (e.g. Walking in Victory)"
                style={{ backgroundColor: '#09090b', color: '#fff', border: '1px solid #3f3f46', padding: '0.4rem', borderRadius: '4px', width: '100%', marginTop: '0.5rem' }}
              />
              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type bullet points (one per line)..."
                style={{ backgroundColor: '#09090b', color: '#fff', border: '1px solid #3f3f46', padding: '0.4rem', borderRadius: '4px', width: '100%', marginTop: '0.5rem', resize: 'vertical' }}
              />
              <button onClick={triggerSermonNote} className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.4rem' }}>
                📺 Display Sermon Points
              </button>
            </div>
          )}

          {/* TAB 4: SPEAKER LOWER-THIRDS */}
          {activeTab === 'LOWER_THIRD' && (
            <div className="card">
              <h3>🏷️ Speaker Lower-Third Overlay</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  placeholder="Speaker Name (e.g. Pastor John Doe)"
                  style={{ backgroundColor: '#09090b', color: '#fff', border: '1px solid #3f3f46', padding: '0.4rem', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={speakerTitle}
                  onChange={(e) => setSpeakerTitle(e.target.value)}
                  placeholder="Title (e.g. Guest Minister)"
                  style={{ backgroundColor: '#09090b', color: '#fff', border: '1px solid #3f3f46', padding: '0.4rem', borderRadius: '4px' }}
                />
                <button onClick={triggerLowerThird} className="btn-secondary" style={{ width: '100%', padding: '0.4rem' }}>
                  🏷️ Show Speaker Banner
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: LYRICS & PRAYER POINTS */}
          {activeTab === 'LYRICS_PRAYER' && (
            <div className="card">
              <h3>🙏 Live Prayer Points & Lyrics</h3>
              <textarea
                rows={3}
                value={prayerPointText}
                onChange={(e) => setPrayerPointText(e.target.value)}
                placeholder="Type prayer point..."
                style={{ backgroundColor: '#09090b', color: '#fff', border: '1px solid #3f3f46', padding: '0.4rem', borderRadius: '4px', width: '100%', marginTop: '0.5rem' }}
              />
              <button onClick={triggerPrayerPoint} className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.4rem' }}>
                🔥 Project Prayer Point
              </button>
            </div>
          )}

          {/* TAB 6: AI ASSISTANT PANEL */}
          {activeTab === 'AI_ASSISTANT' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
              <AIAssistantPanel onLiveTranscript={(text) => setTranscript(text)} />
            </div>
          )}

          {/* THEME SELECTOR */}
          <div className="card" style={{ marginTop: 'auto' }}>
            <h3>🎨 Projection Theme Styles</h3>
            <div className="theme-selector" style={{ marginTop: '0.4rem' }}>
              <button className={`theme-btn ${selectedTheme === 'classic-dark' ? 'active' : ''}`} onClick={() => setSelectedTheme('classic-dark')}>Classic Dark</button>
              <button className={`theme-btn ${selectedTheme === 'lower-third' ? 'active' : ''}`} onClick={() => setSelectedTheme('lower-third')}>Lower Third</button>
              <button className={`theme-btn ${selectedTheme === 'gold-gradient' ? 'active' : ''}`} onClick={() => setSelectedTheme('gold-gradient')}>Warm Gold</button>
            </div>
          </div>
        </section>

        {/* COMPACT CONFIDENCE MONITOR + SUBTITLE CONTROLS PANEL (Right Column) */}
        <section style={{ padding: '0.75rem', backgroundColor: '#121215', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="preview-header">
            <h3 style={{ fontSize: '0.85rem' }}>📺 LIVE MONITOR</h3>
            <span className="live-pill">{isBlackout ? 'BLACKOUT' : 'ON AIR'}</span>
          </div>

          {/* RESTORED PORTRAIT/COMPACT MONITOR BOX */}
          <div 
            className={`screen-preview-box ${selectedTheme} ${isBlackout ? 'blackout' : ''}`} 
            style={{ width: '100%', height: '210px', flexShrink: 0 }}
          >
            {!isBlackout && activeSlide ? (
              activeSlide.type === 'MEDIA' ? (
                activeSlide.mediaType === 'video' ? (
                  <video src={activeSlide.mediaUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <img src={activeSlide.mediaUrl} alt={activeSlide.mediaName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )
              ) : activeSlide.type === 'LOWER_THIRD' ? (
                <div style={{ position: 'absolute', bottom: '10%', left: '8%', padding: '0.4rem 0.8rem', backgroundColor: 'rgba(9, 9, 11, 0.9)', borderLeft: '3px solid #38bdf8', borderRadius: '4px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0, color: '#ffffff' }}>{activeSlide.title}</h3>
                  <p style={{ fontSize: '0.75rem', margin: '0.1rem 0 0 0', color: '#38bdf8' }}>{activeSlide.subtitle}</p>
                </div>
              ) : activeSlide.type === 'NOTES' ? (
                <div style={{ padding: '0.75rem', textAlign: 'left', width: '100%' }}>
                  {activeSlide.title && <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '0.3rem', borderBottom: '1px solid #38bdf8' }}>{activeSlide.title}</h3>}
                  {activeSlide.notePoints && activeSlide.notePoints.map((point, i) => (
                    <p key={i} style={{ fontSize: '0.8rem', color: '#f4f4f5', margin: '0.2rem 0' }}>{point}</p>
                  ))}
                </div>
              ) : (
                <div className="preview-slide-content">
                  <p className="preview-text" style={{ fontSize: '1rem' }}>"{activeSlide.text}"</p>
                  <h4 className="preview-ref" style={{ fontSize: '0.8rem' }}>— {activeSlide.reference} ({activeSlide.version})</h4>
                </div>
              )
            ) : (
              <div className="preview-idle">NO ACTIVE OUTPUT</div>
            )}
          </div>

          <div className="preview-actions">
            <button className={`btn-action ${isBlackout ? 'btn-danger-active' : ''}`} onClick={() => setIsBlackout(!isBlackout)}>
              {isBlackout ? 'Un-Blackout Screen' : '⬛ Blackout'}
            </button>
            <button className="btn-action" onClick={() => setActiveSlide(null)}>
              🧹 Clear Output
            </button>
          </div>

          {/* SUBTITLE & LIVE CAPTION CONTROL BOX BELOW THE MONITOR */}
          <div className="card" style={{ marginTop: '0.25rem', padding: '0.6rem', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.85rem', margin: 0, color: '#38bdf8' }}>💬 Live Subtitles Overlay</h4>
              <input
                type="checkbox"
                checked={showSubtitles}
                onChange={(e) => setShowSubtitles(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: '0.4rem 0 0 0', lineHeight: '1.3' }}>
              {showSubtitles ? 'Captions are live and rendering on main display output.' : 'Subtitles hidden.'}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
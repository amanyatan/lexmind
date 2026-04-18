/**
 * MahirAI.tsx
 * ─────────────────────────────────────────────────────────
 * Mahir AI – Premium Legal Video Chatbot
 *
 * Architecture:
 *  • Video (`/api/mahir-video`) is the character face
 *  • ElevenLabs TTS drives audio; audio events drive video play/pause
 *  • SpeechRecognition captures user voice → sends to chat API
 *  • Chat API returns structured JSON → extract `.text` for TTS
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, ChevronDown, ChevronUp,
  Scale, Shield, AlertTriangle, Info,
} from 'lucide-react';
import logoSrc from '../assets/logo.svg'; // ← swap to logo.png once in src/assets
import './MahirAI.css';

/* ── Types ──────────────────────────────────────────────── */
type Lang = 'hindi' | 'english' | 'hinglish';
interface AiPayload {
  text: string;
  questions?: string[];
  laws?: string[];
  explanation?: string;
  steps?: string[];
  risk_level?: string;
}
interface Message {
  role: 'user' | 'assistant';
  content: string | AiPayload;
}

/* ══════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════ */
export default function MahirAI() {
  /* ── state ── */
  const [messages, setMessages]             = useState<Message[]>([]);
  const [input, setInput]                   = useState('');
  const [lang, setLang]                     = useState<Lang>('hinglish');
  const [isListening, setIsListening]       = useState(false);
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [expanded, setExpanded]             = useState<number | null>(null);
  const [videoReady, setVideoReady]         = useState(false);
  const [micDenied, setMicDenied]           = useState(false);
  const [videoError, setVideoError]         = useState(false);

  /* ── refs ── */
  const videoRef    = useRef<HTMLVideoElement>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const recognRef   = useRef<any>(null);
  const chatEndRef  = useRef<HTMLDivElement>(null);
  const audioBlobUrl = useRef<string | null>(null);

  /* ── scroll ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* ── init Audio once ── */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';

    /* VIDEO ← AUDIO sync */
    audio.onplay  = () => {
      setIsSpeaking(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };
    audio.onended = () => {
      setIsSpeaking(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      // revoke old blob url
      if (audioBlobUrl.current) {
        URL.revokeObjectURL(audioBlobUrl.current);
        audioBlobUrl.current = null;
      }
    };
    audio.onerror = () => setIsSpeaking(false);

    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  /* ── TTS: call ElevenLabs via backend → play audio → sync video ── */
  const speak = useCallback(async (text: string) => {
    if (!text?.trim()) return;
    try {
      const resp = await fetch('/api/lexmind/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) return;

      const blob = await resp.blob();
      const url  = URL.createObjectURL(blob);
      audioBlobUrl.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        // onplay fires → video starts
        await audioRef.current.play();
      }
    } catch (_) {
      setIsSpeaking(false);
    }
  }, []);

  /* ── Chat API ── */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/lexmind/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: text,
          language: lang,
          history: messages.slice(-6),
        }),
      });

      if (!resp.ok) throw new Error('API error');
      const data: AiPayload = await resp.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data }]);

      // Speak the conversational text
      if (data?.text) speak(data.text);

    } catch (_) {
      const fallback: AiPayload = {
        text: 'Kuch problem hua. Backend check karo aur dobara try karo.',
        risk_level: 'Low',
      };
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, lang, speak]);

  /* ── Voice input ── */
  const toggleMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice input.'); return; }

    if (isListening) {
      recognRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.lang            = lang === 'hindi' ? 'hi-IN' : 'en-IN';
    rec.continuous      = false;
    rec.interimResults  = false;
    recognRef.current   = rec;

    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onerror  = (e: any) => {
      setIsListening(false);
      if (e.error === 'not-allowed') setMicDenied(true);
    };
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setIsListening(false);
      sendMessage(t);
    };
    rec.start();
  }, [isListening, lang, sendMessage]);

  /* ── Quick prompts ── */
  const quickPrompts = [
    'FIR kaise file karein?',
    'Property dispute mein kya karein?',
    'Consumer rights explain karo',
    'Divorce process kya hai?',
  ];

  /* ── Risk colour ── */
  const riskColor = (r?: string) => {
    switch (r?.toLowerCase()) {
      case 'critical': return '#ff4040';
      case 'high':     return '#ff8c33';
      case 'moderate': return '#ffe033';
      default:         return '#40e080';
    }
  };

  /* ══════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════ */
  return (
    <div className="ma-root">

      {/* ── Ambient background ── */}
      <div className="ma-bg" aria-hidden>
        <div className="ma-glow ma-glow-a" />
        <div className="ma-glow ma-glow-b" />
      </div>

      {/* ═══════════════════════════════════════════════
          LEFT COLUMN – Video avatar + controls
      ═══════════════════════════════════════════════ */}
      <aside className="ma-left">

        {/* Brand */}
        <div className="ma-brand">
          <img src={logoSrc} alt="Mahir AI" className="ma-logo" />
          <span className="ma-brand-text">Mahir AI</span>
        </div>

        {/* ── VIDEO FRAME ── */}
        <div className={`ma-video-wrap ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}>

          {!videoError ? (
            <video
              ref={videoRef}
              src="/api/mahir-video#t=0.001" /* forces first frame to render */
              className="ma-video"
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
            />
          ) : (
            <div className="ma-orb">
              <div className="orb-inner" />
              {[...Array(3)].map((_, i) => <div key={i} className={`orb-ring ring-${i}`} />)}
            </div>
          )}

          {/* Idle overlay – shown when not speaking */}
          <AnimatePresence>
            {!isSpeaking && !isListening && (
              <motion.div className="ma-idle-vignette"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="ma-idle-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speaking wave bars – bottom of video */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div className="ma-waves"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.div key={i} className="ma-wave-bar"
                    animate={{ scaleY: [0.15, 1, 0.15] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.35 + (i % 5) * 0.07,
                      delay: i * 0.04,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listening sonar on video frame */}
          <AnimatePresence>
            {isListening && (
              <motion.div className="ma-listen-frame"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="ma-sonar-ring"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.4 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status label */}
        <div className={`ma-status ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`}>
          <span className="ma-status-dot" />
          <span>
            {isSpeaking ? 'Mahir is speaking…'
              : isListening ? 'Listening to you…'
              : isLoading   ? 'Thinking…'
              : 'Ready'}
          </span>
        </div>

        {/* Language selector */}
        <div className="ma-langs">
          {(['english', 'hindi', 'hinglish'] as Lang[]).map(l => (
            <button key={l}
              className={`ma-lang ${lang === l ? 'active' : ''}`}
              onClick={() => setLang(l)}>
              {l === 'hinglish' ? 'Hinglish' : l === 'hindi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          RIGHT COLUMN – Chat transcript + input
      ═══════════════════════════════════════════════ */}
      <main className="ma-right">

        {/* ── Messages ── */}
        <div className="ma-messages">
          {messages.length === 0 && (
            <div className="ma-welcome">
              <h1>Namaste, main hoon <span>Mahir.</span></h1>
              <p>Aapka premium legal AI assistant — Hindi, English, ya Hinglish mein baat karein.</p>
              <div className="ma-chips">
                {quickPrompts.map(q => (
                  <button key={q} className="ma-chip" onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isAi = msg.role === 'assistant';
            const payload = isAi ? (msg.content as AiPayload) : null;
            return (
              <motion.div key={i}
                className={`ma-msg ${msg.role}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}>

                {!isAi ? (
                  <div className="ma-user-bubble">{msg.content as string}</div>
                ) : (
                  <div className="ma-ai-card">
                    {/* Main response text */}
                    <p className="ma-ai-text">{payload?.text}</p>

                    {/* Law badges */}
                    {payload?.laws?.length ? (
                      <div className="ma-law-tags">
                        {payload.laws.map((law, li) => (
                          <span key={li} className="ma-law-tag">
                            <Shield size={10} /> {law}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Risk level */}
                    {payload?.risk_level && (
                      <div className="ma-risk" style={{ '--c': riskColor(payload.risk_level) } as any}>
                        <AlertTriangle size={12} />
                        Risk: <strong>{payload.risk_level}</strong>
                      </div>
                    )}

                    {/* Expandable detail */}
                    {(payload?.explanation || payload?.steps?.length) && (
                      <>
                        <button className="ma-expand"
                          onClick={() => setExpanded(expanded === i ? null : i)}>
                          {expanded === i ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {expanded === i ? 'Hide detail' : 'Show detail'}
                        </button>

                        <AnimatePresence>
                          {expanded === i && (
                            <motion.div className="ma-detail"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}>

                              {payload.explanation && (
                                <div className="ma-detail-block">
                                  <div className="ma-detail-lbl"><Info size={11} /> Explanation</div>
                                  <p>{payload.explanation}</p>
                                </div>
                              )}
                              {payload.steps?.length ? (
                                <div className="ma-detail-block">
                                  <div className="ma-detail-lbl"><Scale size={11} /> Next Steps</div>
                                  <ol>{payload.steps.map((s, si) => <li key={si}>{s}</li>)}</ol>
                                </div>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Thinking indicator */}
          {isLoading && (
            <motion.div className="ma-thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="ma-think-dot"
                  animate={{ y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
              ))}
              <span>Mahir is thinking…</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="ma-bar">
          <input
            className="ma-input"
            placeholder={isListening ? 'Listening…' : 'Type or tap mic to speak…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            disabled={isLoading}
          />

          {/* Mic */}
          <button className={`ma-mic ${isListening ? 'active' : ''}`}
            onClick={toggleMic}
            title={isListening ? 'Stop recording' : 'Speak'}>
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            {isListening && (
              <>
                <span className="sonar s1" />
                <span className="sonar s2" />
                <span className="sonar s3" />
              </>
            )}
          </button>

          {/* Send */}
          <button className="ma-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}>
            <Send size={18} />
          </button>
        </div>

        {micDenied && (
          <p className="ma-mic-err">
            Microphone access denied. Allow mic in browser settings and refresh.
          </p>
        )}
      </main>
    </div>
  );
}

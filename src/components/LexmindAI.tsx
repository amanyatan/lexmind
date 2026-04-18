import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, Shield, Scale, AlertTriangle, Play, Pause, X } from 'lucide-react';
import './LexmindAI.css';

interface Message {
  role: 'user' | 'assistant';
  content: string | any;
}

interface LexmindResponse {
  text: string;
  questions: string[];
  laws: string[];
  explanation: string;
  steps: string[];
  risk_level: string;
}

export default function LexmindAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'hindi' | 'english' | 'hinglish'>('hinglish');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/lexmind/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: text,
          language: language,
          history: messages
        })
      });

      const data = await response.json();
      const aiMsg = { role: 'assistant', content: data };
      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-speak the primary text
      generateSpeech(data.text);

    } catch (err) {
      console.error("Lexmind Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSpeech = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/lexmind/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Stop recognition logic (simplified for now)
    } else {
      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return '#ff4d4d';
      case 'high': return '#ffa333';
      case 'moderate': return '#ffe033';
      case 'low': return '#4dff88';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="lexmind-container">
      {/* Background Ambience */}
      <div className="lexmind-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Main Experience Layout */}
      <div className="lexmind-layout">
        
        {/* Top Header */}
        <div className="lexmind-header">
           <div className="status-indicator">
              <div className={`dot ${isSpeaking ? 'pulse' : ''}`}></div>
              <span>{isSpeaking ? 'LEXMIND IS SPEAKING' : isListening ? 'LISTENING...' : 'LEXMIND READY'}</span>
           </div>
           <div className="lang-selector">
              {['english', 'hindi', 'hinglish'].map(lang => (
                <button 
                  key={lang} 
                  className={language === lang ? 'active' : ''}
                  onClick={() => setLanguage(lang as any)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
           </div>
        </div>

        {/* Center: AI Avatar */}
        <div className="lexmind-avatar-section">
          <motion.div 
            className={`avatar-halo ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`}
            animate={{ 
              scale: isSpeaking ? [1, 1.1, 1] : 1,
              rotate: isSpeaking ? [0, 5, -5, 0] : 0
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="avatar-core">
               <Scale size={48} color="#00d4ff" />
               <div className="avatar-eye left"></div>
               <div className="avatar-eye right"></div>
               <div className={`avatar-mouth ${isSpeaking ? 'active' : ''}`}></div>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="voice-wave"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="wave-bar"
                    animate={{ height: [10, 40, 10] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conversation Area (Right or Overlay) */}
        <div className="lexmind-chat-content">
          <div className="messages-scroll">
            {messages.length === 0 && (
              <div className="empty-state">
                <h2>Namaste, I am Lexmind AI.</h2>
                <p>Aapki legal samasya kya hai? Main Hinglish, Hindi, aur English samajhta hoon.</p>
                <div className="suggestions">
                  <button onClick={() => handleSend("Padosi property boundary pe ladhai kar raha hai")}>Property Dispute</button>
                  <button onClick={() => handleSend("Check bounce ho gaya, kya karun?")}>Check Bounce</button>
                  <button onClick={() => handleSend("Divorce file karne ka procedure kya hai?")}>Family Law</button>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`msg-wrapper ${msg.role}`}
              >
                {msg.role === 'user' ? (
                  <div className="user-text">{msg.content}</div>
                ) : (
                  <div className="assistant-card glass">
                    <p className="primary-text">{msg.content.text}</p>
                    
                    {msg.content.laws && (
                      <div className="law-tags">
                        {msg.content.laws.map((law: string, i: number) => (
                          <span key={i} className="law-tag"><Shield size={12} /> {law}</span>
                        ))}
                      </div>
                    )}

                    <div className="structured-info">
                       <details>
                          <summary><Scale size={16} /> Legal Explanation</summary>
                          <p>{msg.content.explanation}</p>
                       </details>
                       <details>
                          <summary><Play size={16} /> Actionable Steps</summary>
                          <ul>
                            {msg.content.steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                          </ul>
                       </details>
                       <div className="risk-indicator" style={{ borderLeft: `4px solid ${getRiskColor(msg.content.risk_level)}` }}>
                          <AlertTriangle size={16} />
                          <span>Risk Level: <strong>{msg.content.risk_level}</strong></span>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Bar: Interaction */}
        <div className="lexmind-controls">
          <div className="input-group glass">
            <input 
              type="text" 
              placeholder="Talk to Lexmind..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              disabled={loading}
            />
            
            <button 
              className={`mic-btn ${isListening ? 'active' : ''}`}
              onClick={toggleListening}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              {isListening && <div className="mic-glow"></div>}
            </button>

            <button 
              className="send-btn" 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>

      <audio 
        ref={audioRef} 
        onEnded={() => setIsSpeaking(false)}
        style={{ display: 'none' }} 
      />
    </div>
  );
}

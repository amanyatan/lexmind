import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2 } from 'lucide-react'
import axios from 'axios'
import { CONFIG } from '../config'
import { FIRMetadata } from '../types'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface ChatAssistantProps {
    firData: FIRMetadata | null
}

export default function ChatAssistant({ firData }: ChatAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: firData
                ? `Hello! I've analyzed FIR ${firData.firNumber}. How can I assist you with the legal strategy or details today?`
                : "Hello! I'm your legal AI assistant. How can I help you today? (Note: You can also upload an FIR for a specific case analysis)"
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // AI Assistant Webhook from CONFIG
    const chatApiUrl = CONFIG.API_CHAT_URL

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isTyping) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsTyping(true)

        try {
            // Send message to local backend
            const response = await axios.post(chatApiUrl, {
                message: userMsg,
                firContext: firData,
                history: messages
            }, {
                headers: { 'Content-Type': 'application/json' }
            })

            console.log("AI Response:", response.data)

            const botResponse = response.data.output || "I received your message but the response format was unexpected."

            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }])
        } catch (error: any) {
            console.error("AI Connection Error Details:", error)

            let errorText = "I'm having trouble connecting to my AI core."
            if (error.response?.status === 404 || error.code === "ERR_NETWORK") {
                errorText = "Backend not reachable. Ensure the local server is running on port 5000."
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorText }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px' }}>
            {!isMobile && (
                <div style={{ marginBottom: '10px' }}>
                    <h1 style={{ fontSize: '2rem' }}>AI Assistant</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Powered by LexMind AI</p>
                </div>
            )}

            <div className="glass-card" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '0',
                background: isMobile ? 'transparent' : 'var(--card-bg)',
                border: isMobile ? 'none' : '1px solid var(--border)'
            }}>
                <div
                    ref={scrollRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: isMobile ? '12px 0' : '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                gap: '10px',
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: isMobile ? '90%' : '80%'
                            }}
                        >
                            {msg.role === 'assistant' && (
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot size={18} color="white" />
                                </div>
                            )}
                            <div style={{
                                padding: '12px 14px',
                                borderRadius: '16px',
                                background: msg.role === 'user' ? 'var(--primary)' : 'var(--glass-bg)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                lineHeight: 1.5,
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px'
                            }}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div style={{ width: '36px', height: '36px', background: 'var(--secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User size={20} color="white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 size={18} className="animate-spin" color="white" />
                            </div>
                            <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} style={{
                    padding: isMobile ? '12px 0' : '20px',
                    background: 'transparent',
                    borderTop: isMobile ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        style={{
                            flex: 1,
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: isMobile ? '0.95rem' : '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: !input.trim() || isTyping ? 0.5 : 1
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}

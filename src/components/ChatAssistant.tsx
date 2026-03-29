import { useState, useRef, useEffect } from 'react'
import { Send, User as UserIcon, Bot, Loader2, Plus, MessageSquare, Trash2, Menu, X, ChevronLeft, Info } from 'lucide-react'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import { CONFIG } from '../config'
import { FIRMetadata } from '../types'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id?: string
    role: 'user' | 'assistant'
    content: string
    created_at?: string
}

interface Conversation {
    id: string
    title: string
    created_at: string
    fir_number?: string
}

interface ChatAssistantProps {
    firData: FIRMetadata | null
    user: User
}

const LexMindFormatter = ({ text }: { text: string }) => {
    const lines = text.split('\n');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lines.map((line, i) => {
                let processedLine = line.trim();
                if (processedLine.startsWith('#')) {
                    const level = processedLine.match(/^#+/)?.[0].length || 1;
                    const content = processedLine.replace(/^#+\s*/, '');
                    return (
                        <div key={i} style={{
                            fontSize: level === 1 ? '1.4rem' : '1.2rem',
                            fontWeight: 800,
                            color: 'var(--primary)',
                            margin: '12px 0 4px'
                        }}>
                            {content}
                        </div>
                    );
                }
                if (processedLine.startsWith('* ') || processedLine.startsWith('- ')) {
                    const content = processedLine.substring(2);
                    return (
                        <div key={i} style={{ display: 'flex', gap: '8px', paddingLeft: '12px' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span>
                            <span>{parseBoldText(content)}</span>
                        </div>
                    );
                }
                if (/^\d+\.\s/.test(processedLine)) {
                    return (
                        <div key={i} style={{ display: 'flex', gap: '8px', paddingLeft: '12px' }}>
                            <span>{parseBoldText(processedLine)}</span>
                        </div>
                    );
                }
                return processedLine ? (
                    <p key={i} style={{ margin: 0 }}>{parseBoldText(processedLine)}</p>
                ) : <div key={i} style={{ height: '10px' }} />;
            })}
        </div>
    );
};

const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export default function ChatAssistant({ firData, user }: ChatAssistantProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024)
    const [loadingConversations, setLoadingConversations] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [activeContext, setActiveContext] = useState<FIRMetadata | null>(firData)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setActiveContext(firData);
    }, [firData]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            if (!mobile) setShowSidebar(true)
        }
        window.addEventListener('resize', handleResize)
        loadConversations()
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId)
            if (isMobile) setShowSidebar(false)
        } else {
            setMessages([])
        }
    }, [currentConversationId, isMobile])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const loadConversations = async () => {
        setLoadingConversations(true)
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setConversations(data || [])
        } catch (err) {
            console.error("Error loading conversations:", err)
        } finally {
            setLoadingConversations(false)
        }
    }

    const loadMessages = async (convId: string) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            console.error("Error loading messages:", err)
        }
    }

    const startNewChat = async () => {
        // The user explicitly requested a New generic chat, so we unbind the current case context
        setActiveContext(null);
        
        const title = `Consultation ${new Date().toLocaleDateString()}`
        try {
            const { data, error } = await supabase
                .from('conversations')
                .insert([{ user_id: user.id, title, fir_number: null }])
                .select().single()

            if (error) throw error
            setConversations([data, ...conversations])
            setCurrentConversationId(data.id)
            if (isMobile) setShowSidebar(false)
        } catch (err) {
            console.error("Error creating conversation:", err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('conversations').delete().eq('id', id)
            if (error) throw error
            setConversations(conversations.filter(c => c.id !== id))
            if (currentConversationId === id) {
                setCurrentConversationId(null)
                setMessages([])
            }
            setDeletingId(null)
        } catch (err) {
            console.error("Error deleting conversation:", err)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isTyping) return

        const userMsg = input.trim()
        setInput('')

        let activeId = currentConversationId

        if (!activeId) {
            const title = userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .insert([{ user_id: user.id, title, fir_number: activeContext?.firNumber || null }])
                    .select().single()
                if (error) throw error
                activeId = data.id
                setCurrentConversationId(activeId)
                setConversations([data, ...conversations])
            } catch (err) {
                console.error("Failed to auto-start conversation:", err)
                return
            }
        }

        const newUserMsg: Message = { role: 'user', content: userMsg }
        setMessages(prev => [...prev, newUserMsg])
        setIsTyping(true)

        try {
            await supabase.from('messages').insert([{ conversation_id: activeId, role: 'user', content: userMsg }])
            const response = await axios.post(CONFIG.API_CHAT_URL, {
                message: userMsg,
                firContext: activeContext,
                history: messages.slice(-10)
            })
            const botResponse = response.data.output || "I'm sorry, I couldn't process that request."
            await supabase.from('messages').insert([{ conversation_id: activeId, role: 'assistant', content: botResponse }])
            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }])
        } catch (error: any) {
            console.error("Chat Error:", error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Backend Connection Failed. Make sure your local server is running on port 5000." }])
        } finally {
            setIsTyping(false)
        }
    }

    // Auto-trigger an interpretation when arriving from Evidence tool or Vault
    useEffect(() => {
        if ((activeContext?.firNumber === 'EVIDENCE-BASED' || activeContext?.firNumber?.startsWith('VAULT-')) && messages.length === 0 && !isTyping && !currentConversationId) {
            const autoTrigger = async () => {
                const autoMsg = "Please interpret the forensic video/image analysis provided in my case context. Explain what happened, whose fault it is, and detail the relevant IPC/BNS sections.";
                
                try {
                    const { data, error } = await supabase
                        .from('conversations')
                        .insert([{ user_id: user.id, title: "Video Evidence Analysis", fir_number: "EVIDENCE-BASED" }])
                        .select().single()
                    if (error) throw error
                    
                    const activeId = data.id;
                    setCurrentConversationId(activeId)
                    setConversations(prev => [data, ...prev])

                    const newUserMsg: Message = { role: 'user', content: autoMsg }
                    setMessages([newUserMsg])
                    setIsTyping(true)

                    await supabase.from('messages').insert([{ conversation_id: activeId, role: 'user', content: autoMsg }])
                    
                    const response = await axios.post(CONFIG.API_CHAT_URL, {
                        message: autoMsg,
                        firContext: activeContext,
                        history: []
                    })
                    const botResponse = response.data.output || "I'm sorry, I couldn't process that request."
                    
                    await supabase.from('messages').insert([{ conversation_id: activeId, role: 'assistant', content: botResponse }])
                    setMessages([{ role: 'user', content: autoMsg }, { role: 'assistant', content: botResponse }])
                } catch(e) {
                    console.error("Auto trigger failed", e)
                } finally {
                    setIsTyping(false)
                }
            }
            autoTrigger();
        }
    }, [activeContext, currentConversationId, messages.length])

    return (
        <div style={{ display: 'flex', height: '100%', gap: '16px', position: 'relative', background: 'transparent' }}>

            {/* Sidebar Toggle Button (Floating) */}
            {!showSidebar && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setShowSidebar(true)}
                    style={{
                        position: 'absolute', top: '10px', left: '10px', zIndex: 90,
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'var(--primary)', color: 'white', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                >
                    <Menu size={20} />
                </motion.button>
            )}

            {/* Sidebar */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            width: isMobile ? '100%' : '300px',
                            height: '100%',
                            display: 'flex', flexDirection: 'column', gap: '16px',
                            padding: '24px',
                            background: 'rgba(1, 22, 39, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            zIndex: 100,
                            position: isMobile ? 'absolute' : 'relative',
                            boxShadow: '20px 0 50px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>History</h2>
                            {isMobile && (
                                <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={startNewChat}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '14px', background: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '14px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
                            }}
                        >
                            <Plus size={18} /> New Conversation
                        </button>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }} className="custom-scrollbar">
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', opacity: 0.6 }}>Recently Started</p>

                            {loadingConversations ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="animate-spin" size={20} color="var(--primary)" /></div>
                            ) : conversations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                    <MessageSquare size={32} style={{ marginBottom: '12px' }} />
                                    <p style={{ fontSize: '0.85rem' }}>Start your first legal consultation</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => {
                                            if (conv.fir_number !== activeContext?.firNumber) {
                                                setActiveContext(null);
                                            }
                                            setCurrentConversationId(conv.id);
                                        }}
                                        style={{
                                            padding: '12px 16px', borderRadius: '16px',
                                            background: currentConversationId === conv.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                            border: `1px solid ${currentConversationId === conv.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)'}`,
                                            cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: '12px'
                                        }}
                                        className="conv-item"
                                    >
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: currentConversationId === conv.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <MessageSquare size={16} color={currentConversationId === conv.id ? 'white' : 'var(--text-secondary)'} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <p style={{ fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: currentConversationId === conv.id ? 700 : 500 }}>{conv.title}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6 }}>{new Date(conv.created_at).toLocaleDateString()}</p>
                                        </div>

                                        {/* Dynamic Delete UI */}
                                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                                            {deletingId === conv.id ? (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', gap: '4px' }}>
                                                    <button onClick={() => handleDelete(conv.id)} style={{ background: '#ef4444', border: 'none', color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700 }}>Del</button>
                                                    <button onClick={() => setDeletingId(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem' }}>Esc</button>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeletingId(conv.id)}
                                                    className="delete-icon"
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0, cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Content */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                background: 'rgba(1, 22, 39, 0.4)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px',
                position: 'relative'
            }}>
                {!currentConversationId ? (
                    /* Welcome / Empty State */
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '40px', textAlign: 'center', color: 'white'
                    }}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                width: '80px', height: '80px', background: 'var(--primary)',
                                borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '24px', boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)'
                            }}
                        >
                            <Bot size={40} />
                        </motion.div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>LexMind AI Strategy</h1>
                        <p style={{ maxWidth: '400px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
                            Your expert legal assistant for case analysis, strategy, and Indian criminal law consultation.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '200px' }}>
                                <Info size={20} color="var(--primary)" style={{ marginBottom: '10px' }} />
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Analyze FIRs</h3>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Upload documents to get instant strategic analysis.</p>
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '200px' }}>
                                <MessageSquare size={20} color="var(--primary)" style={{ marginBottom: '10px' }} />
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Draft Defense</h3>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Get point-wise arguments and IPC references.</p>
                            </div>
                        </div>
                        <button
                            onClick={startNewChat}
                            style={{
                                marginTop: '40px', padding: '14px 28px', background: 'var(--primary)',
                                color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700,
                                fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            Start New Chat <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    /* Active Chat Frame */
                    <>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {isMobile && (
                                    <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', color: 'white', padding: '8px', cursor: 'pointer' }}>
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={22} color="white" />
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {conversations.find(c => c.id === currentConversationId)?.title || 'AI Strategy'}
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Active Consultancy</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            style={{
                                flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '32px',
                                display: 'flex', flexDirection: 'column', gap: '24px'
                            }}
                            className="custom-scrollbar"
                        >
                            {messages.length === 0 && !isTyping && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.4 }}>
                                    <p style={{ fontSize: '0.9rem' }}>Send a message to start this consultation</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex', gap: '16px',
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: isMobile ? '95%' : '80%',
                                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                                    }}
                                >
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                        background: msg.role === 'user' ? 'var(--secondary)' : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {msg.role === 'user' ? <UserIcon size={18} color="white" /> : <Bot size={20} color="white" />}
                                    </div>

                                    <div style={{
                                        padding: '16px 20px', borderRadius: '20px',
                                        background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                        color: 'white', border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                        fontSize: '0.95rem', lineHeight: 1.6,
                                        borderTopRightRadius: msg.role === 'user' ? '4px' : '20px',
                                        borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                                        boxShadow: msg.role === 'user' ? '0 4px 15px rgba(var(--primary-rgb), 0.2)' : 'none'
                                    }}>
                                        {msg.role === 'assistant' ? <LexMindFormatter text={msg.content} /> : msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div style={{ display: 'flex', gap: '16px', alignSelf: 'flex-start' }}>
                                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 size={18} className="animate-spin" color="white" />
                                    </div>
                                    <div style={{ padding: '16px 20px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTopLeftRadius: '4px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                    style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSend} style={{
                            padding: isMobile ? '16px' : '20px 32px',
                            background: 'rgba(0,0,0,0.2)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex', gap: '12px', alignItems: 'flex-end'
                        }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend(e as any)
                                        }
                                    }}
                                    placeholder="Consult LexMind AI..."
                                    style={{
                                        width: '100%', minHeight: '52px', maxHeight: '150px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px', padding: '14px 18px',
                                        color: 'white', outline: 'none', fontSize: '1rem',
                                        resize: 'none', transition: 'all 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                    rows={1}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                style={{
                                    background: 'var(--primary)', color: 'white',
                                    border: 'none', borderRadius: '14px',
                                    width: '52px', height: '52px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', opacity: !input.trim() || isTyping ? 0.5 : 1,
                                    transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
                                }}
                            >
                                {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--primary); }
                .conv-item:hover .delete-icon { opacity: 0.6 !important; }
                .delete-icon:hover { opacity: 1 !important; transform: scale(1.1); }
            `}</style>
        </div>
    )
}


import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, MessageSquare, Map, Shield, X, Menu, Sun, Moon, Search, FileSignature, ArrowRight, Lock, Scale } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import ReactFlow, { Background, Node, Edge, MarkerType, useNodesState, useEdgesState, Connection, addEdge } from 'reactflow'
import 'reactflow/dist/style.css'

interface LandingPageProps {
    onGetStarted: () => void
    onViewSecurity: () => void
    onViewFAQ: () => void
    theme: 'dark' | 'light'
    toggleTheme: () => void
}

// --- Animation Components (Preserving existing ones for Features section) ---

const ScanningAnimation = () => (
    <div style={{ position: 'relative', width: '200px', height: '260px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '60%', height: '12px', background: 'var(--border)', borderRadius: '6px' }} />
            <div style={{ width: '80%', height: '8px', background: 'var(--border)', borderRadius: '4px', opacity: 0.6 }} />
            <div style={{ width: '90%', height: '8px', background: 'var(--border)', borderRadius: '4px', opacity: 0.6 }} />
            <div style={{ width: '70%', height: '8px', background: 'var(--border)', borderRadius: '4px', opacity: 0.6 }} />
        </div>
        <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--primary)',
                boxShadow: '0 0 15px 2px var(--primary)', zIndex: 10
            }}
        />
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'rgba(var(--primary-rgb), 0.1)', padding: '8px 16px', borderRadius: '20px',
                border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600,
                backdropFilter: 'blur(4px)'
            }}
        >
            Analyzing...
        </motion.div>
    </div>
)

// Modified for Hero Interaction
const HeroInteractiveMap = ({ isMobile }: { isMobile: boolean }) => {
    const initialNodes: Node[] = [
        {
            id: '1', position: { x: 150, y: 50 }, data: { label: 'Case #492' },
            style: {
                background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px',
                width: 120, height: 50, fontSize: '0.9rem', fontWeight: 700,
                display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
        },
        {
            id: '2', position: { x: 50, y: 200 }, data: { label: 'Accused' },
            style: {
                background: 'var(--card-bg)', color: 'var(--text-primary)', border: '2px solid var(--secondary)', borderRadius: '12px',
                width: 100, fontSize: '0.8rem', fontWeight: 600,
                display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }
        },
        {
            id: '3', position: { x: 250, y: 200 }, data: { label: 'Witness' },
            style: {
                background: 'var(--card-bg)', color: 'var(--text-primary)', border: '2px solid var(--success)', borderRadius: '12px',
                width: 100, fontSize: '0.8rem', fontWeight: 600,
                display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }
        },
    ]

    const initialEdges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--text-secondary)', strokeWidth: 2 } },
        { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'var(--text-secondary)', strokeWidth: 2 } },
    ]

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

    return (
        <div style={{ width: '100%', height: isMobile ? '280px' : '350px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                Interactive Demo: Drag nodes
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                proOptions={{ hideAttribution: true }}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={false}
                panOnScroll={false}
                nodesDraggable={true}
                nodesConnectable={true}
                style={{ background: 'transparent' }}
            >
                <Background gap={20} size={1} color="var(--border)" style={{ opacity: 0.3 }} />
            </ReactFlow>
        </div>
    )
}

const FeatureNetworkGraph = () => {
    const initialNodes: Node[] = [
        {
            id: 'center', position: { x: 150, y: 125 }, data: { label: 'Main Case' },
            style: {
                background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%',
                width: 100, height: 100, fontSize: '0.85rem', fontWeight: 800,
                display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 25px rgba(var(--primary-rgb), 0.4)'
            }
        },
        {
            id: 'e1', position: { x: 50, y: 30 }, data: { label: 'CCTV' },
            style: { background: 'var(--card-bg)', border: '1px solid var(--secondary)', borderRadius: '30px', width: 80, height: 40, fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)' }
        },
        {
            id: 'e2', position: { x: 270, y: 30 }, data: { label: 'Statement' },
            style: { background: 'var(--card-bg)', border: '1px solid var(--success)', borderRadius: '30px', width: 90, height: 40, fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)' }
        },
        {
            id: 'e3', position: { x: 50, y: 230 }, data: { label: 'IPC 302' },
            style: { background: 'var(--card-bg)', border: '1px solid #ff4d4d', borderRadius: '30px', width: 80, height: 40, fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)' }
        },
        {
            id: 'e4', position: { x: 270, y: 230 }, data: { label: '10:30 PM' },
            style: { background: 'var(--card-bg)', border: '1px solid var(--accent)', borderRadius: '30px', width: 90, height: 40, fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)' }
        },
    ]

    const initialEdges: Edge[] = [
        { id: 'ce1', source: 'center', target: 'e1', animated: true, style: { stroke: 'var(--secondary)' } },
        { id: 'ce2', source: 'center', target: 'e2', animated: true, style: { stroke: 'var(--success)' } },
        { id: 'ce3', source: 'center', target: 'e3', animated: true, style: { stroke: '#ff4d4d' } },
        { id: 'ce4', source: 'center', target: 'e4', animated: true, style: { stroke: 'var(--accent)' } },
    ]

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    return (
        <div style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                fitView
                proOptions={{ hideAttribution: true }}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={false}
                nodesDraggable={true}
                style={{ background: 'transparent' }}
            >
                <Background gap={15} size={1} color="var(--border)" style={{ opacity: 0.2 }} />
            </ReactFlow>
        </div>
    )
}


const ChatAnimation = () => (
    <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
                alignSelf: 'flex-start', padding: '12px 16px',
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: '16px 16px 16px 4px', fontSize: '0.85rem',
                color: 'var(--text-secondary)'
            }}
        >
            Legal strategy for Case #492?
        </motion.div>
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            style={{
                alignSelf: 'flex-end', padding: '12px 16px',
                background: 'var(--primary)', color: 'white',
                borderRadius: '16px 16px 4px 16px', fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
            }}
        >
            Analyzing precedents. Recommend filing for anticipatory bail under Sec 438 immediately.
        </motion.div>
    </div>
)

const DraftingAnimation = () => (
    <div style={{ position: 'relative', width: '220px', height: '280px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ padding: '20px' }}>
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ height: '4px', background: 'var(--text-secondary)', marginBottom: '16px', borderRadius: '2px', opacity: 0.5 }}
            />
            {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div
                    key={i}
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: `${Math.random() * 40 + 60}%`, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
                    style={{ height: '3px', background: 'var(--border)', marginBottom: '8px', borderRadius: '2px' }}
                />
            ))}
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.5, type: 'spring' }}
                style={{
                    position: 'absolute', bottom: '20px', right: '20px',
                    width: '40px', height: '40px', background: 'var(--primary)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
            >
                <FileSignature color="white" size={20} />
            </motion.div>
        </div>
    </div>
)

export default function LandingPage({ onGetStarted, onViewSecurity, onViewFAQ, theme, toggleTheme }: LandingPageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const navLinks = [
        { name: 'About', href: '#features', action: 'scroll' },
        { name: 'Security', href: '#security', action: 'page', onClick: onViewSecurity },
        { name: 'FAQ', href: '#faq', action: 'page', onClick: onViewFAQ },
    ]

    const features = [
        {
            title: "Smart FIR Analysis",
            description: "Instantaneously break down complex FIR documents. Our AI extracts crucial dates, accused details, and applied legal sections.",
            icon: Search,
            animation: <ScanningAnimation />,
            gradient: "linear-gradient(135deg, rgba(0,95,115,0.1), rgba(10,147,150,0.1))"
        },
        {
            title: "Interactive Mind Maps",
            description: "Visualize the connections. Evidence links to witnesses and timeline events in a dynamic network graph.",
            icon: Map,
            animation: <div style={{ width: '100%', height: isMobile ? '280px' : '400px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}><FeatureNetworkGraph /></div>,
            gradient: "linear-gradient(135deg, rgba(202,103,2,0.1), rgba(233,216,166,0.1))"
        },
        {
            title: "AI Legal Strategy",
            description: "Your digital junior counsel. Chat with LexMind to brainstorm defense strategies and find relevant case laws.",
            icon: MessageSquare,
            animation: <ChatAnimation />,
            gradient: "linear-gradient(135deg, rgba(0,180,216,0.1), rgba(0,119,182,0.1))"
        },
        {
            title: "Automated Drafting",
            description: "Draft bail applications and legal briefs in one click using analyzed case data.",
            icon: FileText,
            animation: <DraftingAnimation />,
            gradient: "linear-gradient(135deg, rgba(155,34,38,0.1), rgba(174,32,18,0.1))"
        }
    ]

    return (
        <div style={{ background: 'transparent', color: 'var(--text-primary)', overflowX: 'hidden' }}>

            {/* Glassmorphism Navbar */}
            <nav style={{
                position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
                width: isMobile ? '90%' : '80%', maxWidth: '1000px',
                zIndex: 1000,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                padding: isMobile ? '10px 16px' : '12px 24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', cursor: 'pointer' }}>
                        <div style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield color="white" size={isMobile ? 16 : 18} />
                        </div>
                        <span style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>LexMind</span>
                    </div>

                    {/* Desktop Links with Hover Animation */}
                    <div className="desktop-nav" style={{ display: isMobile ? 'none' : 'flex', gap: '8px', alignItems: 'center' }}>
                        {navLinks.map((link) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => {
                                    if (link.action === 'page' && link.onClick) {
                                        e.preventDefault();
                                        link.onClick();
                                    }
                                }}
                                style={{
                                    position: 'relative', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 500,
                                    color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer',
                                    borderRadius: '20px'
                                }}
                                whileHover={{ color: 'var(--text-primary)' }}
                            >
                                <span style={{ position: 'relative', zIndex: 1 }}>{link.name}</span>
                                <motion.div
                                    id="nav-hover"
                                    layoutId="nav-bg"
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    style={{
                                        position: 'absolute', inset: 0, background: 'var(--glass-border)',
                                        borderRadius: '20px', zIndex: 0
                                    }}
                                />
                            </motion.a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: isMobile ? '8px' : '16px', alignItems: 'center' }}>
                        {!isMobile && <ThemeToggle theme={theme} toggleTheme={toggleTheme} />}

                        <button
                            onClick={onGetStarted}
                            className="btn-primary"
                            style={{
                                padding: isMobile ? '6px 14px' : '8px 24px',
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                borderRadius: '20px',
                                fontWeight: 600
                            }}
                        >
                            Get Started
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{
                                display: isMobile ? 'flex' : 'none',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '4px'
                            }}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', marginTop: '12px' }}
                        >
                            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {navLinks.map(link => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => {
                                            setIsMobileMenuOpen(false);
                                            if (link.action === 'page' && link.onClick) {
                                                e.preventDefault();
                                                link.onClick();
                                            }
                                        }}
                                        style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none', padding: '8px 4px' }}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Theme</span>
                                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: isMobile ? '100px 20px 40px' : '140px 24px 60px', position: 'relative', overflow: 'hidden'
            }}>
                {/* Background Glow */}
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vw', background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.12) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

                <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '40px' : '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>

                    {/* Hero Text */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: isMobile ? 'center' : 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid var(--primary)', borderRadius: '20px', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginInline: isMobile ? 'auto' : '0' }}>
                            <Scale size={14} /> Re-inventing Criminal Defense
                        </div>
                        <h1 style={{ fontSize: isMobile ? '2rem' : '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
                            Justice Served,<br />
                            <span style={{ color: 'transparent', background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                                Simplified.
                            </span>
                        </h1>
                        <p style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '550px', marginInline: isMobile ? 'auto' : '0' }}>
                            Analyze FIRs, map connections, and drift legals documents in seconds. LexMind is the intelligent partner every modern lawyer needs.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                            <button onClick={onGetStarted} className="btn-primary" style={{ padding: isMobile ? '12px 28px' : '14px 36px', fontSize: isMobile ? '1rem' : '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Get Started <ArrowRight size={18} />
                            </button>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Data Encryption</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14} /> Private & Secure</div>
                        </div>
                    </motion.div>

                    {/* Hero Interaction */}
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <HeroInteractiveMap isMobile={isMobile} />
                    </motion.div>

                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '80px 24px', background: 'var(--bg-main)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '120px' }}>
                    {features.map((feature, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '60px', alignItems: 'center', direction: idx % 2 === 1 ? 'rtl' : 'ltr' }}>
                            <div style={{ textAlign: isMobile ? 'center' : 'left', direction: 'ltr' }}>
                                <div style={{ width: '48px', height: '48px', background: feature.gradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', marginInline: isMobile ? 'auto' : '0' }}>
                                    <feature.icon size={24} color="var(--primary)" />
                                </div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>{feature.title}</h3>
                                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.description}</p>
                            </div>
                            <div style={{ direction: 'ltr' }}>
                                {feature.animation}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Compact Footer */}
            <footer style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--border)', padding: '60px 24px 30px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '40px' }}>

                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Shield color="var(--primary)" size={24} />
                            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>LexMind</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            We strictly adhere to data privacy laws. Your case data is end-to-end encrypted and we do not sell or leak data to third parties. Built for lawyer-client confidentiality.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Legal</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                                <a href="#" onClick={(e) => { e.preventDefault(); onViewSecurity(); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onViewSecurity(); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Data Security</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onViewFAQ(); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Product</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                                <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Get Started</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '40px auto 0', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} LexMind Legal Tech. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

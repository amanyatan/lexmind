
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { FileText, MessageSquare, Map, Shield, Sun, Moon, Search, FileSignature, ArrowRight, Lock, Scale } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import MainNavbar from './MainNavbar'
import ReactFlow, { Background, Node, Edge, MarkerType, useNodesState, useEdgesState, Connection, addEdge } from 'reactflow'
import 'reactflow/dist/style.css'
import mainLogo from '/@fs/C:/Users/AMAN YATAN/.gemini/antigravity/brain/118fd0c5-c657-4309-b437-04f76d7d21ed/media__1774739657314.png'

interface LandingPageProps {
    onGetStarted: () => void
    onViewSecurity: () => void
    onViewFAQ: () => void
    theme: 'dark' | 'light'
    toggleTheme: () => void
}

// --- Animation Components (Preserving existing ones for Features section) ---

const ScanningAnimation = () => (
    <div style={{ position: 'relative', width: '100%', maxWidth: '200px', height: '260px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', margin: '0 auto' }}>
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
    <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px', margin: '0 auto' }}>
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
    <div style={{ position: 'relative', width: '100%', maxWidth: '220px', height: '280px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid var(--border)', margin: '0 auto' }}>
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


// Feature card — own component so hooks are called at top level, not in .map()
interface FeatureCardProps {
    feature: { title: string; description: string; icon: any; animation: React.ReactNode; gradient: string }
    idx: number
    isMobile: boolean
    scrollYProgress: any
}
const FeatureCard = ({ feature, idx, isMobile, scrollYProgress }: FeatureCardProps) => {
    const fromX = idx % 2 === 0 ? -80 : 80
    const start = 0.25 + idx * 0.08
    const end   = 0.45 + idx * 0.08
    const cardX   = useTransform(scrollYProgress, [start, end], [fromX, 0])
    const cardOp  = useTransform(scrollYProgress, [start, Math.min(end - 0.03, 0.98)], [0, 1])
    const smoothX = useSpring(cardX, { stiffness: 55, damping: 20 })
    return (
        <motion.div
            style={{
                x: isMobile ? 0 : smoothX,
                opacity: isMobile ? 1 : cardOp,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '32px' : '60px',
                alignItems: 'center',
                direction: idx % 2 === 1 ? 'rtl' : 'ltr',
                willChange: 'transform, opacity'
            }}
        >
            <div style={{ textAlign: isMobile ? 'center' : 'left', direction: 'ltr' }}>
                <div style={{ width: '48px', height: '48px', background: feature.gradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', marginInline: isMobile ? 'auto' : '0' }}>
                    <feature.icon size={24} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.description}</p>
            </div>
            <div style={{ direction: 'ltr', display: 'flex', justifyContent: 'center' }}>
                {feature.animation}
            </div>
        </motion.div>
    )
}

export default function LandingPage({ onGetStarted, onViewSecurity, onViewFAQ, theme, toggleTheme }: LandingPageProps) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })

    // Parallax transforms for various layers
    const heroBgY      = useTransform(scrollYProgress, [0, 0.3], ['0%', '-40%'])
    const heroTextX    = useTransform(scrollYProgress, [0, 0.3], ['0px', '60px'])
    const heroVisualY  = useTransform(scrollYProgress, [0, 0.3], ['0%', '15%'])
    const featHeadX    = useTransform(scrollYProgress, [0.2, 0.6], ['-60px', '0px'])
    const featHeadOp   = useTransform(scrollYProgress, [0.2, 0.35], [0, 1])

    // Spring-smoothed values
    const smoothHeroBgY     = useSpring(heroBgY,     { stiffness: 50, damping: 18 })
    const smoothHeroTextX   = useSpring(heroTextX,   { stiffness: 60, damping: 22 })
    const smoothHeroVisualY = useSpring(heroVisualY, { stiffness: 50, damping: 18 })
    const heroGlow2Y        = useTransform(scrollYProgress, [0, 0.3], ['0%', '-15%'])

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
        <div ref={containerRef} style={{ background: 'transparent', color: 'var(--text-primary)', overflowX: 'hidden' }}>

            {/* Reusable Navbar */}
            <MainNavbar
                onGetStarted={onGetStarted}
                onNavigate={(page: string) => {
                    if (page === 'security') onViewSecurity()
                    else if (page === 'faq') onViewFAQ()
                    // If landing, stay here (MainNavbar handles scroll)
                }}
                theme={theme}
                toggleTheme={toggleTheme}
                currentPage="landing"
            />

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: isMobile ? '100px 20px 40px' : '140px 24px 60px', position: 'relative', overflow: 'hidden'
            }}>
                {/* Parallax Background Glow */}
                <motion.div style={{ y: smoothHeroBgY, position: 'absolute', top: '20%', left: '50%', translateX: '-50%', width: '80vw', height: '60vw', background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.14) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0, willChange: 'transform' }} />
                {/* Secondary slower glow for depth */}
                <motion.div style={{ y: heroGlow2Y, position: 'absolute', top: '40%', left: '30%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.06) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

                <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '40px' : '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>

                    {/* Hero Text — drifts right on scroll */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ x: isMobile ? 0 : smoothHeroTextX, textAlign: isMobile ? 'center' : 'left', willChange: 'transform' }}
                        transition={{ duration: 0.8 }}
                    >
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

                    {/* Hero Interaction — parallax floats upward slower */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ y: isMobile ? 0 : smoothHeroVisualY, willChange: 'transform' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <HeroInteractiveMap isMobile={isMobile} />
                    </motion.div>

                </div>
            </section>


            {/* Features Section */}
            <section id="features" style={{ padding: isMobile ? '50px 16px' : '80px 24px', background: 'var(--bg-main)', overflow: 'hidden' }}>
                {/* Section heading — parallax on desktop only */}
                <motion.div
                    style={{ x: isMobile ? 0 : featHeadX, opacity: isMobile ? 1 : featHeadOp, maxWidth: '1200px', margin: '0 auto 40px', willChange: 'transform, opacity', textAlign: isMobile ? 'center' : 'left', padding: isMobile ? '0 4px' : '0' }}
                >
                    <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.8rem', fontWeight: 800, marginBottom: '12px' }}>Built for the Modern Courtroom</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Every tool crafted for speed, clarity and confidentiality.</p>
                </motion.div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: isMobile ? '60px' : '120px' }}>
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} feature={feature} idx={idx} isMobile={isMobile} scrollYProgress={scrollYProgress} />
                    ))}
                </div>
            </section>

            {/* Compact Footer */}
            <footer style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--border)', padding: '60px 24px 30px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '40px' }}>

                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <img
                                src={mainLogo}
                                alt="LexMind"
                                style={{
                                    height: '60px',
                                    width: 'auto',
                                    mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
                                    filter: theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'contrast(1.05)',
                                    opacity: 1
                                }}
                            />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            We strictly adhere to data privacy laws. Your case data is end-to-end encrypted and we do not sell or leak data to third parties. Built for lawyer-client confidentiality.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Legal</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                                <motion.a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onViewSecurity(); }}
                                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', cursor: 'pointer' }}
                                    whileHover={{ color: 'var(--primary)', x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Privacy Policy
                                </motion.a>
                                <motion.a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onViewSecurity(); }}
                                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', cursor: 'pointer' }}
                                    whileHover={{ color: 'var(--primary)', x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Data Security
                                </motion.a>
                                <motion.a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onViewFAQ(); }}
                                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', cursor: 'pointer' }}
                                    whileHover={{ color: 'var(--primary)', x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    FAQ
                                </motion.a>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Product</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                                <motion.a
                                    href="#features"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', cursor: 'pointer' }}
                                    whileHover={{ color: 'var(--primary)', x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Features
                                </motion.a>
                                <motion.a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onGetStarted(); }}
                                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', cursor: 'pointer' }}
                                    whileHover={{ color: 'var(--primary)', x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Get Started
                                </motion.a>
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

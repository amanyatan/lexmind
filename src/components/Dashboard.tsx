import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
    FileText,
    Map as MapIcon,
    Layout,
    LogOut,
    Upload,
    MessageSquare,
    Mail,
    ChevronRight,
    BrainCircuit,
    History,
    Menu,
    X,
    Sun,
    Moon,
    Scale,
    AlertCircle,
    User as UserIcon,
    Calendar,
    AtSign,
    Edit2,
    CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import MindMap from './MindMap'
import FIRDetails from './FIRDetails'
import Drafting from './Drafting'
import ChatAssistant from './ChatAssistant'
import FIRHistory from './FIRHistory'
import { FIRMetadata } from '../types'
import { useFIRProcessor } from '../hooks/useFIRProcessor'
import ThemeToggle from './ThemeToggle'
import CircularProgressWithLabel from './CircularProgressWithLabel'
import './Dashboard.css'

interface DashboardProps {
    user: User
    theme: 'dark' | 'light'
    toggleTheme: () => void
}

export default function Dashboard({ user, theme, toggleTheme }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'upload' | 'details' | 'mindmap' | 'drafting' | 'chat' | 'history' | 'profile'>('upload')
    const [firData, setFirData] = useState<FIRMetadata | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [isEditingAvatar, setIsEditingAvatar] = useState(false)
    const [updatingAvatar, setUpdatingAvatar] = useState(false)

    // Use custom hook for processing logic
    const { processFIR, isProcessing, processingStep, processingMessage, error, resetError } = useFIRProcessor(user.id);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Handle Errors from Hook - No longer using alerts
    useEffect(() => {
        if (error) {
            console.error("Dashboard caught error:", error);
        }
    }, [error]);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        try {
            const result = await processFIR(file);
            setFirData(result);
            // Small delay to show completion state if needed, or jump straight
            setTimeout(() => setActiveTab('details'), 500);
        } catch (e) {
            // Error handled by effect
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        disabled: isProcessing
    })

    const navItems = [
        { id: 'upload', label: 'Upload', icon: Upload },
        { id: 'history', label: 'Past', icon: History },
        { id: 'details', label: 'Analysis', icon: FileText, disabled: !firData },
        { id: 'mindmap', label: 'Map', icon: MapIcon, disabled: !firData },
        { id: 'drafting', label: 'Draft', icon: Layout, disabled: !firData },
        { id: 'chat', label: 'AI', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: UserIcon },
    ]

    const userMetadata = user.user_metadata || {};
    const avatarSeed = userMetadata.avatar_seed || userMetadata.user_handle || user.email;
    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}`;

    const handleUpdateAvatar = async (newSeed: string) => {
        setUpdatingAvatar(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { ...userMetadata, avatar_seed: newSeed }
            });
            if (updateError) throw updateError;
            setIsEditingAvatar(false);
        } catch (err) {
            console.error("Failed to update avatar:", err);
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const avatarOptions = ['Lucky', 'Felix', 'Snuggles', 'Midnight', 'Misty', 'Pepper', 'Cookie', 'Zeus', 'Sassy', 'Shadow', 'Tigger', 'Buster', 'Simba', 'Casper', 'Romeo'];

    return (
        <div className="dashboard-container">
            {/* Sidebar (Desktop Only) */}
            {!isMobile && (
                <motion.div
                    initial={false}
                    animate={{
                        width: isCollapsed ? '80px' : '280px',
                        padding: isCollapsed ? '20px 0px' : '32px 24px'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="dashboard-sidebar glass-card"
                >
                    {/* Logo Section */}
                    <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '0 10px' : '0' }}>
                        {!isCollapsed && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="logo-box">
                                    <Scale color="white" size={24} />
                                </div>
                                <span className="logo-text">LexMind</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {isCollapsed ? <Menu size={24} /> : <X size={20} />}
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <motion.div
                        onClick={() => setActiveTab('profile')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: isCollapsed ? '0' : '16px',
                            background: activeTab === 'profile' ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: activeTab === 'profile' ? '1px solid var(--primary)' : '1px solid transparent',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            marginBottom: '20px'
                        }}
                    >
                        <div style={{
                            width: isCollapsed ? '40px' : '48px',
                            height: isCollapsed ? '40px' : '48px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border)',
                            flexShrink: 0,
                            position: 'relative'
                        }}>
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {!isCollapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {userMetadata.full_name || 'Legal Counsel'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    @{userMetadata.user_handle || 'counsel'}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    <nav className="sidebar-nav" style={{ alignItems: isCollapsed ? 'center' : 'stretch' }}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                disabled={item.disabled}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                style={{
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    padding: isCollapsed ? '12px' : '12px 16px',
                                    width: isCollapsed ? 'auto' : '100%'
                                }}
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon size={20} />
                                {!isCollapsed && <span style={{ fontWeight: 600, flex: 1 }}>{item.label}</span>}
                                {!isCollapsed && activeTab === item.id && <ChevronRight size={16} />}
                                {isCollapsed && activeTab === item.id && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="active-indicator"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="sidebar-footer" style={{ padding: isCollapsed ? '16px 8px' : '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
                            {!isCollapsed && <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Theme</span>}
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} size={isCollapsed ? 'small' : 'medium'} />
                        </div>

                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="logout-btn"
                            style={{
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                padding: isCollapsed ? '0' : '0 12px',
                                width: isCollapsed ? '44px' : '100%',
                                margin: isCollapsed ? '0 auto' : '0'
                            }}
                        >
                            <LogOut size={20} />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="mobile-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            disabled={item.disabled}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            style={{ opacity: item.disabled ? 0.3 : 1 }}
                        >
                            <item.icon size={22} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="main-content">
                {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Scale color="var(--primary)" size={24} />
                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>LexMind</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={toggleTheme} style={{ background: 'var(--glass-bg)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {activeTab === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ maxWidth: '800px', margin: '0 auto' }}
                        >
                            <div style={{ marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                                    Welcome, {user.user_metadata?.full_name?.split(' ')[0] || 'Counselor'}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)' }}>Upload a FIR PDF to start the analysis and mind-mapping process.</p>
                            </div>

                            <div
                                {...getRootProps()}
                                className={`glass-card upload-zone ${isDragActive ? 'upload-zone-active' : ''}`}
                            >
                                <input {...getInputProps()} />

                                <AnimatePresence mode="wait">
                                    {error ? (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="error-container"
                                            onClick={(e) => e.stopPropagation()} // Prevent triggering dropzone
                                        >
                                            <div className="error-icon-box">
                                                <AlertCircle size={40} />
                                            </div>
                                            <h3 className="error-title">Invalid Document</h3>
                                            <p className="error-message">
                                                {error}
                                            </p>
                                            <button
                                                className="retry-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    resetError();
                                                }}
                                            >
                                                Try Another File
                                            </button>
                                        </motion.div>
                                    ) : isProcessing ? (
                                        <motion.div
                                            key="processing"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <div style={{ marginBottom: '32px' }}>
                                                <CircularProgressWithLabel
                                                    value={((processingStep + 1) / 6) * 100}
                                                    size={160}
                                                    strokeWidth={10}
                                                />
                                            </div>
                                            <h3 style={{ fontSize: '1.75rem', marginBottom: '12px', color: '#ffffff', fontWeight: 700 }}>{processingMessage}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>AI Brain is analyzing the legal complexities...</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ textAlign: 'center', padding: '40px' }}
                                        >
                                            <div style={{
                                                width: '100px',
                                                height: '100px',
                                                background: 'rgba(0, 95, 115, 0.1)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '32px',
                                                margin: '0 auto 32px',
                                                border: '1px solid var(--glass-border)'
                                            }}>
                                                <Upload size={40} color="var(--primary)" />
                                            </div>
                                            <h3 style={{ fontSize: '1.75rem', marginBottom: '12px', color: '#ffffff' }}>
                                                {isDragActive ? 'Drop it here!' : 'Click or drag FIR PDF here'}
                                            </h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                                                Supported format: **.pdf** only. <br />
                                                Ensure the document is clear for best AI results.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: 'var(--primary)', opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%' }} />
                                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '200px', height: '200px', background: 'var(--accent)', opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%' }} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'details' && firData && (
                        <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <FIRDetails data={firData} />
                        </motion.div>
                    )}

                    {activeTab === 'mindmap' && firData && (
                        <motion.div key="mindmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 'calc(100vh - 120px)' }}>
                            <MindMap data={firData} />
                        </motion.div>
                    )}

                    {activeTab === 'drafting' && firData && (
                        <motion.div key="drafting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <Drafting firData={firData} />
                        </motion.div>
                    )}

                    {activeTab === 'chat' && (
                        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 'calc(100vh - 120px)' }}>
                            <ChatAssistant firData={firData} />
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <FIRHistory
                                userId={user.id}
                                onSelectFIR={(data) => {
                                    setFirData(data)
                                    setActiveTab('details')
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ maxWidth: '800px', margin: '0 auto' }}
                        >
                            <div className="glass-card" style={{ padding: isMobile ? '24px' : '48px', borderRadius: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                {/* Profile Header Background */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', opacity: 0.15, zIndex: 0 }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '30px',
                                        overflow: 'hidden',
                                        margin: '0 auto 16px',
                                        border: '4px solid var(--card-bg)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                        background: 'var(--card-bg)',
                                        position: 'relative'
                                    }}>
                                        <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%' }} />
                                    </div>

                                    <button
                                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                                        style={{
                                            margin: '0 auto 24px',
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            background: isEditingAvatar ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--primary-rgb), 0.1)',
                                            border: `1px solid ${isEditingAvatar ? '#ef4444' : 'var(--primary)'}`,
                                            color: isEditingAvatar ? '#ef4444' : 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isEditingAvatar ? <X size={18} /> : <Edit2 size={18} />}
                                        <span>{isEditingAvatar ? 'Cancel' : 'Change Avatar'}</span>
                                    </button>

                                    {isEditingAvatar ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ marginBottom: '32px' }}
                                        >
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Select Your Avatar</h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                                                gap: '12px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                padding: '12px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '20px',
                                                border: '1px solid var(--border)'
                                            }}>
                                                {avatarOptions.map(seed => (
                                                    <button
                                                        key={seed}
                                                        onClick={() => handleUpdateAvatar(seed)}
                                                        disabled={updatingAvatar}
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            background: avatarSeed === seed ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--card-bg)',
                                                            border: avatarSeed === seed ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            opacity: updatingAvatar ? 0.5 : 1,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`}
                                                            alt={seed}
                                                            style={{ width: '100%', height: '100%' }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{userMetadata.full_name || 'Legal Counselor'}</h2>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, marginBottom: '32px' }}>
                                                <AtSign size={18} />
                                                <span>{userMetadata.user_handle || 'counsel_lex'}</span>
                                            </div>
                                        </>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                                        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                <Mail size={16} />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.email}</p>
                                        </div>

                                        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                <Calendar size={16} />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</span>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{userMetadata.dob ? new Date(userMetadata.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '40px', padding: '24px', borderRadius: '24px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.1)', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--primary)' }}>
                                            <Scale size={20} />
                                            <h4 style={{ fontWeight: 700 }}>LexMind Professional Status</h4>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            Your account is verified as a legal professional. You have full access to FIR Analysis, Case Mapping, and AI Drafting tools.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    )
}

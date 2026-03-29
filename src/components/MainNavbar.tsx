import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import logo from '/@fs/C:/Users/AMAN YATAN/.gemini/antigravity/brain/118fd0c5-c657-4309-b437-04f76d7d21ed/media__1774739657314.png'

interface MainNavbarProps {
    onGetStarted: () => void
    onNavigate: (page: 'landing' | 'security' | 'faq') => void
    theme: 'dark' | 'light'
    toggleTheme: () => void
    currentPage: 'landing' | 'security' | 'faq'
}

export default function MainNavbar({ onGetStarted, onNavigate, theme, toggleTheme, currentPage }: MainNavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleNavigation = (target: string, action: 'scroll' | 'page') => {
        setIsMobileMenuOpen(false)

        if (action === 'scroll') {
            if (currentPage !== 'landing') {
                onNavigate('landing')
                setTimeout(() => {
                    const el = document.getElementById('features')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 300)
            } else {
                const el = document.getElementById('features')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
            }
        } else if (action === 'page') {
            if (target === 'security') onNavigate('security')
            else if (target === 'faq') onNavigate('faq')
            else if (target === 'landing') {
                onNavigate('landing')
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
    }

    const navLinks = [
        { name: 'Home', target: 'landing', action: 'page' },
        { name: 'About', target: 'features', action: 'scroll' },
        { name: 'Security', target: 'security', action: 'page' },
        { name: 'FAQ', target: 'faq', action: 'page' },
    ]

    return (
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
                <div
                    onClick={() => handleNavigation('landing', 'page')}
                    style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', cursor: 'pointer' }}
                >
                    <img
                        src={logo}
                        alt="LexMind"
                        style={{
                            height: isMobile ? '36px' : '42px',
                            width: 'auto',
                            mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
                            filter: theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'contrast(1.1)',
                            display: 'block',
                            opacity: 1
                        }}
                    />
                </div>

                {/* Desktop Links with Hover Animation */}
                <div className="desktop-nav" style={{ display: isMobile ? 'none' : 'flex', gap: '8px', alignItems: 'center' }}>
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            onClick={() => handleNavigation(link.target, link.action as any)}
                            style={{
                                position: 'relative', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 500,
                                color: (currentPage === link.target) ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                borderRadius: '20px',
                                userSelect: 'none'
                            }}
                            onMouseEnter={(e) => {
                                const el = document.getElementById(`nav-hover-${link.name}`)
                                if (el) el.style.opacity = '1'
                            }}
                            onMouseLeave={(e) => {
                                const el = document.getElementById(`nav-hover-${link.name}`)
                                if (el) el.style.opacity = '0'
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 1 }}>{link.name}</span>
                            {currentPage === link.target && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    style={{
                                        position: 'absolute', bottom: '6px', left: '16px', right: '16px', height: '2px', background: 'var(--primary)', borderRadius: '1px'
                                    }}
                                />
                            )}
                            <div
                                id={`nav-hover-${link.name}`}
                                style={{
                                    position: 'absolute', inset: 0, background: 'var(--glass-border)',
                                    borderRadius: '20px', zIndex: 0, opacity: 0, transition: 'opacity 0.2s ease'
                                }}
                            />
                        </div>
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
                        <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {navLinks.map(link => (
                                <div
                                    key={link.name}
                                    onClick={() => handleNavigation(link.target, link.action as any)}
                                    style={{
                                        color: currentPage === link.target ? 'var(--primary)' : 'var(--text-primary)',
                                        fontWeight: 500, padding: '12px 8px', borderRadius: '10px',
                                        cursor: 'pointer',
                                        background: currentPage === link.target ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                                        transition: 'background 0.2s ease'
                                    }}
                                >
                                    {link.name}
                                </div>
                            ))}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 8px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Theme</span>
                                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, Loader2, Eye, EyeOff, User as UserIcon, ArrowLeft, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '/@fs/C:/Users/AMAN YATAN/.gemini/antigravity/brain/118fd0c5-c657-4309-b437-04f76d7d21ed/media__1774739657314.png'

interface AuthProps {
    onBack?: () => void;
}

export default function Auth({ onBack }: AuthProps) {
    const vantaRef = useRef<HTMLDivElement>(null)
    const [vantaEffect, setVantaEffect] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [username, setUsername] = useState('')
    const [userHandle, setUserHandle] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    // Password Strength State
    const [passwordStrength, setPasswordStrength] = useState(0)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (!vantaEffect && vantaRef.current) {
            // @ts-ignore
            if (window.VANTA) {
                // @ts-ignore
                setVantaEffect(window.VANTA.NET({
                    el: vantaRef.current,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color: '#3f51b5',
                    backgroundColor: '#1b263b',
                    points: 10.00,
                    maxDistance: 20.00,
                    spacing: 15.00
                }))
            }
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy()
        }
    }, [vantaEffect])

    // Calculate Password Strength
    useEffect(() => {
        let score = 0;
        if (!password) {
            setPasswordStrength(0);
            return;
        }
        if (password.length > 6) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[a-z]/.test(password)) score += 25;
        if (/[0-9!@#$%^&*]/.test(password)) score += 25;
        setPasswordStrength(score);
    }, [password]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Strict Email Validation
        if (!email.includes('@')) {
            setError("Invalid email format. Please include '@'.");
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: username,
                            user_handle: userHandle,
                            dob: dateOfBirth
                        }
                    }
                })
                if (error) throw error
                alert('Check your email for confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getStrengthColor = (strength: number) => {
        if (strength <= 25) return '#ef4444'; // Red
        if (strength <= 50) return '#f59e0b'; // Amber
        if (strength <= 75) return '#3b82f6'; // Blue
        return '#10b981'; // Green
    };

    const getStrengthLabel = (strength: number) => {
        if (strength <= 25) return 'Weak';
        if (strength <= 50) return 'Fair';
        if (strength <= 75) return 'Good';
        return 'Strong';
    };

    return (
        <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '24px', position: 'relative', background: '#1b263b', overflow: 'hidden' }}>
            {/* Vanta Background Container restored for extra premium feel */}
            <div ref={vantaRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} />

            {/* Back to Landing Page Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="back-button"
                    style={{
                        position: 'absolute',
                        top: '24px',
                        left: '24px',
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: '12px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.3s ease'
                    }}
                    title="Back to Home"
                >
                    <ArrowLeft size={24} />
                </button>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: isMobile ? '100%' : '480px',
                    padding: isMobile ? '32px 24px' : '48px',
                    background: 'rgba(1, 22, 39, 0.65)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '32px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        style={{ marginBottom: '24px' }}
                    >
                        <img
                            src={logo}
                            alt="LexMind"
                            style={{
                                height: '90px',
                                width: 'auto',
                                margin: '0 auto',
                                display: 'block',
                                mixBlendMode: 'screen',
                                filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 4px 16px rgba(0,0,0,0.3))'
                            }}
                        />
                    </motion.div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff', letterSpacing: '-0.03em' }}>
                        {isSignUp ? 'Join LexMind' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
                        {isSignUp ? 'Create your account to get started' : 'Sign in to access your dashboard'}
                    </p>
                </div>

                <form onSubmit={handleAuth}>
                    <AnimatePresence mode="wait">
                        {isSignUp && (
                            <motion.div
                                key="signup-name"
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>Full Name</label>
                                    <div className="input-group" style={{ position: 'relative' }}>
                                        <UserIcon size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            required={isSignUp}
                                            className="auth-input-improved"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="John Doe"
                                            style={{
                                                width: '100%', padding: '14px 16px 14px 48px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '16px', color: 'white', fontSize: '1rem',
                                                transition: 'all 0.2s', outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>Username</label>
                                        <div className="input-group" style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>@</span>
                                            <input
                                                type="text"
                                                required={isSignUp}
                                                className="auth-input-improved"
                                                value={userHandle}
                                                onChange={(e) => setUserHandle(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                                placeholder="handle"
                                                style={{
                                                    width: '100%', padding: '14px 16px 14px 38px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '16px', color: 'white', fontSize: '1rem',
                                                    transition: 'all 0.2s', outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>Birth Date</label>
                                        <input
                                            type="date"
                                            required={isSignUp}
                                            className="auth-input-improved"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            style={{
                                                width: '100%', padding: '14px 16px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '16px', color: 'white', fontSize: '1rem',
                                                transition: 'all 0.2s', outline: 'none',
                                                colorScheme: 'dark'
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>Email Address</label>
                        <div className="input-group" style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="lawyer@example.com"
                                style={{
                                    width: '100%', padding: '14px 16px 14px 48px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${error && error.includes('email') ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                    borderRadius: '16px', color: 'white', fontSize: '1rem',
                                    transition: 'all 0.2s', outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>Password</label>
                        <div className="input-group" style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '14px 48px 14px 48px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px', color: 'white', fontSize: '1rem',
                                    transition: 'all 0.2s', outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Password Strength Glider */}
                        <AnimatePresence>
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: '12px', overflow: 'hidden' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Strength: <span style={{ color: getStrengthColor(passwordStrength), fontWeight: 600 }}>{getStrengthLabel(passwordStrength)}</span></span>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{passwordStrength}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor(passwordStrength) }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            style={{ height: '100%', borderRadius: '3px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {[{ l: 'ABC', r: /[A-Z]/ }, { l: 'abc', r: /[a-z]/ }, { l: '123', r: /[0-9]/ }, { l: '#@!', r: /[!@#$%^&*]/ }].map((req, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: req.r.test(password) ? '#10b981' : 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                                                {req.r.test(password) ? <Check size={10} /> : <X size={10} />} {req.l}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <X size={16} /> {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1rem', fontWeight: 600,
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>OR CONTINUE WITH</span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)' }}></div>
                </div>

                <button
                    onClick={async () => {
                        try {
                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: { redirectTo: window.location.origin }
                            })
                            if (error) throw error
                        } catch (err: any) {
                            setError(err.message)
                        }
                    }}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white', fontSize: '1rem', fontWeight: 500,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                    </svg>
                    Google Account
                </button>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, marginLeft: '8px' }}
                        >
                            {isSignUp ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

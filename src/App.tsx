import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'
import DataSecurity from './components/DataSecurity'
import FAQ from './components/FAQ'
import JigglyBackground from './components/JigglyBackground'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

type ViewType = 'landing' | 'auth' | 'security' | 'faq'

function App() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [currentView, setCurrentView] = useState<ViewType>('landing')

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.setAttribute('data-theme', savedTheme)
        } else {
            document.documentElement.setAttribute('data-theme', 'dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
            if (session?.user) {
                setCurrentView('landing')
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                setCurrentView('landing')
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
                <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            </div>
        )
    }

    const renderView = () => {
        if (user) return <Dashboard user={user} theme={theme} toggleTheme={toggleTheme} />;

        switch (currentView) {
            case 'auth':
                return <Auth onBack={() => setCurrentView('landing')} />;
            case 'security':
                return <DataSecurity onBack={() => setCurrentView('landing')} theme={theme} />;
            case 'faq':
                return <FAQ onBack={() => setCurrentView('landing')} theme={theme} />;
            default:
                return (
                    <LandingPage
                        onGetStarted={() => setCurrentView('auth')}
                        onViewSecurity={() => setCurrentView('security')}
                        onViewFAQ={() => setCurrentView('faq')}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                );
        }
    }

    return (
        <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`} style={{ minHeight: '100vh', color: 'var(--text-primary)' }}>
            <JigglyBackground />
            <AnimatePresence mode="wait">
                <motion.div
                    key={user ? 'dashboard' : currentView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default App

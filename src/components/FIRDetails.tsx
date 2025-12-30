import { useState, useEffect } from 'react'
import { FileText, MapPin, Calendar, Scale, User, ShieldAlert, Clock, Info, Shield, ListChecks } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { FIRMetadata } from '../types'

interface FIRDetailsProps {
    data: FIRMetadata
}

export default function FIRDetails({ data }: FIRDetailsProps) {
    const [activeSubTab, setActiveSubTab] = useState<'summary' | 'entities' | 'timeline' | 'strategy'>('summary')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const detailItems = [
        { icon: FileText, label: 'FIR Number', value: data.firNumber },
        { icon: MapPin, label: 'Police Station', value: data.policeStation || 'N/A' },
        { icon: Calendar, label: 'Date', value: data.date },
        { icon: Scale, label: 'Sections', value: data.sections?.join(', ') || 'N/A' },
    ]

    const subTabs = [
        { id: 'summary', label: 'Summary', icon: Info },
        { id: 'entities', label: 'Entities', icon: User },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'strategy', label: 'Legal Strategy', icon: Shield },
    ]

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: isMobile ? '40px' : '0' }}>
            <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Case Analysis
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.9rem' : '1rem' }}>AI breakdown of FIR {data.firNumber}.</p>
            </div>

            {/* Sub-Tabs Navigation */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                padding: '4px',
                background: 'var(--glass-bg)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                width: '100%',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id as any)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: isMobile ? '8px 16px' : '10px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeSubTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeSubTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontWeight: 600,
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        <tab.icon size={isMobile ? 16 : 18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeSubTab === 'summary' && (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: isMobile ? '12px' : '20px',
                            marginBottom: '32px'
                        }}>
                            {detailItems.map((item, idx) => (
                                <div key={idx} className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--primary)' }}>
                                        <item.icon size={16} />
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                                    </div>
                                    <div style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: 600 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={20} color="var(--primary)" />
                                Incident Summary
                            </h3>
                            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: isMobile ? '1rem' : '1.1rem' }}>
                                {data.incidentSummary}
                            </p>
                        </div>
                    </motion.div>
                )}

                {activeSubTab === 'entities' && (
                    <motion.div
                        key="entities"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}
                    >
                        <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldAlert size={20} color="#ef4444" />
                                Accused Parties
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.accused?.map((person: string, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <User size={18} color="#ef4444" />
                                        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{person}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={20} color="var(--primary)" />
                                Witnesses & Complainant
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--primary)', position: 'absolute', top: '-8px', left: '12px', background: 'var(--card-bg)', padding: '0 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid var(--border)' }}>Complainant</div>
                                    <User size={18} color="var(--primary)" />
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.complainant}</span>
                                </div>
                                {data.witnesses?.map((person: string, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <User size={18} color="var(--text-secondary)" />
                                        <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{person}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSubTab === 'timeline' && (
                    <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card"
                        style={{ padding: isMobile ? '24px' : '40px' }}
                    >
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} color="var(--primary)" />
                            Incident Timeline
                        </h3>
                        <div style={{ position: 'relative', paddingLeft: '32px' }}>
                            <div style={{ position: 'absolute', left: '9px', top: '0', bottom: '0', width: '2px', background: 'var(--primary)', opacity: 0.2 }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {data.timeline?.map((item: any, idx: number) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-30px', top: '4px', width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%', border: '3px solid var(--bg-main)', zIndex: 1 }}></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '2px' }}>{item.time}</div>
                                        <div style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.event}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSubTab === 'strategy' && (
                    <motion.div
                        key="strategy"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '24px' }}
                    >
                        <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={20} color="var(--primary)" />
                                Legal Strategies
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Array.isArray(data.legalStrategy) && data.legalStrategy.map((strategy: string, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', gap: '12px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{idx + 1}</div>
                                        <div style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{strategy}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ListChecks size={20} color="var(--primary)" />
                                Key Evidence
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.evidence?.map((item: any, idx: number) => (
                                    <div key={idx} style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', borderLeft: '4px solid var(--primary)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{item.type}</div>
                                        <div style={{ fontSize: '0.95rem' }}>{item.item}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Server, ChevronLeft } from 'lucide-react'

interface DataSecurityProps {
    onBack: () => void
    theme: 'dark' | 'light'
}

export default function DataSecurity({ onBack, theme }: DataSecurityProps) {
    const sections = [
        {
            icon: Lock,
            title: "End-to-End Encryption",
            description: "All legal documents and FIR data are encrypted at rest using AES-256 and in transit using TLS 1.3. Your case details are only visible to you."
        },
        {
            icon: Eye,
            title: "Strict Confidentiality",
            description: "LexMind adheres to lawyer-client privilege standards. We do not access, read, or share your proprietary legal strategies or client information."
        },
        {
            icon: Database,
            title: "Data Sovereignty",
            description: "Your data is stored in secure, geographically redundant servers. You maintain full ownership of your data and can export or delete it at any time."
        },
        {
            icon: Server,
            title: "secure Infrastructure",
            description: "Built on enterprise-grade infrastructure with 24/7 monitoring, automated backups, and advanced DDoS protection."
        }
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text-primary)', padding: '40px 24px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <motion.button
                    onClick={onBack}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', color: 'var(--primary)',
                        cursor: 'pointer', marginBottom: '40px', fontSize: '1rem', fontWeight: 600
                    }}
                >
                    <ChevronLeft size={20} /> Back to Home
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid var(--primary)', borderRadius: '32px', marginBottom: '24px' }}>
                        <Shield size={24} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>Security First</span>
                    </div>

                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
                        Your Legal Data,<br />
                        <span style={{ color: 'transparent', background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                            Untouchable.
                        </span>
                    </h1>

                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '60px' }}>
                        At LexMind, we understand that confidentiality is the bedrock of the legal profession. Our security architecture is designed to protect your sensitive case information with military-grade standards.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            viewport={{ once: true }}
                            style={{
                                padding: '32px', background: 'var(--card-bg)',
                                borderRadius: '24px', border: '1px solid var(--border)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ width: '48px', height: '48px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <section.icon size={24} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>{section.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{section.description}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: '80px', padding: '40px', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent)', borderRadius: '32px', border: '1px solid var(--glass-border)', textAlign: 'center' }}
                >
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '16px' }}>Compliance & Standards</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        We strictly follow international data protection regulations and industry-standard security protocols to ensure your law firm's peace of mind.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        {['ISO 27001', 'SOC 2 Type II', 'GDPR Compliant', 'HIPAA Ready'].map(badge => (
                            <span key={badge} style={{ padding: '8px 16px', background: 'var(--border)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {badge}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

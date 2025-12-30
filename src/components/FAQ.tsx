import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, HelpCircle } from 'lucide-react'

interface FAQProps {
    onBack: () => void
    theme: 'dark' | 'light'
}

const faqData = [
    {
        question: "How does LexMind analyze FIR documents?",
        answer: "LexMind uses advanced Large Language Models (LLMs) specially fine-tuned for legal terminology. When you upload an FIR (PDF or Image), our system extracts entities like Accused names, Sections of IPC/BNS, Incident dates, and creates a structured summary automatically."
    },
    {
        question: "Is my case data safe and confidential?",
        answer: "Absolutely. We use bank-grade AES-256 encryption for all stored data. Your documents are processed in secure environments and are never used for training public AI models. Only you have access to your case repository."
    },
    {
        question: "Can I generate legal documents using LexMind?",
        answer: "Yes, LexMind includes an automated drafting engine. Based on the FIR analysis, it can generate initial drafts for Bail Applications, Memo of Appearance, and Chronology of Events, saving you hours of manual typing."
    },
    {
        question: "What are 'Interactive Mind Maps'?",
        answer: "Interactive Mind Maps are visual representations of your case. They link witnesses to incidents, evidence to accused, and IPC sections to specific events, helping you spot contradictions or missing links in the prosecution's story."
    },
    {
        question: "Does it support Indian legal sections (IPC/CRPC)?",
        answer: "Yes, LexMind is specifically designed for the Indian legal system. It understands the nuances of the Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), and the newly introduced Bharatiya Nyaya Sanhita (BNS)."
    }
]

export default function FAQ({ onBack, theme }: FAQProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

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
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid var(--primary)', borderRadius: '32px', marginBottom: '24px' }}>
                        <HelpCircle size={24} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>Knowledge Base</span>
                    </div>

                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
                        Common Questions,<br />
                        <span style={{ color: 'transparent', background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                            Clear Answers.
                        </span>
                    </h1>

                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '60px' }}>
                        Everything you need to know about using LexMind for your legal practice. If you have more questions, our support team is always here to help.
                    </p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {faqData.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}
                            onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                        >
                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: activeIndex === idx ? 'var(--primary)' : 'var(--text-primary)', transition: 'color 0.3s' }}>
                                    {item.question}
                                </h3>
                                <motion.div
                                    animate={{ rotate: activeIndex === idx ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown size={20} color={activeIndex === idx ? 'var(--primary)' : 'var(--text-secondary)'} />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {activeIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div style={{ padding: '0 32px 32px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>
                                                {item.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

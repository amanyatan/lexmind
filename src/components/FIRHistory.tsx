import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, Download, ExternalLink, Calendar, Search, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { FIRRecord, FIRMetadata } from '../types'

interface FIRHistoryProps {
    userId: string
    onSelectFIR: (data: FIRMetadata) => void
}

export default function FIRHistory({ userId, onSelectFIR }: FIRHistoryProps) {
    const [records, setRecords] = useState<FIRRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmModal, setConfirmModal] = useState<FIRRecord | null>(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (userId) fetchRecords()
    }, [userId])

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('firs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRecords(data || [])
        } catch (error) {
            console.error('Error fetching records:', error)
            setRecords([])
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirmModal) return

        const record = confirmModal
        setConfirmModal(null)
        setDeletingId(record.id)

        try {
            // 1. Delete from Storage
            if (record.storage_path) {
                const { error: storageError } = await supabase.storage
                    .from('firs')
                    .remove([record.storage_path])

                if (storageError) console.warn("Storage deletion error:", storageError)
            }

            // 2. Delete from Database
            const { error: dbError } = await supabase
                .from('firs')
                .delete()
                .eq('id', record.id)

            if (dbError) throw dbError

            setRecords(prev => prev.filter(r => r.id !== record.id))
        } catch (error: any) {
            console.error('Deletion failed:', error)
            alert(`Failed to delete: ${error.message}`)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredRecords = records.filter(r =>
        r.fir_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleViewPDF = async (path: string) => {
        if (!path) {
            alert('PDF storage logic not fully implemented. Please configure Supabase Storage.')
            return
        }
        const { data } = supabase.storage.from('firs').getPublicUrl(path)
        window.open(data.publicUrl, '_blank')
    }

    return (
        <div style={{ paddingBottom: '40px', position: 'relative' }}>
            {/* Custom Confirm Modal */}
            <AnimatePresence>
                {confirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setConfirmModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{
                                maxWidth: '400px',
                                width: '100%',
                                padding: isMobile ? '24px' : '32px',
                                background: 'var(--card-bg)',
                                textAlign: 'center'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Trash2 size={30} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Confirm Deletion</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                                Are you sure you want to delete <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>FIR No: {confirmModal.fir_number}</span>?
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="btn-outline"
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#ef4444',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{
                marginBottom: '32px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                gap: '20px'
            }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '8px' }}>FIR History</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your analyzed documents.</p>
                </div>
                <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search FIRs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: isMobile ? '16px' : '24px'
                }}>
                    <AnimatePresence>
                        {filteredRecords.map((record) => (
                            <motion.div
                                key={record.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="glass-card"
                                style={{ padding: '20px', opacity: deletingId === record.id ? 0.5 : 1, background: 'var(--card-bg)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ padding: '10px', background: 'var(--glass-bg)', borderRadius: '10px' }}>
                                        <FileText size={20} color="var(--primary)" />
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            <Calendar size={12} />
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </div>
                                        <button
                                            onClick={() => setConfirmModal(record)}
                                            disabled={deletingId === record.id}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                color: '#ef4444',
                                                padding: '6px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Delete FIR"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--text-primary)' }}>FIR No: {record.fir_number}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.filename}</p>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => onSelectFIR(record.metadata)}
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleViewPDF(record.storage_path)}
                                        className="btn-outline"
                                        style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredRecords.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px', background: 'var(--glass-bg)', borderRadius: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No documents found.</p>
                </div>
            )}
        </div>
    )
}


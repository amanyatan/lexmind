import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Film, Calendar, ShieldAlert, MessageSquare, Play, VideoOff, Eye, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface EvidenceRecord {
    id: string;
    file_name: string;
    crime_type: string;
    fault: string;
    reasoning: string;
    ipc_sections: string[];
    file_url?: string;
    created_at: string;
}

interface EvidenceHistoryProps {
    onChat: (record: EvidenceRecord) => void;
}

export default function EvidenceHistory({ onChat }: EvidenceHistoryProps) {
    const [history, setHistory] = useState<EvidenceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchHistory = async () => {
        setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('evidence_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setHistory(data);
            }
            setLoading(false);
        };
    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDelete = async (record: EvidenceRecord) => {
        if (!window.confirm(`Are you sure you want to delete this case: ${record.file_name}?`)) return;

        setDeletingId(record.id);
        try {
            // 1. Delete from physical storage if url exists
            if (record.file_url) {
                await axios.post('/api/delete-evidence', { fileUrl: record.file_url });
            }

            // 2. Delete from Supabase
            const { error } = await supabase
                .from('evidence_history')
                .delete()
                .eq('id', record.id);

            if (error) throw error;

            setHistory(prev => prev.filter(h => h.id !== record.id));
        } catch (err: any) {
            console.error("Deletion failed:", err);
            alert("Failed to delete forensic case history record.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Loading your forensic evidence vault...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px' }}>Evidence Vault</h1>
            
            {history.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', borderRadius: '24px' }}>
                    <Film size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Evidence Found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Upload a video or image in the Evidence Tool to start building your case vault.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {history.map((record, i) => (
                        <motion.div 
                            key={record.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card" 
                            style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Film size={18} color="var(--primary)" /> {record.file_name}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={14} /> Analyzed on {new Date(record.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {record.file_url && (
                                        <button 
                                            onClick={() => setPlayingId(playingId === record.id ? null : record.id)}
                                            style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            {playingId === record.id ? <VideoOff size={14} /> : <Play size={14} />} 
                                            {playingId === record.id ? 'Close Player' : 'Watch Case'}
                                        </button>
                                    )}
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ShieldAlert size={14} /> {record.crime_type}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(record)}
                                        disabled={deletingId === record.id}
                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {playingId === record.id && record.file_url && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', borderRadius: '12px', background: 'black' }}
                                    >
                                        <video 
                                            src={record.file_url} 
                                            controls 
                                            autoPlay
                                            style={{ width: '100%', maxHeight: '400px' }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Primary Fault</h4>
                                <p style={{ fontWeight: 600 }}>{record.fault}</p>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Violations Detected</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {record.ipc_sections?.map((sec, idx) => (
                                        <span key={idx} style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {sec.split(':')[0]}
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button 
                                        onClick={() => onChat(record)}
                                        style={{ 
                                            flex: 1, 
                                            padding: '12px', 
                                            background: 'var(--secondary)', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontSize: '0.9rem', 
                                            fontWeight: 600, 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <MessageSquare size={16} /> Discuss in AI Chat
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Film, Calendar, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvidenceRecord {
    id: string;
    file_name: string;
    crime_type: string;
    fault: string;
    reasoning: string;
    ipc_sections: string[];
    created_at: string;
}

export default function EvidenceHistory() {
    const [history, setHistory] = useState<EvidenceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
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
        fetchHistory();
    }, []);

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
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShieldAlert size={14} /> {record.crime_type}
                                </div>
                            </div>
                            
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
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

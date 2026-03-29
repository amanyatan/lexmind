import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Search, FileText, Activity, ShieldAlert, ArrowRight } from 'lucide-react';
import CircularProgressWithLabel from './CircularProgressWithLabel';

interface EvidenceAnalysisProps {
    onDraftFIR: (analysisData: any) => void;
}

export default function EvidenceAnalysis({ onDraftFIR }: EvidenceAnalysisProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);

    const onDrop = async (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setError(null);
        setAnalysisResult(null);

        // Generate preview for images/videos
        if (uploadedFile.type.startsWith('image/') || uploadedFile.type.startsWith('video/')) {
            setPreviewUrl(URL.createObjectURL(uploadedFile));
        }

        await analyzeMedia(uploadedFile);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'video/*': ['.mp4', '.mov', '.webm']
        },
        maxSize: 15 * 1024 * 1024, // 15MB limit for inline processing to be safe
        multiple: false,
        disabled: isAnalyzing
    });

    const analyzeMedia = async (mediaFile: File) => {
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('media', mediaFile);

            const res = await fetch('/api/analyze-evidence', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = 'Failed to analyze evidence. The backend system might be offline.';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server Error (${res.status}): Make sure you completely RESTARTED your backend terminal.`;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            setAnalysisResult(data);

            // Attempt to save to evidence_history (if the SQL table exists)
            try {
                const { supabase } = await import('../lib/supabase');
                await supabase.from('evidence_history').insert([{
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    file_name: mediaFile.name,
                    crime_type: data.crimeType,
                    fault: data.fault,
                    reasoning: data.reasoning,
                    ipc_sections: data.ipcSections
                }]);
            } catch (saveErr) {
                console.warn("Evidence history table might not exist yet:", saveErr);
            }

        } catch (err: any) {
            console.error("Evidence Analysis Error:", err);
            setError(err.message || "Failed to analyze evidence. Make sure your local server is running.");
            setFile(null); // Reset the file so the Dropzone UI returns and shows the error!
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>
                    <Search size={16} /> Forensic Analysis Engine
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 800 }}>
                    Accident & Crime Evidence Predictor
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Upload video footage or images of an accident scene or crime. LexMind AI will analyze the visual evidence, determine fault, predict the crime type, and suggest relevant legal sections.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div
                            {...getRootProps()}
                            className={`glass-card upload-zone ${isDragActive ? 'upload-zone-active' : ''}`}
                            style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '32px',
                            border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
                            background: isDragActive ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--card-bg)'
                        }}
                    >
                        <input {...getInputProps()} />
                        <div style={{
                            width: '80px', height: '80px', background: 'rgba(var(--primary-rgb), 0.1)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px', color: 'var(--primary)'
                        }}>
                            <Upload size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
                            {isDragActive ? 'Drop media file here...' : 'Upload Image or Video (up to 15MB)'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Supported formats: MP4, MOV, WEBM, JPG, PNG.</p>
                        {error && (
                            <div style={{ marginTop: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        </div>
                    </motion.div>
                ) : isAnalyzing ? (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card"
                        style={{ padding: '60px 40px', textAlign: 'center', borderRadius: '32px' }}
                    >
                        <div style={{ marginBottom: '32px' }}>
                            {previewUrl && file.type.startsWith('video/') ? (
                                <video src={previewUrl} style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '20px', opacity: 0.5 }} autoPlay loop muted />
                            ) : (
                                <img src={previewUrl!} style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '20px', opacity: 0.5 }} />
                            )}
                        </div>
                        <Activity size={40} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 24px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Analyzing Evidence...</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Extracting entities, predicting fault vectors, and mapping to penal codes visually.</p>
                    </motion.div>
                ) : analysisResult ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ padding: '40px', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '40px' }}>
                            {/* Left Column: Media Preview */}
                            <div>
                                {previewUrl && file.type.startsWith('video/') ? (
                                    <video src={previewUrl} style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)' }} controls />
                                ) : (
                                    <img src={previewUrl!} style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)' }} />
                                )}
                                <div style={{ marginTop: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Detected Crime Type</h4>
                                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldAlert size={18} /> {analysisResult.crimeType}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: AI Analysis */}
                            <div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Evidence Report</h3>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>Fault Prediction</h4>
                                    <p style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>{analysisResult.fault}</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>Detailed Reasoning</h4>
                                    <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{analysisResult.reasoning}</p>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>Relevant Sections & Laws</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {analysisResult.ipcSections && Array.isArray(analysisResult.ipcSections) ? analysisResult.ipcSections.map((sec: string, idx: number) => (
                                            <span key={idx} style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
                                                {sec}
                                            </span>
                                        )) : <span style={{ color: 'var(--text-secondary)' }}>No specific sections identified.</span>}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                    <button 
                                        onClick={() => onDraftFIR(analysisResult)} 
                                        className="btn-primary" 
                                        style={{ flex: 1, minWidth: '220px', padding: '16px', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <FileText size={20} /> Convert to Draft
                                    </button>
                                    <button 
                                        onClick={() => onDraftFIR({ ...analysisResult, _action: 'CHAT' })} 
                                        style={{ flex: 1, minWidth: '220px', padding: '16px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        Interpret in AI Chat <ArrowRight size={20} />
                                    </button>
                                    <button 
                                        onClick={() => { setFile(null); setAnalysisResult(null); }} 
                                        style={{ padding: '16px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

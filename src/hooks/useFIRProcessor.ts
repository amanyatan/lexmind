import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { CONFIG } from '../config';
import { FIRMetadata } from '../types';

export const useFIRProcessor = (userId: string) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const processingSteps = [
        "Scanning document structure...",
        "Identifying legal entities...",
        "Generating litigation timeline...",
        "Evaluating IPC sections...",
        "Formulating defense strategy...",
        "Finalizing analysis report..."
    ];

    const processFIR = async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setProcessingStep(0);

        // Simulated progress for UX
        const interval = setInterval(() => {
            setProcessingStep(s => (s < processingSteps.length - 1 ? s + 1 : s));
        }, 1500);

        try {
            // 1. Send to Backend
            const formData = new FormData();
            formData.append('data', file);

            const response = await axios.post(CONFIG.API_FIR_ANALYSIS_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const result = response.data as FIRMetadata;

            if (!result || typeof result !== 'object') {
                throw new Error("Invalid response from analysis engine.");
            }

            // 2. Upload to Storage
            const storagePath = `firs/${userId}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('firs').upload(storagePath, file);

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error("Supabase Storage bucket 'firs' not found. Please create a public bucket named 'firs' in your Supabase project.");
                }
                throw uploadError;
            }

            // 3. Save to Database
            const { error: dbError } = await supabase.from('firs').insert([{
                user_id: userId,
                fir_number: result.firNumber || "NEW-CASE",
                filename: file.name,
                storage_path: storagePath,
                metadata: result
            }]);

            if (dbError) throw dbError;

            setProcessingStep(processingSteps.length - 1);
            return result;

        } catch (err: any) {
            console.error("Processing Error:", err);
            const backendError = err.response?.data?.error;
            setError(backendError || err.message || "An unexpected error occurred");
            throw err;
        } finally {
            clearInterval(interval);
            setIsProcessing(false);
        }
    };

    const resetError = () => {
        setError(null);
        setProcessingStep(0);
    };

    return {
        processFIR,
        isProcessing,
        processingStep,
        processingMessage: processingSteps[processingStep],
        error,
        resetError
    };
};

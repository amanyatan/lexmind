export const CONFIG = {
    // If VITE_API_URL is set in .env or deployment, use it. Otherwise, default to relative paths.
    // Use relative paths in production (Vercel) to hit the co-located /api folder.
    API_FIR_ANALYSIS_URL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/analyze-fir` 
        : "/api/analyze-fir",
    
    API_CHAT_URL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/chat` 
        : "/api/chat",
        
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
} as const;

export default CONFIG;

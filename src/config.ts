export const CONFIG = {
    API_FIR_ANALYSIS_URL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/analyze-fir` : "/api/analyze-fir",
    API_CHAT_URL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/chat` : "/api/chat",
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
} as const;

export default CONFIG;

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fetch = global.fetch || require('node-fetch');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static files from public/uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Error handler for Multer limits
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large (limit is 100MB)' });
        }
        return res.status(400).json({ error: err.message });
    }
    next(err);
};

// Multer for file uploads - allow up to 100MB for large videos
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
});

app.use(handleMulterError);

// Helper to call AI API with Fallback mechanism
async function callAI(messages, modelId = 'deepseek-chat') {
    try {
        if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error('DEEPSEEK_API_KEY is missing');
        }

        console.log(`[AI] Attempting call with DeepSeek (${modelId})...`);
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages,
                temperature: 0.1
            })
        });

        if (response.status === 402) {
            console.warn("⚠️ DeepSeek: Insufficient Balance. Falling back to Gemini...");
            return await callGeminiFallback(messages);
        }

        if (!response.ok) {
            const err = await response.text();
            console.error(`DeepSeek API Error (${response.status}):`, err);
            // Fallback for any other API failures
            return await callGeminiFallback(messages);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (err) {
        console.error('[AI Error]:', err.message);
        return await callGeminiFallback(messages);
    }
}

// Fallback to Gemini if DeepSeek fails
async function callGeminiFallback(messages) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY missing too.");
        }

        console.log("[AI] Using Gemini 1.5 Flash as fallback...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using -latest for better compatibility with current v1beta API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        // Convert OpenAI message format to Gemini format
        const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (gemErr) {
        console.error("[Fallback Error]:", gemErr.message);
        throw new Error("Both DeepSeek and Gemini failed. Please check your API keys and balances.");
    }
}

// ============================================
// ENDPOINT 1: PDF/FIR Analysis
// ============================================
app.post('/analyze-fir', upload.single('data'), async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file received');
            return res.status(400).json({ error: 'No PDF uploaded' });
        }

        console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

        // Extract text from PDF
        let extractedText = "";
        try {
            const pdfData = await pdfParse(req.file.buffer);
            extractedText = pdfData.text;
            console.log("PDF Text Extracted, length:", extractedText.length);
        } catch (pdfError) {
            console.error("PDF Parsing Error:", pdfError);
            return res.status(500).json({ error: "Failed to parse PDF text." });
        }

        const prompt = `
        You are a strict legal document validator. 
        Your primary role is to identify if the provided text is an official Indian Police First Information Report (FIR).
        
        STRICT VALIDATION RULES:
        1. If the text does not contain "FIRST INFORMATION REPORT", "FIR No.", "Police Station", or "Under Section", it is NOT an FIR.
        2. If the text is an offer letter, resume, invoice, or any non-legal document, it is NOT an FIR.
        3. If it is NOT an FIR, return ONLY: { "isFIR": false, "error": "This document is not a valid FIR. Please upload an official First Information Report PDF." }

        If it IS an FIR:
        1. Extract all details into the specified JSON format.
        2. "firNumber" MUST be the actual number (e.g., 123/2024). If you cannot find a real FIR number, set isFIR to false.
        3. "isFIR" MUST be true.

        JSON FORMAT:
        {
            "isFIR": true,
            "firNumber": "Specific FIR No/Year",
            "incidentDate": "Full date and time of incident",
            "location": "Exact place of occurrence",
            "policeStation": "Police Station name",
            "sections": ["List of IPC/Act sections e.g. 302, 34"],
            "incidentSummary": "Detailed narrative summary",
            "accused": ["Full names"],
            "witnesses": ["Full names"],
            "complainant": "Full name",
            "evidence": [{ "type": "Physical/Documentary", "item": "Description" }],
            "ipcProvisions": ["Detailed mapping"],
            "legalStrategy": ["Strategic advice"],
            "defenseStrategy": ["Defense points"],
            "timeline": [{ "time": "Date/Time", "event": "Event" }]
        }

        RETURN ONLY JSON.

        TEXT TO ANALYZE:
        ${extractedText}
        `;

        const messages = [
            { role: "system", content: "You are a strict legal document validator. Respond purely with JSON." },
            { role: "user", content: prompt }
        ];

        const text = await callAI(messages, 'deepseek-chat');

        console.log("Raw AI response received.");

        // Parse JSON response
        const data = JSON.parse(text);

        // Secondary Validation: If AI was too "helpful" but fields are empty
        const hasFirKeywords = extractedText.toLowerCase().includes('fir') || extractedText.toLowerCase().includes('police');
        const hasValidNumber = data.firNumber && data.firNumber !== "N/A" && data.firNumber !== "Unknown";

        if (data.isFIR === false || !hasValidNumber || (!hasFirKeywords && data.isFIR)) {
            console.log("Validation Failed: Document rejected as non-FIR.");
            return res.status(400).json({
                error: "The uploaded document does not appear to be a valid FIR. Ensure it contains a Case/FIR number and Police Station details.",
                code: "INVALID_DOCUMENT"
            });
        }

        console.log("Analysis successful. FIR Number:", data.firNumber);
        res.json(data);

    } catch (err) {
        console.error("Error in FIR analysis:", err);
        res.status(500).json({ error: err.message, details: "Check server logs." });
    }
});

// ============================================
// ENDPOINT 2: Evidence Analysis
// ============================================
app.post('/analyze-evidence', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No media uploaded' });
        }

        const prompt = `
        Analyze this image as potential evidence. Return ONLY a pure JSON object in this exact format:
        {
            "crimeType": "Type of crime or accident identified",
            "fault": "Who appears to be at fault based on the visual evidence",
            "reasoning": "Detailed visual reasoning for this conclusion",
            "ipcSections": ["Relevant IPC Section 1", "Relevant IPC Section 2"]
        }`;

        // Use Gemini because it natively supports image and video analysis
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing. Required for visual/video evidence analysis.");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-2.5-flash as it is fast and supports multi-modal inputs natively
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("Generating analysis from Gemini...");
        
        const response = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            }
        ]);
        
        const responseText = response.response.text();
        const cleanedText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

        const data = JSON.parse(cleanedText);
        
        // Save file locally for playback
        const fileExt = path.extname(req.file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const finalPath = path.join(uploadsDir, uniqueName);
        fs.writeFileSync(finalPath, req.file.buffer);
        data.fileUrl = `/api/uploads/${uniqueName}`;

        console.log("Evidence analyzed successfully.");
        res.json(data);
        
    } catch (err) {
        console.error("Error in Evidence analysis:", err);
        res.status(500).json({ error: "Failed to process visual evidence: " + err.message });
    }
});

// Load legal data for context injection
let ipcData = [];
try {
    const ipcPath = path.join(__dirname, '..', '..', 'legallaws', 'ipc.json');
    if (fs.existsSync(ipcPath)) {
        ipcData = JSON.parse(fs.readFileSync(ipcPath, 'utf8'));
        console.log(`✅ Loaded ${ipcData.length} IPC legal records for Lexmind AI.`);
    } else {
        console.warn("⚠️ ipc.json not found. Legal context injection will be limited.");
    }
} catch (err) {
    console.error("❌ Error loading ipc.json:", err.message);
}

// ============================================
// ENDPOINT 3: Generic AI Chat (Required by ChatAssistant)
// ============================================
app.post('/chat', async (req, res) => {
    try {
        const { message, firContext, history = [] } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[Chat] Processing message: "${message.substring(0, 50)}..."`);

        let contextPrompt = "";
        if (firContext) {
            contextPrompt = `
            THE USER IS CURRENTLY CONSULTING ON THIS CASE:
            FIR Number: ${firContext.firNumber}
            Location: ${firContext.location}
            Police Station: ${firContext.policeStation}
            IPC Sections: ${firContext.sections?.join(', ')}
            Summary: ${firContext.incidentSummary}
            `;
        }

        const systemPrompt = `
        You are LexMind AI, a specialized legal assistant focusing on Indian Criminal Law (IPC, CrPC, BNS).
        Your goal is to provide strategic legal advice, explain complex laws in simple terms, and help users understand their rights.
        
        ${contextPrompt}

        Tone: Professional, supportive, and clear.
        Language: English (with a touch of Hinglish if appropriate for the Indian context, unless the user specifies otherwise).
        
        Structure your response with clear headings and bullet points where helpful.
        Always include a disclaimer that you are an AI assistant and not a replacement for professional legal advice.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: message }
        ];

        // Call AI (using deepseek-chat as configured in this server)
        const aiResponse = await callAI(messages, 'deepseek-chat');

        res.json({ output: aiResponse });

    } catch (err) {
        console.error('[Chat Error]:', err);
        res.status(500).json({ error: "Chat service is currently unavailable. " + err.message });
    }
});

// ============================================
// ENDPOINT 4: Lexmind AI Chat (Premium)
// ============================================
app.post('/api/lexmind/chat', async (req, res) => {
    try {
        const { user_message, language = 'hinglish', history = [] } = req.body;
        if (!user_message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[Lexmind] Processing message in ${language}: "${user_message.substring(0, 50)}..."`);

        // 1. Contextual Search (Simple Keyword Match)
        const keywords = user_message.toLowerCase().split(' ').filter(word => word.length > 3);
        let relevantContext = "";
        if (ipcData.length > 0) {
            const matches = ipcData.filter(item => 
                keywords.some(kw => item.question.toLowerCase().includes(kw) || item.answer.toLowerCase().includes(kw))
            ).slice(0, 5); // Limit to top 5 matches
            
            if (matches.length > 0) {
                relevantContext = matches.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n');
                console.log(`[Lexmind] Found ${matches.length} relevant legal context segments.`);
            }
        }

        // 2. System Prompt
        const systemPrompt = `
        You are Lexmind AI, an intelligent Indian legal assistant.
        Your goal is to help users understand legal issues in simple, calm, and professional language.
        You must respond in ${language}. 
        If ${language} is 'hinglish', use a mix of Hindi and English like a typical Indian conversation.

        STRUCTURE OF RESPONSE:
        Your response MUST be a JSON object with these fields:
        {
          "text": "The conversational response to the user",
          "questions": ["2-3 clarifying questions to understand their case better"],
          "laws": ["Specific Indian laws or sections applicable"],
          "explanation": "A very simple explanation of their legal situation",
          "steps": ["Step-by-step actionable advice"],
          "risk_level": "Low | Moderate | High | Critical"
        }

        RULES:
        - Identify applicable Indian laws (IPC, CRPC, Constitution, etc.)
        - Never hallucinate laws. Use the provided context if available.
        - Be supportive, clear, and professional. Not robotic.
        - Always suggest consulting a real lawyer for serious matters.
        - If the user is just saying hello, still return the JSON structure but with appropriate content.

        ${relevantContext ? `RELEVANT LEGAL CONTEXT:\n${relevantContext}` : ""}
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-5).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: typeof m.content === 'object' ? JSON.stringify(m.content) : m.content })),
            { role: "user", content: user_message }
        ];

        const aiResponse = await callAI(messages, 'deepseek-chat');
        
        // Clean AI response in case it contains markdown blocks
        const cleanedJson = aiResponse.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
        const data = JSON.parse(cleanedJson);

        res.json(data);

    } catch (err) {
        console.error('[Lexmind Chat Error]:', err);
        res.status(500).json({ error: "Lexmind AI is currently unavailable. " + err.message });
    }
});

// ============================================
// ENDPOINT 5: ElevenLabs TTS
// ============================================
app.post('/lexmind/tts', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) throw new Error("ELEVENLABS_API_KEY is missing.");

        const voiceId = "pNInz6obpg8ndclQU7C3"; // A natural, professional voice (can change)
        
        console.log(`[TTS] Generating voice for text: "${text.substring(0, 50)}..."`);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`ElevenLabs Error: ${err}`);
        }

        const audioBuffer = await response.arrayBuffer();
        res.set('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));

    } catch (err) {
        console.error('[TTS Error]:', err);
        res.status(500).json({ error: "Voice generation failed." });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LexMind Backend Running' });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 LexMind Backend listening on http://localhost:${port}`);
    console.log(`   - POST /analyze-fir      → FIR PDF Analysis`);
    console.log(`   - POST /chat             → AI Chat Assistant`);
    console.log(`   - POST /api/lexmind/chat → Premium Lexmind Chat`);
    console.log(`   - POST /api/lexmind/tts  → ElevenLabs Voice`);
    console.log(`   - GET  /health           → Health Check\n`);
});

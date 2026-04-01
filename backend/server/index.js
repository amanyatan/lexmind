require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fetch = global.fetch || require('node-fetch');
const fs = require('fs');
const os = require('os');
const path = require('path');

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

// Helper to call DeepSeek API
async function callDeepSeek(messages, model = 'deepseek-chat') {
    if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is missing in your .env file');
    }
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`DeepSeek API Error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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

        const text = await callDeepSeek(messages, 'deepseek-chat');

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

        // DeepSeek doesn't natively support video files or all images easily yet.
        // We will try sending the image to deepseek-chat (though deepseek-vision is not fully open yet).
        // If it's a video, we must explicitly throw an error as DeepSeek doesn't support video processing.
        if (req.file.mimetype.startsWith('video/')) {
            throw new Error("DeepSeek API currently does not support direct video file analysis. Please upload an image instead.");
        }

        const messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` } }
                ]
            }
        ];

        console.log("Generating analysis from DeepSeek...");
        const responseText = await callDeepSeek(messages, 'deepseek-chat');
        
        const cleanedText = responseText.replace(/^```(json)?/m, '').replace(/```$/m, '').trim();

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

app.post('/chat', async (req, res) => {
    try {
        const { message, history = [], firContext = null } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log("Generating AI response with Gemini...");

        // Construct conversation history for Gemini
        const systemPrompt = `
        You are LexMind AI, a specialized legal assistant for Indian criminal law. 
        Your goal is to assist lawyers with case analysis, legal strategy, and procedural questions.
        
        ${firContext ? `CONTEXT OF CURRENT CASE BEING ANALYZED:
        - FIR Number: ${firContext.firNumber}
        - Sections: ${firContext.sections?.join(', ')}
        - Accused: ${firContext.accused?.join(', ')}
        - Summary: ${firContext.incidentSummary}
        - Strategy already identified: ${firContext.legalStrategy?.join('. ')}` : "No specific case is currently selected."}

        Guidelines:
        1. Be professional, concise, and legally accurate.
        2. Reference specific Indian Penal Code (IPC) or Bharatiya Nyaya Sanhita (BNS) sections where applicable.
        3. Do not give binding legal advice, but provide strategic insights and precedents.
        4. If history is provided, maintain context of the conversation.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: "user", content: message }
        ];

        const botResponse = await callDeepSeek(messages, 'deepseek-chat');

        console.log("AI Response generated successfully.");
        res.json({ output: botResponse });

    } catch (err) {
        console.error('Gemini Chat Error:', err.message);
        res.status(500).json({ error: "AI Assistant failed to respond. " + err.message });
    }
});

// ============================================
// ENDPOINT 4: Delete Evidence
// ============================================
app.post('/delete-evidence', async (req, res) => {
    try {
        const { fileUrl } = req.body;
        if (!fileUrl) return res.status(400).json({ error: 'fileUrl is required' });

        // Security check: only allow deleting from /uploads/
        if (!fileUrl.includes('/uploads/')) return res.status(403).json({ error: 'Invalid file path' });

        const fileName = fileUrl.split('/').pop();
        const filePath = path.join(uploadsDir, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${fileName}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete physical file." });
    }
});

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LexMind Backend Running (DeepSeek)' });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 LexMind Backend listening on http://localhost:${port}`);
    console.log(`   - POST /analyze-fir  → FIR PDF Analysis`);
    console.log(`   - POST /chat         → AI Chat Assistant`);
    console.log(`   - GET  /health       → Health Check\n`);
});

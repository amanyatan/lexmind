require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
// use node-fetch if global fetch is not available (older node versions)
const fetch = global.fetch || require('node-fetch');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json());

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
    }
});

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Raw AI response length:", text.length);

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
// ENDPOINT 2: Chat / AI Assistant (Proxy to n8n)
// ============================================
const N8N_WEBHOOK_URL = "https://amanyatannnn.app.n8n.cloud/webhook/b56d416c-8328-487d-8032-958c974be2f9/chat";

app.post('/chat', async (req, res) => {
    try {
        const { message, history = [], firContext = null } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log("Forwarding chat to n8n...");

        // Send to n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatInput: message,
                message: message,
                firContext: firContext,
                history: history
            })
        });

        console.log("n8n Status:", response.status);

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`n8n error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        console.log("n8n Response received.");

        // n8n response mapping
        const botResponse = data.output || data.text || data.message || (typeof data === 'string' ? data : null);

        if (!botResponse) {
            console.error("Unexpected n8n response format:", response.data);
            return res.json({ output: "I received a response from n8n but couldn't parse the message." });
        }

        res.json({ output: botResponse });

    } catch (err) {
        console.error('Proxy Error (Chat):', err.message);
        res.status(500).json({ error: "Failed to connect to n8n workflow. " + err.message });
    }
});

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LexMind Backend Running (GPT-4)' });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 LexMind Backend (Gemini 2.5 Flash) listening on http://localhost:${port}`);
    console.log(`   - POST /analyze-fir  → FIR PDF Analysis`);
    console.log(`   - POST /chat         → AI Chat Assistant`);
    console.log(`   - GET  /health       → Health Check\n`);
});

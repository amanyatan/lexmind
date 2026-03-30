import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

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
    model: 'gemini-1.5-flash',
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
    }
});

// ============================================
// ENDPOINT 1: PDF/FIR Analysis
// ============================================
app.post('/api/analyze-fir', upload.single('data'), async (req, res) => {
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
// ENDPOINT 2: Chat / AI Assistant
// ============================================
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], firContext = null } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log("Generating AI response with Gemini...");

        // Construct conversation history for Gemini
        // LexMind Assistant identity and context
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

        // Format history for Gemini API
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
        });

        const result = await model.generateContent({
            contents,
            generationConfig: {
                temperature: 0.7, // Higher for chat
                maxOutputTokens: 1000,
                responseMimeType: 'text/plain' // Chat usually returns plain text
            }
        });

        const response = await result.response;
        const botResponse = response.text();

        console.log("AI Response generated successfully.");
        res.json({ output: botResponse });

    } catch (err) {
        console.error('Gemini Chat Error:', err.message);
        res.status(500).json({ error: "AI Assistant failed to respond. " + err.message });
    }
});

// ============================================
// Health Check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LexMind Backend Running on Vercel (Gemini 2.5 Flash)' });
});

export default app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
// use node-fetch if global fetch is not available (older node versions)
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

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to get model (allows fallback)
async function getModel(modelName = 'gemini-2.5-flash') {
    try {
        return genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1
            }
        });
    } catch (e) {
        console.warn(`Model ${modelName} not available, falling back to gemini-1.5-flash`);
        return genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1
            }
        });
    }
}

// Global model instance
let model;
(async () => {
    model = await getModel('gemini-2.5-flash');
})();

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

        if (!model) model = await getModel('gemini-2.5-flash');

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

const { GoogleAIFileManager } = require('@google/generative-ai/server');

// ============================================
// ENDPOINT 2: Evidence Analysis (Image/Video)
// ============================================
app.post('/analyze-evidence', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No media file uploaded' });
        }
        
        console.log(`Analyzing evidence: ${req.file.originalname} (${req.file.mimetype}) - ${req.file.size} bytes`);
        
        if (!model) model = await getModel('gemini-1.5-flash');

        const prompt = `
        You are a highly skilled forensic traffic anaylst and criminal legal expert in India. 
        Analyze the provided image or video evidence of an accident or crime scene.
        
        Determine whose fault it is, exactly what happened, the severity, and what Indian Penal Code (IPC) or Bharatiya Nyaya Sanhita (BNS) sections apply.
        
        Respond ONLY with a beautifully structured JSON that matches the following format:
        {
            "fault": "Clear statement of who is likely at fault (e.g., The driver of the red car, The pedestrian).",
            "reasoning": "A highly detailed, step-by-step forensic analysis of what the evidence shows.",
            "crimeType": "Short category (e.g., Severe Traffic Collision, Hit and Run, Vandalism).",
            "ipcSections": [
                "IPC Section 279: Rash driving or riding on a public way",
                "IPC Section 337: Causing hurt by act endangering life"
            ]
        }
        
        Do NOT include markdown formatting wrappers like \`\`\`json. Return pure JSON.
        `;

        // If it's an image and DeepSeek is available, try fallback if Gemini fails
        const tryDeepSeekImage = async (base64) => {
            if (!process.env.DEEPSEEK_API_KEY) return null;
            try {
                const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
                    body: JSON.stringify({
                        model: "deepseek-v3-vision", // If user has access to a vision model!
                        messages: [{
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                { type: "image_url", image_url: { url: `data:${req.file.mimetype};base64,${base64}` } }
                            ]
                        }]
                    })
                });
                if (dsRes.ok) return await dsRes.json();
            } catch (e) { console.warn("DeepSeek Vision failed:", e); }
            return null;
        };

        let mediaPart;

        if (req.file.mimetype.startsWith('video/')) {
            console.log("Video detected. Using Google AI File API...");
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
            const tempFilePath = path.join(os.tmpdir(), `temp_vid_${Date.now()}_${req.file.originalname}`);
            
            // Write to disk temporarily for the SDK
            fs.writeFileSync(tempFilePath, req.file.buffer);
            
            try {
                const uploadResult = await fileManager.uploadFile(tempFilePath, {
                    mimeType: req.file.mimetype,
                    displayName: req.file.originalname,
                });
                
                console.log(`Uploaded to Gemini: ${uploadResult.file.uri}`);
                
                // Wait for video processing on Google's servers
                let fileInfo = await fileManager.getFile(uploadResult.file.name);
                while (fileInfo.state === "PROCESSING") {
                    console.log('Waiting for video processing...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    fileInfo = await fileManager.getFile(uploadResult.file.name);
                }
                
                if (fileInfo.state === "FAILED") {
                    throw new Error("Google AI rejected the video file.");
                }
                
                mediaPart = {
                    fileData: {
                        fileUri: uploadResult.file.uri,
                        mimeType: uploadResult.file.mimeType
                    }
                };
            } finally {
                // Ensure cleanup
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            }
        } else {
            // Images use inline data
            mediaPart = {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            };
        }

        console.log("Generating analysis from Gemini...");
        let responseText;
        try {
            const result = await model.generateContent([prompt, mediaPart]);
            responseText = (await result.response).text();
        } catch (geminiErr) {
            console.error("Gemini failed, checking for DeepSeek fallback...", geminiErr.message);
            
            // If it's an image and Gemini failed (e.g. 429), try DeepSeek
            if (!req.file.mimetype.startsWith('video/')) {
                const dsResult = await tryDeepSeekImage(req.file.buffer.toString("base64"));
                if (dsResult) {
                    responseText = dsResult.choices[0].message.content;
                    console.log("DeepSeek fallback successful for image analysis.");
                } else {
                    throw geminiErr; // If DS also fails or isn't available, rethrow Gemini error
                }
            } else {
                throw geminiErr; // Video analysis is Gemini-only for now
            }
        }
        
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

        if (!model) model = await getModel('gemini-2.5-flash');

        // Check if we should use DeepSeek (if Gemini fails or user explicitly has DEEPSEEK_API_KEY)
        if (process.env.DEEPSEEK_API_KEY) {
            console.log("DeepSeek API Key found. Attempting DeepSeek as primary/fallback...");
            try {
                const deepSeekRes = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
                            { role: "user", content: message }
                        ],
                        stream: false
                    })
                });

                if (deepSeekRes.ok) {
                    const deepSeekData = await deepSeekRes.json();
                    console.log("DeepSeek response received successfully.");
                    return res.json({ output: deepSeekData.choices[0].message.content });
                }
                console.warn("DeepSeek API failed, falling back to Gemini...");
            } catch (dsErr) {
                console.error("DeepSeek Attempt Error:", dsErr);
            }
        }

        const result = await model.generateContent({
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                responseMimeType: 'text/plain'
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
    res.json({ status: 'ok', message: 'LexMind Backend Running (Gemini)' });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 LexMind Backend listening on http://localhost:${port}`);
    console.log(`   - POST /analyze-fir  → FIR PDF Analysis`);
    console.log(`   - POST /chat         → AI Chat Assistant`);
    console.log(`   - GET  /health       → Health Check\n`);
});

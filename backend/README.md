# LexMind Backend Services

This folder contains two separate backend services:

## 1. PDF Extractor (Port 5001)
Analyzes FIR PDFs using Gemini AI and extracts structured legal data.

### To run:
```bash
cd pdf-extractor
npm install
npm start
```

Server will start on: `http://localhost:5001`
Endpoint: `POST /analyze-fir` (accepts PDF file as multipart/form-data with field name "data")

## 2. Chatbot (Port 5002)
AI legal assistant that can answer questions about FIR cases.

### To run:
```bash
cd chatbot
npm install
npm start
```

Server will start on: `http://localhost:5002`
Endpoint: `POST /chat` (accepts JSON: `{ message, history, firContext }`)

## Environment Variables
Both services require a `.env` file with:
```
GEMINI_API_KEY=your_api_key_here
PORT=5001  # or 5002 for chatbot
```

## Running Both Services
Open two separate terminal windows and run each service in its own terminal.

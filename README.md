# ⚖️ LexMind - Intelligence Layer for Modern Legal Practice

LexMind is an advanced AI-powered platform designed to empower lawyers and legal professionals by automating the analysis of FIR (First Information Report) documents and providing strategic legal insights.

![Status](https://img.shields.io/badge/Status-Development-orange)
![Version](https://img.shields.io/badge/Version-0.1.0-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Gemini-green)

---

## 🚀 Key Features

### 🔍 AI-Powered FIR Analysis
Upload official FIR PDFs and let LexMind's specialized AI model extract critical data points instantly:
- IPC/Legal section mapping
- Incident timelines and locations
- Accused, Witness, and Complainant identification
- Evidence summaries

### 🧠 Interactive Case Visualization (Mind Maps)
Visualize case relationships through interactive 2D and 3D Mind Maps. Explore connections between evidence, accused entities, and legal provisions to build a stronger case strategy.

### 💬 AI Legal Assistant
A dedicated chat interface powered by Large Language Models to:
- Answer case-specific queries.
- Draft legal arguments and defense strategies.
- Summarize complex legal documents.

### ✍️ Automated Drafting
Generate draft documents based on the extracted FIR details, saving hours of manual data entry and formatting.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Flow (for Mind Maps), Framer Motion (for animations).
- **Backend**: Node.js, Express.
- **AI Engine**: Google Gemini 2.5 Flash (for structured data extraction), n8n (workflow automation).
- **Database & Auth**: Supabase.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key
- Supabase Account

### 1. Clone the Repository
```bash
git clone https://github.com/amanyatan/lexmind.git
cd lexmind
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create .env and add Supabase credentials
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# Run development server
npm run dev
```

### 3. Backend Setup
```bash
cd backend/server

# Install dependencies
npm install

# Create .env and add:
# GEMINI_API_KEY=your_gemini_api_key
# PORT=5000

# Start the server
npm start
```

---

## 📁 Project Structure

```text
├── backend/
│   ├── server/           # Main Node.js API (Port 5000)
│   ├── chatbot/          # Legacy chatbot logic
│   └── pdf-extractor/    # Legacy PDF processing tools
├── src/
│   ├── components/       # UI Components (Auth, Dashboard, MindMap, etc.)
│   ├── hooks/            # Custom React hooks (useFIRProcessor)
│   ├── lib/              # Supabase & configuration
│   └── types/            # TypeScript definitions
├── public/               # Static assets
└── legallaws/            # Reference JSON data for IPC/CrPC
```

---

## 🔒 Security & Privacy
LexMind is built with a focus on data privacy. Documents are processed securely, and sensitive case information is handled according to best practices for legal confidentiality.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is for educational and professional demonstration purposes. Check [LICENSE](LICENSE) for more details.

---
*Created with ❤️ for the Legal Community.*

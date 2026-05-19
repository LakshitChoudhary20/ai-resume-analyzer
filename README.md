# AI Resume Analyzer

An AI-powered ATS Resume Analyzer with PDF parsing, keyword extraction, job-description matching, AI suggestions, and interview question generation.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: Google Gemini API
- **Auth**: JWT

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ai-resume-analyzer

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Set up environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:
- `GEMINI_API_KEY` — get free at https://aistudio.google.com/app/apikey
- `JWT_SECRET` — any random string

### 3. Run

In two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open http://localhost:5173

## Features
- Upload PDF resume
- ATS score calculation
- Skill extraction & gap analysis
- Job description matching
- AI improvement suggestions (Gemini)
- Interview question generation
- JWT authentication

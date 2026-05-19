<div align="center">
  <h1>🤖 AI Resume Analyzer</h1>
  <p>An AI-powered ATS resume analyzer with PDF parsing, skill extraction, job-description matching, AI suggestions, and interview question generation.</p>

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss" />
</div>

---

## ✨ Features

- 📄 **PDF Resume Upload** — drag & drop your resume for instant analysis
- 📊 **ATS Score Calculation** — know how recruiter bots will rank you
- 🔍 **Skill Extraction & Gap Analysis** — see what you have vs. what's needed
- 🎯 **Job Description Matching** — paste any JD and get a match percentage
- 🤖 **AI Improvement Suggestions** — powered by Google Gemini
- ❓ **Interview Question Generation** — role-specific questions based on your resume
- 🔐 **JWT Authentication** — secure user accounts

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Recharts |
| Backend   | Node.js, Express                    |
| AI        | Google Gemini API (`@google/generative-ai`) |
| Auth      | JWT + bcryptjs                      |
| File      | Multer, pdf-parse                   |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=any_long_random_string
NODE_ENV=development
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Run

Open **two terminals**:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── controllers/        # Route handlers
│   │   ├── auth.controller.js
│   │   └── resume.controller.js
│   ├── middleware/         # Auth & upload middleware
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── models/             # Data models
│   │   ├── User.js
│   │   └── Resume.js
│   ├── routes/             # Express routers
│   │   ├── auth.routes.js
│   │   └── resume.routes.js
│   ├── services/           # Business logic
│   │   ├── atsScorer.js
│   │   ├── gemini.service.js
│   │   ├── pdfParser.js
│   │   └── skillExtractor.js
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ATSScore.jsx
│   │   │   ├── InterviewQuestions.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ResumeUploader.jsx
│   │   │   └── SkillsPanel.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © [Your Name](https://github.com/YOUR_USERNAME)

---

## 🌐 Deployment

### Backend → Render (free)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo, select the `backend` folder as root
3. Set these:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables:
   ```
   GROQ_API_KEY=your_key
   JWT_SECRET=your_secret
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy — copy the URL (e.g. `https://ai-resume-analyzer.onrender.com`)

### Frontend → Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://ai-resume-analyzer.onrender.com/api
   ```
4. Deploy!

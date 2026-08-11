# 🎙️ VoiceChat — Voice-Enabled AI Chatbot

A full-stack AI chatbot you can **talk to and hear back from**, built with React + FastAPI.
Speak into the mic, Whisper transcribes it, an LLM (Groq or Gemini) generates a reply, and
your browser reads the answer aloud — all wrapped in a dark, ChatGPT-style interface with
conversation memory, markdown/code rendering, and a sidebar for multiple chats.

![status](https://img.shields.io/badge/status-active-2DD4BF) ![python](https://img.shields.io/badge/python-3.10+-7C6CF6) ![node](https://img.shields.io/badge/node-18+-7C6CF6)

## 📸 Screenshots

> _Add screenshots or a short screen recording here once you run it locally —_
> _e.g. `docs/screenshot-chat.png`, `docs/screenshot-voice.png`, `docs/demo.gif`_

## ✨ Features

- **AI Chat** — markdown rendering, syntax-highlighted code blocks, copy button, regenerate
  last response, stop generation mid-reply, typing indicator, auto-scroll, timestamps
- **Voice Input** — click the mic, speak, and your speech is transcribed via OpenAI Whisper
  and dropped into the input box for you to review/edit before sending
- **AI Voice Response** — every AI reply has a speaker button with play / pause / resume /
  stop, plus voice selection and playback-speed controls
- **Conversation Memory** — the AI understands follow-up questions ("who created it?") using
  full conversation history; multiple conversations tracked in a sidebar with new chat /
  delete / clear
- **Polished UI** — dark theme, responsive desktop/mobile layout, glassmorphism header,
  animated waveform recording indicator, reduced-motion support, visible keyboard focus

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Lucide icons, react-markdown, react-syntax-highlighter |
| Backend | Python, FastAPI, Pydantic, httpx |
| Speech-to-Text | OpenAI Whisper API |
| LLM | Groq (Llama 3.1) or Google Gemini — swappable via one env var |
| Text-to-Speech | Browser `speechSynthesis` API (free, no setup) |

## 🏗️ Architecture

```
┌──────────────┐  audio blob   ┌──────────────────┐   ┌────────────────┐
│   React UI   │ ────────────▶ │  POST /api/       │──▶│ OpenAI Whisper │
│ (mic button) │               │  transcribe        │   └────────────────┘
│              │ ◀──────────── │  (FastAPI)          │
│              │  text          └──────────────────┘
│              │
│              │  message +    ┌──────────────────┐   ┌────────────────┐
│  chat input  │ ────────────▶ │  POST /api/chat    │──▶│ Groq / Gemini  │
│              │  history       │  (FastAPI)          │   └────────────────┘
│              │ ◀──────────── │                      │
│  chat bubble │  reply text    └──────────────────┘
│              │
│ speechSynth  │  (reply text spoken entirely in-browser, no network call)
└──────────────┘
```

The backend is intentionally stateless: the frontend sends the full conversation history with
every `/api/chat` call, and `services/llm_service.py` maps that onto whichever provider is
configured — so swapping LLM providers later is a one-line env var change, not a rewrite.

## 📁 Project Structure

```
voice-ai-chatbot/
├── frontend/
│   ├── src/
│   │   ├── components/   (ChatWindow, MessageBubble, ChatInput, VoiceRecorder, VoicePlayer, Sidebar, LoadingIndicator)
│   │   ├── hooks/          (useAudioRecorder, useSpeechSynthesis)
│   │   ├── services/       (api.js — all backend calls)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── main.py
│   ├── routes/            (chat.py, transcription.py)
│   ├── services/           (llm_service.py, whisper_service.py)
│   ├── models/              (schemas.py)
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
└── README.md
```

## 🚀 Setup (Windows + VS Code)

### 1. Install prerequisites
- **Node.js** (v18+): download from [nodejs.org](https://nodejs.org), then verify:
  ```
  node -v
  npm -v
  ```
- **Python** (3.10+): download from [python.org](https://python.org). During install, check
  **"Add Python to PATH"**. Verify:
  ```
  python --version
  ```

### 2. Clone and open the project
```
git clone https://github.com/<your-username>/voice-ai-chatbot.git
cd voice-ai-chatbot
code .
```

### 3. Backend setup
Open a terminal in VS Code (`` Ctrl+` ``):
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure backend environment variables
```
copy .env.example .env
```
Open `backend/.env` and fill in your keys:
```
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=
OPENAI_API_KEY=your_openai_key_here
```
- Free Groq key: https://console.groq.com/keys
- Free Gemini key: https://aistudio.google.com/app/apikey
- OpenAI key (for Whisper transcription): https://platform.openai.com/api-keys

### 5. Start the backend
```
uvicorn main:app --reload --port 8000
```
Leave this terminal running. Visit `http://localhost:8000/api/health` — you should see
`{"status": "ok", ...}`.

### 6. Frontend setup (open a **new** terminal)
```
cd frontend
npm install
copy .env.example .env
```
The default `VITE_API_BASE_URL=http://localhost:8000/api` works out of the box for local dev.

### 7. Start the frontend
```
npm run dev
```

### 8. Open the app
Go to **http://localhost:5173** in your browser. Click the mic, allow microphone access, and
start talking.

## 🐳 Run with Docker (alternative to manual setup)

If you have Docker Desktop installed, you can skip the Node/Python setup above entirely.

1. Create `backend/.env` from `backend/.env.example` and fill in your API keys (same as step 4
   above — this file is still required, Docker just reads it instead of your shell).
2. From the project root:
   ```
   docker compose up --build
   ```
3. Open **http://localhost:3000**.

This starts two containers:
- `backend` — the FastAPI app on an internal port (not exposed to your host)
- `frontend` — an nginx server on `localhost:3000` that serves the built React app and proxies
  `/api/*` requests to the backend container, so the browser only ever talks to one origin and
  there's no CORS configuration to worry about in this setup

To stop everything: `docker compose down`. To rebuild after changing code:
`docker compose up --build`.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Body: `{ message, history }` → Returns `{ reply, provider }` |
| `POST` | `/api/transcribe` | Multipart form with `audio` file → Returns `{ text }` |
| `GET` | `/api/health` | Returns `{ status: "ok" }` for liveness checks |

## 🔐 Security Notes

- API keys live only in `backend/.env` — never in the React app or client-side code
- `.env` is git-ignored; `.env.example` files show the required variable names without values
- CORS is restricted to the local Vite dev origin
- Uploaded audio is validated for content-type and a 25 MB size cap before being sent to Whisper

## 📈 Future Improvements

- **WebSocket streaming** — stream LLM tokens as they're generated instead of waiting for the full reply
- **Real-time voice conversation** — continuous listen/respond loop instead of push-to-talk
- **ElevenLabs TTS** — swap browser TTS for realistic, natural-sounding voices
- **Authentication** — per-user accounts and private conversation history
- **Persistent database** — PostgreSQL to store conversations instead of in-memory React state
- **Redis** — cache recent context / rate-limit API usage
- **RAG (document chat)** — let users upload PDFs/notes and ask questions grounded in them
- **Docker + cloud deployment** — containerize both services and deploy (Render/Railway/Fly.io)

---

## 📝 Resume Description

Use one of these as a resume bullet:

> Built a full-stack voice-enabled AI chatbot (React, FastAPI, Whisper, Groq/Gemini) supporting
> real-time speech-to-text transcription, LLM-powered conversational memory across multi-turn
> dialogue, and in-browser text-to-speech playback, deployed with a modular provider architecture
> allowing LLM/TTS backends to be swapped via configuration.

> Designed and implemented a REST API in FastAPI with Pydantic-validated endpoints for chat
> and audio transcription, integrating OpenAI Whisper for speech recognition and a swappable
> LLM provider layer (Groq/Gemini), reducing coupling between the frontend and any single AI vendor.

> Developed a responsive, accessible React interface (Tailwind CSS) featuring markdown/code
> rendering, streaming-ready chat state management, and custom hooks for audio recording and
> speech synthesis — mirroring UX patterns used in production AI chat products.

## 🐙 GitHub Repository Suggestions

- **Repository name:** `voice-ai-chatbot` (alt: `talkbot-ai`, `voicechat-fastapi-react`)
- **Description:** "Full-stack voice-enabled AI chatbot — React + FastAPI + Whisper + Groq/Gemini, with conversation memory and text-to-speech playback."
- **Topics/tags:** `react` `fastapi` `openai-whisper` `speech-to-text` `text-to-speech` `chatbot` `llm` `groq` `gemini-api` `tailwindcss` `python` `full-stack`
- **Recommended screenshots:** empty state / hero screen, active conversation with markdown + code block, mic recording animation, voice playback controls, mobile view
- **Good commit structure:** separate commits per milestone, e.g.
  `feat: scaffold FastAPI backend with chat + transcribe routes`,
  `feat: add React chat UI with markdown rendering`,
  `feat: implement voice recording and Whisper transcription`,
  `feat: add text-to-speech playback with voice/speed controls`,
  `feat: add conversation sidebar and history`,
  `docs: add README with setup instructions`

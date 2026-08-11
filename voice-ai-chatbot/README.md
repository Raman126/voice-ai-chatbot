# 🎙️ Voice AI Chatbot

A full-stack AI chatbot with **text chat, voice input, and AI voice responses**.

Built using React, FastAPI, Groq AI, and the browser's native Speech Recognition API.

## ✨ Features

- 💬 AI-powered text conversation
- 🎤 Voice input using browser Speech Recognition
- 🔊 AI responses with text-to-speech
- 🧠 Groq-powered LLM responses
- 💭 Conversation history
- 🆕 Create new conversations
- 🗑️ Delete and clear conversations
- 🔄 Regenerate AI responses
- ⏹️ Stop AI generation
- ❤️ Backend health monitoring
- 🌙 Modern dark UI
- 📱 Responsive interface

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript
- Web Speech API

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### AI
- Groq API
- Browser Speech Recognition
- Browser Speech Synthesis

## 📁 Project Structure

```text
voice-ai-chatbot/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docker-compose.yml
└── README.md
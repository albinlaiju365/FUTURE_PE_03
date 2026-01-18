# NEXIS OS - Advanced AI Chatbot Documentation

## 1. Project Overview
**NEXIS OS** is a next-generation AI chatbot application built with Next.js 16. It features a cyberpunk/futuristic aesthetic ("Dark OS" theme) and integrates advanced AI capabilities including active memory, voice interaction, and secure persistent authentication. It is designed to feel like a high-end operating system rather than a standard web page.

## 2. Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion (Animations)
- **AI Provider**: Vercel AI SDK (`ai`), Groq (`@ai-sdk/groq`), Google Gemini (`@google/generative-ai`)
- **Database**: PostgreSQL (Vercel Postgres - Serverless)
- **Authentication**: Custom Auth (Bcrypt + JWT + Cookies)
- **State Management**: React Hooks + LocalStorage (for History/Settings)
- **UI Components**: Radix UI, Lucide React, Custom "Data Plates"

## 3. Key Features

### 🔐 Secure Authentication
- **Backend**: Local SQLite database (`nexis.db`).
- **Mechanism**:
    - **Signup**: Validates unique emails, hashes passwords using `bcrypt`.
    - **Login**: Verifies credentials and issues a secure HTTP-Only JWT cookie.
    - **Session**: Persistent sessions across browser restarts via `/api/auth/me`.
    - **Logout**: clear-site-data compliancy.

### 🧠 Active Memory System
- **Context Awareness**: The AI analyzes conversations to "learn" facts (e.g., user name, project preferences).
- **Storage**: Memories are stored in `localStorage` (`ai_memories`) for privacy.
- **Injection**: Relevant memories are silently injected into the system prompt of subsequent chats.
- **Management**: Users can view and delete specific memories in `Settings > Memory Bank`.

### 🎙️ Voice Command Module
- **Speech-to-Text**: Native Web Speech API integration.
- **Microphone Security**: Configured `Permissions-Policy` to strictly allow trusted origins.
- **Visual Feedback**: Real-time toast notifications for listening state and errors.

### 💎 Cyberpunk UI & UX
- **Data Plates**: Messages are rendered in glass-morphism containers with glowing borders.
- **Hacker Typer**: AI responses stream with a custom "decryption" glitch effect.
- **Ambience**: Background scanlines, particle effects (`AnimatedBackground`), and "breathing" UI elements.
- **Responsive**: Fully mobile-optimized with a collapsible sidebar.

### 🗃️ Data Persistence & Search
- **Chat History**: All conversations are automatically saved to `localStorage` (`nexis_chat_history`).
- **Unified Search**: A real-time search bar filters both "Standard" and "Project" threads instantly.
- **Data Safety**: Reset functionality available to purge local data if needed.

## 4. Architecture & Directory Structure

```
├── app/
│   ├── api/
│   │   ├── auth/           # Login/Signup/Me/Logout endpoints
│   │   ├── chat/           # Main AI Chat endpoint (Groq)
│   │   └── enhance/        # Prompt Enhancement endpoint (Gemini)
│   ├── chat/               # Main Chat Interface (Protected)
│   ├── login/              # Login Page
│   ├── signup/             # Signup Page
│   └── page.ts             # Landing Page
├── components/
│   ├── ui/                 # Reusable UI atoms (Buttons, Inputs)
│   ├── auth-modal.tsx      # Modal version of Login/Signup
│   ├── chatbot-ui.tsx      # Core Chat Logic
│   ├── hacker-text.tsx     # Glitch Text Component
│   ├── profile-menu.tsx    # User Dropdown
│   └── settings-modal.tsx  # Memory & Config Settings
├── lib/
│   ├── auth.ts             # JWT & Bcrypt utilities
│   ├── db.ts               # SQLite Connection
│   └── utils.ts            # Tailwind helpers
├── hooks/
│   └── use-speech-recognition.ts # Voice logic
└── nexis.db                # Local SQLite Database
```

## 5. API Routes

### `POST /api/auth/signup`
- **Body**: `{ name, email, password }`
- **Returns**: User object + Set-Cookie header.
- **Errors**: 409 (Duplicate Email).

### `POST /api/auth/login`
- **Body**: `{ email, password }`
- **Returns**: User object + Set-Cookie header.
- **Errors**: 401 (Invalid Credentials).

### `POST /api/chat`
- **Body**: `{ messages, memories }`
- **Core Logic**:
    1.  Injects "System Prompt" based on selected Persona (Standard/Project).
    2.  Appends "Active Memories" to context.
    3.  Streams response from Groq (Llama/Mixtral).

## 6. Setup & Configuration

### Environment Variables (.env.local)
```env
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
JWT_SECRET=your-secret...
```

### Installation
1.  `npm install`
2.  `npm run dev` (Starts server on localhost:3000)
3.  Database `nexis.db` is auto-created on first run.

## 7. Security Notes
- **Passwords**: Never stored in plain text.
- **Cookies**: `HttpOnly`, `Secure` (in prod), `SameSite=Strict`.
- **headers**: `Permissions-Policy` configured for Microphone/Camera security.

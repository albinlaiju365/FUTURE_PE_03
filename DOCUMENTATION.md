# NEXIS OS - Advanced AI Chatbot Documentation

## 1. Project Overview
**NEXIS OS** is a high-performance, agentic AI terminal designed with a "Dark Mode" cyberpunk aesthetic. It combines robust backend architecture (Vercel Postgres, Next.js 16) with a fluid, game-like frontend interface to provide a unique conversational experience.

## 2. Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion (Animations)
- **AI Infrastructure**: Vercel AI SDK, Groq (Llama/Mixtral), Google Gemini (Planning)
- **Database**: Vercel Postgres (Serverless SQL)
- **Authentication**: Custom JWT-based Auth (HttpOnly Cookies, Bcrypt hashing)
- **State**: React Hooks + LocalStorage + Server Actions

## 3. Core Features

### 🔐 Security & Authentication
- **Secure Access**: All chat endpoints (`/api/chat`) are protected and require a valid session.
- **Data Safety**:
  - `JWT_SECRET` is rotated and cryptographically strong.
  - Passwords are salted and hashed via `bcryptjs`.
  - Database queries use parameterized SQL to prevent injection.
  - **Guest Access is Disabled** by default for security.

### 🎭 Dynamic Personas (New!)
The AI can switch between distinct personalities, affecting its tone, system prompt, and reasoning style.
- **NEXIS Core** (Default): Friendly, emotional, "Best Friend" vibe. Uses empathetic language and casual tone.
- **The Inventor**: Eccentric, scientific, chaotic genius. Uses technical metaphors and high-energy reasoning.
- **Switching**: Users can toggle personas instantly via `Settings -> Bot Logic`. The preference persists across sessions.

### 🧠 Active Memory System
- **Contextual Learning**: The AI identifies and memorizes user details (names, preferences, project ideas) automatically.
- **Storage**: Memories are stored in `memories_v2` table (Postgres) and injected into future conversations.
- **RAG Pipeline**: Relevant memories are retrieved based on vector similarity or keyword matching before generating a response.

### 🗑️ Chat Management (New!)
- **Individual Deletion**: Users can delete specific chat threads from the sidebar.
- **UI**: A trash icon appears on hover for each chat item.
- **Sync**: Deletion updates both local state and persistent storage immediately.

### 🎙️ Voice Command
- **Speech-to-Text**: Integrated Web Speech API for real-time voice input.
- **Feedback**: Visual indicators for "Listening" and "Processing" states.

## 4. Architecture

### Directory Structure
```
├── app/
│   ├── api/
│   │   ├── auth/           # Login, Signup, Logout routes
│   │   ├── chat/           # Main Agentic Pipeline (POST)
│   │   └── enhance/        # Prompt refinement (Gemini)
│   ├── chat/               # Main Chat Interface (Protected)
│   └── page.tsx            # Landing Page
├── components/
│   ├── settings-modal.tsx  # Persona & Config UI
│   ├── profile-menu.tsx    # User actions
│   └── chatbot-ui.tsx      # Chat logic & rendering
├── lib/
│   ├── auth.ts             # Token & Password utilities
│   ├── db.ts               # Vercel Postgres connection
│   └── agents/             # Agentic Modules (Planner, Critic)
```

### Agentic Pipeline (`/api/chat`)
1.  **Auth Layer**: Verifies user session. Returns 401 if invalid.
2.  **Memory Layer**: Retrieves user-specific memories from Postgres.
3.  **Planning Layer**: A fast planner (Gemini Flash) analyzes the user request and creates an execution plan.
4.  **Persona Layer**: Inject selected persona (Nexis/Inventor) into the system prompt.
5.  **Execution Layer**: Groq (Llama-70b) generates the final response based on the plan and persona.

## 5. Setup & Development

### Prerequisites
- Node.js 18+
- Vercel Account (for Postgres)

### Environment Variables (.env.local)
```env
# AI Keys
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Security
JWT_SECRET=your-strong-secret-key...

# Database (Vercel Postgres)
POSTGRES_URL=...
POSTGRES_URL_NON_POOLING=...
```

### Running Locally
1.  `npm install`
2.  `npm run dev`
3.  Visit `http://localhost:3000`

## 6. Deployment
This project is optimized for **Vercel**.
1.  Push to GitHub.
2.  Import to Vercel.
3.  Add Environment Variables in Vercel Dashboard.
4.  Redeploy.

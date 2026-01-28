# NEXIS CORE - Advanced AI OS & Agentic Sidekick

NEXIS is a high-performance, emotionally intelligent AI system designed to serve as a personal digital sidekick. Built with a sophisticated multi-agent architecture and a "Neural core" memory bank, it learns from every interaction to provide a truly personalized experience.

## 🚀 1. Core Architecture
- **Framework**: Next.js 16+ (App Router)
- **AI Intelligence**: Orchestrated via Groq (Llama 3.3 70B & 8B variants)
- **Storage**: Vercel Postgres (SQL) for persistent identity and memories.
- **Agentic Pipeline**: A three-node agentic system (Planner -> Critic -> Extractor).

---

## 🧠 2. Intelligent Agent Nodes
Unlike standard chatbots, Nexis uses a multi-agent decision loop for every message:

### A. The Planner Node (`planner.ts`)
Analyzes your intent, context, and requested persona to create a sub-step execution plan. It decides whether to be technical, creative, or empathetic.

### B. The Critic Node (`critic.ts`)
Reviews the internal plan for safety, alignment with the chosen persona, and technical accuracy before any response is generated.

### C. The Extraction Node (`extractor.ts`) - **Active Learning**
The system's "Machine Learning" core. After every reply, this node runs in the background to:
- Identify and store personal facts (Location, Preferences, Projects).
- Update user identity (e.g., if you ask the AI to call you by a new name).
- Categorize memories by importance (High, Medium, Low) and type (Identity, Behavioral, Project).

---

## 🔒 3. Authentication & Identity Sync
- **Dual-Method Auth**: Supports secure Email/Password and one-click Google OAuth.
- **Identity Fusion**: If you sign in with Google, Nexis automatically merges your Google profile data (Name, Profile Pic) with your local Nexis identity.
- **Real-Time Sync**: Profile changes propagate instantly across the app using a global `storage` event system—no refresh required.

---

## 🎙️ 4. Neural Voice Link (Multimodal)
Nexis features a high-fidelity voice interface with a **Dual-Engine Failover System**:

- **Engine X (Remote)**: Powered by ElevenLabs for ultra-realistic, low-latency conversational AI.
- **Engine Nexis-Local (Fallback)**: If the remote link is unavailable, Nexis automatically switches to an optimized local engine using Web Speech API/TTS.
- **Fluid UI**: An "Apple Intelligence" style fluid orb that reacts to speech patterns and thinking states in real-time.

---

## 💾 5. Neural Memory Bank
- **Persistent Nodes**: Memories aren't just for the session—they are stored in Postgres.
- **RAG (Retrieval Augmented Generation)**: Nexis pulls relevant memories from your history before answering to provide contextually aware replies.
- **Bank Management**: A dedicated UI tab in Settings allows you to view, delete, or wipe your learned memories.

---

## ✨ 6. Advanced Interface Features
- **Holographic Typewriter**: AI responses are projected letter-by-letter with a simulated terminal cursor for an immersive narrative feel.
- **Interface Personas**: Switch between "Nexis Core" (Friendly/Empathetic) and "The Inventor" (Eccentric/Technical) nodes.
- **Creativity Control (Temperature)**: Manually adjust the AI's "Neural randomness" slider (0.1 for precision, 1.0 for creative chaos).
- **Responsive PWA**: Fully optimized for mobile with "Glassmorphism" styling and high-performance Framer Motion animations.

---

## 🛠️ 7. Technical Specifications
- **Real-time Streaming**: Vercel AI SDK for token-by-token streaming.
- **Styling**: Vanilla CSS + Tailwind + Framer Motion for premium aesthetics.
- **Sync Architecture**: Global state management via LocalStorage and Server-Side `/api/auth/me` synchronization.

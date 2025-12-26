# TechNest AI Support Agent

AI-powered customer support chat for Spur's take-home assignment. Built with React, Node.js, and Google Gemini.

**Live Demo:** [Coming soon - deploying to Vercel/Render]

## Quick Start

```bash
# Clone and install
git clone https://github.com/Abhishekgoyal007/AI-Support-Agent.git
cd AI-Support-Agent
npm install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env and add your GEMINI_API_KEY

# Set up database
npm run db:migrate
npm run db:seed

# Run both frontend and backend
npm run dev
```

Open http://localhost:5173 in your browser.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite + Prisma ORM
- **LLM:** Google Gemini 2.5 Flash
- **Validation:** Zod

## Project Structure

```
├── client/               # React frontend
│   └── src/
│       ├── hooks/        # useChat - chat state management
│       ├── services/     # API client
│       └── App.tsx       # Main chat UI
│
├── server/               # Express backend
│   └── src/
│       ├── routes/       # /api/chat endpoints
│       ├── services/     # LLM + conversation logic
│       └── middleware/   # validation, error handling
│
└── server/prisma/        # DB schema + seed data
```

## How It Works

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/message` | POST | Send message, get AI reply |
| `/api/chat/history/:sessionId` | GET | Load conversation history |
| `/api/chat/session` | POST | Create new session |

### Backend Architecture

The backend follows a simple service layer pattern:

- **Routes** handle HTTP requests and delegate to services
- **Services** contain business logic (LLM calls, DB operations)
- **Middleware** handles validation (Zod) and error catching

The `LLMService` wraps the Gemini API and builds prompts dynamically by:
1. Loading FAQ knowledge from the database
2. Including last 10 messages for context
3. Adding a system prompt with the support agent persona

### Database

Three tables:
- `Conversation` - tracks chat sessions
- `Message` - stores all messages (user + AI)
- `KnowledgeBase` - FAQ data for the AI prompt

Session IDs are stored in localStorage on the frontend, so conversations persist across page reloads.

### The Fictional Store

TechNest is a made-up electronics store. The AI knows about:
- Shipping (free over $50, 5-7 days standard)
- Returns (30-day policy)
- Payment methods (cards, PayPal, Klarna)
- Support hours (Mon-Fri 9-6, Sat 10-4)
- Warranty (1 year on electronics)

All this is seeded into the `KnowledgeBase` table and included in the LLM prompt.

## Environment Variables

Create `server/.env`:

```
GEMINI_API_KEY=your_key_here
PORT=3001
DATABASE_URL="file:./dev.db"
CLIENT_URL=http://localhost:5173
```

Get a Gemini API key from https://aistudio.google.com/app/apikey

## What I'd Do With More Time

Honestly ran out of time on a few things:

**Features:**
- User auth (probably OAuth)
- WebSocket for streaming responses
- Admin panel to see conversations
- Message reactions/feedback

**Technical:**
- Unit tests (didn't have time, sorry)
- Response streaming from Gemini
- Better error logging
- Docker setup

**Polish:**
- Light mode toggle
- Message editing
- Sound notifications
- Better mobile keyboard handling

## Trade-offs I Made

| Decision | Why |
|----------|-----|
| SQLite instead of Postgres | Simpler for demo, works in 2 minutes |
| No auth | Not required, would add complexity |
| Polling instead of WebSocket | Good enough for demo, less code |
| Single LLM provider | Could abstract for fallback, but YAGNI |

## Running in Production

**Frontend (Vercel):**
- Root: `client`
- Build: `npm run build`
- Output: `dist`

**Backend (Render):**
- Root: `server`
- Build: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start: `npm start`
- Add env vars in Render dashboard

## Author

Abhishek Ashok Goyal - [@Abhishekgoyal007](https://github.com/Abhishekgoyal007)

---

Built for Spur's Founding Full-Stack Engineer take-home assignment.

# 🛒 TechNest AI Support Agent

An AI-powered customer support chat widget built for Spur's take-home assignment. Features real-time chat with Google Gemini 2.5 Flash, conversation persistence, and a modern dark theme UI.

![TechNest Support](https://img.shields.io/badge/AI-Gemini%202.5-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933) ![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)

## ✨ Features

- 🤖 **AI-Powered Chat** - Powered by Google Gemini 2.5 Flash
- 💬 **Real-time Responses** - Instant AI replies with typing indicators
- 📝 **Conversation Persistence** - Chat history saved across sessions
- 🎨 **Modern Dark Theme** - Beautiful, responsive UI
- 📱 **Mobile Friendly** - Works on all screen sizes
- 🛡️ **Rate Limiting** - Prevents API abuse
- ✅ **Input Validation** - Zod-based validation

## 🏪 About TechNest (Fictional Store)

TechNest is a premium electronics & gadgets e-commerce store. The AI agent can answer questions about:

| Topic | Information |
|-------|-------------|
| 📦 Shipping | Free over $50, Standard (5-7 days), Express (2-3 days) |
| 🔄 Returns | 30-day hassle-free return policy |
| 💳 Payments | Visa, Mastercard, PayPal, Apple Pay, Klarna |
| 🛡️ Warranty | 1-year manufacturer warranty |
| ⏰ Support | Mon-Fri 9AM-6PM, Sat 10AM-4PM EST |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Vanilla CSS (Dark theme) |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite + Prisma ORM |
| LLM | Google Gemini 2.5 Flash |
| Validation | Zod |

## 📁 Project Structure

```
spur-ai-support-agent/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── hooks/          # useChat hook
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main component
│   │   └── App.css         # Styles
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # LLM, Conversation services
│   │   ├── middleware/     # Validation, Error handling
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # FAQ seed data
│   └── package.json
│
├── .env.example            # Environment template
├── package.json            # Monorepo root
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** 
- **npm**
- **Google Gemini API Key** - Get one at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Abhishekgoyal007/AI-Support-Agent.git
cd AI-Support-Agent

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp server/.env.example server/.env
```

### Configure API Key

Edit `server/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CLIENT_URL=http://localhost:5173
```

### Initialize Database

```bash
# Run migrations
npm run db:migrate

# Seed FAQ data
npm run db:seed
```

### Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:server  # Backend on http://localhost:3001
npm run dev:client  # Frontend on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send a message and get AI response |
| GET | `/api/chat/history/:sessionId` | Get conversation history |
| POST | `/api/chat/session` | Create new chat session |
| GET | `/health` | Health check |

### Example Request

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your shipping options?"}'
```

### Example Response

```json
{
  "reply": "We offer FREE shipping on orders over $50. Standard shipping takes 5-7 business days...",
  "sessionId": "uuid-here"
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Send a message and receive AI response
- [ ] Check conversation history persists after refresh
- [ ] Click suggestion buttons for quick questions
- [ ] Test "New Chat" button clears conversation
- [ ] Verify error toast appears on network failure
- [ ] Test on mobile/tablet screen sizes

### Test Scenarios

1. **Shipping Questions**: "What are your shipping options?"
2. **Returns**: "What is your return policy?"
3. **Payments**: "What payment methods do you accept?"
4. **Support Hours**: "What are your support hours?"
5. **Promotions**: "Do you have any discounts?"

## 🏗️ Architecture Overview

### Backend Structure

```
server/src/
├── index.ts              # Express app entry point
├── lib/
│   └── prisma.ts         # Prisma client singleton
├── routes/
│   └── chat.ts           # Chat API endpoints
├── services/
│   ├── conversationService.ts  # CRUD for conversations/messages
│   ├── knowledgeService.ts     # FAQ retrieval for prompts
│   └── llmService.ts           # Gemini API integration
└── middleware/
    ├── errorHandler.ts   # Global error handling
    ├── validation.ts     # Zod input validation
    └── requestLogger.ts  # Request logging
```

### Design Decisions

**1. Service Layer Pattern**
- Business logic is encapsulated in services (`llmService`, `conversationService`)
- Routes are thin controllers that delegate to services
- Makes it easy to add new channels (WhatsApp, Instagram) by reusing services

**2. LLM Integration**
- `LLMService` class encapsulates all Gemini API interactions
- System prompt includes dynamically fetched FAQ knowledge from database
- Conversation history (last 10 messages) passed for context
- Graceful fallback to mock responses when API key is missing

**3. Database Schema**
```
Conversation (1) ──→ (N) Message
                          ├── sender: "user" | "ai"
                          ├── text: string
                          └── tokenCount: int (optional)

KnowledgeBase
├── category: "shipping" | "returns" | etc.
├── question: string
├── answer: string
└── priority: int (for ordering)
```

**4. Session Management**
- Session ID stored in localStorage on frontend
- New session created automatically on first message
- History loaded on page refresh via GET `/api/chat/history/:sessionId`

### LLM Prompting Strategy

```
System Prompt Structure:
┌─────────────────────────────────────┐
│ Persona: Friendly support agent     │
│ Guidelines: Concise, helpful, etc.  │
│ FAQ Knowledge: Dynamically loaded   │
│ Constraints: No markdown, plain txt │
└─────────────────────────────────────┘
         +
┌─────────────────────────────────────┐
│ Conversation History (last 10 msgs) │
└─────────────────────────────────────┘
         +
┌─────────────────────────────────────┐
│ Current User Message                │
└─────────────────────────────────────┘
```

### Why These Tech Choices?

| Choice | Reasoning |
|--------|-----------|
| **Gemini 2.5 Flash** | Fast (1-2s responses), cost-effective, generous free tier |
| **SQLite + Prisma** | Zero-config, portable, type-safe ORM, easy PostgreSQL migration |
| **React + Vite** | Fast dev experience, familiar ecosystem, TypeScript support |
| **Monorepo** | Single `npm install`, simplified deployment, shared configs |
| **Zod** | Runtime validation with TypeScript inference |

## 🔮 Trade-offs & If I Had More Time

### Current Trade-offs

| Decision | Trade-off |
|----------|-----------|
| SQLite over PostgreSQL | Simpler setup, but no concurrent writes for production |
| No WebSocket | Polling-based, but simpler architecture for demo |
| No authentication | Simpler UX, but anyone can access any session with ID |
| Single LLM provider | Locked to Gemini, but cleaner code without abstraction |

### If I Had More Time...

**Features I'd Add:**
- 🔐 **User Authentication** - OAuth with Google/GitHub
- 🔌 **WebSocket Support** - Real-time streaming responses
- 📊 **Admin Dashboard** - View all conversations, analytics
- 🌐 **Multi-language Support** - i18n for UI and AI responses
- 🎨 **Theme Customization** - Light mode, custom branding
- 📁 **File Uploads** - Share images/documents with support

**Technical Improvements:**
- ⚡ **Response Streaming** - Stream LLM tokens for faster perceived response
- 🧪 **Unit Tests** - Jest/Vitest for services and API endpoints
- 📈 **Observability** - OpenTelemetry tracing, structured logging
- 🔄 **LLM Fallback** - Automatic failover to OpenAI if Gemini is down
- 🗃️ **PostgreSQL** - For production scalability
- 🐳 **Docker** - Containerized deployment

**UX Improvements:**
- ✏️ **Message Editing** - Edit sent messages
- 👍 **Feedback Buttons** - Thumbs up/down on AI responses
- 📋 **Copy Message** - One-click copy for AI responses
- 🔊 **Sound Notifications** - Audio feedback for new messages

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | SQLite database path | file:./dev.db |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 |

## 🚢 Deployment

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repo
3. Set root directory to `server`
4. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Start command: `npm start`
6. Add environment variables

## 👤 Author

**Abhishek Ashok Goyal**

- GitHub: [@Abhishekgoyal007](https://github.com/Abhishekgoyal007)

## 📄 License

MIT License - feel free to use this project as a reference!

---

Built with ❤️ for Spur

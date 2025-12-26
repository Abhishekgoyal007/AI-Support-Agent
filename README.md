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

## 🏗️ Architecture Decisions

### Why Gemini 2.5 Flash?
- Fast response times (~1-2 seconds)
- Cost-effective for chat applications
- Excellent context understanding
- Free tier available for development

### Why SQLite?
- Zero configuration required
- Portable (single file database)
- Perfect for demo/take-home projects
- Easy to switch to PostgreSQL for production

### Why Monorepo?
- Simplified development workflow
- Single `npm install` for everything
- Shared TypeScript types possible
- Easy deployment configuration

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

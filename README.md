# Spur AI Support Agent

AI-powered customer support chat widget built for Spur's take-home assignment.

## 🎯 Overview

This project simulates a customer support chat for **TechNest**, a fictional premium electronics e-commerce store. Users can interact with an AI agent that answers questions about shipping, returns, payments, warranty, and more.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite + Prisma ORM |
| LLM | OpenAI GPT-4o-mini |

## 📁 Project Structure

```
spur-ai-support-agent/
├── client/          # React Frontend
├── server/          # Node.js Backend
├── .env.example     # Environment template
├── package.json     # Monorepo root
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key

### Installation

```bash
# Install all dependencies
npm install

# Set up environment variables
cp .env.example server/.env
# Edit server/.env and add your OPENAI_API_KEY

# Initialize database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

## 📝 License

MIT

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// In-memory storage (resets on cold start, fine for demo)
const conversations: Map<string, Array<{ sender: string; text: string }>> = new Map();

const KNOWLEDGE = `
## TechNest Store Info
- Shipping: FREE on orders over $50, Standard 5-7 days, Express 2-3 days ($9.99)
- Returns: 30-day policy, items must be unused, refunds in 5-7 days
- Support: Mon-Fri 9AM-6PM, Sat 10AM-4PM EST
- Payment: Visa, Mastercard, Amex, PayPal, Apple Pay, Klarna
- Warranty: 1-year manufacturer warranty on electronics
`;

const SYSTEM_PROMPT = `You are a friendly customer support agent for TechNest, a premium electronics store.
Be warm, professional, and concise. Answer based on this knowledge:
${KNOWLEDGE}
Do NOT use markdown formatting like **bold** or *italic*.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, sessionId } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: { message: 'Message is required' } });
        }

        const trimmedMessage = message.trim().slice(0, 4000);
        const sid = sessionId || crypto.randomUUID();

        // Get or create conversation
        if (!conversations.has(sid)) {
            conversations.set(sid, []);
        }
        const history = conversations.get(sid)!;

        // Add user message
        history.push({ sender: 'user', text: trimmedMessage });

        // Build chat history for Gemini
        const chatHistory = history.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.text }]
        }));

        // Call Gemini
        const chat = model.startChat({
            history: chatHistory.slice(0, -1),
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        });

        const result = await chat.sendMessage(trimmedMessage);
        const reply = result.response.text().trim();

        // Save AI response
        history.push({ sender: 'ai', text: reply });

        return res.status(200).json({ reply, sessionId: sid });
    } catch (error) {
        console.error('Error:', error);
        const msg = error instanceof Error ? error.message : '';

        if (msg.includes('429') || msg.includes('quota')) {
            return res.status(200).json({
                reply: 'Too many requests. Please wait a moment and try again.',
                sessionId: req.body.sessionId || crypto.randomUUID()
            });
        }

        return res.status(200).json({
            reply: 'Something went wrong. Please try again or contact support@technest.com.',
            sessionId: req.body.sessionId || crypto.randomUUID()
        });
    }
}

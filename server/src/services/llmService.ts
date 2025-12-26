import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '@prisma/client';
import { knowledgeService } from './knowledgeService.js';

const MAX_HISTORY_MESSAGES = 10;
const MODEL = 'gemini-1.5-flash';

interface LLMResponse {
    reply: string;
    tokensUsed?: number;
}

export class LLMService {
    private client: GoogleGenerativeAI | null = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            this.client = new GoogleGenerativeAI(apiKey);
            console.log('Gemini client initialized');
        } else {
            console.warn('No API key - using mock responses');
        }
    }

    async generateReply(userMessage: string, conversationHistory: Message[]): Promise<LLMResponse> {
        if (!this.client) {
            return this.getMockResponse(userMessage);
        }

        try {
            const systemPrompt = await this.buildSystemPrompt();
            const model = this.client.getGenerativeModel({
                model: MODEL,
                systemInstruction: systemPrompt
            });

            const history = this.buildHistory(conversationHistory);
            const chat = model.startChat({
                history,
                generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;

            return {
                reply: response.text().trim(),
                tokensUsed: response.usageMetadata?.totalTokenCount
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            return this.handleLLMError(error);
        }
    }

    private async buildSystemPrompt(): Promise<string> {
        const knowledge = await knowledgeService.getKnowledgeForPrompt();

        return `You are a friendly customer support agent for TechNest, a premium electronics store. 

Your personality:
- Warm, professional, and empathetic
- Concise but thorough
- Always maintain a positive tone

Guidelines:
- Answer based on the store knowledge below
- If unsure, offer to connect with a human agent
- Keep responses concise (2-4 sentences for simple questions)
- Use bullet points for complex info
- Never make up information
- Do NOT use markdown formatting like **bold** or *italic*

Store Knowledge:
${knowledge}`;
    }

    private buildHistory(messages: Message[]): Array<{ role: 'user' | 'model', parts: [{ text: string }] }> {
        return messages.slice(-MAX_HISTORY_MESSAGES).map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.text }]
        }));
    }

    private handleLLMError(error: unknown): LLMResponse {
        const msg = error instanceof Error ? error.message : '';

        if (msg.includes('RATE_LIMIT') || msg.includes('429')) {
            return { reply: "Too many requests right now. Please wait a moment and try again." };
        }
        if (msg.includes('API_KEY') || msg.includes('401')) {
            return { reply: "Having trouble connecting. Please try again in a moment." };
        }
        return { reply: "Something went wrong. Please try again or contact support@technest.com." };
    }

    private getMockResponse(userMessage: string): LLMResponse {
        const msg = userMessage.toLowerCase();

        if (msg.includes('shipping') || msg.includes('delivery')) {
            return { reply: "We offer FREE shipping on orders over $50. Standard takes 5-7 days, Express is 2-3 days for $9.99." };
        }
        if (msg.includes('return') || msg.includes('refund')) {
            return { reply: "We have a 30-day return policy. Items must be unused and in original packaging. Refunds process in 5-7 business days." };
        }
        if (msg.includes('hours') || msg.includes('contact')) {
            return { reply: "Support hours: Mon-Fri 9AM-6PM, Sat 10AM-4PM EST. Email: support@technest.com" };
        }
        if (msg.includes('payment')) {
            return { reply: "We accept Visa, Mastercard, Amex, PayPal, Apple Pay, and Klarna." };
        }
        if (msg.includes('warranty')) {
            return { reply: "All electronics have a 1-year warranty. Extended 2-year warranty available." };
        }
        if (msg.includes('hello') || msg.includes('hi')) {
            return { reply: "Hello! Welcome to TechNest support. How can I help you today?" };
        }
        return { reply: "Hi! I can help with shipping, returns, payments, warranty, and more. What would you like to know?" };
    }
}

export const llmService = new LLMService();

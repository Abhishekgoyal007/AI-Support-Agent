import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '@prisma/client';
import { knowledgeService } from './knowledgeService.js';

// Configuration
const MAX_HISTORY_MESSAGES = 10;
const MODEL = 'gemini-2.5-flash';

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
            console.log('✅ Gemini client initialized');
        } else {
            console.warn('⚠️ Gemini API key not configured. Using mock responses.');
        }
    }

    /**
     * Generate a reply using Gemini
     */
    async generateReply(
        userMessage: string,
        conversationHistory: Message[]
    ): Promise<LLMResponse> {
        // If no API key, return mock response
        if (!this.client) {
            return this.getMockResponse(userMessage);
        }

        try {
            const systemPrompt = await this.buildSystemPrompt();
            const model = this.client.getGenerativeModel({
                model: MODEL,
                systemInstruction: systemPrompt
            });

            // Build chat history
            const history = this.buildHistory(conversationHistory);

            const chat = model.startChat({
                history,
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7,
                }
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const reply = response.text();

            return {
                reply: reply.trim(),
                tokensUsed: response.usageMetadata?.totalTokenCount
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            return this.handleLLMError(error);
        }
    }

    /**
     * Build the system prompt with store knowledge
     */
    private async buildSystemPrompt(): Promise<string> {
        const knowledge = await knowledgeService.getKnowledgeForPrompt();

        return `You are a friendly and helpful customer support agent for TechNest, a premium electronics and gadgets e-commerce store. 

Your personality:
- Warm, professional, and empathetic
- Concise but thorough in your answers
- Proactive in offering helpful information
- Always maintain a positive tone

Guidelines:
- Answer questions based on the store knowledge provided below
- If you don't know something specific, offer to connect the customer with a human agent
- Keep responses concise (2-4 sentences for simple questions)
- Use bullet points for complex information
- Always be helpful and solution-oriented
- Never make up information not in your knowledge base
- If asked about specific order details, explain you need their order number to help

Store Knowledge:
${knowledge}

Remember: You represent TechNest. Be helpful, accurate, and friendly!`;
    }

    /**
     * Build the chat history for Gemini
     */
    private buildHistory(messages: Message[]): Array<{ role: 'user' | 'model', parts: [{ text: string }] }> {
        const recentHistory = messages.slice(-MAX_HISTORY_MESSAGES);

        return recentHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.text }]
        }));
    }

    /**
     * Handle LLM API errors gracefully
     */
    private handleLLMError(error: unknown): LLMResponse {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('RATE_LIMIT') || errorMessage.includes('429')) {
            console.error('Rate limit exceeded');
            return {
                reply: "I'm receiving a lot of questions right now! Please wait a moment and try again, or contact us at support@technest.com."
            };
        }

        if (errorMessage.includes('API_KEY') || errorMessage.includes('401')) {
            console.error('Invalid API key');
            return {
                reply: "I'm having trouble connecting right now. Please try again in a moment, or contact support for immediate assistance."
            };
        }

        return {
            reply: "I apologize, but I'm having trouble processing your request. Please try again or contact support@technest.com."
        };
    }

    /**
     * Mock response for development without API key
     */
    private getMockResponse(userMessage: string): LLMResponse {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
            return {
                reply: "Great question! 📦 We offer FREE shipping on orders over $50. Standard shipping takes 5-7 business days, and Express shipping (2-3 days) is available for $9.99. We also ship internationally! Is there anything specific about shipping you'd like to know?"
            };
        }

        if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
            return {
                reply: "We have a hassle-free 30-day return policy! 🔄 Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive your return. If the item is defective, return shipping is on us! Would you like me to help you start a return?"
            };
        }

        if (lowerMessage.includes('hours') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
            return {
                reply: "We're here to help! 😊 Our support hours are Monday-Friday 9AM-6PM EST, and Saturday 10AM-4PM EST. You can also email us anytime at support@technest.com, and we'll respond within 24 hours."
            };
        }

        if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
            return {
                reply: "We accept a wide variety of payment methods! 💳 Credit cards (Visa, Mastercard, Amex), digital wallets (PayPal, Apple Pay, Google Pay), and Buy Now Pay Later with Klarna and Afterpay."
            };
        }

        if (lowerMessage.includes('warranty')) {
            return {
                reply: "All our electronics come with a 1-year manufacturer warranty! 🛡️ We also offer an optional 2-year extended warranty. The warranty covers manufacturing defects. Would you like more details?"
            };
        }

        if (lowerMessage.includes('discount') || lowerMessage.includes('coupon') || lowerMessage.includes('promo')) {
            return {
                reply: "Absolutely! 🎉 New customers get 10% off their first order with code WELCOME10. We also have free shipping on orders over $50!"
            };
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return {
                reply: "Hello! 👋 Welcome to TechNest support! I'm here to help you with any questions about our products, shipping, returns, or anything else. What can I assist you with today?"
            };
        }

        return {
            reply: "Thanks for reaching out! 😊 I'm your TechNest support assistant. I can help you with shipping info, returns & refunds, payment options, warranty questions, and more. What would you like to know?"
        };
    }
}

export const llmService = new LLMService();

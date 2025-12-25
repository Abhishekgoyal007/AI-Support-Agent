import prisma from '../lib/prisma.js';
import { Conversation, Message } from '@prisma/client';

export interface CreateMessageInput {
    conversationId: string;
    sender: 'user' | 'ai';
    text: string;
    tokenCount?: number;
}

export class ConversationService {
    /**
     * Create a new conversation
     */
    async createConversation(metadata?: string): Promise<Conversation> {
        return prisma.conversation.create({
            data: { metadata }
        });
    }

    /**
     * Get a conversation by ID with all messages
     */
    async getConversation(id: string): Promise<(Conversation & { messages: Message[] }) | null> {
        return prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    /**
     * Get or create a conversation
     */
    async getOrCreateConversation(sessionId?: string): Promise<Conversation & { messages: Message[] }> {
        if (sessionId) {
            const existing = await this.getConversation(sessionId);
            if (existing) return existing;
        }

        const newConversation = await this.createConversation();
        return { ...newConversation, messages: [] };
    }

    /**
     * Add a message to a conversation
     */
    async addMessage(input: CreateMessageInput): Promise<Message> {
        // Update conversation's updatedAt
        await prisma.conversation.update({
            where: { id: input.conversationId },
            data: { updatedAt: new Date() }
        });

        return prisma.message.create({
            data: {
                conversationId: input.conversationId,
                sender: input.sender,
                text: input.text,
                tokenCount: input.tokenCount
            }
        });
    }

    /**
     * Get recent messages for a conversation (for LLM context)
     */
    async getRecentMessages(conversationId: string, limit: number = 20): Promise<Message[]> {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return messages.reverse(); // Return in chronological order
    }
}

export const conversationService = new ConversationService();

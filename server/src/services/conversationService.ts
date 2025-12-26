import prisma from '../lib/prisma.js';
import { Conversation, Message } from '@prisma/client';

export interface CreateMessageInput {
    conversationId: string;
    sender: 'user' | 'ai';
    text: string;
    tokenCount?: number;
}

export class ConversationService {
    async createConversation(metadata?: string): Promise<Conversation> {
        return prisma.conversation.create({ data: { metadata } });
    }

    async getConversation(id: string): Promise<(Conversation & { messages: Message[] }) | null> {
        return prisma.conversation.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
    }

    async getOrCreateConversation(sessionId?: string): Promise<Conversation & { messages: Message[] }> {
        if (sessionId) {
            const existing = await this.getConversation(sessionId);
            if (existing) return existing;
        }
        const newConvo = await this.createConversation();
        return { ...newConvo, messages: [] };
    }

    async addMessage(input: CreateMessageInput): Promise<Message> {
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

    async getRecentMessages(conversationId: string, limit: number = 20): Promise<Message[]> {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return messages.reverse();
    }
}

export const conversationService = new ConversationService();

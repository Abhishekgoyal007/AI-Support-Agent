import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: 'Session ID required' });
    }

    try {
        // Fetch conversation with messages from database
        const conversation = await prisma.conversation.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            return res.status(200).json({
                sessionId,
                messages: []
            });
        }

        return res.status(200).json({
            sessionId: conversation.id,
            messages: conversation.messages.map(msg => ({
                id: msg.id,
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.createdAt.toISOString()
            }))
        });
    } catch (error) {
        console.error('History fetch error:', error);
        return res.status(200).json({
            sessionId,
            messages: []
        });
    }
}

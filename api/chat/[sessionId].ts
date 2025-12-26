import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (shared with message.ts in same instance)
const conversations: Map<string, Array<{ id: string; sender: string; text: string; timestamp: string }>> = new Map();

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

    // Return empty for serverless (no persistence between requests)
    return res.status(200).json({
        sessionId,
        messages: []
    });
}

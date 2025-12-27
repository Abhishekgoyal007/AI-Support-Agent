import type { SendMessageResponse, ChatHistoryResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function sendMessage(message: string, sessionId?: string): Promise<SendMessageResponse> {
    const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to send message');
    }

    return res.json();
}

export async function getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`);
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
}

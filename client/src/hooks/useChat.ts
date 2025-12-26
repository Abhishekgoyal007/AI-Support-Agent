import { useState, useCallback, useEffect } from 'react';
import type { Message } from '../types';
import { sendMessage, getChatHistory } from '../services/api';

const SESSION_KEY = 'chat_session_id';

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(() =>
        localStorage.getItem(SESSION_KEY)
    );

    // Load history on mount
    useEffect(() => {
        if (sessionId) {
            getChatHistory(sessionId)
                .then(res => setMessages(res.messages))
                .catch(() => { }); // Ignore errors, start fresh
        }
    }, []);

    const send = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        setError(null);
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: text.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await sendMessage(text.trim(), sessionId || undefined);

            if (res.sessionId !== sessionId) {
                setSessionId(res.sessionId);
                localStorage.setItem(SESSION_KEY, res.sessionId);
            }

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: res.reply,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, isLoading]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setSessionId(null);
        localStorage.removeItem(SESSION_KEY);
    }, []);

    return { messages, isLoading, error, send, clearChat, setError };
}

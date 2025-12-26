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

    useEffect(() => {
        if (sessionId) {
            setIsLoading(true);
            getChatHistory(sessionId)
                .then(res => {
                    if (res.messages.length > 0) setMessages(res.messages);
                })
                .catch(() => {
                    localStorage.removeItem(SESSION_KEY);
                    setSessionId(null);
                })
                .finally(() => setIsLoading(false));
        }
    }, []);

    const send = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        if (trimmed.length > 4000) {
            setError('Message too long (max 4000 characters)');
            return;
        }

        setError(null);
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: trimmed,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await sendMessage(trimmed, sessionId || undefined);

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
            let errorMsg = 'Something went wrong. Please try again.';
            if (err instanceof Error) {
                if (err.message.includes('rate') || err.message.includes('Too many')) {
                    errorMsg = 'Too many requests. Wait a moment.';
                } else if (err.message.includes('network') || err.message.includes('fetch')) {
                    errorMsg = 'Connection error. Check your internet.';
                } else if (err.message.length < 100) {
                    errorMsg = err.message;
                }
            }
            setError(errorMsg);
            setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, isLoading]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setSessionId(null);
        setError(null);
        localStorage.removeItem(SESSION_KEY);
    }, []);

    return { messages, isLoading, error, send, clearChat, setError };
}

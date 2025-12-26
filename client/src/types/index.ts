// Message type
export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

// API types
export interface SendMessageResponse {
    reply: string;
    sessionId: string;
}

export interface ChatHistoryResponse {
    sessionId: string;
    messages: Message[];
}

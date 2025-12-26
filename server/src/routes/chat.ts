import { Router, Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversationService.js';
import { llmService } from '../services/llmService.js';
import { validateChatMessage, ChatMessageInput } from '../middleware/validation.js';
import { createError } from '../middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: { message: 'Too many requests. Please wait a moment.' } },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/message', chatLimiter, validateChatMessage, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, sessionId } = req.body as ChatMessageInput;

        const conversation = await conversationService.getOrCreateConversation(sessionId);

        await conversationService.addMessage({
            conversationId: conversation.id,
            sender: 'user',
            text: message
        });

        const history = await conversationService.getRecentMessages(conversation.id);
        const { reply, tokensUsed } = await llmService.generateReply(message, history);

        await conversationService.addMessage({
            conversationId: conversation.id,
            sender: 'ai',
            text: reply,
            tokenCount: tokensUsed
        });

        res.json({ reply, sessionId: conversation.id });
    } catch (error) {
        next(error);
    }
});

router.get('/history/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) throw createError('Session ID required', 400);

        const conversation = await conversationService.getConversation(sessionId);

        if (!conversation) {
            res.json({ sessionId, messages: [] });
            return;
        }

        res.json({
            sessionId: conversation.id,
            messages: conversation.messages.map(msg => ({
                id: msg.id,
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.createdAt.toISOString()
            }))
        });
    } catch (error) {
        next(error);
    }
});

router.post('/session', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const conversation = await conversationService.createConversation();
        res.status(201).json({
            sessionId: conversation.id,
            createdAt: conversation.createdAt.toISOString()
        });
    } catch (error) {
        next(error);
    }
});

export { router as chatRouter };

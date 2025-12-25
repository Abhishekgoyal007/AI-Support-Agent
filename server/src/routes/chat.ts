import { Router, Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversationService.js';
import { validateChatMessage, ChatMessageInput } from '../middleware/validation.js';
import { createError } from '../middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting: 30 requests per minute per IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        error: {
            message: 'Too many requests. Please wait a moment before sending more messages.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * POST /api/chat/message
 * Send a message and get an AI response
 */
router.post(
    '/message',
    chatLimiter,
    validateChatMessage,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { message, sessionId } = req.body as ChatMessageInput;

            // Get or create conversation
            const conversation = await conversationService.getOrCreateConversation(sessionId);

            // Save user message
            await conversationService.addMessage({
                conversationId: conversation.id,
                sender: 'user',
                text: message
            });

            // Get conversation history for context
            const history = await conversationService.getRecentMessages(conversation.id);

            // TODO: In Phase 4, we'll add LLM integration here
            // For now, return a placeholder response
            const reply = `Thank you for your message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}". LLM integration coming in Phase 4!`;

            // Save AI response
            await conversationService.addMessage({
                conversationId: conversation.id,
                sender: 'ai',
                text: reply
            });

            res.json({
                reply,
                sessionId: conversation.id
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history for a session
 */
router.get(
    '/history/:sessionId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                throw createError('Session ID is required', 400);
            }

            const conversation = await conversationService.getConversation(sessionId);

            if (!conversation) {
                // Return empty history for new sessions
                res.json({
                    sessionId,
                    messages: []
                });
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
    }
);

/**
 * POST /api/chat/session
 * Create a new chat session
 */
router.post(
    '/session',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const conversation = await conversationService.createConversation();

            res.status(201).json({
                sessionId: conversation.id,
                createdAt: conversation.createdAt.toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as chatRouter };

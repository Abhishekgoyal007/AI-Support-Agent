import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createError } from './errorHandler.js';

// Maximum message length (4000 chars ~ roughly 1000 tokens)
const MAX_MESSAGE_LENGTH = 4000;

// Validation schema for chat message request
export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
        .transform(val => val.trim()),
    sessionId: z.string().uuid().optional()
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const validateChatMessage = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = chatMessageSchema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map(e => e.message).join(', ');
            throw createError(errors, 400);
        }

        // Attach validated data to request
        req.body = result.data;
        next();
    } catch (error) {
        next(error);
    }
};

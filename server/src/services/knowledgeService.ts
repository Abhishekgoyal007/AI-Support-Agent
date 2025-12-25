import prisma from '../lib/prisma.js';

export class KnowledgeService {
    /**
     * Get all knowledge base items formatted for the LLM prompt
     */
    async getKnowledgeForPrompt(): Promise<string> {
        const items = await prisma.knowledgeBase.findMany({
            orderBy: [
                { priority: 'desc' },
                { category: 'asc' }
            ]
        });

        if (items.length === 0) {
            return this.getDefaultKnowledge();
        }

        // Group by category
        const grouped = items.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, typeof items>);

        // Format for prompt
        let knowledge = '';
        for (const [category, categoryItems] of Object.entries(grouped)) {
            knowledge += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            for (const item of categoryItems) {
                knowledge += `Q: ${item.question}\nA: ${item.answer}\n\n`;
            }
        }

        return knowledge;
    }

    /**
     * Default knowledge if database is empty
     */
    getDefaultKnowledge(): string {
        return `
## About TechNest
TechNest is a premium electronics and gadgets e-commerce store.

## Shipping Policy
- FREE shipping on all orders over $50
- Standard Shipping: 5-7 business days
- Express Shipping: 2-3 business days ($9.99)

## Returns & Refunds
- 30-day hassle-free return policy
- Items must be unused and in original packaging
- Refunds processed within 5-7 business days

## Support Hours
- Monday to Friday: 9:00 AM - 6:00 PM EST
- Saturday: 10:00 AM - 4:00 PM EST
- Sunday: Closed

## Payment Methods
- Credit Cards: Visa, Mastercard, Amex
- Digital Wallets: PayPal, Apple Pay, Google Pay
- Buy Now Pay Later: Klarna, Afterpay

## Warranty
- 1-year manufacturer warranty on all electronics
- Extended warranty available for purchase
`;
    }
}

export const knowledgeService = new KnowledgeService();

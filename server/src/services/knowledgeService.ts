import prisma from '../lib/prisma.js';

export class KnowledgeService {
    async getKnowledgeForPrompt(): Promise<string> {
        const items = await prisma.knowledgeBase.findMany({
            orderBy: [{ priority: 'desc' }, { category: 'asc' }]
        });

        if (items.length === 0) {
            return this.getDefaultKnowledge();
        }

        const grouped = items.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, typeof items>);

        let knowledge = '';
        for (const [category, categoryItems] of Object.entries(grouped)) {
            knowledge += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            for (const item of categoryItems) {
                knowledge += `Q: ${item.question}\nA: ${item.answer}\n\n`;
            }
        }
        return knowledge;
    }

    getDefaultKnowledge(): string {
        return `
## About TechNest
TechNest is a premium electronics and gadgets e-commerce store.

## Shipping
- FREE shipping on orders over $50
- Standard: 5-7 business days
- Express: 2-3 business days ($9.99)

## Returns
- 30-day return policy
- Items must be unused and in original packaging
- Refunds in 5-7 business days

## Support Hours
- Mon-Fri: 9AM-6PM EST
- Sat: 10AM-4PM EST
- Sun: Closed

## Payment
- Cards: Visa, Mastercard, Amex
- Digital: PayPal, Apple Pay, Google Pay
- BNPL: Klarna, Afterpay

## Warranty
- 1-year manufacturer warranty
- Extended warranty available
`;
    }
}

export const knowledgeService = new KnowledgeService();

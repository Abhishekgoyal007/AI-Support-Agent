import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding database...');

    // Clear existing knowledge base
    await prisma.knowledgeBase.deleteMany();

    // Seed knowledge base with TechNest FAQs
    const faqs = [
        // Shipping
        {
            category: 'shipping',
            question: 'What are your shipping options?',
            answer: 'We offer Standard Shipping (5-7 business days, free over $50), Express Shipping (2-3 business days, $9.99), and Same-Day Delivery in select metro areas ($14.99).',
            priority: 10
        },
        {
            category: 'shipping',
            question: 'Do you offer free shipping?',
            answer: 'Yes! We offer FREE shipping on all orders over $50. Orders under $50 have a flat $4.99 standard shipping fee.',
            priority: 10
        },
        {
            category: 'shipping',
            question: 'Do you ship internationally?',
            answer: 'Yes! We ship to USA, Canada, UK, Australia, Germany, France, and Japan. International Standard takes 10-15 business days ($19.99) and International Express takes 5-7 business days ($34.99).',
            priority: 8
        },
        {
            category: 'shipping',
            question: 'How long does shipping take?',
            answer: 'Standard shipping takes 5-7 business days, Express takes 2-3 business days. All orders are processed within 24 hours on business days.',
            priority: 9
        },

        // Returns & Refunds
        {
            category: 'returns',
            question: 'What is your return policy?',
            answer: 'We have a 30-day hassle-free return policy. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the item.',
            priority: 10
        },
        {
            category: 'returns',
            question: 'How do I return an item?',
            answer: 'Contact our support team to initiate a return. We\'ll email you a prepaid shipping label for defective items. For other returns, you can use any carrier.',
            priority: 9
        },
        {
            category: 'returns',
            question: 'Can I exchange an item?',
            answer: 'Yes! We offer exchanges for different sizes, colors, or similar products. Contact support to arrange an exchange.',
            priority: 7
        },

        // Support
        {
            category: 'support',
            question: 'What are your support hours?',
            answer: 'Our support team is available Monday-Friday 9AM-6PM EST and Saturday 10AM-4PM EST. We\'re closed on Sundays. Email support available 24/7 with response within 24 hours.',
            priority: 10
        },
        {
            category: 'support',
            question: 'How can I contact support?',
            answer: 'You can reach us via email at support@technest.com, phone at 1-800-TECHNEST (1-800-832-4637), or through live chat on our website during support hours.',
            priority: 10
        },

        // Payment
        {
            category: 'payment',
            question: 'What payment methods do you accept?',
            answer: 'We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, Google Pay, and Shop Pay. We also offer Buy Now Pay Later with Klarna and Afterpay.',
            priority: 10
        },
        {
            category: 'payment',
            question: 'Do you offer payment plans?',
            answer: 'Yes! We partner with Klarna and Afterpay to offer Buy Now Pay Later options. You can split your purchase into 4 interest-free payments.',
            priority: 8
        },

        // Warranty
        {
            category: 'warranty',
            question: 'What warranty do your products have?',
            answer: 'All electronics come with a 1-year manufacturer warranty. Accessories have a 90-day warranty. We also offer extended 2-year warranties for an additional 15% of the item price.',
            priority: 9
        },
        {
            category: 'warranty',
            question: 'What does the warranty cover?',
            answer: 'Our warranty covers manufacturing defects only. It does not cover accidental damage, water damage, or normal wear and tear. Accidental damage protection is available separately.',
            priority: 8
        },

        // Promotions
        {
            category: 'promotions',
            question: 'Do you have any discounts?',
            answer: 'New customers get 10% off their first order with code WELCOME10. We also offer free shipping on orders over $50 and bundle deals (buy 2 accessories, get 20% off).',
            priority: 10
        },
        {
            category: 'promotions',
            question: 'Do you have gift cards?',
            answer: 'Yes! TechNest gift cards are available in denominations from $25 to $500. They never expire and can be used on any product.',
            priority: 6
        }
    ];

    for (const faq of faqs) {
        await prisma.knowledgeBase.create({
            data: faq
        });
    }

    console.log(`✅ Seeded ${faqs.length} FAQ items`);
    console.log('🎉 Database seeding complete!');
}

seed()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

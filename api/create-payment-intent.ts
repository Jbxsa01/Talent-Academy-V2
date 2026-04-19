import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

// Initialize Stripe safely
if (stripeKey && stripeKey.startsWith('sk_')) {
  try {
    stripe = new Stripe(stripeKey);
  } catch (err) {
    console.error('❌ Failed to initialize Stripe:', err);
  }
} else {
  console.error('⚠️  STRIPE_SECRET_KEY not configured or invalid format (must start with sk_)');
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is initialized
  if (!stripe) {
    console.error('❌ Stripe not initialized - STRIPE_SECRET_KEY missing or invalid');
    return res.status(500).json({
      error: 'Payment service not configured. Please contact support.',
    });
  }

  try {
    const { amount, currency = 'mad', metadata } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({
        error: 'Invalid amount - must be greater than 0',
      });
    }

    console.log('✅ Creating payment intent: amount=', amount, 'currency=', currency);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('❌ Stripe error:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      type: error.type,
    });

    return res.status(500).json({
      error: error.message || 'Failed to create payment intent',
      code: error.code,
    });
  }
};

import Stripe from 'stripe';

// Validate Stripe key on startup
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('⚠️  STRIPE_SECRET_KEY not configured');
}

const stripe = new Stripe(stripeKey || '', {
  apiVersion: '2024-04-10' as any,
});

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { amount, currency = 'mad', metadata } = JSON.parse(event.body);

    // Validate amount
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid amount' }),
      };
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error: any) {
    console.error('Stripe error:', error.message || error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || 'Failed to create payment intent',
      }),
    };
  }
};

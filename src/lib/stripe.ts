import { loadStripe } from '@stripe/react-stripe-js';

// Remplace par ta clé publishable Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key_here';

// Create stripe instance once and reuse it
let stripeInstanceCache: ReturnType<typeof loadStripe> | null = null;

export const getStripe = async () => {
  if (!stripeInstanceCache) {
    stripeInstanceCache = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripeInstanceCache;
};

// Helper function to create a payment intent
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'mad'
): Promise<{ clientSecret: string } | null> => {
  try {
    // Try Netlify function first
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    // For local development without Netlify functions, return a mock
    if (import.meta.env.DEV) {
      console.warn('⚠️  Using mock payment intent for local development');
      return {
        clientSecret: 'pi_test_mock_' + Math.random().toString(36).substring(7),
      };
    }
    return null;
  }
};

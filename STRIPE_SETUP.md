# 🏦 Stripe Payment Integration Guide

## Quick Setup (3 Steps)

### 1️⃣ Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in to your Stripe account
3. Navigate to **Settings → API Keys**
4. Copy your **Publishable Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`)

### 2️⃣ Add Keys to `.env.local`

Update your `.env.local` file:
```
VITE_STRIPE_PUBLIC_KEY="pk_test_your_publishable_key_here"
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
```

### 3️⃣ Deploy Configuration

**For Netlify Deployment:**
- Add environment variables in **Netlify Dashboard → Site Settings → Build & Deploy → Environment**
- Set both `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY`

**For Local Testing:**
```bash
npm run dev
```

## 🔄 Payment Flow

### User Journey:
1. User browses talent and selects an offer
2. Clicks **"Rejoindre la Session"** button
3. Stripe Payment Modal opens (secure checkout)
4. User enters payment details
5. Stripe processes payment
6. Transaction record created in Firestore
7. Chat channel created between learner and trainer
8. User redirected to messaging page

### Backend Process:
1. Frontend requests `/netlify/functions/create-payment-intent`
2. Backend creates Stripe PaymentIntent
3. Returns `clientSecret` to frontend
4. Frontend shows Stripe Elements UI
5. User completes payment
6. Frontend calls `handlePaymentSuccess()` callback
7. Transaction data saved to Firestore

## 💳 Testing with Stripe Test Cards

Use these test card numbers in development:

| Card | Number | CVC | Date |
|------|--------|-----|------|
| **Success** | `4242 4242 4242 4242` | Any 3 digits | Any future date |
| **Declined** | `4000 0000 0000 0002` | Any 3 digits | Any future date |
| **3D Secure** | `4000 0025 0000 3155` | Any 3 digits | Any future date |

## 📱 Components Modified

### `src/components/StripePayment.tsx` 
- New payment modal component
- Stripe Elements integration
- Secure checkout flow

### `src/pages/TalentDetail.tsx`
- Updated to show Stripe payment modal
- Changed from hardcoded to real payment processing
- Receives `paymentIntentId` from Stripe

### `src/lib/stripe.ts`
- Stripe configuration
- Payment intent creation helper

### `netlify/functions/create-payment-intent.ts`
- Serverless function for creating Stripe PaymentIntents
- Handles payment security on backend

## 🔒 Security Checklist

✅ **Frontend:**
- Never expose secret key in frontend code
- Use `VITE_` prefix for environment variables in `.env.local`
- Stripe Elements handles card data securely

✅ **Backend:**
- Secret key only in backend `.env`
- Netlify Functions/Cloud Functions hide secret
- Payment verification on server-side

✅ **Database:**
- Store `paymentIntentId` in Firestore (not card data)
- Firestore Rules prevent unauthorized access
- Only learner/trainer/admin can view transactions

## 🚨 Firestore Rules Update (Already Applied)

Your `firestore.rules` already supports transactions with this rule:

```firestore
match /transactions/{transactionId} {
  allow read: if isSignedIn() && (resource.data.learnerId == request.auth.uid || resource.data.trainerId == request.auth.uid || isAdmin());
  allow create: if isSignedIn() && request.resource.data.learnerId == request.auth.uid;
}
```

## 📊 Transaction Record Fields

When payment succeeds, a transaction is created with:

```typescript
{
  learnerId: string;              // Learner's Firebase UID
  trainerId: string;              // Trainer's Firebase UID
  offerId: string;                // The service offer ID
  talentId: string;               // The talent/course ID
  amount: number;                 // 120 DHS (hardcoded for now)
  commission: number;             // 24 DHS (20% fee for Hestim)
  status: 'completed';            // Payment status
  paymentIntentId: string;        // Stripe PaymentIntent ID (for refunds)
  createdAt: ISO8601 timestamp;   // When payment was made
}
```

## 🔄 Next Steps

### Immediate:
- ✅ Add your Stripe API keys to `.env.local`
- ✅ Test with Stripe test cards
- ✅ Deploy to Netlify with environment variables

### Future Enhancements:
- [ ] Add webhook for payment confirmation (`/netlify/functions/stripe-webhook.ts`)
- [ ] Send payment confirmation email
- [ ] Display transaction history in user dashboard
- [ ] Implement refund mechanism
- [ ] Add commission tracking for trainers
- [ ] Integrate payment analytics

## 🆘 Troubleshooting

**Error: "Failed to create payment intent"**
- Check that `STRIPE_SECRET_KEY` is set in environment variables
- Verify Stripe API keys are correct (no copy/paste errors)
- Check Netlify function logs for detailed errors

**Error: "Stripe is not defined"**
- Ensure `VITE_STRIPE_PUBLIC_KEY` is in `.env.local`
- Restart dev server after adding env variables
- Browser needs to access `https://js.stripe.com/v3/`

**Payment works but transaction not created**
- Check Firestore security rules allow creation
- Verify user is authenticated (in `/login`)
- Check browser console for Firebase errors

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)

---

**Questions?** Check the Stripe dashboard for transaction logs and potential error messages.

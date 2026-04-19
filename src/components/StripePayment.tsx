import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key_here';

interface StripePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  talentTitle: string;
  offerTitle: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({
  isOpen,
  onClose,
  amount,
  talentTitle,
  offerTitle,
  onPaymentSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise] = useState(() => loadStripe(STRIPE_PUBLISHABLE_KEY));

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setError(null);
      return;
    }

    const fetchClientSecret = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: 'mad',
            metadata: {
              talentTitle,
              offerTitle,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        // For local development without API, show a helpful message
        if (import.meta.env.DEV) {
          console.warn('⚠️  API functions not available in local development. Running: npm run dev');
          setError('DEV_MODE');
        } else {
          setError('Erreur de paiement. Veuillez vérifier votre connexion et réessayer.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, [isOpen, amount, talentTitle, offerTitle]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border-subtle">
          <div>
            <h2 className="text-2xl font-black text-text-main italic">{offerTitle}</h2>
            <p className="text-sm text-text-muted font-medium mt-1">{talentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="px-8 py-6 bg-slate-50 border-b border-border-subtle">
          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Montant à payer:</span>
            <span className="text-3xl font-black text-primary">
              {amount.toFixed(2)} <span className="text-sm text-text-muted">DHS</span>
            </span>
          </div>
        </div>

        {/* Stripe Checkout */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse text-primary font-black text-xl mb-2">
                  Initialisation du paiement...
                </div>
                <p className="text-text-muted text-sm">Veuillez patienter</p>
              </div>
            </div>
          ) : clientSecret && clientSecret.startsWith('pi_') ? (
            // Only render checkout if clientSecret is a valid Stripe secret
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout onComplete={() => onPaymentSuccess(clientSecret)} />
            </EmbeddedCheckoutProvider>
          ) : error === 'DEV_MODE' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 font-bold mb-2">🔧 Mode développement</p>
                  <p className="text-sm text-blue-800 mb-3">
                    Les fonctions Netlify ne sont pas disponibles en local. Vous pouvez tester le paiement après déploiement.
                  </p>
                  <p className="text-[10px] text-blue-700 font-mono">
                    Déployez sur Netlify pour activer les paiements Stripe
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 font-bold mb-4">
                  {error || 'Erreur lors de l\'initialisation du paiement'}
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 border-t border-border-subtle bg-slate-50 text-[10px] text-text-muted font-medium">
          <p>💳 Paiement sécurisé par Stripe · Aucune donnée bancaire stockée</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StripePayment;

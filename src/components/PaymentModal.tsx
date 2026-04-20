import React, { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  offer: { title: string; price: number; duration: string } | null;
  talent: { title: string; trainerName: string } | null;
  isProcessing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  offer,
  talent,
  isProcessing,
}) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Le nom est requis';
    }

    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      newErrors.cardNumber = 'Numéro de carte invalide (16 chiffres)';
    }

    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Format: MM/YY';
    }

    if (formData.cvc.length !== 3) {
      newErrors.cvc = 'CVC invalide (3 chiffres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formattedValue = value
      .slice(0, 16)
      .replace(/(\d{4})/g, '$1 ')
      .trim();
    setFormData({ ...formData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      const formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      setFormData({ ...formData, expiryDate: formattedValue });
    } else {
      setFormData({ ...formData, expiryDate: value });
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setFormData({ ...formData, cvc: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setPaymentSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      await onConfirm();
      
      setFormData({ cardName: '', cardNumber: '', expiryDate: '', cvc: '' });
      setPaymentSuccess(false);
      onClose();
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden border border-gray-200"
          >
            {/* Header - Simple White */}
            <div className="border-b border-gray-200 px-6 py-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Paiement</h2>
                  <p className="text-sm text-gray-600 mt-1">Informations de carte bancaire</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary - Minimal */}
              <div className="bg-gray-50 rounded p-3 text-sm border border-gray-200">
                <p className="font-medium text-gray-900">{talent?.title}</p>
                <p className="text-gray-600 mt-1">{offer?.title}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-700">Montant à payer</span>
                  <span className="text-lg font-semibold text-gray-900">{offer?.price} DHS</span>
                </div>
              </div>
            </div>

            {/* Form Content - Wide Layout */}
            <div className="p-6">
              {!paymentSuccess ? (
                <form onSubmit={handleSubmit} className="flex flex-row gap-8 items-start">
                  {/* Left: Card Fields */}
                  <div className="flex-1 space-y-4">
                    {/* Card Holder Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Nom du titulaire
                      </label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        disabled={isProcessing}
                        className={`w-full px-3 py-2 rounded border text-sm transition-colors disabled:opacity-50 disabled:bg-gray-50 ${
                          errors.cardName
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        } focus:outline-none`}
                      />
                      {errors.cardName && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.cardName}
                        </p>
                      )}
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        disabled={isProcessing}
                        maxLength="19"
                        className={`w-full px-3 py-2 rounded border text-sm transition-colors disabled:opacity-50 disabled:bg-gray-50 font-mono tracking-wider ${
                          errors.cardNumber
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        } focus:outline-none`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    {/* Expiry & CVC */}
                    <div className="flex gap-3">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Expiration
                        </label>
                        <input
                          type="text"
                          placeholder="12/25"
                          value={formData.expiryDate}
                          onChange={handleExpiryChange}
                          disabled={isProcessing}
                          maxLength="5"
                          className={`w-full px-3 py-2 rounded border text-sm transition-colors disabled:opacity-50 disabled:bg-gray-50 font-mono ${
                            errors.expiryDate
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          } focus:outline-none`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={formData.cvc}
                          onChange={handleCvcChange}
                          disabled={isProcessing}
                          maxLength="3"
                          className={`w-full px-3 py-2 rounded border text-sm transition-colors disabled:opacity-50 disabled:bg-gray-50 font-mono tracking-wider ${
                            errors.cvc
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          } focus:outline-none`}
                        />
                        {errors.cvc && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.cvc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Security Notice - Minimal */}
                    <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                      <Lock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p>Vos informations sont sécurisées et chiffrées.</p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-4 w-64 min-w-[220px]">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-blue-600 text-white py-2.5 rounded font-medium text-sm hover:bg-blue-700 transition-colors active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <CreditCard className="w-4 h-4" />
                          </motion.div>
                          <span>Traitement...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Payer {offer?.price} DHS</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isProcessing}
                      className="w-full py-2 rounded font-medium text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Paiement Confirmé!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Vous allez être redirigé vers votre apprentissage.
                  </p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-green-600"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

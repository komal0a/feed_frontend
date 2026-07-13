import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

export default function PaymentForm({ amount, onSuccess }: { amount: string, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    // Stripe handles the heavy lifting here
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevents the page from reloading if possible
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      // Payment successful!
      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <PaymentElement className="mb-4" />
      
      {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}
      
      <button 
        disabled={!stripe || isProcessing}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg py-4 rounded-2xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${amount}`}
      </button>
    </form>
  );
}
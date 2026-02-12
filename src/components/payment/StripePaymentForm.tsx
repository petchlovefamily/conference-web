'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
    clientSecret: string;
    amount: number;
    regCode: string;
    email: string;
    onSuccess: (paymentIntentId?: string) => void;
    onError: (error: string) => void;
}

function CheckoutForm({ amount, regCode, email, onSuccess, onError }: Omit<StripePaymentFormProps, 'clientSecret'>) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isElementReady, setIsElementReady] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success?code=${regCode}`,
                receipt_email: email,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message || 'Payment failed');
            onError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else if (paymentIntent && paymentIntent.status === 'processing') {
            // For async payment methods like PromptPay
            onSuccess(paymentIntent.id);
        } else {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isElementReady && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="ml-2 text-gray-400">Loading payment form...</span>
                </div>
            )}
            <div className={!isElementReady ? 'hidden' : ''}>
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                    onReady={() => setIsElementReady(true)}
                    onLoadError={(error) => {
                        console.error('[Stripe] Element load error:', error);
                        setMessage('Failed to load payment form. Please refresh the page.');
                    }}
                />
            </div>

            {message && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                    {message}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing || !isElementReady}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg rounded-xl disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay ฿${amount.toLocaleString()}`
                )}
            </Button>
        </form>
    );
}

export function StripePaymentForm({ clientSecret, amount, regCode, email, onSuccess, onError }: StripePaymentFormProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#10b981',
            colorBackground: '#0a0a0a',
            colorText: '#ffffff',
            colorTextSecondary: '#9ca3af',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '12px',
            spacingUnit: '4px',
        },
        rules: {
            '.Input': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            '.Input:focus': {
                border: '1px solid #10b981',
                boxShadow: '0 0 0 1px #10b981',
            },
            '.Label': {
                color: '#d1d5db',
            },
            '.Tab': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            '.Tab--selected': {
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
            },
        },
    };

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance,
            }}
        >
            <CheckoutForm
                amount={amount}
                regCode={regCode}
                email={email}
                onSuccess={onSuccess}
                onError={onError}
            />
        </Elements>
    );
}

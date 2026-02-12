'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export function getStripePromise(): Promise<Stripe | null> {
    return stripePromise;
}

export { stripePromise };

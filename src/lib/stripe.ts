// Stripe integration removed - all payments are mocked
// When new API is ready, reinitialize Stripe here

export function getStripePromise() {
    // Return null - Stripe is not initialized in mock mode
    return Promise.resolve(null);
}

export const stripePromise = Promise.resolve(null);

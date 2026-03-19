import { redirect } from 'next/navigation';

// Fallback: /checkout without event ID → redirect to events listing
export default function CheckoutFallbackPage() {
    redirect('/events');
}

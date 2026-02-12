'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MOCK_EVENTS } from '@/lib/mockData';
import { getEventById } from '@/lib/services';
import { registrationsApi, paymentsApi } from '@/lib/api';
import { Round, TicketType } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, CreditCard, User, Mail, Phone, Building2, Ticket, QrCode, MessageSquare, Send, Loader2, Lock } from 'lucide-react';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"



export default function CheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const eventId = params.id as string;
    const roundId = searchParams.get('round');
    const ticketId = searchParams.get('ticket');
    const addonsParam = searchParams.get('addons'); // Comma-separated add-on IDs
    const selectedAddonIds = addonsParam ? addonsParam.split(',') : [];

    // Get logged-in user info
    const { user, isLoggedIn } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        organization: ''
    });

    // E-Ticket Delivery Options
    const [deliveryOptions, setDeliveryOptions] = useState({
        sendViaEmail: true,
        sendViaSms: false
    });

    // Stripe Elements state
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [registrationData, setRegistrationData] = useState<{ id: number; regCode: string } | null>(null);
    const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<'qr' | 'credit_card'>('credit_card');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill email from logged-in user
    useEffect(() => {
        if (isLoggedIn && user?.email) {
            setFormData(prev => ({
                ...prev,
                email: user.email,
            }));
        }
    }, [isLoggedIn, user]);

    // Load saved form data from sessionStorage on mount
    useEffect(() => {
        const savedData = sessionStorage.getItem(`checkout-${eventId}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Don't override email if user is logged in
            const savedFormData = parsed.formData || {};
            if (isLoggedIn && user?.email) {
                savedFormData.email = user.email;
            }
            setFormData(savedFormData);
            setPaymentMethod(parsed.paymentMethod || 'qr');
        }
    }, [eventId, isLoggedIn, user]);

    // Save form data to sessionStorage whenever it changes
    useEffect(() => {
        if (formData.firstName || formData.lastName || formData.email || formData.phone) {
            sessionStorage.setItem(`checkout-${eventId}`, JSON.stringify({
                formData,
                paymentMethod
            }));
        }
    }, [formData, paymentMethod, eventId]);

    // Fetch Event Data
    const { data: event } = useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const result = await getEventById(eventId);
            if (!result) {
                throw new Error('Event not found');
            }
            return result;
        },
        enabled: !!eventId,
        retry: 1,
    });

    if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    const round = event.rounds?.find((r: Round) => r.id === roundId) || event.rounds?.[0];

    // Find ticket type from URL param, or fallback to first ticket type
    // Note: ticket IDs might be strings or numbers, so compare as strings
    const selectedTicketType = ticketId
        ? event.ticketTypes?.find((t: TicketType) => String(t.id) === String(ticketId))
        : event.ticketTypes?.[0];

    // If not found by ID but ticketId was provided, fallback to first (shouldn't happen)
    const finalTicketType = selectedTicketType || event.ticketTypes?.[0];
    const ticketPrice = finalTicketType ? parseFloat(finalTicketType.price?.toString() || '0') : (event.price ?? 0);

    // Find selected add-on tickets
    const selectedAddons = event.ticketTypes?.filter((t: TicketType) =>
        selectedAddonIds.includes(String(t.id)) && t.ticketCategory === 'addon'
    ) || [];
    const addonsTotal = selectedAddons.reduce((sum: number, addon: TicketType) =>
        sum + parseFloat(addon.price?.toString() || '0'), 0
    );
    const totalPrice = ticketPrice + addonsTotal;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Use selected ticket type from URL param
            if (!finalTicketType) {
                alert('ไม่พบประเภทบัตร');
                setIsSubmitting(false);
                return;
            }

            // 2. Create Registration via API
            // Determine attendeeType: use user's role if logged in as member, or check licenseNumber
            const isMember = (isLoggedIn && user?.role === 'member') || formData.licenseNumber;
            const regData: import('@/lib/api').CreateRegistrationData = {
                eventId: parseInt(eventId),
                ticketTypeId: parseInt(finalTicketType.id),
                addonTicketTypeIds: selectedAddonIds.map(id => parseInt(id)),
                attendeeType: isMember ? 'member' : 'public',
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone || undefined,
                organization: formData.organization || undefined,
                licenseNumber: formData.licenseNumber || undefined,
            };

            const regResponse = await registrationsApi.create(regData);

            if (!regResponse.success || !regResponse.data) {
                throw new Error('Failed to create registration');
            }

            const registration = regResponse.data;
            setRegistrationData({ id: registration.id, regCode: registration.regCode });

            // 3. Check if ticket is free
            const finalPrice = parseFloat(finalTicketType.price?.toString() || '0');

            if (finalPrice === 0) {
                // Free ticket - go directly to success page
                sessionStorage.removeItem(`checkout-${eventId}`);
                router.push(`/success?code=${registration.regCode}`);
                return;
            }

            // 4. Create PaymentIntent for Stripe Elements
            // Map frontend payment method to backend type
            const paymentType = paymentMethod === 'qr' ? 'promptpay' : 'card';

            const paymentResponse = await paymentsApi.createIntent({
                registrationId: registration.id,
                ticketTypeId: parseInt(finalTicketType.id),
                paymentMethodType: paymentType,
            });

            if (!paymentResponse.success || !paymentResponse.data?.clientSecret) {
                throw new Error('Failed to create payment intent');
            }

            // 5. Set client secret and open Stripe Elements dialog
            setClientSecret(paymentResponse.data.clientSecret);
            setPaymentAmount(paymentResponse.data.amount);
            setIsStripeDialogOpen(true);
            setIsSubmitting(false);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง';
            alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = (paymentIntentId?: string) => {
        sessionStorage.removeItem(`checkout-${eventId}`);
        if (registrationData) {
            const params = new URLSearchParams();
            params.set('code', registrationData.regCode);
            if (paymentIntentId) {
                params.set('payment_intent', paymentIntentId);
            }
            router.push(`/success?${params.toString()}`);
        }
    };

    const handlePaymentError = (_error: string) => {
        // Error is handled by Stripe form component
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-grow pt-32 pb-20 px-4 md:px-6 relative">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent -z-10" />

                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-4xl font-bold mb-8 text-center md:text-left">Checkout & Registration</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left: Registration Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-400" />
                                        Participant Details
                                    </CardTitle>
                                    <CardDescription>
                                        Please fill in the information for the attendee.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                                                <Input
                                                    id="firstName" name="firstName" required
                                                    placeholder="John"
                                                    value={formData.firstName} onChange={handleInputChange}
                                                    className="bg-black/20 border-white/10 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                                                <Input
                                                    id="lastName" name="lastName" required
                                                    placeholder="Doe"
                                                    value={formData.lastName} onChange={handleInputChange}
                                                    className="bg-black/20 border-white/10 focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                                                    Email Address
                                                    {isLoggedIn && <Lock className="w-3 h-3 text-emerald-400" />}
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input
                                                        id="email" name="email" type="email" required
                                                        placeholder="john@example.com"
                                                        value={formData.email} onChange={handleInputChange}
                                                        disabled={isLoggedIn}
                                                        className={`pl-10 bg-black/20 border-white/10 focus:border-emerald-500 ${isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                </div>
                                                {isLoggedIn && (
                                                    <p className="text-xs text-emerald-400">ใช้ email จากบัญชีที่ login อยู่</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input
                                                        id="phone" name="phone" type="tel" required
                                                        placeholder="0812345678"
                                                        value={formData.phone} onChange={handleInputChange}
                                                        className="pl-10 bg-black/20 border-white/10 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="organization" className="text-gray-300">Organization / Hospital</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="organization" name="organization"
                                                    placeholder="Bangkok Hospital"
                                                    value={formData.organization} onChange={handleInputChange}
                                                    className="pl-10 bg-black/20 border-white/10 focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="licenseNumber" className="text-gray-300">Pharmacist License Number (Optional)</Label>
                                            <Input
                                                id="licenseNumber" name="licenseNumber"
                                                placeholder="PH-xxxxx"
                                                value={formData.licenseNumber} onChange={handleInputChange}
                                                className="bg-black/20 border-white/10 focus:border-emerald-500"
                                            />
                                            <p className="text-xs text-gray-500">Required for CPE credit accumulation.</p>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Payment Method Selection */}
                            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-emerald-400" />
                                        Payment Method
                                    </CardTitle>
                                    <CardDescription>Select how you would like to pay.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setPaymentMethod('qr')}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'qr' ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}
                                        >
                                            <QrCode className={`w-8 h-8 ${paymentMethod === 'qr' ? 'text-emerald-400' : 'text-gray-400'}`} />
                                            <div className="text-center">
                                                <div className={`font-bold ${paymentMethod === 'qr' ? 'text-white' : 'text-gray-300'}`}>Thai QR Payment</div>
                                                <div className="text-xs text-gray-500">Scan via any banking app</div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('credit_card')}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'credit_card' ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}
                                        >
                                            <CreditCard className={`w-8 h-8 ${paymentMethod === 'credit_card' ? 'text-emerald-400' : 'text-gray-400'}`} />
                                            <div className="text-center">
                                                <div className={`font-bold ${paymentMethod === 'credit_card' ? 'text-white' : 'text-gray-300'}`}>Credit / Debit Card</div>
                                                <div className="text-xs text-gray-500">Visa, Mastercard, JCB</div>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMethod === 'credit_card' && (
                                        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200 text-sm flex items-start gap-2">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                            <span>
                                                Credit Card payment is processed via ksher. Please enter your card details in the popup.
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* E-Ticket Delivery Options */}
                            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="w-5 h-5 text-emerald-400" />
                                        ช่องทางรับ E-Ticket
                                    </CardTitle>
                                    <CardDescription>เลือกช่องทางที่ต้องการรับ E-Ticket หลังชำระเงิน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Email Option */}
                                        <label
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${deliveryOptions.sendViaEmail
                                                ? 'bg-emerald-600/20 border-emerald-500'
                                                : 'bg-black/20 border-white/10 hover:bg-white/5'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={deliveryOptions.sendViaEmail}
                                                onChange={(e) => setDeliveryOptions(prev => ({ ...prev, sendViaEmail: e.target.checked }))}
                                                className="w-5 h-5 rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <Mail className={`w-6 h-6 ${deliveryOptions.sendViaEmail ? 'text-emerald-400' : 'text-gray-400'}`} />
                                            <div className="flex-1">
                                                <div className={`font-bold ${deliveryOptions.sendViaEmail ? 'text-white' : 'text-gray-300'}`}>
                                                    Email
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ส่งไปที่: {formData.email || 'กรุณากรอก Email ด้านบน'}
                                                </div>
                                            </div>
                                        </label>

                                        {/* SMS Option */}
                                        <label
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${deliveryOptions.sendViaSms
                                                ? 'bg-emerald-600/20 border-emerald-500'
                                                : 'bg-black/20 border-white/10 hover:bg-white/5'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={deliveryOptions.sendViaSms}
                                                onChange={(e) => setDeliveryOptions(prev => ({ ...prev, sendViaSms: e.target.checked }))}
                                                className="w-5 h-5 rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <MessageSquare className={`w-6 h-6 ${deliveryOptions.sendViaSms ? 'text-emerald-400' : 'text-gray-400'}`} />
                                            <div className="flex-1">
                                                <div className={`font-bold ${deliveryOptions.sendViaSms ? 'text-white' : 'text-gray-300'}`}>
                                                    SMS
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ส่งไปที่: {formData.phone || 'กรุณากรอกเบอร์โทรด้านบน'}
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {!deliveryOptions.sendViaEmail && !deliveryOptions.sendViaSms && (
                                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                                            ⚠️ กรุณาเลือกอย่างน้อย 1 ช่องทางรับ E-Ticket
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <Card className="bg-gradient-to-br from-emerald-900/40 to-black/40 border-emerald-500/30 backdrop-blur-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-4">
                                            <img src={event.coverImage} alt={event.name} className="w-20 h-20 rounded-lg object-cover bg-gray-800" />
                                            <div>
                                                <h3 className="font-bold text-sm line-clamp-2">{event.name}</h3>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Ticket className="w-3 h-3" />
                                                    {event.eventType === 'single' ? 'Single Event' : 'Conference'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4 space-y-3 text-sm">
                                            <div className="flex justify-between w-full">
                                                <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</span>
                                                <span className="text-right">{round?.date ? new Date(round.date).toLocaleDateString() : 'TBA'}</span>
                                            </div>
                                            <div className="flex justify-between w-full">
                                                <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</span>
                                                <span className="text-right truncate max-w-[150px]">{round?.location}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-400">บัตรหลัก ({finalTicketType?.name || 'General'})</span>
                                                <span>฿{ticketPrice.toLocaleString()}</span>
                                            </div>

                                            {/* Add-ons Section */}
                                            {selectedAddons.length > 0 && (
                                                <div className="space-y-2 mb-3 pb-3 border-b border-white/10">
                                                    <div className="text-xs text-cyan-400">Add-ons:</div>
                                                    {selectedAddons.map((addon: TicketType) => (
                                                        <div key={addon.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-cyan-300">+ {addon.name}</span>
                                                            <span className="text-cyan-400">฿{(typeof addon.price === 'string' ? parseFloat(addon.price) : addon.price).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-xl font-bold text-emerald-400 mt-4">
                                                <span>รวมทั้งหมด</span>
                                                <span>฿{totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            form="checkout-form"
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                                        >
                                            {isSubmitting ? 'Processing...' : `Pay via ${paymentMethod === 'qr' ? 'QR Code' : 'Credit Card'}`}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Stripe Payment Dialog */}
            <Dialog open={isStripeDialogOpen} onOpenChange={setIsStripeDialogOpen}>
                <DialogContent className="sm:max-w-[480px] bg-black/95 border-white/10 text-white p-0 overflow-hidden backdrop-blur-xl">
                    <div className="p-6">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <DialogTitle className="text-2xl font-bold text-white">Pay with card</DialogTitle>
                            </div>
                            <DialogDescription className="text-gray-400">
                                Enter your card details to complete the payment securely via Stripe.
                            </DialogDescription>
                        </DialogHeader>

                        {clientSecret && registrationData ? (
                            <StripePaymentForm
                                clientSecret={clientSecret}
                                amount={paymentAmount}
                                regCode={registrationData.regCode}
                                email={formData.email}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

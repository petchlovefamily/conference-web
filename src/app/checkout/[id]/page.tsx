'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/lib/services';

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
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"



import { calculatePaySolutionsFeeExact, resolvePaySolutionsFeeMethod } from '@/lib/paySolutionsFee';

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
    const [mounted, setMounted] = useState(false);

    const { ref: formRef, isVisible: formVisible } = useScrollAnimation({ rootMargin: '0px 0px -20px 0px' });
    const { ref: paymentRef, isVisible: paymentVisible } = useScrollAnimation();
    const { ref: summaryRef, isVisible: summaryVisible } = useScrollAnimation();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        organization: ''
    });



    // Stripe Elements state
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [registrationData, setRegistrationData] = useState<{ id: number; regCode: string } | null>(null);
    const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<'qr' | 'credit_card'>('credit_card');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mounted animation
    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

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

    if (!event) return <div className="min-h-screen bg-white text-[#6f7e0d] flex items-center justify-center">Loading...</div>;

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

    // Calculate Base Net Amount
    const netAmount = ticketPrice + addonsTotal;

    // Apply Promo Code (Assume no promo for now, or just placeholders if they exist in checkout later)
    // NOTE: The previous checkout didn't have promo code parsing logic from URL yet, so we assume netAmount.

    // Calculate Final Total including Fees
    const feeMethod = resolvePaySolutionsFeeMethod(paymentMethod === 'qr' ? 'qr' : 'card', 'THB');
    const feeBreakdown = calculatePaySolutionsFeeExact(netAmount, feeMethod);

    const totalPrice = feeBreakdown.total;
    const totalFee = feeBreakdown.fee;

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

            // 2. Real Registration
            const { createRegistration, createCheckoutSession } = await import('@/lib/services');
            const regRequest = {
                eventId: eventId,
                ticketTypeId: String(finalTicketType.id),
                attendeeType: 'public',
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                organization: formData.organization,
                licenseNumber: formData.licenseNumber,
            };

            const regResponse = await createRegistration(regRequest);
            if (!regResponse.registration?.id) throw new Error('Registration failed');

            const regId = Number(regResponse.registration.id);
            const regCode = regResponse.registration.registrationNumber;
            setRegistrationData({ id: regId, regCode });

            // 3. Check if ticket is free
            const finalPrice = parseFloat(finalTicketType.price?.toString() || '0');

            if (finalPrice <= 0) {
                sessionStorage.removeItem(`checkout-${eventId}`);
                router.push(`/success?code=${regCode}`);
                return;
            }

            // 4. Payment process
            const baseUrl = window.location.origin;
            const checkout = await createCheckoutSession(
                String(regId),
                `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                `${baseUrl}/checkout/${eventId}`
            );

            if (checkout.checkoutUrl) {
                // Redirect to stripe checkout
                sessionStorage.removeItem(`checkout-${eventId}`);
                window.location.href = checkout.checkoutUrl;
            } else {
                // Fallback / QR code payment page
                sessionStorage.removeItem(`checkout-${eventId}`);
                router.push(`/payment/${eventId}?amount=${totalPrice}&method=${paymentMethod}&round=${roundId}`);
            }
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
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            <Navbar />

            <div className="flex-grow pt-32 pb-20 px-4 md:px-6 relative">
                <div className="container mx-auto max-w-6xl">
                    <h1 className={`text-4xl font-bold mb-8 text-center md:text-left text-[#6f7e0d] scroll-animate fade-up ${mounted ? 'is-visible' : ''}`}>Checkout & Registration</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left: Registration Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card ref={formRef} className={`bg-white border-gray-200 shadow-sm scroll-animate fade-up stagger-1 ${formVisible ? 'is-visible' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <User className="w-5 h-5 text-[#537547]" />
                                        ข้อมูลผู้เข้าร่วม
                                    </CardTitle>
                                    <CardDescription className="text-gray-500">
                                        กรุณากรอกข้อมูลสำหรับผู้เข้าร่วมงาน
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-gray-700">ชื่อ</Label>
                                                <Input
                                                    id="firstName" name="firstName" required
                                                    placeholder="John"
                                                    value={formData.firstName} onChange={handleInputChange}
                                                    className="bg-gray-50 border-gray-200 focus:border-[#537547] text-gray-900"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-gray-700">นามสกุล</Label>
                                                <Input
                                                    id="lastName" name="lastName" required
                                                    placeholder="Doe"
                                                    value={formData.lastName} onChange={handleInputChange}
                                                    className="bg-gray-50 border-gray-200 focus:border-[#537547] text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                                                    อีเมล
                                                    {isLoggedIn && <Lock className="w-3 h-3 text-[#537547]" />}
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="email" name="email" type="email" required
                                                        placeholder="john@example.com"
                                                        value={formData.email} onChange={handleInputChange}
                                                        disabled={isLoggedIn}
                                                        className={`pl-10 bg-gray-50 border-gray-200 focus:border-[#537547] text-gray-900 ${isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                </div>
                                                {isLoggedIn && (
                                                    <p className="text-xs text-[#537547]">ใช้ email จากบัญชีที่ login อยู่</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-gray-700">เบอร์โทรศัพท์</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="phone" name="phone" type="tel" required
                                                        placeholder="0812345678"
                                                        value={formData.phone} onChange={handleInputChange}
                                                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#537547] text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="organization" className="text-gray-700">หน่วยงาน / โรงพยาบาล</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="organization" name="organization"
                                                    placeholder="Bangkok Hospital"
                                                    value={formData.organization} onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:border-[#537547] text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="licenseNumber" className="text-gray-700">เลขที่ใบอนุญาตเภสัชกร (ไม่บังคับ)</Label>
                                            <Input
                                                id="licenseNumber" name="licenseNumber"
                                                placeholder="PH-xxxxx"
                                                value={formData.licenseNumber} onChange={handleInputChange}
                                                className="bg-gray-50 border-gray-200 focus:border-[#537547] text-gray-900"
                                            />
                                            <p className="text-xs text-gray-500">จำเป็นสำหรับการสะสมหน่วยกิต CPE</p>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Payment Method Selection */}
                            <Card ref={paymentRef} className={`bg-white border-gray-200 shadow-sm scroll-animate fade-up stagger-2 ${paymentVisible ? 'is-visible' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <CreditCard className="w-5 h-5 text-[#537547]" />
                                        วิธีการชำระเงิน
                                    </CardTitle>
                                    <CardDescription className="text-gray-500">เลือกวิธีการชำระเงินที่ต้องการ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setPaymentMethod('qr')}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${paymentMethod === 'qr' ? 'bg-[#537547]/10 border-[#537547] shadow-sm scale-[1.02]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:scale-[1.02]'}`}
                                        >
                                            <QrCode className={`w-8 h-8 ${paymentMethod === 'qr' ? 'text-[#537547]' : 'text-gray-400'}`} />
                                            <div className="text-center">
                                                <div className={`font-bold ${paymentMethod === 'qr' ? 'text-gray-900' : 'text-gray-600'}`}>Thai QR Payment</div>
                                                <div className="text-xs text-gray-500">สแกนผ่านแอปธนาคาร</div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('credit_card')}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${paymentMethod === 'credit_card' ? 'bg-[#537547]/10 border-[#537547] shadow-sm scale-[1.02]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:scale-[1.02]'}`}
                                        >
                                            <CreditCard className={`w-8 h-8 ${paymentMethod === 'credit_card' ? 'text-[#537547]' : 'text-gray-400'}`} />
                                            <div className="text-center">
                                                <div className={`font-bold ${paymentMethod === 'credit_card' ? 'text-gray-900' : 'text-gray-600'}`}>Credit / Debit Card</div>
                                                <div className="text-xs text-gray-500">Visa, Mastercard, JCB</div>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMethod === 'credit_card' && (
                                        <div className="mt-6 p-4 bg-[#537547]/10 border border-[#537547]/20 rounded-lg text-gray-700 text-sm flex items-start gap-2">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-[#537547] flex-shrink-0" />
                                            <span>
                                                การชำระเงินผ่านบัตรเครดิตดำเนินการผ่าน Pay Solutions กรุณากรอกข้อมูลบัตรในหน้าต่างถัดไป
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>

                        {/* Right: Order Summary */}
                        <div ref={summaryRef} className="lg:col-span-1">
                            <div>
                                <Card className={`bg-white border-gray-200 shadow-lg scroll-animate slide-right ${summaryVisible ? 'is-visible' : ''}`}>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-[#6f7e0d]">สรุปรายการ</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-4">
                                            <img src={event.coverImage} alt={event.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                                            <div>
                                                <h3 className="font-bold text-sm line-clamp-2 text-gray-900">{event.name}</h3>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Ticket className="w-3 h-3" />
                                                    {event.eventType === 'single' ? 'Single Event' : 'Conference'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                                            <div className="flex justify-between w-full">
                                                <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-3 h-3" /> วันที่</span>
                                                <span className="text-gray-900">{round?.date ? new Date(round.date).toLocaleDateString() : 'TBA'}</span>
                                            </div>
                                            <div className="flex justify-between w-full">
                                                <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-3 h-3" /> สถานที่</span>
                                                <span className="text-gray-900 text-right truncate max-w-[150px]">{round?.location}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-500">บัตรหลัก ({finalTicketType?.name || 'General'})</span>
                                                <span className="text-gray-900">฿{ticketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>

                                            {/* Add-ons Section */}
                                            {selectedAddons.length > 0 && (
                                                <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
                                                    <div className="text-xs text-[#537547]">Add-ons:</div>
                                                    {selectedAddons.map((addon: TicketType) => (
                                                        <div key={addon.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-[#537547]">+ {addon.name}</span>
                                                            <span className="text-[#537547]">฿{(typeof addon.price === 'string' ? parseFloat(addon.price) : addon.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>ราคาตั๋วและบริการ (Net)</span>
                                                    <span>฿{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>ค่าธรรมเนียมการชำระเงิน</span>
                                                    <span>฿{totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 text-right mt-[-4px]">
                                                    (รวม Processing Fee ฿{feeBreakdown.processingFee.toFixed(2)} และ VAT 7% ฿{feeBreakdown.processingVat.toFixed(2)})
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-xl font-bold text-[#537547] mt-4 pt-4 border-t border-[#537547]/20">
                                                <span>ยอดชำระสุทธิ</span>
                                                <span>฿{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            form="checkout-form"
                                            type="submit"
                                            className="w-full h-12 bg-[#537547] hover:bg-[#456339] text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                                        >
                                            {isSubmitting ? 'กำลังดำเนินการ...' : `ชำระเงินผ่าน${paymentMethod === 'qr' ? ' QR Code' : 'บัตรเครดิต'}`}
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
                <DialogContent className="sm:max-w-[480px] bg-white border-gray-200 text-gray-900 p-0 overflow-hidden">
                    <div className="p-6">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-[#537547] flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <DialogTitle className="text-2xl font-bold text-gray-900">ชำระด้วยบัตร</DialogTitle>
                            </div>
                            <DialogDescription className="text-gray-500">
                                กรอกข้อมูลบัตรเพื่อชำระเงินอย่างปลอดภัยผ่าน Stripe
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
                                <Loader2 className="w-8 h-8 animate-spin text-[#537547]" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

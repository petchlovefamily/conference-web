'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getEventById, verifyMember, createRegistration, createCheckoutSession } from '@/lib/services';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketType } from '@/types';
import {
    Calendar, MapPin, User, Mail, Phone, CreditCard,
    CheckCircle, XCircle, Loader2, Tag, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    // User role for ticket filtering
    const { user: authUser } = useAuth();
    const userRole = authUser?.role || 'public';

    // Helper: check if a ticket is visible to the current user based on allowedRoles
    const isTicketAllowedForUser = (ticket: { allowedRoles?: string[] }) => {
        if (!ticket.allowedRoles || ticket.allowedRoles.length === 0) return true;
        const role = userRole === 'public' ? 'general' : userRole;
        return ticket.allowedRoles.includes(role);
    };

    const [formData, setFormData] = useState({
        nameTh: '',
        nameEn: '',
        email: '',
        phone: '',
        licenseNumber: '',
        promoCode: '',
    });
    const [selectedTicketType, setSelectedTicketType] = useState<string>('');
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [verifying, setVerifying] = useState(false);
    const [memberVerified, setMemberVerified] = useState<boolean | null>(null);
    const [memberName, setMemberName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const { data: event, isLoading } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => getEventById(eventId),
        enabled: !!eventId,
    });

    useEffect(() => {
        if (event?.ticketTypes && event.ticketTypes.length > 0 && !selectedTicketType) {
            // Auto-select first primary ticket, not add-on
            const firstPrimaryTicket = event.ticketTypes.find(t => t.ticketCategory !== 'addon' && isTicketAllowedForUser(t));
            if (firstPrimaryTicket) {
                setSelectedTicketType(firstPrimaryTicket.id);
            }
        }
    }, [event, selectedTicketType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'licenseNumber') {
            setMemberVerified(null);
            setMemberName('');
        }
    };

    const handleVerifyMember = async () => {
        if (!formData.licenseNumber.trim()) return;
        setVerifying(true);
        setMemberVerified(null);
        try {
            const result = await verifyMember(formData.licenseNumber.trim());
            setMemberVerified(result.valid);
            if (result.valid && result.member) setMemberName(result.member.name);
        } catch {
            setMemberVerified(false);
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const regResult = await createRegistration({
                eventId,
                ticketTypeId: selectedTicketType,
                email: formData.email,
                phone: formData.phone,
                nameTh: formData.nameTh,
                nameEn: formData.nameEn || undefined,
                licenseNumber: formData.licenseNumber || undefined,
                promoCode: formData.promoCode || undefined,
            });

            const baseUrl = window.location.origin;
            const checkoutResult = await createCheckoutSession(
                regResult.registration.id,
                `${baseUrl}/success`,
                `${baseUrl}/cancel`
            );

            window.location.href = checkoutResult.checkoutUrl;
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            setError(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">ไม่พบงาน</h1>
                <Link href="/events"><Button>กลับไปหน้างานทั้งหมด</Button></Link>
            </div>
        );
    }

    const selectedTicket = event.ticketTypes?.find(t => t.id === selectedTicketType);
    const selectedAddonTickets = event.ticketTypes?.filter(t => selectedAddons.includes(t.id)) || [];
    const totalPrice = (selectedTicket?.price || 0) + selectedAddonTickets.reduce((sum, t) => sum + (t.price || 0), 0);

    const handleAddonToggle = (ticketId: string) => {
        setSelectedAddons(prev =>
            prev.includes(ticketId)
                ? prev.filter(id => id !== ticketId)
                : [...prev, ticketId]
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navbar />
            <main className="pt-24 pb-12 px-4 sm:px-6">
                <div className="container mx-auto max-w-5xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">ลงทะเบียนเข้าร่วมงาน</h1>
                    <p className="text-gray-400 mb-8">{event.name}</p>

                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Info */}
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-emerald-400" />ข้อมูลส่วนตัว
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nameTh">ชื่อ-นามสกุล (ภาษาไทย) <span className="text-red-400">*</span></Label>
                                            <Input id="nameTh" name="nameTh" required value={formData.nameTh} onChange={handleInputChange} placeholder="สมชาย ใจดี" className="bg-black/20 border-white/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nameEn">ชื่อ-นามสกุล (English)</Label>
                                            <Input id="nameEn" name="nameEn" value={formData.nameEn} onChange={handleInputChange} placeholder="Somchai Jaidee" className="bg-black/20 border-white/10" />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email <span className="text-red-400">*</span></Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className="pl-10 bg-black/20 border-white/10" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">เบอร์โทรศัพท์ <span className="text-red-400">*</span></Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} placeholder="0812345678" className="pl-10 bg-black/20 border-white/10" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="licenseNumber">เลขใบประกอบวิชาชีพ (สำหรับเภสัชกร)</Label>
                                            <div className="flex gap-2">
                                                <Input id="licenseNumber" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="ภ.12345" className="bg-black/20 border-white/10" />
                                                <Button type="button" variant="outline" onClick={handleVerifyMember} disabled={verifying || !formData.licenseNumber.trim()} className="border-emerald-500/50 hover:bg-emerald-500/20">
                                                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ตรวจสอบ'}
                                                </Button>
                                            </div>
                                            {memberVerified === true && <p className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" />ยืนยันแล้ว: {memberName}</p>}
                                            {memberVerified === false && <p className="text-sm text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" />ไม่พบข้อมูลสมาชิก</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Primary Ticket Selection */}
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-emerald-400" />ประเภทบัตรหลัก <span className="text-red-400">*</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {event.ticketTypes?.filter(t => t.ticketCategory !== 'addon' && isTicketAllowedForUser(t)).map((ticket) => {
                                            const available = (ticket.quota ?? 0) - (ticket.soldCount ?? 0);
                                            const isSoldOut = available <= 0;
                                            return (
                                                <div
                                                    key={ticket.id}
                                                    onClick={() => !isSoldOut && setSelectedTicketType(ticket.id)}
                                                    className={cn(
                                                        "p-4 rounded-xl border cursor-pointer transition-all",
                                                        isSoldOut ? "opacity-50 cursor-not-allowed bg-gray-800/50 border-gray-700"
                                                            : selectedTicketType === ticket.id ? "bg-emerald-600/20 border-emerald-500"
                                                                : "bg-black/20 border-white/10 hover:border-white/30"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedTicketType === ticket.id ? "border-emerald-500" : "border-gray-500")}>
                                                                {selectedTicketType === ticket.id && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">{ticket.name}</div>
                                                                <div className="text-xs text-gray-400">{isSoldOut ? 'เต็มแล้ว' : `เหลือ ${available} ที่นั่ง`}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xl font-bold text-emerald-400">฿{ticket.price.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {event.ticketTypes?.filter(t => t.ticketCategory !== 'addon' && isTicketAllowedForUser(t)).length === 0 && (
                                            <div className="text-center text-gray-400 py-4">ไม่มีบัตรหลักในขณะนี้</div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Add-on Ticket Selection */}
                                {event.ticketTypes?.some(t => t.ticketCategory === 'addon' && isTicketAllowedForUser(t)) && (
                                    <Card className={cn("bg-white/5 border-white/10", !selectedTicketType && "opacity-50")}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-cyan-400" />บัตรเสริม (ไม่บังคับ)
                                                {!selectedTicketType && (
                                                    <span className="text-xs text-yellow-400 font-normal ml-2">⚠️ กรุณาเลือกบัตรหลักก่อน</span>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {event.ticketTypes?.filter(t => t.ticketCategory === 'addon' && isTicketAllowedForUser(t)).map((ticket) => {
                                                const available = (ticket.quota ?? 0) - (ticket.soldCount ?? 0);
                                                const isSoldOut = available <= 0;
                                                const isDisabled = !selectedTicketType || isSoldOut;
                                                const isSelected = selectedAddons.includes(ticket.id);
                                                return (
                                                    <div
                                                        key={ticket.id}
                                                        onClick={() => !isDisabled && handleAddonToggle(ticket.id)}
                                                        className={cn(
                                                            "p-4 rounded-xl border transition-all cursor-pointer",
                                                            isDisabled ? "opacity-50 cursor-not-allowed bg-gray-800/50 border-gray-700"
                                                                : isSelected ? "bg-cyan-600/20 border-cyan-500"
                                                                    : "bg-black/20 border-white/10 hover:border-white/30"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-5 h-5 rounded border-2 flex items-center justify-center",
                                                                    isSelected ? "border-cyan-500 bg-cyan-500" : "border-gray-500"
                                                                )}>
                                                                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold flex items-center gap-2">
                                                                        {ticket.name}
                                                                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">Add-on</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">{isSoldOut ? 'เต็มแล้ว' : `เหลือ ${available} ที่นั่ง`}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-xl font-bold text-cyan-400">+฿{ticket.price.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Promo Code */}
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Tag className="w-4 h-4 text-emerald-400" />โค้ดส่วนลด (ถ้ามี)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input name="promoCode" value={formData.promoCode} onChange={handleInputChange} placeholder="กรอกโค้ดส่วนลด" className="bg-black/20 border-white/10" />
                                    </CardContent>
                                </Card>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{error}</span>
                                    </div>
                                )}

                                <Button type="submit" disabled={isSubmitting || !selectedTicketType} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl">
                                    {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />กำลังดำเนินการ...</> : 'ดำเนินการชำระเงิน'}
                                </Button>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="hidden lg:block">
                            <div className="sticky top-24">
                                <Card className="bg-gradient-to-br from-emerald-900/40 to-black/40 border-emerald-500/30">
                                    <CardHeader><CardTitle>สรุปรายการ</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="font-bold mb-2">{event.name}</h3>
                                            <div className="text-sm text-gray-400 space-y-1">
                                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{event.startDate ? new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA'}</div>
                                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</div>
                                            </div>
                                        </div>
                                        <div className="border-t border-white/10 pt-4 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">บัตรหลัก</span>
                                                <span>{selectedTicket?.name || '-'}</span>
                                            </div>
                                            {selectedTicket && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500"></span>
                                                    <span className="text-emerald-400">฿{selectedTicket.price.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {selectedAddonTickets.length > 0 && (
                                                <>
                                                    <div className="border-t border-white/10 my-2"></div>
                                                    <div className="text-gray-400 text-sm">Add-ons:</div>
                                                    {selectedAddonTickets.map(addon => (
                                                        <div key={addon.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-cyan-400">+ {addon.name}</span>
                                                            <span className="text-cyan-400">฿{addon.price.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                            <div className="border-t border-white/10 pt-2 mt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold">รวมทั้งหมด</span>
                                                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                                                        ฿{totalPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {event.cpeCredits && (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-300">
                                                ✅ งานนี้มอบหน่วยกิต CPE {event.cpeCredits} หน่วยกิต
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

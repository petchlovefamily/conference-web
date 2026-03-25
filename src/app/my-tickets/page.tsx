'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
    Loader2, Ticket, Calendar, MapPin, Clock, Download,
    ShoppingBag, AlertCircle, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function MyTicketsPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/login?redirect=/my-tickets');
        }
    }, [authLoading, isLoggedIn, router]);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['my-tickets'],
        queryFn: () => paymentsApi.myTickets(),
        enabled: isLoggedIn,
        refetchOnWindowFocus: false,
    });

    const tickets = data?.data;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'TBA';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (amount: string | null, currency: string | null) => {
        if (!amount) return 'ฟรี';
        const num = Number(amount);
        if (num === 0) return 'ฟรี';
        const symbol = currency === 'USD' ? '$' : '฿';
        return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    // Loading
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#537547] mx-auto" />
                        <p className="text-gray-500 text-sm">กำลังโหลดตั๋วของคุณ...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Error
    if (isError) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="text-center space-y-4">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                        <h2 className="text-xl font-bold text-gray-700">เกิดข้อผิดพลาด</h2>
                        <p className="text-gray-500 text-sm">
                            {error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลตั๋วได้'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm"
                        >
                            ลองใหม่
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Empty state
    if (!tickets?.registration) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="text-center space-y-4 max-w-md">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <Ticket className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-700">ยังไม่มีตั๋ว</h2>
                        <p className="text-gray-500 text-sm">คุณยังไม่ได้ลงทะเบียนงานประชุมใดๆ</p>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            ดูงานประชุมทั้งหมด
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const reg = tickets.registration;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-grow pt-28 pb-20 px-4 md:px-6">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">ตั๋วของฉัน</h1>

                    {/* Primary Registration Card - Mockup Ticket with QR */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden mb-6 flex flex-col md:flex-row">
                        {/* Ticket Stub (QR Code side) */}
                        <div className="md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 border-dashed p-6 flex flex-col items-center justify-center shrink-0 relative">
                            {/* Decorative Cutouts */}
                            <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200 shadow-inner" />
                            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-200 shadow-inner z-10" />

                            <div className="w-40 h-40 bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center justify-center mb-4">
                                {/* Use an external API to generate a mock QR code from the regCode */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reg.regCode || 'NO-CODE')}&margin=0`}
                                    alt="Ticket QR Code"
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <div className="text-center space-y-1">
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest block">Scan for Entry</span>
                                <span className="font-mono font-bold text-gray-900 text-lg block tracking-wider">{reg.regCode}</span>
                            </div>
                        </div>

                        {/* Ticket Details side */}
                        <div className="flex-1 flex flex-col relative">
                            <div className="bg-gradient-to-r from-[#537547] to-[#6f7e0d] p-5 md:p-6">
                                <div className="text-white/80 text-xs font-medium uppercase tracking-wider">Admission Ticket</div>
                                <h3 className="text-white text-xl font-bold mt-1 line-clamp-2 leading-tight">{reg.ticketName}</h3>
                            </div>

                            <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Status</span>
                                        <span className={`inline-flex items-center gap-1 mt-0.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                            reg.status === 'confirmed'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            {reg.status === 'confirmed' ? '✓ CONFIRMED' : reg.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Price</span>
                                        <span className="font-semibold text-gray-900 text-base">{formatPrice(reg.amount, reg.currency)}</span>
                                    </div>
                                    {reg.purchasedAt && (
                                        <div>
                                            <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Purchased</span>
                                            <span className="text-gray-800 font-medium">{formatDate(reg.purchasedAt)}</span>
                                        </div>
                                    )}
                                    {reg.priority && (
                                        <div>
                                            <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Tier</span>
                                            <span className="text-gray-800 font-medium capitalize">{reg.priority}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Includes */}
                                {reg.includes && reg.includes.length > 0 && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Included Benefits</div>
                                        <div className="flex flex-wrap gap-2">
                                            {reg.includes.map((feature, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-[#537547]/5 border border-[#537547]/20 text-[#537547] font-medium text-xs rounded-md">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Links */}
                                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        {reg.receiptUrl && (
                                            <a
                                                href={reg.receiptUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Receipt
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gala Dinner Ticket */}
                    {tickets.galaTicket && (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                            <div className="p-5 flex items-start justify-between">
                                <div>
                                    <div className="text-xs text-amber-600 font-medium uppercase tracking-wider">Gala Dinner</div>
                                    <h3 className="text-gray-900 font-bold mt-1">{tickets.galaTicket.name}</h3>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatPrice(tickets.galaTicket.amount, tickets.galaTicket.currency)}
                                </span>
                            </div>
                            <div className="px-5 pb-5 flex flex-wrap gap-4 text-sm text-gray-600">
                                {tickets.galaTicket.dateTimeStart && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#537547]" />
                                        {formatDate(tickets.galaTicket.dateTimeStart)}
                                    </span>
                                )}
                                {tickets.galaTicket.dateTimeStart && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#537547]" />
                                        {formatTime(tickets.galaTicket.dateTimeStart)}
                                        {tickets.galaTicket.dateTimeEnd && ` - ${formatTime(tickets.galaTicket.dateTimeEnd)}`}
                                    </span>
                                )}
                                {tickets.galaTicket.venue && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-[#537547]" />
                                        {tickets.galaTicket.venue}
                                    </span>
                                )}
                                {tickets.galaTicket.dietary && (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">
                                        อาหาร: {tickets.galaTicket.dietary}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Workshop Tickets */}
                    {tickets.workshops && tickets.workshops.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900">Workshops</h2>
                            {tickets.workshops.map((ws) => (
                                <div key={ws.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-5 flex items-start justify-between">
                                        <div>
                                            <div className="text-xs text-[#537547] font-medium uppercase tracking-wider">Workshop</div>
                                            <h3 className="text-gray-900 font-bold mt-1">{ws.name}</h3>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatPrice(ws.amount, ws.currency)}
                                        </span>
                                    </div>
                                    <div className="px-5 pb-5 flex flex-wrap gap-4 text-sm text-gray-600">
                                        {ws.dateTimeStart && (
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[#537547]" />
                                                {formatDate(ws.dateTimeStart)}
                                            </span>
                                        )}
                                        {ws.dateTimeStart && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-[#537547]" />
                                                {formatTime(ws.dateTimeStart)}
                                                {ws.dateTimeEnd && ` - ${formatTime(ws.dateTimeEnd)}`}
                                            </span>
                                        )}
                                        {ws.venue && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-[#537547]" />
                                                {ws.venue}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

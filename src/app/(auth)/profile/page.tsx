'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    User, Mail, Phone, Building2, IdCard, Edit3,
    Shield, Calendar, CheckCircle, ArrowLeft,
    Stethoscope, LogOut, Loader2, Ticket, Clock, XCircle, AlertCircle, Receipt
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRegistrations, UserRegistration } from '@/lib/services';
import { QRCodeTicket, QRCodeTicketCompact } from '@/components/ticket/QRCodeTicket';
import { cn } from '@/lib/utils';

type MenuTab = 'profile' | 'tickets' | 'payment';
type PaymentStatus = 'all' | 'pending' | 'completed' | 'failed' | 'cancelled';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoggedIn, isLoading: authLoading, logout, token } = useAuth();

    const [activeTab, setActiveTab] = useState<MenuTab>('profile');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus>('all');
    const [viewingQrTicket, setViewingQrTicket] = useState<UserRegistration | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
    });

    // Real data from API
    const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Fetch user's registrations when logged in
    useEffect(() => {
        async function fetchData() {
            if (isLoggedIn && token) {
                setIsLoadingData(true);
                try {
                    const data = await getUserRegistrations(token);
                    setRegistrations(data);
                } catch {
                    // Silent fail for registration fetch
                }
                setIsLoadingData(false);
            }
        }
        fetchData();
    }, [isLoggedIn, token]);

    // Derived data
    // Show both confirmed and pending tickets in My Tickets
    const myTickets = registrations.filter(r => r.status === 'confirmed' || r.status === 'pending');
    const paymentHistory = registrations.filter(r => r.payment !== null);
    const filteredPayments = paymentStatusFilter === 'all'
        ? paymentHistory
        : paymentHistory.filter(p => p.payment?.status === paymentStatusFilter);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/login');
        }
    }, [authLoading, isLoggedIn, router]);

    // Update edit form when user changes
    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phone: '',
                organization: '',
            });
        }
    }, [user]);

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Note: Profile update API should be called here when implemented
        setIsEditModalOpen(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const getPaymentStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { icon: Clock, label: 'Waiting Confirm', color: 'yellow' };
            case 'completed':
                return { icon: CheckCircle, label: 'Completed', color: 'green' };
            case 'failed':
                return { icon: XCircle, label: 'Failed', color: 'red' };
            case 'cancelled':
                return { icon: XCircle, label: 'Cancelled', color: 'red' };
            default:
                return { icon: AlertCircle, label: status, color: 'gray' };
        }
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    // Not logged in (will redirect)
    if (!isLoggedIn || !user) {
        return null;
    }

    const isPharmacist = user.role === 'pharmacist' || user.role === 'member';

    const menuItems = [
        { key: 'profile' as MenuTab, label: 'Profile', icon: User },
        { key: 'tickets' as MenuTab, label: 'My Ticket', icon: Ticket },
        { key: 'payment' as MenuTab, label: 'Payment History', icon: Receipt },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Header */}
            <section className="relative pt-32 pb-8 px-6 bg-black/40 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-10 w-64 h-64 bg-emerald-600/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 right-10 w-96 h-96 bg-green-600/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto max-w-6xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>กลับหน้าหลัก</span>
                    </Link>
                    <h1 className="text-4xl font-bold">โปรไฟล์ของฉัน</h1>
                    <p className="text-gray-400 mt-2">จัดการข้อมูลส่วนตัวและดูประวัติการซื้อ</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Left Sidebar */}
                        <div className="lg:w-72 flex-shrink-0">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-24">
                                {/* Profile Avatar */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold mx-auto border-4 border-emerald-500/50">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        {(user.role === 'admin' || user.role === 'staff') && (
                                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                                                <Shield className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-bold mt-3">{user.name}</h2>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${user.role === 'admin'
                                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                                            : user.role === 'staff'
                                                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                                                : isPharmacist
                                                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                                                    : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                                            }`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role === 'staff' && <User className="w-3 h-3" />}
                                            {isPharmacist && <Stethoscope className="w-3 h-3" />}
                                            {user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                                                user.role === 'staff' ? 'Staff' :
                                                    isPharmacist ? 'เภสัชกร' : 'ผู้ใช้งาน'}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <nav className="space-y-1">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.key;
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => setActiveTab(item.key)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all",
                                                    isActive
                                                        ? "bg-emerald-600/20 text-emerald-300 border-l-4 border-emerald-500"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </nav>

                                {/* Admin Dashboard Link */}
                                {(user.role === 'admin' || user.role === 'staff') && (
                                    <div className="mt-4">
                                        <Link href="/dashboard" className="block">
                                            <Button
                                                variant="outline"
                                                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                ไปหน้า Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Logout Button */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        ออกจากระบบ
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">

                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-2">
                                            Profile Information
                                        </h2>
                                        <p className="text-gray-400 text-sm mb-8">
                                            ข้อมูลที่จะแสดงบนตั๋วและใช้ยืนยันตัวตนก่อนเข้างาน
                                        </p>

                                        <div className="space-y-4">
                                            {/* Name */}
                                            <div className="flex items-center gap-4 py-4 border-b border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">ชื่อ-นามสกุล</div>
                                                    <div className="font-medium text-white">{user.name || 'ไม่ระบุ'}</div>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-center gap-4 py-4 border-b border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-400">อีเมล</div>
                                                    <div className="font-medium text-white">{user.email}</div>
                                                </div>
                                                <button
                                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex items-center gap-4 py-4 border-b border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                    <Phone className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-400">เบอร์โทรศัพท์</div>
                                                    <div className="font-medium text-white">-</div>
                                                </div>
                                                <button
                                                    onClick={() => setIsEditModalOpen(true)}
                                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            {/* User ID */}
                                            <div className="flex items-center gap-4 py-4 border-b border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                                    <IdCard className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">User ID</div>
                                                    <div className="font-medium font-mono text-white">{user.id}</div>
                                                </div>
                                            </div>

                                            {/* Role */}
                                            <div className="flex items-center gap-4 py-4 border-b border-emerald-500/50">
                                                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-teal-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">บทบาท</div>
                                                    <div className="font-medium text-white capitalize">{user.role}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Links */}
                                        <div className="mt-8 grid md:grid-cols-2 gap-4">
                                            <Link href="/events" className="block">
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 hover:bg-white/10 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Calendar className="w-6 h-6 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">ดูงานประชุม</div>
                                                            <div className="text-sm text-gray-400">ค้นหางานประชุมที่น่าสนใจ</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link href="/contact" className="block">
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-green-500/50 hover:bg-white/10 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Mail className="w-6 h-6 text-green-400" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">ติดต่อเรา</div>
                                                            <div className="text-sm text-gray-400">ต้องการความช่วยเหลือ?</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* My Ticket Tab */}
                                {activeTab === 'tickets' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-2">
                                            My Tickets
                                        </h2>
                                        <p className="text-gray-400 text-sm mb-8">
                                            ตั๋วงานประชุมที่คุณจองไว้
                                        </p>

                                        {isLoadingData ? (
                                            <div className="text-center py-16">
                                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                                                <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
                                            </div>
                                        ) : myTickets.length === 0 ? (
                                            <div className="text-center py-16 text-gray-400">
                                                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg">ยังไม่มีตั๋ว</p>
                                                <Link href="/events">
                                                    <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                                                        ดูงานประชุม
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {myTickets.map((ticket) => (
                                                    <div
                                                        key={ticket.id}
                                                        className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-500/50 transition-all"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-white text-lg">{ticket.event?.eventName || 'Unknown Event'}</h4>
                                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                                                                    <span className="flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 text-emerald-400" />
                                                                        {ticket.event?.startDate
                                                                            ? `${new Date(ticket.event.startDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })} ${new Date(ticket.event.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${ticket.event.endDate ? new Date(ticket.event.endDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}`
                                                                            : '-'}
                                                                    </span>
                                                                    <span className="flex items-center gap-2">
                                                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                                                        {ticket.event?.location || 'TBA'}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 text-xs text-gray-500 font-mono">{ticket.regCode}</div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-3">
                                                                <span className={cn(
                                                                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border",
                                                                    ticket.status === 'confirmed'
                                                                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
                                                                        : "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
                                                                )}>
                                                                    {ticket.status === 'confirmed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                                    {ticket.status === 'confirmed' ? (ticket.ticketType?.name || 'Ticket') : 'Waiting Payment'}
                                                                </span>
                                                                {ticket.status === 'confirmed' ? (
                                                                    <QRCodeTicketCompact
                                                                        regCode={ticket.regCode}
                                                                        onClick={() => setViewingQrTicket(ticket)}
                                                                    />
                                                                ) : (
                                                                    <Link href={`/checkout/${ticket.event?.id}?ticket=${ticket.ticketType?.id}&round=${ticket.event?.id}`} className="mt-2">
                                                                        <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                                                                            Pay Now
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Payment History Tab */}
                                {activeTab === 'payment' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-2">
                                            Payment History
                                        </h2>
                                        <p className="text-gray-400 text-sm mb-6">
                                            ประวัติการชำระเงินทั้งหมด
                                        </p>

                                        {/* Status Filter */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {[
                                                { key: 'all' as PaymentStatus, label: 'ทั้งหมด' },
                                                { key: 'pending' as PaymentStatus, label: 'Waiting Confirm' },
                                                { key: 'completed' as PaymentStatus, label: 'Completed' },
                                                { key: 'failed' as PaymentStatus, label: 'Failed' },
                                                { key: 'cancelled' as PaymentStatus, label: 'Cancelled' },
                                            ].map((filter) => (
                                                <button
                                                    key={filter.key}
                                                    onClick={() => setPaymentStatusFilter(filter.key)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                                        paymentStatusFilter === filter.key
                                                            ? "bg-emerald-600 text-white"
                                                            : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>

                                        {isLoadingData ? (
                                            <div className="text-center py-16">
                                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                                                <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
                                            </div>
                                        ) : filteredPayments.length === 0 ? (
                                            <div className="text-center py-16 text-gray-400">
                                                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg">ไม่พบรายการ</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {filteredPayments.map((payment) => {
                                                    const statusConfig = getPaymentStatusConfig(payment.payment?.status || 'pending');
                                                    const StatusIcon = statusConfig.icon;

                                                    return (
                                                        <div
                                                            key={payment.id}
                                                            className={cn(
                                                                "rounded-2xl p-5 transition-all",
                                                                payment.payment?.status === 'pending'
                                                                    ? "bg-gradient-to-r from-orange-900/20 to-red-900/20 border-2 border-orange-500/30"
                                                                    : "bg-white/5 border border-white/10 hover:border-white/20"
                                                            )}
                                                        >
                                                            {/* Header with Order Date and Purchase Number */}
                                                            <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                                                                <span>Order on {payment.createdAt ? new Date(payment.createdAt).toLocaleString('th-TH') : '-'}</span>
                                                                <span className="font-mono">Purchase Number {payment.regCode}</span>
                                                            </div>

                                                            {/* Event Name */}
                                                            <h4 className="font-bold text-white text-lg">{payment.event?.eventName || 'Unknown Event'}</h4>

                                                            {/* Ticket Info */}
                                                            <div className="flex justify-between items-center mt-3">
                                                                <div className="text-sm text-gray-400">
                                                                    <div className="flex items-center gap-2">
                                                                        <Ticket className="w-4 h-4 text-orange-400" />
                                                                        {payment.ticketType?.name || 'Ticket'} : {payment.event?.startDate ? new Date(payment.event.startDate).toLocaleDateString('th-TH') : '-'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="font-bold text-xl text-emerald-400">
                                                                        {parseFloat(payment.payment?.amount || '0').toLocaleString()} THB
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Status Badge and Purchase Again Button */}
                                                            {payment.payment?.status === 'pending' ? (
                                                                <div className="mt-4 pt-4 border-t border-orange-500/30">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="text-sm">
                                                                            <p className="text-gray-400">Please purchase by <span className="text-orange-400 font-semibold">QR code</span> or</p>
                                                                            <Link href={`/events/${payment.event?.id}`} className="text-orange-400 hover:text-orange-300 underline">
                                                                                change purchase channel
                                                                            </Link>
                                                                        </div>
                                                                        <Link href={`/events/${payment.event?.id}`}>
                                                                            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-2 rounded-full">
                                                                                Purchase again
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-end mt-4">
                                                                    <span className={cn(
                                                                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border",
                                                                        statusConfig.color === 'yellow' ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' :
                                                                            statusConfig.color === 'green' ? 'bg-green-600/20 text-green-300 border-green-500/30' :
                                                                                statusConfig.color === 'red' ? 'bg-red-600/20 text-red-300 border-red-500/30' :
                                                                                    'bg-gray-600/20 text-gray-300 border-gray-500/30'
                                                                    )}>
                                                                        <StatusIcon className="w-3 h-3" />
                                                                        {statusConfig.label}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Edit Profile Modal */}
            {/* QR Code View Modal */}
            <Dialog open={!!viewingQrTicket} onOpenChange={(open) => !open && setViewingQrTicket(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Ticket QR Code</DialogTitle>
                        <DialogDescription className="text-center text-gray-400">
                            Show this QR code at the event entrance for check-in
                        </DialogDescription>
                    </DialogHeader>
                    {viewingQrTicket && (
                        <div className="py-4">
                            <QRCodeTicket
                                regCode={viewingQrTicket.regCode}
                                eventName={viewingQrTicket.event?.eventName}
                                size={250}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-gray-950 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">แก้ไขข้อมูลส่วนตัว</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            อัปเดตข้อมูลของคุณ
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                disabled
                                className="bg-white/5 border-white/10 opacity-50"
                            />
                            <p className="text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                            <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="bg-white/5 border-white/10"
                                placeholder="08X-XXX-XXXX"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="organization">หน่วยงาน/องค์กร</Label>
                            <Input
                                id="organization"
                                value={editForm.organization}
                                onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                            >
                                บันทึก
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

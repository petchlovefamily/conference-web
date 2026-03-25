'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api/payments';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type PaymentStatus = 'polling' | 'paid' | 'pending' | 'failed' | 'cancelled' | 'error';

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 3000;

function PaymentResultInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading } = useAuth();

    const [status, setStatus] = useState<PaymentStatus>('polling');
    const [regCode, setRegCode] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [amount, setAmount] = useState<string | null>(null);
    const [currency, setCurrency] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(10);
    const pollCount = useRef(0);
    const pollTimer = useRef<NodeJS.Timeout | null>(null);

    // Get refno from URL params (Pay Solutions callback) or sessionStorage
    const refnoFromUrl = searchParams.get('refno') || searchParams.get('Refno');
    const refno = refnoFromUrl || (typeof window !== 'undefined' ? sessionStorage.getItem('payment-refno') : null);
    const eventId = typeof window !== 'undefined' ? sessionStorage.getItem('payment-event-id') : null;

    const pollVerify = useCallback(async () => {
        if (!refno) {
            setErrorMessage('ไม่พบข้อมูลการชำระเงิน');
            setStatus('error');
            return;
        }

        try {
            const result = await paymentsApi.verify(refno);

            if (result.success) {
                switch (result.status) {
                    case 'paid':
                        setStatus('paid');
                        setRegCode(result.regCode || null);
                        setOrderNumber(result.orderNumber || null);
                        setAmount(result.amount || null);
                        setCurrency(result.currency || null);
                        // Cleanup sessionStorage
                        sessionStorage.removeItem('checkout-payment-data');
                        sessionStorage.removeItem('payment-refno');
                        sessionStorage.removeItem('payment-event-id');
                        if (eventId) {
                            sessionStorage.removeItem(`checkout-wizard-${eventId}`);
                        }
                        return;
                    case 'failed':
                        setStatus('failed');
                        return;
                    case 'cancelled':
                        setStatus('cancelled');
                        return;
                    case 'pending':
                        // Continue polling
                        break;
                }
            }

            pollCount.current++;
            if (pollCount.current >= MAX_POLL_ATTEMPTS) {
                setStatus('pending');
                return;
            }

            pollTimer.current = setTimeout(pollVerify, POLL_INTERVAL_MS);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
            // If 404 or network error, keep polling a few more times
            if (pollCount.current < 5) {
                pollCount.current++;
                pollTimer.current = setTimeout(pollVerify, POLL_INTERVAL_MS);
                return;
            }
            setErrorMessage(msg);
            setStatus('error');
        }
    }, [refno, eventId]);

    useEffect(() => {
        if (authLoading) return;

        // Free registration — show success immediately without polling
        const isFree = searchParams.get('free') === '1';
        if (isFree) {
            setOrderNumber(searchParams.get('orderNumber') || null);
            setRegCode(searchParams.get('regCode') || null);
            setAmount('0');
            setCurrency('THB');
            setStatus('paid');
            sessionStorage.removeItem('checkout-payment-data');
            sessionStorage.removeItem('payment-refno');
            sessionStorage.removeItem('payment-event-id');
            return;
        }

        if (!refno) {
            setErrorMessage('ไม่พบข้อมูลการชำระเงิน กรุณาเริ่มต้นใหม่');
            setStatus('error');
            return;
        }

        pollVerify();

        return () => {
            if (pollTimer.current) {
                clearTimeout(pollTimer.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, refno]);

    useEffect(() => {
        if (status === 'paid') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        window.location.href = 'https://pris2026.vercel.app/en';
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status]);

    const renderContent = () => {
        switch (status) {
            case 'polling':
                return (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-[#537547]/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-[#537547]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">กำลังตรวจสอบการชำระเงิน</h2>
                        <p className="text-gray-500 text-sm">กรุณารอสักครู่ ระบบกำลังตรวจสอบสถานะ...</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>ตรวจสอบครั้งที่ {pollCount.current + 1}/{MAX_POLL_ATTEMPTS}</span>
                        </div>
                    </div>
                );

            case 'paid':
                return (
                    <div className="text-center space-y-5">
                        <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">ชำระเงินสำเร็จ!</h2>
                            <p className="text-gray-500 text-sm mt-1">ขอบคุณสำหรับการลงทะเบียน</p>
                        </div>

                        {(regCode || orderNumber || amount) && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm max-w-sm mx-auto">
                                {regCode && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">รหัสลงทะเบียน</span>
                                        <span className="font-mono font-bold text-[#537547]">{regCode}</span>
                                    </div>
                                )}
                                {orderNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">เลขที่คำสั่งซื้อ</span>
                                        <span className="font-mono text-gray-700">{orderNumber}</span>
                                    </div>
                                )}
                                {amount && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ยอดชำระ</span>
                                        <span className="font-bold text-gray-900">
                                            {currency === 'USD' ? '$' : '฿'}{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-gray-400">ใบเสร็จและรายละเอียดจะถูกส่งไปยังอีเมลที่ลงทะเบียน</p>

                        <div className="flex gap-3 justify-center pt-2">
                            <a
                                href="https://pris2026.vercel.app/en"
                                className="px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm flex items-center gap-2"
                            >
                                ไปยังเว็บไซต์ PRIS 2026 ({countdown}s)
                            </a>
                            <Link
                                href="/my-tickets"
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                ดูตั๋วของฉัน
                            </Link>
                        </div>
                    </div>
                );

            case 'pending':
                return (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                            <Clock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">รอการยืนยัน</h2>
                        <p className="text-gray-500 text-sm">
                            ระบบยังไม่ได้รับการยืนยันจากธนาคาร<br />
                            กรุณาตรวจสอบสถานะอีกครั้งในภายหลัง
                        </p>
                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                onClick={() => {
                                    pollCount.current = 0;
                                    setStatus('polling');
                                    pollVerify();
                                }}
                                className="px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm"
                            >
                                ตรวจสอบอีกครั้ง
                            </button>
                            <Link
                                href="/events"
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                กลับหน้าหลัก
                            </Link>
                        </div>
                    </div>
                );

            case 'failed':
                return (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">การชำระเงินไม่สำเร็จ</h2>
                        <p className="text-gray-500 text-sm">กรุณาลองใหม่อีกครั้ง หรือเลือกวิธีชำระเงินอื่น</p>
                        <div className="flex gap-3 justify-center pt-2">
                            {eventId && (
                                <Link
                                    href={`/checkout/${eventId}`}
                                    className="px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm"
                                >
                                    ลองชำระเงินอีกครั้ง
                                </Link>
                            )}
                            <Link
                                href="/events"
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                กลับหน้าหลัก
                            </Link>
                        </div>
                    </div>
                );

            case 'cancelled':
                return (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">ยกเลิกการชำระเงิน</h2>
                        <p className="text-gray-500 text-sm">คุณได้ยกเลิกการชำระเงิน</p>
                        <div className="flex gap-3 justify-center pt-2">
                            {eventId && (
                                <Link
                                    href={`/checkout/${eventId}`}
                                    className="px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm"
                                >
                                    กลับไปชำระเงิน
                                </Link>
                            )}
                            <Link
                                href="/events"
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                กลับหน้าหลัก
                            </Link>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-700">เกิดข้อผิดพลาด</h2>
                        <p className="text-gray-500 text-sm">{errorMessage}</p>
                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                onClick={() => router.back()}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                ย้อนกลับ
                            </button>
                            <Link
                                href="/events"
                                className="px-5 py-2.5 bg-[#537547] text-white font-medium rounded-lg hover:bg-[#456339] transition-colors text-sm"
                            >
                                กลับหน้าหลัก
                            </Link>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center px-4 py-20">
                <div className="max-w-lg w-full">
                    {renderContent()}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white flex flex-col">
                    <Navbar />
                    <div className="flex-grow flex items-center justify-center px-4 py-20">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto bg-[#537547]/10 rounded-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-[#537547]" />
                            </div>
                            <p className="text-gray-500 text-sm">กำลังโหลด...</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            }
        >
            <PaymentResultInner />
        </Suspense>
    );
}

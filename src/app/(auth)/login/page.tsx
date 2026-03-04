'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, Sparkles, ArrowRight, ArrowLeft, Eye, EyeOff, Stethoscope, User, Check, GraduationCap, Smartphone } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
    password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginType, setLoginType] = useState<'pharmacist' | 'general'>('pharmacist');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    // Backoffice URL (สำหรับ admin/staff)
    const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3000';

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data.email, data.password);

            // Map API user to AuthContext format
            const authUser = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                role: response.user.role,
                country: response.user.country,
                delegateType: response.user.delegateType,
                isThai: response.user.isThai,
                name: `${response.user.firstName} ${response.user.lastName}`,
            };

            login(response.token, authUser);
            router.push('/events');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
            if (errorMessage === 'ACCOUNT_PENDING') {
                setError('บัญชีของคุณอยู่ระหว่างรอการอนุมัติ กรุณารอการตรวจสอบจากเจ้าหน้าที่');
            } else if (errorMessage === 'ACCOUNT_REJECTED') {
                setError('บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อเจ้าหน้าที่');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#6f7e0d] flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#537547] via-[#456339] to-[#3d5733]" />
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-start items-center w-full pt-20 p-12">
                    <div className={`flex items-center gap-3 mb-8 scroll-animate fade-up ${mounted ? 'is-visible' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">
                            สภาเภสัชกรรม
                        </span>
                    </div>

                    <h2 className={`text-4xl font-bold text-center mb-4 leading-tight text-white scroll-animate fade-up stagger-1 ${mounted ? 'is-visible' : ''}`}>
                        ยินดีต้อนรับ<br />
                        <span className="text-white/90">
                            สู่ระบบลงทะเบียน
                        </span>
                    </h2>
                    <p className={`text-white/70 text-center max-w-md mb-8 scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}>
                        ลงทะเบียนเข้าร่วมงานประชุมวิชาการและสะสมหน่วยกิต CPE ได้ง่ายๆ
                    </p>

                    {/* Features */}
                    <div className="space-y-4 max-w-sm">
                        <div className={`flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-4 scroll-animate fade-up stagger-3 hover:-translate-y-0.5 hover:bg-white/15 transition-all duration-300 ${mounted ? 'is-visible' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-white">ลงทะเบียนง่าย</div>
                                <div className="text-sm text-white/60">จองที่นั่งได้ในไม่กี่คลิก</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-4 scroll-animate fade-up stagger-4 hover:-translate-y-0.5 hover:bg-white/15 transition-all duration-300 ${mounted ? 'is-visible' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-white">สะสมหน่วยกิต CPE</div>
                                <div className="text-sm text-white/60">รับหน่วยกิตอัตโนมัติ</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-4 scroll-animate fade-up stagger-5 hover:-translate-y-0.5 hover:bg-white/15 transition-all duration-300 ${mounted ? 'is-visible' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-white">QR Check-in</div>
                                <div className="text-sm text-white/60">เช็คอินด้วย QR Code</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Background gradient for mobile */}
                <div className="absolute inset-0 lg:hidden bg-gray-50" />

                <div className="w-full max-w-md relative z-10">
                    {/* Back to Home Link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#6f7e0d] mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>กลับหน้าหลัก</span>
                    </Link>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-[#537547] flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-[#537547]">
                            สภาเภสัชกรรม
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className={`bg-white border border-gray-200 rounded-3xl p-8 shadow-lg scroll-animate slide-right ${mounted ? 'is-visible' : ''}`}>
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold mb-2 text-[#6f7e0d]">เข้าสู่ระบบ</h1>
                            <p className="text-gray-500 text-sm">เลือกประเภทการเข้าสู่ระบบ</p>
                        </div>

                        {/* Login Type Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => { setLoginType('pharmacist'); setError(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${loginType === 'pharmacist'
                                    ? 'bg-[#537547] text-white shadow-lg'
                                    : 'text-gray-500 hover:text-[#6f7e0d]'
                                    }`}
                            >
                                <Stethoscope className="w-4 h-4" />
                                <span>เภสัชกร</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginType('general'); setError(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${loginType === 'general'
                                    ? 'bg-[#537547] text-white shadow-lg'
                                    : 'text-gray-500 hover:text-[#6f7e0d]'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                <span>บุคคลทั่วไป</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* CPE Notice for Pharmacist */}
                        {loginType === 'pharmacist' && (
                            <div className="mb-5 bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-3 text-sm text-[#537547] flex items-center gap-2 font-medium">
                                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                                <span>เข้าสู่ระบบเพื่อสะสมหน่วยกิต CPE อัตโนมัติ</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] focus:ring-[#537547]/20 text-[#6f7e0d] placeholder:text-gray-400"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-gray-700">รหัสผ่าน</Label>
                                    <Link href="/forgot-password" className="text-sm text-[#537547] hover:text-[#456339] transition-colors">
                                        ลืมรหัสผ่าน?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] focus:ring-[#537547]/20 text-[#6f7e0d] placeholder:text-gray-400"
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#537547] hover:bg-[#456339] rounded-xl font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        กำลังเข้าสู่ระบบ...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        เข้าสู่ระบบ <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-gray-500 text-sm">หรือ</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Guest Continue */}
                        <Link href="/events" className="block">
                            <Button variant="outline" className="w-full h-12 border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-gray-700">
                                <span className="flex items-center gap-2">
                                    ดูงานประชุมโดยไม่ต้องเข้าสู่ระบบ
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </Button>
                        </Link>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-gray-500 mt-8">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-[#537547] hover:text-[#456339] font-medium transition-colors">
                            สมัครสมาชิก
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

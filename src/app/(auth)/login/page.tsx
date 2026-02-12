'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
// Mock login - accepts any credentials
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, Sparkles, ArrowRight, ArrowLeft, Eye, EyeOff, Stethoscope, User } from 'lucide-react';
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

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    // Backoffice URL (สำหรับ admin/staff)
    const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3000';

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            // Mock login - simulate API delay and return mock user
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockToken = 'mock-token-' + Date.now();
            const mockUser = {
                id: 1,
                name: data.email.split('@')[0],
                email: data.email,
                role: 'member',
            };

            // ใช้ AuthContext login function (เก็บใน localStorage ของ Frontend)
            login(mockToken, mockUser);

            // Mock: always redirect to events (no backoffice)
            router.push('/events');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/30 rounded-full blur-[120px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                            สภาเภสัชกรรม
                        </span>
                    </div>

                    <h2 className="text-4xl font-bold text-center mb-4 leading-tight">
                        ยินดีต้อนรับ<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400">
                            สู่ระบบลงทะเบียน
                        </span>
                    </h2>
                    <p className="text-gray-400 text-center max-w-md mb-8">
                        ลงทะเบียนเข้าร่วมงานประชุมวิชาการและสะสมหน่วยกิต CPE ได้ง่ายๆ
                    </p>

                    {/* Features */}
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 text-lg">✓</span>
                            </div>
                            <div>
                                <div className="font-semibold">ลงทะเบียนง่าย</div>
                                <div className="text-sm text-gray-400">จองที่นั่งได้ในไม่กี่คลิก</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-lg">🎓</span>
                            </div>
                            <div>
                                <div className="font-semibold">สะสมหน่วยกิต CPE</div>
                                <div className="text-sm text-gray-400">รับหน่วยกิตอัตโนมัติ</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-400 text-lg">📱</span>
                            </div>
                            <div>
                                <div className="font-semibold">QR Check-in</div>
                                <div className="text-sm text-gray-400">เช็คอินด้วย QR Code</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Background gradient for mobile */}
                <div className="absolute inset-0 lg:hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600/20 rounded-full blur-[100px]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Back to Home Link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>กลับหน้าหลัก</span>
                    </Link>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                            สภาเภสัชกรรม
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold mb-2">เข้าสู่ระบบ</h1>
                            <p className="text-gray-400 text-sm">เลือกประเภทการเข้าสู่ระบบ</p>
                        </div>

                        {/* Login Type Tabs */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => { setLoginType('pharmacist'); setError(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${loginType === 'pharmacist'
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Stethoscope className="w-4 h-4" />
                                <span>เภสัชกร</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginType('general'); setError(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${loginType === 'general'
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                <span>บุคคลทั่วไป</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* CPE Notice for Pharmacist */}
                        {loginType === 'pharmacist' && (
                            <div className="mb-5 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm text-green-400">
                                🎓 เข้าสู่ระบบเพื่อสะสมหน่วยกิต CPE อัตโนมัติ
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-12 h-12 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-gray-500"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-gray-300">รหัสผ่าน</Label>
                                    <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                        ลืมรหัสผ่าน?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-12 pr-12 h-12 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-gray-500"
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
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl font-semibold shadow-lg shadow-emerald-900/30 transition-all hover:shadow-emerald-900/50 hover:-translate-y-0.5"
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
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-gray-500 text-sm">หรือ</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Guest Continue */}
                        <Link href="/events" className="block">
                            <Button variant="outline" className="w-full h-12 border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                                <span className="flex items-center gap-2">
                                    ดูงานประชุมโดยไม่ต้องเข้าสู่ระบบ
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </Button>
                        </Link>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-gray-400 mt-8">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            สมัครสมาชิก
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

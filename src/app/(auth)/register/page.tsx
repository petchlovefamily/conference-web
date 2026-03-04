'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, User, Phone, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff, Building2, GraduationCap, Briefcase } from 'lucide-react';
import Link from 'next/link';

const accountTypes = [
    { value: 'thaiStudent', label: 'นักศึกษา', icon: GraduationCap, description: 'Thai Student' },
    { value: 'thaiProfessional', label: 'เภสัชกร', icon: Briefcase, description: 'Thai Professional' },
] as const;

type AccountType = 'thaiStudent' | 'thaiProfessional';

const registerSchema = z.object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
    phone: z.string().optional(),
    password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    confirmPassword: z.string().min(6, 'กรุณายืนยันรหัสผ่าน'),
    organization: z.string().optional(),
    idCard: z.string().optional(),
    pharmacyLicenseId: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [accountType, setAccountType] = useState<AccountType>('thaiProfessional');
    const isStudent = accountType === 'thaiStudent';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError(null);
        try {
            // Build FormData for multipart upload
            const formData = new FormData();
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('accountType', accountType);

            if (data.phone) formData.append('phone', data.phone);
            if (data.organization) formData.append('organization', data.organization);

            // Conditional fields based on account type
            if (data.idCard) {
                formData.append('idCard', data.idCard);
            }
            if (data.pharmacyLicenseId) {
                formData.append('pharmacyLicenseId', data.pharmacyLicenseId);
            }

            await authApi.register(formData);
            router.push('/login?registered=true');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
            setError(errorMessage);
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
                        ลงทะเบียนบัญชี<br />
                        <span className="text-white/90">
                            Conference Community
                        </span>
                    </h2>
                    <p className={`text-white/70 text-center max-w-md mb-8 scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}>
                        สร้างบัญชีเพื่อเข้าร่วมงานประชุม และรับสิทธิประโยชน์มากมาย
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-4 max-w-sm">
                        <div className={`flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-4 scroll-animate fade-up stagger-3 hover:-translate-y-0.5 hover:bg-white/15 transition-all duration-300 ${mounted ? 'is-visible' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-white" />
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
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-white">Exclusive Events</div>
                                <div className="text-sm text-white/60">เข้าถึงเนื้อหาพิเศษสำหรับสมาชิก</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Background gradient for mobile */}
                <div className="absolute inset-0 lg:hidden bg-gray-50">
                </div>

                <div className="w-full max-w-lg relative z-10">
                    {/* Back to Home Link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Home</span>
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
                            <h1 className="text-3xl font-bold mb-2 text-[#6f7e0d]">สร้างบัญชีผู้ใช้</h1>
                            <p className="text-gray-500 text-sm">กรอกข้อมูลเพื่อลงทะเบียน</p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Account Type Selector */}
                        <div className="mb-6">
                            <Label className="text-gray-700 mb-3 block">ประเภทบัญชี</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {accountTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setAccountType(type.value)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${accountType === type.value
                                                ? 'bg-[#537547]/10 border-[#537547]/50 text-[#537547] font-medium'
                                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span>{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-gray-700">ชื่อ</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="firstName"
                                            placeholder="ชื่อ"
                                            className="pl-12 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                            {...register('firstName')}
                                        />
                                    </div>
                                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-gray-700">นามสกุล</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="lastName"
                                            placeholder="นามสกุล"
                                            className="pl-12 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                            {...register('lastName')}
                                        />
                                    </div>
                                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-12 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-700">เบอร์โทรศัพท์ <span className="text-gray-400">(ไม่บังคับ)</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="phone"
                                        placeholder="08XXXXXXXX"
                                        className="pl-12 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                        {...register('phone')}
                                    />
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="space-y-2">
                                <Label htmlFor="organization" className="text-gray-700">
                                    {isStudent ? 'สถาบันการศึกษา' : 'หน่วยงาน/องค์กร'} <span className="text-gray-400">(ไม่บังคับ)</span>
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="organization"
                                        placeholder={isStudent ? 'มหาวิทยาลัย...' : 'โรงพยาบาล/บริษัท...'}
                                        className="pl-12 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                        {...register('organization')}
                                    />
                                </div>
                            </div>

                            {/* Thai ID Card */}
                            <div className="space-y-2">
                                <Label htmlFor="idCard" className="text-gray-700">เลขบัตรประชาชน <span className="text-gray-400">(13 หลัก)</span></Label>
                                <Input
                                    id="idCard"
                                    placeholder="X-XXXX-XXXXX-XX-X"
                                    maxLength={13}
                                    className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                    {...register('idCard')}
                                />
                            </div>

                            {/* Pharmacy License (for professionals) */}
                            {!isStudent && (
                                <div className="space-y-2">
                                    <Label htmlFor="pharmacyLicenseId" className="text-gray-700">
                                        เลขใบอนุญาต <span className="text-gray-400">(ไม่บังคับ)</span>
                                    </Label>
                                    <Input
                                        id="pharmacyLicenseId"
                                        placeholder="ภ.XXXXX"
                                        className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                        {...register('pharmacyLicenseId')}
                                    />
                                </div>
                            )}



                            {/* Password Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-700">รหัสผ่าน</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••"
                                            className="pl-12 pr-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                            {...register('password')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-700">ยืนยัน</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••"
                                            className="pl-12 pr-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#537547] text-gray-900 placeholder:text-gray-400"
                                            {...register('confirmPassword')}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 w-4 h-4 rounded border-gray-300 bg-white text-[#537547] focus:ring-[#537547] accent-[#537547]"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-500">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-[#537547] hover:text-[#456339]">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-[#537547] hover:text-[#456339]">Privacy Policy</Link>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#537547] hover:bg-[#456339] text-white rounded-xl font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        กำลังสร้างบัญชี...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        สร้างบัญชี <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-gray-500 mt-6">
                        มีบัญชีอยู่แล้ว?{' '}
                        <Link href="/login" className="text-[#537547] hover:text-[#456339] font-medium transition-colors">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

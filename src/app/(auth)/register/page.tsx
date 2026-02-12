'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, User, Phone, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(9, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.register({
                email: data.email,
                password: data.password,
                name: data.name,
                phone: data.phone || undefined,
            });
            router.push('/login?registered=true');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
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
                            ConfSys
                        </span>
                    </div>

                    <h2 className="text-4xl font-bold text-center mb-4 leading-tight">
                        Join the<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400">
                            Conference Community
                        </span>
                    </h2>
                    <p className="text-gray-400 text-center max-w-md mb-8">
                        Create your account and start exploring world-class events.
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="font-semibold">Easy Registration</div>
                                <div className="text-sm text-gray-400">Book events in seconds</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="font-semibold">CPE Credits</div>
                                <div className="text-sm text-gray-400">Earn certificates automatically</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="font-semibold">Exclusive Events</div>
                                <div className="text-sm text-gray-400">Access members-only content</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
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
                        <span>Back to Home</span>
                    </Link>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                            ConfSys
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                            <p className="text-gray-400 text-sm">Fill in your details to get started</p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="pl-12 h-11 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 text-white placeholder:text-gray-500"
                                        {...register('name')}
                                    />
                                </div>
                                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-12 h-11 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 text-white placeholder:text-gray-500"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="phone"
                                        placeholder="08XXXXXXXX"
                                        className="pl-12 h-11 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 text-white placeholder:text-gray-500"
                                        {...register('phone')}
                                    />
                                </div>
                                {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••"
                                            className="pl-12 pr-10 h-11 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 text-white placeholder:text-gray-500"
                                            {...register('password')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••"
                                            className="pl-12 pr-10 h-11 bg-black/30 border-white/10 rounded-xl focus:border-emerald-500 text-white placeholder:text-gray-500"
                                            {...register('confirmPassword')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 w-4 h-4 rounded border-white/20 bg-black/30 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-400">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl font-semibold shadow-lg shadow-emerald-900/30 transition-all hover:shadow-emerald-900/50 hover:-translate-y-0.5"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, ArrowRight, MapPin, Award, ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCounter } from '@/hooks/use-counter';
import { useEffect } from 'react';
import { Event } from '@/types';

interface HeroSectionProps {
    yearsCount: number;
    membersCount: number;
    eventsCount: number;
    featuredEvent?: Event;
}

export function HeroSection({ yearsCount, membersCount, eventsCount, featuredEvent }: HeroSectionProps) {
    const yearsCounter = useCounter(yearsCount, 2000);
    const membersCounter = useCounter(membersCount, 2500);
    const eventsCounter = useCounter(eventsCount, 2000);

    useEffect(() => {
        const timer = setTimeout(() => {
            yearsCounter.setIsVisible(true);
            membersCounter.setIsVisible(true);
            eventsCounter.setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Helper for formatting date
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Official Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">องค์กรวิชาชีพเภสัชกรรม</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            สภาเภสัชกรรม
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                                แห่งประเทศไทย
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                            ศูนย์กลางการจัดงานประชุมวิชาการและอบรมเพื่อพัฒนาศักยภาพเภสัชกร
                            พร้อมสะสมหน่วยกิตการศึกษาต่อเนื่อง (CPE) ที่ได้รับการรับรอง
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link href="/events">
                                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    ดูงานประชุมทั้งหมด
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-white/20 hover:bg-white/5">
                                    เข้าสู่ระบบสมาชิก
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">{yearsCounter.count}+</div>
                                <div className="text-sm text-gray-500">ปีแห่งความไว้วางใจ</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">{(membersCounter.count / 1000).toFixed(0)}K+</div>
                                <div className="text-sm text-gray-500">เภสัชกรทั่วประเทศ</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">{eventsCounter.count}+</div>
                                <div className="text-sm text-gray-500">งานประชุมที่จัด</div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Featured Event Card */}
                    <div className="relative">
                        {featuredEvent ? (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm w-full aspect-[4/3]">
                                <Image
                                    src={featuredEvent.coverImage || featuredEvent.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop'}
                                    alt={featuredEvent.name || 'Conference'}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Event Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 rounded-full text-sm font-medium mb-3">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        เปิดรับสมัครแล้ว
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{featuredEvent.name}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(featuredEvent.startDate)}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {featuredEvent.location || 'สถานที่จัดงาน'}</span>
                                        {featuredEvent.cpeCredits && Number(featuredEvent.cpeCredits) > 0 && (
                                            <span className="flex items-center gap-1"><Award className="w-4 h-4 text-emerald-400" /> {featuredEvent.cpeCredits} หน่วยกิต CPE</span>
                                        )}
                                    </div>
                                    <Link href={`/events/${featuredEvent.id}`}>
                                        <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-xl">
                                            ลงทะเบียนเข้าร่วม
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                                <div className="w-full aspect-[4/3] bg-gradient-to-br from-emerald-900/20 to-green-900/40 flex items-center justify-center">
                                    <Calendar className="w-16 h-16 text-emerald-500/50" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-400">กำลังโหลดข้อมูลงาน...</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

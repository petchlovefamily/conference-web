'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, ArrowRight, MapPin, Award, ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCounter } from '@/hooks/use-counter';
import { useEffect, useState } from 'react';
import { ApiEvent } from '@/lib/api/events';

interface HeroSectionProps {
    yearsCount: number;
    membersCount: number;
    eventsCount: number;
    featuredEvent?: ApiEvent;
}

export function HeroSection({ yearsCount, membersCount, eventsCount, featuredEvent }: HeroSectionProps) {
    const yearsCounter = useCounter(yearsCount, 2000);
    const membersCounter = useCounter(membersCount, 2500);
    const eventsCounter = useCounter(eventsCount, 2000);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            yearsCounter.setIsVisible(true);
            membersCounter.setIsVisible(true);
            eventsCounter.setIsVisible(true);
        }, 500);

        // Trigger entrance animation
        requestAnimationFrame(() => setMounted(true));

        return () => clearTimeout(timer);
    }, []);

    // Helper for formatting date
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Official Badge */}
                        <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#537547]/10 border border-[#537547]/20 scroll-animate fade-up ${mounted ? 'is-visible' : ''}`}
                        >
                            <Shield className="w-4 h-4 text-[#537547]" />
                            <span className="text-sm text-[#537547] font-medium">องค์กรวิชาชีพเภสัชกรรม</span>
                        </div>

                        <h1
                            className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#6f7e0d] scroll-animate fade-up stagger-1 ${mounted ? 'is-visible' : ''}`}
                        >
                            สภาเภสัชกรรม
                            <br />
                            <span className="text-[#537547]">
                                แห่งประเทศไทย
                            </span>
                        </h1>

                        <p
                            className={`text-lg text-gray-500 max-w-lg leading-relaxed scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}
                        >
                            ศูนย์กลางการจัดงานประชุมวิชาการและอบรมเพื่อพัฒนาศักยภาพเภสัชกร
                            พร้อมสะสมหน่วยกิตการศึกษาต่อเนื่อง (CPE) ที่ได้รับการรับรอง
                        </p>

                        {/* CTA Buttons */}
                        <div className={`flex flex-wrap gap-4 scroll-animate fade-up stagger-3 ${mounted ? 'is-visible' : ''}`}>
                            <Link href="/events">
                                <Button size="lg" className="h-14 px-8 bg-[#537547] text-white hover:bg-[#456339] rounded-xl shadow-lg font-semibold transition-transform hover:scale-105 active:scale-95">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    ดูงานประชุมทั้งหมด
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-[#537547]/30 hover:bg-[#537547]/5 text-[#537547] transition-transform hover:scale-105 active:scale-95">
                                    เข้าสู่ระบบสมาชิก
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className={`grid grid-cols-3 gap-6 pt-4 scroll-animate fade-up stagger-4 ${mounted ? 'is-visible' : ''}`}>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#537547]">{yearsCounter.count}+</div>
                                <div className="text-sm text-gray-500">ปีแห่งความไว้วางใจ</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#537547]">{(membersCounter.count / 1000).toFixed(0)}K+</div>
                                <div className="text-sm text-gray-500">เภสัชกรทั่วประเทศ</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#537547]">{eventsCounter.count}+</div>
                                <div className="text-sm text-gray-500">งานประชุมที่จัด</div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Featured Event Card */}
                    <div className={`relative scroll-animate slide-right stagger-2 ${mounted ? 'is-visible' : ''}`}>
                        {featuredEvent ? (
                            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl w-full aspect-[4/3] group">
                                <Image
                                    src={featuredEvent.imageUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop'}
                                    alt={featuredEvent.eventName || 'Conference'}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Event Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#537547] rounded-full text-sm font-medium text-white mb-3">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        เปิดรับสมัครแล้ว
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-white">{featuredEvent.eventName}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(featuredEvent.startDate)}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {featuredEvent.location || 'สถานที่จัดงาน'}</span>
                                        {featuredEvent.cpeCredits && Number(featuredEvent.cpeCredits) > 0 && (
                                            <span className="flex items-center gap-1"><Award className="w-4 h-4 text-white/80" /> {featuredEvent.cpeCredits} หน่วยกิต CPE</span>
                                        )}
                                    </div>
                                    <Link href={`/events/${featuredEvent.id}`}>
                                        <Button className="w-full bg-white text-[#537547] hover:bg-gray-100 rounded-xl font-semibold transition-transform hover:scale-[1.02] active:scale-95">
                                            ลงทะเบียนเข้าร่วม
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                                <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                    <Calendar className="w-16 h-16 text-gray-300" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-xl font-bold mb-2 text-white/60">กำลังโหลดข้อมูลงาน...</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

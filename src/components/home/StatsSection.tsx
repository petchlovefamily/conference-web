'use client';

import { useEffect } from 'react';
import { useCounter } from '@/hooks/use-counter';

interface StatsSectionProps {
    yearsCount?: number;
    membersCount?: number;
    eventsCount?: number;
    cpeCount?: number;
}

export function StatsSection({
    yearsCount = 25,
    membersCount = 50000,
    eventsCount = 200,
    cpeCount = 15000,
}: StatsSectionProps) {
    const yearsCounter = useCounter(yearsCount, 2000);
    const membersCounter = useCounter(membersCount, 2500);
    const eventsCounter = useCounter(eventsCount, 2000);
    const cpeCounter = useCounter(cpeCount, 2500);

    useEffect(() => {
        // Trigger animations when component mounts (or could be IntersectionObserver)
        const timer = setTimeout(() => {
            yearsCounter.setIsVisible(true);
            membersCounter.setIsVisible(true);
            eventsCounter.setIsVisible(true);
            cpeCounter.setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="py-20 px-6">
            <div className="container mx-auto">
                <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/30 rounded-3xl p-12 border border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold text-emerald-400 mb-2">
                                {yearsCounter.count}+
                            </div>
                            <div className="text-gray-400">ปีแห่งประสบการณ์</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-blue-400 mb-2">
                                {(membersCounter.count / 1000).toFixed(0)}K+
                            </div>
                            <div className="text-gray-400">สมาชิกเภสัชกร</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-green-400 mb-2">
                                {eventsCounter.count}+
                            </div>
                            <div className="text-gray-400">งานประชุมที่จัด</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-green-400 mb-2">
                                {(cpeCounter.count / 1000).toFixed(0)}K+
                            </div>
                            <div className="text-gray-400">หน่วยกิต CPE ที่ให้</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

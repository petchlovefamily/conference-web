'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) {
        return null;
    }

    const isPast = new Date(targetDate).getTime() < new Date().getTime();

    if (isPast) {
        return (
            <div className={`text-center ${className}`}>
                <div className="text-sm text-gray-400 mb-2">Event Status</div>
                <div className="text-lg font-bold text-gray-500">Event has ended</div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="text-sm text-gray-400 mb-3 text-center">Event starts in</div>
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-3 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#537547]">{timeLeft.days}</div>
                    <div className="text-xs text-gray-400">Days</div>
                </div>
                <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-3 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#537547]">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Hours</div>
                </div>
                <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-3 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#537547]">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Mins</div>
                </div>
                <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-3 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-400 animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Secs</div>
                </div>
            </div>
        </div>
    );
}

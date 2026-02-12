import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-white/10',
                className
            )}
        />
    );
}

// Pre-built skeleton variants
export function SkeletonCard() {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    );
}

export function SkeletonEventList() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <Skeleton className="w-full md:w-64 h-48 rounded-xl" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-8">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-32 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonProfile() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/5 rounded-2xl p-8">
                <div className="flex items-center gap-6">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-6">
                        <Skeleton className="h-12 w-12 rounded-full mb-4" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Skeleton;

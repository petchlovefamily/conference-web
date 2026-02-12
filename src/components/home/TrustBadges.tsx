import { CheckCircle, Shield, Award, Star } from 'lucide-react';

export function TrustBadges() {
    return (
        <section className="py-8 border-y border-white/5 bg-white/[0.02]">
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    <div className="flex items-center gap-2 text-gray-400">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">รับรองโดยสภาเภสัชกรรม</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <span className="text-sm">มาตรฐาน ISO 9001</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Award className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm">หน่วยกิต CPE ได้รับการรับรอง</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Star className="w-5 h-5 text-green-500" />
                        <span className="text-sm">คะแนนความพึงพอใจ 4.8/5</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

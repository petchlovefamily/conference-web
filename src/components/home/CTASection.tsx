import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
    return (
        <section className="py-20 px-6">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">พร้อมเข้าร่วมงานประชุมหรือยัง?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    ลงทะเบียนเข้าร่วมงานประชุมวิชาการเพื่อพัฒนาความรู้และสะสมหน่วยกิต CPE
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/events">
                        <Button
                            size="lg"
                            className="h-14 px-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl"
                        >
                            <Calendar className="w-5 h-5 mr-2" />
                            ดูงานประชุมทั้งหมด
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl border-white/20 hover:bg-white/5">
                            เข้าสู่ระบบสมาชิก
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

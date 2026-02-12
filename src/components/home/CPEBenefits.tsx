import { GraduationCap, BookOpen, Users } from 'lucide-react';

export function CPEBenefits() {
    return (
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">
                        หน่วยกิตการศึกษาต่อเนื่อง
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">ทำไมต้องสะสม CPE?</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        หน่วยกิตการศึกษาต่อเนื่องทางเภสัชศาสตร์ (CPE) เป็นสิ่งจำเป็นสำหรับการต่ออายุใบอนุญาตประกอบวิชาชีพเภสัชกรรม
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">พัฒนาความรู้</h3>
                        <p className="text-gray-400 text-sm">
                            อัปเดตความรู้ใหม่ๆ ในวงการเภสัชกรรม จากวิทยากรผู้เชี่ยวชาญ
                        </p>
                    </div>

                    <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">ต่ออายุใบอนุญาต</h3>
                        <p className="text-gray-400 text-sm">
                            สะสมหน่วยกิตครบตามเกณฑ์สำหรับการต่ออายุใบประกอบวิชาชีพ
                        </p>
                    </div>

                    <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-500/20 flex items-center justify-center">
                            <Users className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">เครือข่ายวิชาชีพ</h3>
                        <p className="text-gray-400 text-sm">
                            พบปะแลกเปลี่ยนประสบการณ์กับเภสัชกรจากทั่วประเทศ
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

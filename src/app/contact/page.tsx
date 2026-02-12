'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Phone, Mail, MapPin, Clock, Send, ChevronDown, ChevronUp,
    MessageCircle, HelpCircle, FileText, CreditCard, Calendar, Users
} from 'lucide-react';

// FAQ Data
const FAQ_ITEMS = [
    {
        category: 'การลงทะเบียน',
        icon: FileText,
        questions: [
            {
                q: 'ฉันสามารถลงทะเบียนหลายงานพร้อมกันได้หรือไม่?',
                a: 'ได้ครับ คุณสามารถลงทะเบียนเข้าร่วมหลายงานได้ โดยแต่ละงานจะถูกจัดการแยกกัน และจะได้รับ E-Ticket แยกสำหรับแต่ละงาน'
            },
            {
                q: 'ฉันสามารถยกเลิกหรือเปลี่ยนแปลงการลงทะเบียนได้หรือไม่?',
                a: 'สามารถยกเลิกได้ก่อนวันงาน 7 วัน โดยจะได้รับเงินคืนเต็มจำนวน หากต้องการเปลี่ยนแปลงกรุณาติดต่อ staff ล่วงหน้า'
            },
            {
                q: 'ลงทะเบียนแล้วแต่ไม่ได้รับ E-Ticket?',
                a: 'กรุณาตรวจสอบโฟลเดอร์ Spam ในอีเมล หากยังไม่พบกรุณาติดต่อเราผ่านช่องทางด้านล่าง'
            }
        ]
    },
    {
        category: 'การชำระเงิน',
        icon: CreditCard,
        questions: [
            {
                q: 'รองรับช่องทางการชำระเงินอะไรบ้าง?',
                a: 'รองรับ Thai QR Payment (PromptPay), บัตรเครดิต/เดบิต (Visa, Mastercard, JCB)'
            },
            {
                q: 'ชำระเงินแล้วแต่ยังไม่ได้รับการยืนยัน?',
                a: 'การชำระเงินผ่าน QR Payment อาจใช้เวลา 5-15 นาทีในการยืนยัน หากเกิน 30 นาทีกรุณาติดต่อเรา'
            },
            {
                q: 'สามารถขอใบเสร็จรับเงินได้หรือไม่?',
                a: 'ได้ครับ ใบเสร็จจะถูกส่งไปพร้อม E-Ticket ทางอีเมล หรือสามารถขอเพิ่มเติมได้ที่จุดลงทะเบียนในวันงาน'
            }
        ]
    },
    {
        category: 'หน่วยกิต CPE',
        icon: Calendar,
        questions: [
            {
                q: 'หน่วยกิต CPE จะได้รับเมื่อไหร่?',
                a: 'หน่วยกิต CPE จะถูกบันทึกภายใน 7 วันหลังจบงาน โดยจะแจ้งเตือนทางอีเมลเมื่อบันทึกเรียบร้อย'
            },
            {
                q: 'ต้องใช้เลขใบประกอบวิชาชีพในการลงทะเบียนหรือไม่?',
                a: 'จำเป็นกรณีที่ต้องการรับหน่วยกิต CPE เท่านั้น หากเป็นบุคคลทั่วไปไม่จำเป็นต้องกรอก'
            }
        ]
    },
    {
        category: 'วันงาน',
        icon: Users,
        questions: [
            {
                q: 'ต้องพิมพ์ E-Ticket หรือไม่?',
                a: 'ไม่จำเป็นครับ สามารถแสดง E-Ticket ผ่านหน้าจอมือถือได้เลย Staff จะสแกน QR Code จากหน้าจอ'
            },
            {
                q: 'มาถึงช้ากว่ากำหนดได้หรือไม่?',
                a: 'สามารถมาช้าได้ แต่อาจพลาดเนื้อหาบางส่วน และการเข้าห้องประชุมอาจถูกจำกัดในบางช่วง'
            }
        ]
    }
];

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        regCode: '',
        category: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState('');

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate Ticket ID
        const id = `TKT-${Date.now().toString(36).toUpperCase()}`;
        setTicketId(id);

        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', regCode: '', category: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            {/* Header */}
            <section className="relative pt-32 pb-16 px-6 bg-black/40 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-10 w-64 h-64 bg-emerald-600/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 right-10 w-96 h-96 bg-green-600/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm mb-4">
                        <HelpCircle className="w-4 h-4" />
                        ช่วยเหลือ
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold">ติดต่อเรา</h1>
                    <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                        มีคำถามหรือต้องการความช่วยเหลือ? เราพร้อมให้บริการคุณ
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-6 flex-grow">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Left: Contact Info + Form */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Contact Cards */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-emerald-500/50 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Phone className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="font-bold mb-1">โทรศัพท์</h3>
                                    <p className="text-sm text-gray-400">02-123-4567</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-green-500/50 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Mail className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h3 className="font-bold mb-1">อีเมล</h3>
                                    <p className="text-sm text-gray-400">support@eventflow.th</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-blue-500/50 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="font-bold mb-1">เวลาทำการ</h3>
                                    <p className="text-sm text-gray-400">จ-ศ 9:00-17:00</p>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                                    ส่งข้อความถึงเรา
                                </h2>

                                {submitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Send className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-400 mb-2">ส่งข้อความสำเร็จ!</h3>
                                        <p className="text-gray-400 mb-4">เราจะติดต่อกลับภายใน 24 ชั่วโมง</p>
                                        <div className="bg-black/30 rounded-xl p-4 mb-4 inline-block">
                                            <p className="text-sm text-gray-400 mb-1">หมายเลข Ticket</p>
                                            <p className="text-xl font-mono font-bold text-emerald-400">{ticketId}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">กรุณาเก็บหมายเลขนี้ไว้อ้างอิง</p>
                                        <Button
                                            onClick={() => setSubmitted(false)}
                                            variant="outline"
                                            className="mt-4 border-white/20"
                                        >
                                            ส่งข้อความใหม่
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                                                <Input
                                                    id="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="กรอกชื่อของคุณ"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">อีเมล *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="your@email.com"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">เบอร์โทร (ถ้ามี)</Label>
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="08X-XXX-XXXX"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="regCode">รหัสลงทะเบียน (ถ้ามี)</Label>
                                                <Input
                                                    id="regCode"
                                                    value={formData.regCode}
                                                    onChange={(e) => setFormData({ ...formData, regCode: e.target.value })}
                                                    placeholder="REG-XXXXXX"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">หมวดหมู่ *</Label>
                                            <select
                                                id="category"
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg bg-black/20 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                                            >
                                                <option value="" className="bg-slate-900">-- เลือกหมวดหมู่ --</option>
                                                <option value="registration" className="bg-slate-900">การลงทะเบียน</option>
                                                <option value="payment" className="bg-slate-900">การชำระเงิน</option>
                                                <option value="checkin" className="bg-slate-900">Check-in / QR Code</option>
                                                <option value="cpe" className="bg-slate-900">หน่วยกิต CPE</option>
                                                <option value="other" className="bg-slate-900">อื่นๆ</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">หัวข้อ *</Label>
                                            <Input
                                                id="subject"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="เรื่องที่ต้องการติดต่อ"
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">ข้อความ</Label>
                                            <textarea
                                                id="message"
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="รายละเอียดที่ต้องการสอบถาม..."
                                                rows={5}
                                                className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12"
                                        >
                                            {isSubmitting ? (
                                                <>กำลังส่ง...</>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    ส่งข้อความ
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Right: FAQ */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                                    คำถามที่พบบ่อย
                                </h2>

                                <div className="space-y-4">
                                    {FAQ_ITEMS.map((category) => (
                                        <div key={category.category} className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                                                <category.icon className="w-4 h-4" />
                                                {category.category}
                                            </div>

                                            {category.questions.map((item, idx) => {
                                                const faqId = `${category.category}-${idx}`;
                                                const isOpen = openFaq === faqId;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                                                    >
                                                        <button
                                                            onClick={() => toggleFaq(faqId)}
                                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                                                        >
                                                            <span className="text-sm font-medium pr-4">{item.q}</span>
                                                            {isOpen ? (
                                                                <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            )}
                                                        </button>

                                                        {isOpen && (
                                                            <div className="px-4 pb-4 text-sm text-gray-400 border-t border-white/10 pt-3">
                                                                {item.a}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

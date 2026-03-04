import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#537547] py-16 border-t border-[#537547]/80 text-white">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-mono text-white">Event<span className="text-white/80">Flow</span></h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Discover a world of knowledge and inspiration. Join our events to connect with industry leaders.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link href="/" className="hover:text-white">Home</Link></li>
                            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                            <li><Link href="/events" className="hover:text-white">Events</Link></li>
                            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-white">Legal</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-white">Subscribe</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/10 border border-white/20 rounded px-4 py-2 text-sm w-full text-white placeholder:text-white/50 focus:outline-none focus:border-white/50"
                            />
                            <button className="bg-white text-[#537547] px-4 py-2 rounded text-sm font-semibold hover:bg-white/90">Go</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-white/60">© 2025 EventFlow. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Facebook className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                        <Twitter className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                        <Instagram className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                        <Linkedin className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

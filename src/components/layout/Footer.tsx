import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-black py-16 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-mono">Event<span className="text-emerald-500">Flow</span></h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Discover a world of knowledge and inspiration. Join our events to connect with industry leaders.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-emerald-500">Home</Link></li>
                            <li><Link href="/about" className="hover:text-emerald-500">About Us</Link></li>
                            <li><Link href="/events" className="hover:text-emerald-500">Events</Link></li>
                            <li><Link href="/contact" className="hover:text-emerald-500">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/terms" className="hover:text-emerald-500">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-emerald-500">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Subscribe</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded px-4 py-2 text-sm w-full focus:outline-none focus:border-emerald-500"
                            />
                            <button className="bg-emerald-600 px-4 py-2 rounded text-sm hover:bg-emerald-700">Go</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2025 EventFlow. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

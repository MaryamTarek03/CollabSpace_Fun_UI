import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store';

/**
 * LandingPage - Beautiful intro/hero page for CollabSpace
 * Shows dashboard button for logged users, login/signup for guests
 */
export default function LandingPage() {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#FFFDF5] overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-200 rounded-full opacity-60 animate-pulse" />
                <div className="absolute top-1/4 -left-20 w-60 h-60 bg-accent-300 rounded-full opacity-40 animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-accent-400 rounded-full opacity-50 animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-pink-300 rounded-full opacity-40 animate-bounce" style={{ animationDuration: '4s' }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent border-3 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000] hover-vibrate cursor-pointer">
                        <span className="text-2xl font-black">C</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight">CollabSpace</span>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="px-6 py-3 bg-accent border-3 border-black rounded-xl font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-5 py-2.5 font-bold hover:text-accent-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/login"
                                className="px-6 py-2.5 bg-black text-white border-3 border-black rounded-xl font-bold shadow-[4px_4px_0_0_var(--accent)] hover:shadow-[2px_2px_0_0_var(--accent)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-6 py-16 md:px-12 lg:px-20 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 border-2 border-black rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-bold">Now in Open Beta</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                                Where Teams
                                <span className="block text-accent-500">Come Alive</span>
                            </h1>

                            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                                The all-in-one collaborative workspace that brings your remote team together.
                                <span className="font-semibold text-black"> Chat, share files, and work in real-time</span> —
                                all in one beautiful space.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {isAuthenticated ? (
                                    <Link
                                        to="/dashboard"
                                        className="group px-8 py-4 bg-accent border-3 border-black rounded-2xl font-bold text-lg shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-3"
                                    >
                                        <span>Open Dashboard</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="group px-8 py-4 bg-accent border-3 border-black rounded-2xl font-bold text-lg shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-3"
                                        >
                                            <span>Start Free</span>
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="px-8 py-4 bg-white border-3 border-black rounded-2xl font-bold text-lg shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                                        >
                                            Watch Demo
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {['#3b82f6', '#ec4899', '#10b981', '#f59e0b'].map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full border-3 border-white"
                                            style={{ background: color }}
                                        />
                                    ))}
                                </div>
                                <div>
                                    <div className="font-bold">2,500+ teams</div>
                                    <div className="text-sm text-gray-500">already collaborating</div>
                                </div>
                            </div>
                        </div>

                        {/* Right - App Preview */}
                        <div className="relative">
                            <div className="relative bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0_0_#000] overflow-hidden">
                                {/* Fake App Header */}
                                <div className="flex items-center gap-3 p-4 border-b-3 border-black bg-accent-50">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full border border-black" />
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full border border-black" />
                                        <div className="w-3 h-3 bg-green-400 rounded-full border border-black" />
                                    </div>
                                    <div className="flex-1 h-6 bg-white border-2 border-black rounded-lg" />
                                </div>

                                {/* Fake App Content */}
                                <div className="p-6 space-y-4">
                                    {/* Space Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { name: 'Design Team', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                                            { name: 'Marketing', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                                            { name: 'Engineering', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                                            { name: 'Product', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                                        ].map((space, i) => (
                                            <div
                                                key={i}
                                                className="aspect-video rounded-xl border-3 border-black shadow-[4px_4px_0_0_#000] p-3 flex flex-col justify-end"
                                                style={{ background: space.gradient }}
                                            >
                                                <span className="text-white font-bold text-sm drop-shadow-md">{space.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Fake Chat Preview */}
                                    <div className="bg-gray-50 border-2 border-black rounded-xl p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-400 rounded-full border-2 border-black flex-shrink-0" />
                                            <div className="bg-white border-2 border-black rounded-xl rounded-tl-none px-3 py-2 text-sm">
                                                Hey team! New designs ready 🎨
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 justify-end">
                                            <div className="bg-accent border-2 border-black rounded-xl rounded-tr-none px-3 py-2 text-sm">
                                                Looking great! Let's review it!
                                            </div>
                                            <div className="w-8 h-8 bg-pink-400 rounded-full border-2 border-black flex-shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 bg-accent border-3 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0_0_#000] rotate-6">
                                <span className="font-bold">Real-time</span>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-pink-300 border-3 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0_0_#000] -rotate-6">
                                <span className="font-bold">Free Forever</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20 bg-black text-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
                        Everything Your Team Needs
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '💬',
                                title: 'Real-time Chat',
                                desc: 'Instant messaging with channels, threads, and rich media sharing. Never miss a beat.',
                                color: 'bg-blue-400'
                            },
                            {
                                icon: '📁',
                                title: 'File Sharing',
                                desc: 'Upload, organize, and collaborate on documents with your team in one place.',
                                color: 'bg-green-400'
                            },
                            {
                                icon: '🎮',
                                title: 'Live Sessions',
                                desc: 'Jump into immersive 3D collaboration sessions. Like being in the same room.',
                                color: 'bg-purple-400'
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-white text-black border-4 border-white rounded-2xl p-6 shadow-[8px_8px_0_0_var(--accent)] hover:shadow-[4px_4px_0_0_var(--accent)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-default"
                            >
                                <div className={`w-16 h-16 ${feature.color} border-3 border-black rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 px-6 py-16 md:px-12 lg:px-20 bg-accent-100 border-y-4 border-black">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: '2,500+', label: 'Active Teams', icon: '👥' },
                            { number: '50K+', label: 'Messages/Day', icon: '💬' },
                            { number: '99.9%', label: 'Uptime', icon: '⚡' },
                            { number: '4.9/5', label: 'User Rating', icon: '⭐' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <div className="text-4xl md:text-5xl font-black">{stat.number}</div>
                                <div className="text-sm font-bold text-gray-600 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Get Started in Minutes
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            No complex setup. No learning curve. Just collaboration that works.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-black" style={{ zIndex: 0 }} />

                        {[
                            {
                                step: '1',
                                title: 'Create Your Space',
                                desc: 'Sign up in seconds and create your first collaborative workspace. Customize it to match your team\'s style.',
                                icon: '🏠'
                            },
                            {
                                step: '2',
                                title: 'Invite Your Team',
                                desc: 'Share a link or send email invites. Your team can join instantly with no app downloads required.',
                                icon: '✉️'
                            },
                            {
                                step: '3',
                                title: 'Start Collaborating',
                                desc: 'Chat, share files, and jump into live sessions. Everything is real-time and beautifully simple.',
                                icon: '🚀'
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-accent border-4 border-black rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-[4px_4px_0_0_#000]">
                                    {item.icon}
                                </div>
                                <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0_0_#000]">
                                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* More Features Grid */}
            <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20 bg-gray-50 border-y-4 border-black">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Packed with Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to collaborate effectively
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '🔔', title: 'Smart Notifications', desc: 'Get notified about what matters. Mute the rest.' },
                            { icon: '🔍', title: 'Powerful Search', desc: 'Find any message, file, or conversation instantly.' },
                            { icon: '📱', title: 'Mobile Ready', desc: 'Access your workspace from any device, anywhere.' },
                            { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 compliant with end-to-end encryption.' },
                            { icon: '🎨', title: 'Custom Themes', desc: 'Personalize your workspace with beautiful themes.' },
                            { icon: '🔗', title: 'Integrations', desc: 'Connect with tools you already use and love.' },
                            { icon: '👑', title: 'Role-Based Access', desc: 'Control who sees what with granular permissions.' },
                            { icon: '📊', title: 'Analytics', desc: 'Track engagement and team activity insights.' },
                            { icon: '⚡', title: 'Blazing Fast', desc: 'Built for speed with real-time sync everywhere.' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                                <div>
                                    <h3 className="font-bold mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Loved by Teams Worldwide
                        </h2>
                        <p className="text-xl text-gray-600">
                            Don't just take our word for it
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "CollabSpace transformed how our remote team works together. The 3D sessions feel like we're in the same room!",
                                author: 'Sarah Chen',
                                role: 'Head of Design, TechFlow',
                                avatar: '#3b82f6'
                            },
                            {
                                quote: "Finally, a collaboration tool that doesn't feel like work. Our team actually enjoys using it every day.",
                                author: 'Marcus Rodriguez',
                                role: 'CEO, StartupXYZ',
                                avatar: '#10b981'
                            },
                            {
                                quote: "The file sharing and real-time chat integration is seamless. Best tool we've adopted this year.",
                                author: 'Emily Watson',
                                role: 'Product Manager, CreativeHub',
                                avatar: '#ec4899'
                            },
                        ].map((testimonial, i) => (
                            <div
                                key={i}
                                className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0_0_var(--accent)]"
                            >
                                <div className="text-4xl mb-4">"</div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    {testimonial.quote}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full border-3 border-black flex items-center justify-center text-white font-bold"
                                        style={{ background: testimonial.avatar }}
                                    >
                                        {testimonial.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold">{testimonial.author}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20 bg-accent-50 border-y-4 border-black">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'Is CollabSpace really free?',
                                a: 'Yes! Our core features are completely free forever. We offer premium plans for larger teams who need advanced features.'
                            },
                            {
                                q: 'How many team members can I add?',
                                a: 'Free teams can have up to 10 members. Premium plans support unlimited team members.'
                            },
                            {
                                q: 'Is my data secure?',
                                a: 'Absolutely. We use enterprise-grade encryption and are SOC 2 compliant. Your data is always safe with us.'
                            },
                            {
                                q: 'Can I use CollabSpace on mobile?',
                                a: 'Yes! CollabSpace works beautifully on any device with a modern web browser. Native apps coming soon.'
                            },
                            {
                                q: 'What are Live Sessions?',
                                a: 'Live Sessions are immersive 3D collaboration spaces where your team can work together as if you\'re in the same room.'
                            },
                        ].map((faq, i) => (
                            <div
                                key={i}
                                className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000]"
                            >
                                <div className="p-5 font-bold text-lg flex items-center justify-between">
                                    <span>{faq.q}</span>
                                    <span className="text-2xl">+</span>
                                </div>
                                <div className="px-5 pb-5 pt-0 text-gray-600 border-t border-gray-100">
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-6 py-24 md:px-12 lg:px-20 bg-black text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent border-2 border-accent rounded-full text-black mb-8">
                        <span className="font-bold">🎉 Join 2,500+ teams today</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6">
                        Ready to Transform Your Team?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of teams already collaborating smarter.
                        Set up your workspace in minutes, not hours.
                    </p>

                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-accent border-4 border-accent text-black rounded-2xl font-bold text-xl shadow-[8px_8px_0_0_rgba(255,255,255,0.3)] hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                        >
                            <span>Go to Your Dashboard</span>
                            <span className="text-2xl">→</span>
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-accent border-4 border-accent text-black rounded-2xl font-bold text-xl shadow-[8px_8px_0_0_rgba(255,255,255,0.3)] hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                            >
                                <span>Get Started Free</span>
                                <span className="text-2xl">✨</span>
                            </Link>
                        </div>
                    )}

                    {/* Trust badges */}
                    <div className="flex flex-wrap justify-center gap-8 mt-12 opacity-60">
                        <div className="font-bold">🔒 SOC 2 Compliant</div>
                        <div className="font-bold">🌍 GDPR Ready</div>
                        <div className="font-bold">⚡ 99.9% Uptime</div>
                        <div className="font-bold">💳 No Credit Card Required</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-8 md:px-12 lg:px-20 border-t-3 border-black">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent border-2 border-black rounded-lg flex items-center justify-center">
                            <span className="text-lg font-black">C</span>
                        </div>
                        <span className="font-bold">CollabSpace © 2025</span>
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                        <a href="#" className="hover:text-accent-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-accent-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-accent-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

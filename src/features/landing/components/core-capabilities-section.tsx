import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BrainCircuit, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CapabilityCard = ({
    title,
    description,
    icon: Icon,
    features,
    delay,
    gradient
}: {
    title: string;
    description: string;
    icon: any;
    features: string[];
    delay: number;
    gradient: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay }}
            className="group relative h-full"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />

            <div className="relative h-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col">
                {/* Icon Header */}
                <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-7 h-7 ${gradient.split(' ')[0].replace('from-', 'text-')}`} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">{description}</p>

                {/* Features List */}
                <div className="space-y-4 mt-auto">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${gradient.split(' ')[0].replace('from-', 'text-')} opacity-80`} />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Hover accent line */}
                <div className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full`} />
            </div>
        </motion.div>
    );
};

export const CoreCapabilitiesSection = () => {
    const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation();

    return (
        <section className="py-32 relative overflow-hidden bg-slate-50/50">
            {/* Background Ambience - reduced motion */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none motion-safe:block motion-reduce:hidden">
                <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl mix-blend-multiply" />
                <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl mix-blend-multiply" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <div
                    ref={headerRef}
                    className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-800 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >

                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Three pillars that close the <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            churn loop
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                        PulseLTV isn't a CRM, CDP, or marketing suite. It's a focused decision platform that turns churn signals into measurable revenue outcomes.
                    </p>
                </div>

                {/* 3 Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">

                    {/* Pillar 1: Unified Churn Signal */}
                    <CapabilityCard
                        title="Unified Churn Signal"
                        description="Combine signals from payments, support, and engagement into one clear risk score, with the reason behind every change."
                        icon={Activity}
                        delay={0.1}
                        gradient="from-sky-500 to-blue-600"
                        features={[
                            "Pulls data from Stripe, HubSpot, Intercom, and more",
                            "One risk score per customer, updated in real-time",
                            "Explains exactly why risk changed",
                            "Works with just one integration to start"
                        ]}
                    />

                    {/* Pillar 2: Decision Engine */}
                    <CapabilityCard
                        title="Playbook Engine"
                        description="Stop guessing what to do. Pre-built and custom playbooks map each churn reason to the right intervention, driven by rules and models you can inspect."
                        icon={BrainCircuit}
                        delay={0.2}
                        gradient="from-indigo-500 to-purple-600"
                        features={[
                            "Segments customers by root cause of churn",
                            "Pre-built playbooks for common scenarios",
                            "Custom rules you can configure and audit",
                            "Transparent logic with no black-box decisions"
                        ]}
                    />

                    {/* Pillar 3: Execution */}
                    <CapabilityCard
                        title="Execute & Measure"
                        description="Actions trigger through your existing tools, not a separate email system. Track revenue saved, not just 'churn reduced'."
                        icon={Zap}
                        delay={0.3}
                        gradient="from-emerald-500 to-teal-600"
                        features={[
                            "Payment retries via Stripe",
                            "Outreach via HubSpot, Intercom, or Slack",
                            "Alerts & handoffs to your CS team",
                            "Revenue saved dashboard with attribution"
                        ]}
                    />

                </div>
            </div>
        </section>
    );
};

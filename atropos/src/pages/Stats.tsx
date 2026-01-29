import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { calculateAge } from '../utils/ageCalculator';
import { Heatmap } from '../components/Heatmap';
import { AppUsageChart } from '../components/AppUsageChart';
import { FlowChart } from '../components/FlowChart';
import { motion } from 'framer-motion';
import { revealVariants } from '../utils/animations';
import dayjs from 'dayjs';

export const Stats = () => {
    const user = useAppStore((state) => state.user);
    const telemetry = useAppStore((state) => state.telemetry);
    const [, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!window.electronAPI?.onDataChange) return;
        const cleanup = window.electronAPI.onDataChange(() => {
            setRefreshKey((k) => k + 1);
            useAppStore.getState().loadData();
        });
        return cleanup;
    }, []);

    // --- REAL DATA CALC ---
    const appUsageData = useState(() => {
        if (!telemetry?.events) return [];
        const usageMap = new Map<string, number>();
        const sessionEnd = dayjs();
        let lastEventTime = dayjs(telemetry.events[0]?.ts);
        let lastApp = telemetry.events[0]?.title || 'Unknown';

        telemetry.events.forEach((evt) => {
            const currentTime = dayjs(evt.ts);
            const durationSeconds = currentTime.diff(lastEventTime, 'second');
            if (durationSeconds > 0) usageMap.set(lastApp, (usageMap.get(lastApp) || 0) + durationSeconds);
            lastEventTime = currentTime;
            if (evt.type === 'focus_change' && evt.title) lastApp = evt.title;
        });

        const finalDuration = sessionEnd.diff(lastEventTime, 'second');
        if (finalDuration > 0) usageMap.set(lastApp, (usageMap.get(lastApp) || 0) + finalDuration);

        return Array.from(usageMap, ([name, seconds]) => ({ name, usage: Math.round(seconds / 60) }))
            .sort((a, b) => b.usage - a.usage).slice(0, 6);
    })[0];

    const activityData = useState(() => {
        if (!telemetry?.events) return [];
        const buckets = new Map<number, number>();
        telemetry.events.forEach(evt => {
            const hour = dayjs(evt.ts).hour();
            buckets.set(hour, (buckets.get(hour) || 0) + 1);
        });
        const data = [];
        for (let i = 0; i < 24; i++) data.push({ time: `${i}:00`, flow: (buckets.get(i) || 0) * 10 });
        return data;
    })[0];

    const interestList = user?.interests.split(',').map(i => i.trim()) || [];

    return (
        <div className="w-full h-full flex bg-[var(--bg-current)] overflow-hidden">

            {/* Left Bar - Fixed Layout & Better Fonts */}
            <motion.aside
                className="w-80 md:w-96 h-full border-r border-current/10 p-8 md:p-12 flex flex-col justify-between relative z-10 hidden md:flex flex-shrink-0"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            >
                <div className="relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full border border-current/20 flex items-center justify-center mb-10 text-5xl font-heading bg-[var(--text-current)] text-[var(--bg-current)]">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>

                    <h1 className="font-heading text-5xl md:text-6xl mb-8 tracking-tighter text-[var(--text-current)] leading-none py-1">
                        {user?.name}
                    </h1>

                    <div className="space-y-6 font-mono text-xs md:text-sm uppercase tracking-widest opacity-60 mb-12 text-[var(--text-current)]">
                        <div className="flex justify-between border-b border-current/20 pb-3">
                            <span>Age</span>
                            <span className="font-bold opacity-100 text-lg">{calculateAge(user?.dob || '')}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="opacity-50">Designation</span>
                            {/* Fix for Long Text */}
                            <span className="font-bold opacity-100 text-lg break-words leading-tight w-full text-ellipsis overflow-hidden">
                                {user?.profession}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-mono text-xs uppercase tracking-[0.3em] opacity-40">Core Interests</h4>
                        <div className="flex flex-wrap gap-2">
                            {interestList.map((interest, idx) => (
                                <span key={idx} className="px-3 py-1 border border-current/20 text-sm font-serif italic rounded-full opacity-60">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="font-serif italic text-lg opacity-40 leading-relaxed">
                    "Data is the paint, time is the canvas."
                </div>
            </motion.aside>

            {/* Right Content - Spacing Fixes */}
            <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-8 md:p-16">
                <div>
                    <motion.div
                        className="max-w-5xl mx-auto space-y-16 pb-20"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Header - Increased Gap */}
                        <motion.header variants={revealVariants}>
                            <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-40 block mb-8">
                                Live Telemetry
                            </span>
                            <h2 className="font-heading text-6xl md:text-7xl mb-4 tracking-tight text-[var(--text-current)] leading-none py-2">
                                Quantified Self
                            </h2>

                        </motion.header>

                        {/* Heatmap - Larger Fonts */}
                        <motion.section variants={revealVariants}>

                            <div className="h-80 w-full">
                                <Heatmap />
                            </div>
                        </motion.section>

                        {/* Charts Grid */}
                        <section className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                            {/* REAL APP USAGE */}
                            <motion.div variants={revealVariants}>
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="font-heading text-2xl opacity-80">Application Usage</h3>
                                    <div className="h-[1px] flex-1 bg-current/10 ml-4" />
                                </div>
                                <div className="opacity-80 hover:opacity-100 transition-opacity duration-300 h-64">
                                    {appUsageData.length > 0 ? (
                                        <AppUsageChart data={appUsageData} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-30 font-serif italic">
                                            No usage data available yet.
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* REAL ACTIVITY CHART */}
                            <motion.div variants={revealVariants}>
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="font-heading text-2xl opacity-80">Activity Intensity</h3>
                                    <div className="h-[1px] flex-1 bg-current/10 ml-4" />
                                </div>
                                <div className="opacity-80 hover:opacity-100 transition-opacity duration-300 h-64">
                                    <FlowChart data={activityData} />
                                </div>
                            </motion.div>
                        </section>
                    </motion.div>

                    <div className="h-32" />
                </div>
            </main>
        </div>
    );
};
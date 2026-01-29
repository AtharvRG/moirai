import { useEffect } from 'react';
import { useAppStore, getGreeting } from '../store/useAppStore';
import { Heatmap } from '../components/Heatmap';
import { InsightCard } from '../components/InsightCard';
import { motion } from 'framer-motion';
import { revealVariants } from '../utils/animations';

export const Home = () => {
    const { user, telemetry, loadData } = useAppStore();
    const greeting = getGreeting();
    useEffect(() => { loadData(); }, [loadData]);
    const displayName = user?.name || 'Traveler';

    const flowScore = telemetry?.metrics?.flow_score_estimate || 0;
    const keystrokes = telemetry?.metrics?.total_keystrokes || 0;
    const mouseDist = telemetry?.metrics?.total_mouse_dist_pixels || 0;

    return (
        <div className="w-full h-full flex flex-col p-6 md:p-12 lg:p-16 relative">

            {/* Header - Spacing Fixes */}
            <motion.header className="flex-none pb-8" variants={revealVariants} initial="hidden" animate="visible">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        {/* Safe padding for Font Clipping */}
                        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-tighter text-[var(--text-current)] leading-[1.1] pt-4 pb-2">
                            {greeting}, <span className="italic opacity-50">{displayName}.</span>
                        </h1>
                    </div>
                    <div className="max-w-md border-l border-[var(--accent-current)] pl-6 md:pl-8 min-w-0">
                        <p className="font-body text-base md:text-lg leading-relaxed opacity-70">
                            Analysis from <span className="font-mono">{telemetry?.meta?.date || 'Today'}</span> The system has compiled your digital residue.
                        </p>
                    </div>
                </div>
            </motion.header>

            {/* Main Grid - Fixed Heights */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: 2 Fixed Height Cards - Scrollable Container */}
                <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
                    <motion.div variants={revealVariants} className="shrink-0 h-1/2 min-h-[300px]">
                        <InsightCard title="Current Flow Score">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="font-heading text-6xl text-[var(--accent-current)] leading-none py-2">{Math.round(flowScore)}</span>
                                <span className="font-mono text-sm opacity-50">/ 100</span>
                            </div>
                            <p className="font-body text-base leading-relaxed opacity-80">
                                {flowScore > 70 ? "Deep work detected." : flowScore > 40 ? "Moderate focus." : "Fragmented attention."}
                            </p>
                        </InsightCard>
                    </motion.div>

                    <motion.div variants={revealVariants} className="shrink-0 h-1/2 min-h-[300px]">
                        <InsightCard title="Input Velocity" accent>
                            <div className="grid grid-cols-2 gap-6 mt-4">
                                <div>
                                    <span className="block font-mono text-xs uppercase tracking-widest opacity-50">Keystrokes</span>
                                    <span className="block font-heading text-3xl">{keystrokes}</span>
                                </div>
                                <div>
                                    <span className="block font-mono text-xs uppercase tracking-widest opacity-50">Mouse</span>
                                    <span className="block font-heading text-3xl">{(mouseDist / 1000).toFixed(1)}k</span>
                                </div>
                            </div>
                        </InsightCard>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Heatmap - Takes Remaining Height */}
                <motion.div className="lg:col-span-8 flex flex-col bg-current/[0.02] border border-current/5 p-6 rounded-sm" variants={revealVariants}>
                    <div className="w-full h-full flex flex-col min-h-0">
                        <div className="flex-1 overflow-hidden relative">
                            <Heatmap />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer - Fixed Bottom */}
            <motion.div className="flex-none flex items-center justify-between opacity-40 pt-8 border-t border-current/5 mt-4" variants={revealVariants}>
                <span className="font-mono text-sm uppercase tracking-widest">Moirai v0.0.1 Beta</span>
                <span className="font-heading text-2xl italic opacity-100">"Weft and Warp"</span>
            </motion.div>
        </div>
    );
};
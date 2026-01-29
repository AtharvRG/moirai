import type { ReactNode } from 'react';

interface InsightCardProps {
    title: string;
    children: ReactNode;
    accent?: boolean;
}

export const InsightCard = ({ title, children, accent = false }: InsightCardProps) => {
    return (
        <div className={`
      relative p-10 border transition-all duration-500 ease-out group overflow-hidden reveal-up
      ${accent
                ? 'border-[var(--accent-current)] bg-[var(--accent-current)]/5'
                : 'border-current/20 hover:border-current/40 hover:bg-current/[0.02]'}
    `}>
            {/* Hover Accent Line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-[var(--accent-current)] transform -translate-x-full transition-transform duration-500 var(--ease-out-expo) group-hover:translate-x-0`} />

            <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] mb-6 opacity-60">
                {title}
            </h4>

            <div className="font-body text-lg leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                {children}
            </div>
        </div>
    );
};
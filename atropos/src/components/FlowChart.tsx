import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FlowData {
    time: string;
    flow: number;
}

interface Props {
    data: FlowData[];
}

export const FlowChart = ({ data }: Props) => {
    return (
        <div className="w-full h-full min-h-[250px] transition-opacity duration-700 reveal-up" style={{ animationDelay: '0.1s' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-current)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent-current)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="time"
                        stroke="var(--text-current)"
                        tick={{ fill: 'var(--text-current)', fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.6 }}
                        tickLine={false}
                        axisLine={false}
                        interval={2}
                    />
                    <YAxis
                        stroke="var(--text-current)"
                        tick={{ fill: 'var(--text-current)', fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.6 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-current)',
                            borderColor: 'var(--accent-current)',
                            borderRadius: '2px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: 'var(--accent-current)' }}
                        formatter={(value: number) => [Math.round(value), 'Flow Score']}
                    />
                    <Area
                        type="monotone"
                        dataKey="flow"
                        stroke="var(--accent-current)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorFlow)"
                        animationDuration={2000}
                        animationEasing="var(--ease-out-expo)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
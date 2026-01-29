import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AppUsage {
    name: string;
    usage: number;
}

interface Props {
    data: AppUsage[];
}

const truncateString = (str: string, num: number) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
};

export const AppUsageChart = ({ data }: Props) => {
    return (
        <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 60 }}>
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-current)"
                        tick={{
                            fill: 'var(--text-current)',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            textAnchor: 'end',
                            dy: 20
                        }}
                        tickFormatter={(value: string) => truncateString(value, 15)}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-current)',
                            borderColor: 'var(--text-current)',
                            borderRadius: '2px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                        }}
                        itemStyle={{ color: 'var(--text-current)' }}
                        formatter={(value: any, _name: any) => [`${value} min`, 'Duration']}
                        labelFormatter={(label: any) => label}
                    />
                    <Bar dataKey="usage" radius={[2, 2, 0, 0]} animationDuration={1500}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill="var(--text-current)" opacity={0.4 + (index / data.length) * 0.6} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';


type HeatmapMode = 'flow' | 'tasks' | 'time';

interface HeatmapProps {
    mode?: HeatmapMode;
    year?: number;
}

export const Heatmap = ({ mode = 'flow', year }: HeatmapProps) => {
    const [currentMode, setCurrentMode] = useState<HeatmapMode>(mode);
    const [currentYear, setCurrentYear] = useState(year || dayjs().year());
    const [calendarData, setCalendarData] = useState<Array<{ date: string; flow: number; keystrokes: number }>>([]);

    useEffect(() => {
        if (window.electronAPI?.getCalendarData) {
            window.electronAPI.getCalendarData().then((data) => {
                setCalendarData(data);
            });
        }
    }, []);

    const data = useMemo(() => {
        const days: any[] = [];
        const today = dayjs();
        const targetYear = currentYear;
        const startDate = dayjs().year(targetYear).startOf('year');
        const endDate = targetYear === today.year() ? today : dayjs().year(targetYear).endOf('year');
        let currentDate = startDate;

        const dataMap = new Map(calendarData.map(d => [d.date, d]));

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const dayData = dataMap.get(dateStr);

            let level = 0;
            if (dayData) {
                const val = dayData.flow;
                if (val > 0) level = 1;
                if (val > 30) level = 2;
                if (val > 60) level = 3;
                if (val > 80) level = 4;
            }

            const isFuture = currentDate.isAfter(today, 'day');

            days.push({
                date: dateStr,
                level,
                actualFlow: dayData?.flow || 0,
                actualKeys: dayData?.keystrokes || 0,
                isFuture
            });
            currentDate = currentDate.add(1, 'day');
        }
        return days;
    }, [currentMode, currentYear, calendarData]);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="w-full">
                <div className="flex justify-between items-end mb-8 pb-4 border-b border-current/20">
                    <h3 className="font-heading text-3xl tracking-tight text-[var(--text-current)] pt-2">
                        Contribution Graph
                    </h3>

                    <div className="flex gap-8 items-center">
                        <select
                            value={currentYear}
                            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                            className="appearance-none bg-transparent font-mono text-xs uppercase tracking-widest border-b border-current/20 cursor-pointer focus:outline-none focus:border-[var(--accent-current)] py-2 hover:opacity-100 opacity-60 transition-all"
                            style={{ color: 'var(--text-current)' }}
                        >
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>

                        <select
                            value={currentMode}
                            onChange={(e) => setCurrentMode(e.target.value as HeatmapMode)}
                            className="appearance-none bg-transparent font-mono text-xs uppercase tracking-widest border-b border-current/20 cursor-pointer focus:outline-none focus:border-[var(--accent-current)] py-2 hover:opacity-100 opacity-60 transition-all"
                            style={{ color: 'var(--text-current)' }}
                        >
                            <option value="flow">Flow State</option>
                            <option value="tasks">Tasks</option>
                            <option value="time">Time</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto pb-6 scrollbar-none">
                    <div
                        className="grid gap-[4px]"
                        style={{
                            gridTemplateRows: 'repeat(7, 14px)',
                            gridAutoFlow: 'column',
                            width: 'max-content'
                        }}
                    >
                        {data.map((day: any, index: number) => {
                            let bgClass = '';
                            if (day.isFuture) bgClass = 'bg-current opacity-5';
                            else if (day.level === 0) bgClass = 'bg-current opacity-10';
                            else if (day.level === 4) bgClass = 'bg-[var(--accent-current)]';
                            else bgClass = `bg-[var(--text-current)] opacity-${day.level * 20 + 20}`;

                            return (
                                <div
                                    key={index}
                                    className={`w-3 h-3.5 rounded-[1px] transition-all duration-300 ${bgClass} hover:opacity-100 hover:scale-125 hover:z-10 relative group`}
                                >
                                    {day.level > 0 && !day.isFuture && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--bg-current)] text-[var(--text-current)] text-[10px] font-mono border border-current shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                            <div className="font-bold">{day.date}</div>
                                            <div className="opacity-70">Flow: {Math.round(day.actualFlow)}</div>
                                            <div className="opacity-70">Keys: {day.actualKeys}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
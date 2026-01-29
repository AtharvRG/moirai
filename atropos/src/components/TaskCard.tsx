import type { Task } from '../store/useTaskStore';
import { useState } from 'react';

interface Props {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }: Props) => {
    const [isDragging, setIsDragging] = useState(false);

    // Calculate Progress
    const totalSub = task.subtasks?.length || 0;
    const completedSub = task.subtasks?.filter(s => s.completed).length || 0;
    const progress = totalSub === 0 ? 0 : (completedSub / totalSub) * 100;

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const priorityColors = {
        Low: 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5',
        Medium: 'border-amber-500/30 text-amber-600 bg-amber-500/5',
        High: 'border-[var(--accent-current)]/30 text-[var(--accent-current)] bg-[var(--accent-current)]/5'
    };

    const pColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.Medium;

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onEdit(task)}
            className={`
        group relative p-6 mb-4 bg-[var(--bg-current)] border border-current/10 
        transition-all duration-500 ease-out hover:border-current/30 hover:shadow-xl hover:-translate-y-1
        cursor-move overflow-hidden
        ${task.completed ? 'opacity-50 grayscale' : ''}
        ${isDragging ? 'opacity-40 scale-95 rotate-2' : ''}
      `}
        >
            {/* Hover Lift Effect */}
            <div className={`absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-current/[0.02] pointer-events-none`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h4 className={`font-heading text-xl leading-snug transition-all duration-300 ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                    </h4>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${pColor}`}>
                        {task.priority}
                    </span>
                </div>

                {task.description && (
                    <p className="font-body text-sm opacity-60 mb-5 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Progress Bar */}
                {totalSub > 0 && (
                    <div className="mb-5">
                        <div className="w-full h-[2px] bg-current/10 overflow-hidden relative">
                            <div
                                className="h-full bg-[var(--accent-current)] transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-right font-mono text-[9px] mt-1.5 opacity-50 tracking-wider">
                            {completedSub}/{totalSub} CHECKPOINTS
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                        className="font-mono text-[10px] uppercase tracking-widest hover:text-[var(--accent-current)] transition-colors flex items-center gap-2"
                    >
                        {task.completed ? (
                            <>
                                <span className="text-lg">↺</span> Reopen
                            </>
                        ) : (
                            <>
                                <span className="text-lg">✓</span> Complete
                            </>
                        )}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="font-mono text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
import type { Group, Task } from '../store/useTaskStore';
import { TaskCard } from './TaskCard';
import { useState } from 'react';

interface Props {
    group: Group;
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onMoveTask: (taskId: string, groupId: string) => void;
}

export const TaskColumn = ({ group, tasks, onEditTask, onDeleteTask, onToggleComplete, onMoveTask }: Props) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onMoveTask(taskId, group.id);
        }
    };

    // Sort tasks alphabetically
    const sortedTasks = [...tasks].sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        flex-shrink-0 w-[24rem] border-r border-current/10 p-6 flex flex-col transition-all duration-500
        ${isOver ? 'bg-[var(--accent-current)]/5' : 'bg-transparent'}
      `}
            style={{ height: 'calc(100vh - 80px)' }} // Fixed height minus header approx
        >
            {/* Sticky Header - Fixed Truncation & Clipping */}
            <div className="pb-6 border-b border-current/10 mb-6 flex justify-between items-end sticky top-0 bg-[var(--bg-current)] z-20 transition-colors duration-500">
                {/* Added truncate, pr-2, and prevent overflow */}
                <h3 className="font-heading text-3xl text-[var(--text-current)] tracking-tight truncate w-full pr-2 leading-tight py-1">
                    {group.name}
                </h3>
                <span className="font-mono text-xs opacity-40 mb-1 tracking-widest shrink-0">
                    {tasks.length} CHRONICLES
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-4">
                {sortedTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onToggleComplete={onToggleComplete}
                    />
                ))}

                {tasks.length === 0 && (
                    <div className="h-40 border-2 border-dashed border-current/10 rounded-lg flex items-center justify-center opacity-30 group">
                        <span className="font-body italic text-sm group-hover:text-[var(--accent-current)] transition-colors">
                            Drop chronicle here
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
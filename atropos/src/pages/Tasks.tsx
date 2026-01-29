import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../store/useTaskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_EDITORIAL } from '../utils/animations';
import { TaskModal } from '../components/TaskModal';

export const Tasks = () => {
    const { groups, tasks, loadTasks, addGroup, deleteGroup, deleteTask } = useTaskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => { loadTasks(); }, [loadTasks]);

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('Delete group? Tasks move to General.')) return;
        try {
            deleteGroup(id);
        } catch (e) { console.error(e); }
    };

    const handleAddGroup = () => {
        if (!newGroupName.trim()) return;
        try {
            addGroup(newGroupName);
            setNewGroupName('');
        } catch (e) { console.error(e); }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDeleteTask = (id: string) => {
        if (confirm('Delete chronicle?')) deleteTask(id);
    };



    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-current)] overflow-hidden">

            {/* Header - Fixed Top */}
            <div className="flex-none px-8 py-6 border-b border-current/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-[var(--bg-current)] z-20 shrink-0">
                <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 block mb-2">
                        Chronicles
                    </span>
                    <h1 className="font-heading text-5xl md:text-6xl tracking-tight leading-none text-[var(--text-current)] py-1">
                        The Board
                    </h1>
                </div>

                <button
                    onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
                    className="shrink-0 px-8 py-4 border border-current/20 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--text-current)] hover:text-[var(--bg-current)] transition-all duration-300 relative overflow-hidden"
                >
                    <span className="relative z-10">+ New Chronicle</span>
                </button>
            </div>

            {/* Kanban Board - Scrollable Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 min-h-0">
                <div className="flex h-full gap-8 min-w-max">

                    <AnimatePresence mode="popLayout">
                        {groups.map((group, index) => (
                            <motion.div
                                key={group.id}
                                className="relative group/col h-full w-[320px] max-w-sm flex-shrink-0 flex flex-col"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: index * 0.05 }}
                            >
                                {/* Column Header */}
                                <div className="pb-6 mb-6 flex justify-between items-start shrink-0 border-b border-current/10">
                                    <h3 className="font-heading text-2xl text-[var(--text-current)] tracking-tight leading-tight py-1 truncate pr-2">
                                        {group.name}
                                    </h3>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="font-mono text-[10px] opacity-40 tracking-widest">
                                            {tasks.filter(t => t.groupId === group.id).length} ITEMS
                                        </span>
                                        {group.id !== 'general' && (
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="text-[10px] opacity-0 group-hover/col:opacity-50 hover:text-red-500 transition-all font-mono uppercase tracking-wider"
                                            >
                                                Del
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tasks List */}
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-4">
                                    {tasks
                                        .filter(t => t.groupId === group.id)
                                        .sort((a, b) => a.title.localeCompare(b.title))
                                        .map((task) => (
                                            <div
                                                key={task.id}
                                                onClick={() => handleEditTask(task)}
                                                className="p-4 border border-current/10 bg-[var(--bg-current)] hover:border-current/30 hover:shadow-lg cursor-pointer transition-all group/item rounded-sm"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`font-heading text-base leading-tight ${task.completed ? 'line-through opacity-50' : ''}`}>
                                                        {task.title}
                                                    </h4>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="opacity-0 group-hover/item:opacity-50 text-xs font-mono">✕</button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-current/10 rounded-sm">
                                                        {task.priority}
                                                    </span>
                                                    {task.subtasks.length > 0 && (
                                                        <span className="font-mono text-[9px] opacity-50">
                                                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add Group Column */}
                    <div className="flex-shrink-0 w-[320px] border border-dashed border-current/10 p-6 flex flex-col justify-center items-center opacity-40 hover:opacity-100 transition-all h-full">
                        <input
                            type="text"
                            placeholder="New Collection..."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddGroup(); }}
                            className="bg-transparent text-center font-heading text-2xl focus:outline-none w-full border-b border-transparent focus:border-current/50 placeholder:opacity-30 placeholder:italic transition-colors pb-2 leading-tight"
                            style={{ color: 'var(--text-current)' }}
                        />
                        <p className="font-mono text-[10px] uppercase tracking-widest mt-4 opacity-50">Press Enter</p>
                    </div>

                    <div className="w-8 flex-shrink-0" /> {/* Spacer */}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editTask={editingTask} />
                )}
            </AnimatePresence>
        </div>
    );
};
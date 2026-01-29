import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task, Subtask } from '../store/useTaskStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editTask?: Task | null;
}

export const TaskModal = ({ isOpen, onClose, editTask }: Props) => {
    const { addTask, updateTask } = useTaskStore();

    const [formData, setFormData] = useState({
        title: editTask?.title || '',
        description: editTask?.description || '',
        startDate: editTask?.startDate || '',
        dueDate: editTask?.dueDate || '',
        priority: (editTask?.priority || 'Medium') as Task['priority'],
        groupId: editTask?.groupId || 'general',
        subtasks: (editTask?.subtasks || []) as Subtask[],
        completed: editTask?.completed || false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editTask) {
            updateTask(editTask.id, formData);
        } else {
            addTask({ ...formData, completed: false });
        }
        onClose();
    };

    const addSubtask = () => {
        setFormData({
            ...formData,
            subtasks: [...formData.subtasks, { id: crypto.randomUUID(), title: '', completed: false }]
        });
    };

    const removeSubtask = (id: string) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks.filter(s => s.id !== id)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

            {/* Modal Content - Scrollable Inner */}
            <div className="relative w-full max-w-2xl bg-[var(--bg-current)] shadow-2xl border border-current/10 flex flex-col max-h-[90vh] overflow-hidden rounded-sm">

                {/* Fixed Header */}
                <div className="p-8 border-b border-current/10 flex justify-between items-center bg-[var(--bg-current)] shrink-0">
                    <h2 className="font-heading text-4xl tracking-tight text-[var(--text-current)]">
                        {editTask ? 'Edit Chronicle' : 'New Chronicle'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="font-mono text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Close
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Inputs ... */}
                        <div className="group">
                            <label className="block font-mono text-xs uppercase tracking-widest mb-3 opacity-50">Title</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-transparent border-b border-current/20 py-3 font-heading text-3xl focus:outline-none focus:border-[var(--accent-current)] transition-colors placeholder:opacity-20 leading-tight"
                                placeholder="What must be done?"
                                style={{ color: 'var(--text-current)' }}
                                autoFocus
                            />
                        </div>

                        <div className="group">
                            <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">
                                Narrative Details
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-transparent border-b border-current/20 py-2 font-body text-xl focus:outline-none focus:border-[var(--accent-current)] min-h-[120px] resize-none leading-relaxed transition-colors placeholder:opacity-20"
                                placeholder="Add context..."
                                style={{ color: 'var(--text-current)' }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-12">
                            <div className="group">
                                <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full bg-transparent border-b border-current/20 py-2 font-mono text-sm focus:outline-none focus:border-[var(--accent-current)] transition-colors"
                                    style={{ color: 'var(--text-current)' }}
                                />
                            </div>
                            <div className="group">
                                <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">
                                    Due Date
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full bg-transparent border-b border-current/20 py-2 font-mono text-sm focus:outline-none focus:border-[var(--accent-current)] transition-colors"
                                    style={{ color: 'var(--text-current)' }}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block font-mono text-[10px] uppercase tracking-widest mb-4 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">
                                Priority Level
                            </label>
                            <div className="flex gap-4">
                                {(['Low', 'Medium', 'High'] as const).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border transition-all duration-300 ${formData.priority === p
                                            ? 'bg-[var(--text-current)] text-[var(--bg-current)] border-[var(--text-current)]'
                                            : 'border-current/20 hover:border-current/50'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex justify-between items-center mb-6">
                                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">
                                    Subtasks / Checkpoints
                                </label>
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    className="text-[10px] font-mono tracking-widest uppercase hover:text-[var(--accent-current)] transition-colors"
                                >
                                    + Add Step
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.subtasks.map((st, idx) => (
                                    <div key={st.id} className="flex items-center gap-4 group/item">
                                        <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={e => {
                                                const newSubs = [...formData.subtasks];
                                                newSubs[idx].completed = e.target.checked;
                                                setFormData({ ...formData, subtasks: newSubs });
                                            }}
                                            className="accent-[var(--accent-current)] w-4 h-4 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={st.title}
                                            onChange={e => {
                                                const newSubs = [...formData.subtasks];
                                                newSubs[idx].title = e.target.value;
                                                setFormData({ ...formData, subtasks: newSubs });
                                            }}
                                            className="bg-transparent border-b border-current/10 py-2 font-body text-lg w-full focus:outline-none focus:border-[var(--accent-current)] transition-colors placeholder:italic placeholder:opacity-30"
                                            style={{ color: 'var(--text-current)' }}
                                            placeholder="Describe step..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSubtask(st.id)}
                                            className="opacity-0 group-hover/item:opacity-100 text-[10px] uppercase hover:text-red-500 transition-all font-mono"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {formData.subtasks.length === 0 && (
                                    <div className="text-center py-6 border border-dashed border-current/10 opacity-30 font-body italic text-sm">
                                        No checkpoints defined.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-6 pt-8 border-t border-current/10">
                            <button type="button" onClick={onClose} className="flex-1 py-4 border border-current/20 font-mono text-sm uppercase tracking-[0.2em] hover:bg-current/5 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 py-4 bg-[var(--text-current)] text-[var(--bg-current)] font-mono text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg">
                                Save Chronicle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
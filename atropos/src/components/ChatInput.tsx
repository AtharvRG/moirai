import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../store/useTaskStore';

interface Props {
    onSend: (message: string) => void;
}

export const ChatInput = ({ onSend }: Props) => {
    const [text, setText] = useState('');
    const [mentionTrigger, setMentionTrigger] = useState<'@' | '#' | null>(null);
    const [mentionIndex, setMentionIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { tasks } = useTaskStore();

    const dailyAnalyses = ['2026-02-09', '2026-02-08', '2026-02-07'];

    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(''));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const lastChar = val.slice(-1);

        if (lastChar === '@' || lastChar === '#') {
            setMentionTrigger(lastChar);
            setMentionIndex(0);
        } else if (val.endsWith(' ')) {
            // Close menu on space
            setMentionTrigger(null);
        }

        setText(val);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    // FIX: Click outside to close menu
    useEffect(() => {
        const handleClickOutside = () => {
            if (mentionTrigger) {
                setMentionTrigger(null);
            }
        };
        if (mentionTrigger) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [mentionTrigger]);

    const handleSelectMention = (item: string) => {
        const trigger = mentionTrigger;
        const newText = text.slice(0, -1) + `${trigger}${item} `;
        setText(newText);
        setMentionTrigger(null);
        textareaRef.current?.focus();
    };

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !mentionTrigger) {
            e.preventDefault();
            handleSend();
        }
        if (mentionTrigger) {
            const list = mentionTrigger === '@' ? filteredTasks : dailyAnalyses;
            if (e.key === 'ArrowDown') setMentionIndex(prev => (prev + 1) % list.length);
            if (e.key === 'ArrowUp') setMentionIndex(prev => (prev - 1 + list.length) % list.length);
            if (e.key === 'Enter') {
                e.preventDefault();
                const item = list[mentionIndex];
                const itemLabel = typeof item === 'string' ? item : item.title;
                handleSelectMention(itemLabel);
            }
        }
    };

    return (
        <div className="relative w-full group">
            {/* Mention Dropdown */}
            {mentionTrigger && (
                <div className="absolute bottom-full left-0 mb-4 w-72 bg-[var(--bg-current)]/95 backdrop-blur-xl border border-current/10 shadow-2xl z-50 max-h-60 overflow-y-auto rounded-sm">
                    <div className="p-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 border-b border-current/10">
                        {mentionTrigger === '@' ? 'Select Chronicle' : 'Select Entry'}
                    </div>
                    {(mentionTrigger === '@' ? filteredTasks : dailyAnalyses).map((item: string | Task, idx) => (
                        <div
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent closing from document click immediately
                                const itemLabel = typeof item === 'string' ? item : item.title;
                                handleSelectMention(itemLabel);
                            }}
                            className={`px-4 py-3 cursor-pointer font-body text-sm transition-all duration-300 border-l-2 ${idx === mentionIndex ? 'bg-[var(--accent-current)]/5 border-[var(--accent-current)] text-[var(--accent-current)]' : 'border-transparent hover:bg-current/5'
                                }`}
                        >
                            {typeof item === 'string' ? item : item.title}
                        </div>
                    ))}
                </div>
            )}

            {/* Input Container */}
            <div
                className={`relative border-b-2 bg-transparent transition-colors duration-500 ${isFocused ? 'border-[var(--accent-current)]' : 'border-current/20'}`}
            >
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask Moirai... (@Chronicles, #Entries)"
                    className="w-full bg-transparent p-6 font-body text-xl placeholder:text-current/30 focus:outline-none resize-none min-h-[80px] max-h-[240px]"
                    style={{ color: 'var(--text-current)' }}
                    rows={1}
                />

                <button
                    onClick={handleSend}
                    className="absolute bottom-6 right-4 text-[var(--accent-current)] hover:scale-110 active:scale-90 transition-transform duration-300"
                    aria-label="Send message"
                >
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className={`${text.trim() ? 'opacity-100 rotate-0' : 'opacity-40 -rotate-45'} transition-all duration-500`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h15" />
                    </svg>
                </button>
            </div>

            <div className="font-mono text-[10px] opacity-30 mt-3 text-right tracking-wider">
                RETURN TO SEND • SHIFT + RETURN FOR NEW LINE
            </div>
        </div>
    );
};
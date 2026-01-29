import { useChatStore } from '../store/useChatStore';

export const ChatSidebar = () => {
    const { sessions, activeSessionId, createSession, selectSession, deleteSession } = useChatStore();

    return (
        <div className="w-80 border-r border-current/10 flex flex-col h-full bg-[var(--bg-current)]">
            <div className="p-8 border-b border-current/10">
                <button
                    onClick={createSession}
                    className="w-full py-4 border border-current/20 font-mono text-[10px] uppercase tracking-widest hover:border-[var(--accent-current)] hover:text-[var(--accent-current)] transition-all duration-300"
                >
                    + New Oracle Session
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {sessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 opacity-30 gap-2">
                        <span className="font-heading text-2xl">Moirai</span>
                        <p className="font-body italic text-sm text-center">No threads found.</p>
                    </div>
                )}

                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => selectSession(session.id)}
                        className={`
              group p-4 cursor-pointer border-l-2 transition-all duration-300 relative
              ${activeSessionId === session.id
                                ? 'border-[var(--accent-current)] bg-[var(--accent-current)]/5 pl-6'
                                : 'border-transparent hover:border-current/20 hover:pl-5 opacity-60 hover:opacity-100'}
            `}
                    >
                        <h4 className="font-heading text-lg mb-1 truncate" style={{ color: 'var(--text-current)' }}>
                            {session.title}
                        </h4>
                        <div className="flex justify-between items-end">
                            <p className="font-mono text-[10px] opacity-50">
                                {session.messages.length} messages
                            </p>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] hover:text-[var(--accent-current)] transition-opacity uppercase tracking-wider"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatInput } from '../components/ChatInput';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_EDITORIAL } from '../utils/animations';

export const Chat = () => {
    const { sessions, activeSessionId, createSession, sendMessage, isOnline, checkConnection } = useChatStore();
    const { telemetry, apiKey } = useAppStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeSession = sessions.find(s => s.id === activeSessionId);

    useEffect(() => {
        const init = async () => {
            if (apiKey) {
                const { groqService } = await import('../services/groqService');
                groqService.setKey(apiKey);
                checkConnection();
            }
        };
        init();
    }, [apiKey, checkConnection]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages]);

    useEffect(() => {
        if (sessions.length === 0) createSession();
    }, [sessions.length, createSession]);

    if (!activeSession) return <div className="p-12 font-mono text-[10px] uppercase tracking-widest opacity-50 animate-pulse">Initializing Oracle...</div>;

    const handleSend = (msg: string) => {
        const context = telemetry ? JSON.stringify(telemetry, null, 2) : undefined;
        sendMessage(msg, context);
    };

    return (
        <div className="w-full h-full flex bg-[var(--bg-current)] overflow-hidden">
            <motion.div className="h-full border-r border-current/10 bg-[var(--bg-current)] z-20 w-80 flex-shrink-0" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: EASE_EDITORIAL }}>
                <ChatSidebar />
            </motion.div>

            <main className="flex-1 flex flex-col relative w-full h-full min-w-0">
                <motion.header className="flex-none px-8 py-6 border-b border-current/10 flex justify-between items-center bg-[var(--bg-current)]/80 backdrop-blur-sm z-10" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.2 }}>
                    <div>
                        <motion.h2 className="font-heading text-3xl tracking-tight text-[var(--text-current)] leading-none" key={activeSession.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                            {activeSession.title}
                        </motion.h2>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 mt-2">
                            Neural Link Active
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="font-mono text-[10px] uppercase opacity-60">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </motion.header>

                <div className="flex-1 overflow-y-auto px-4 md:px-12 pt-12 pb-40 custom-scrollbar scroll-smooth">
                    {activeSession.messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <span className="font-heading text-8xl mb-6">Moirai</span>
                            <p className="font-serif italic text-2xl">The thread awaits your query.</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-12">
                            <AnimatePresence initial={false}>
                                {activeSession.messages.map((msg) => (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_EDITORIAL }} className={`relative group ${msg.role === 'user' ? 'ml-auto max-w-xl' : 'mr-auto w-full'}`}>
                                        <div className={`
                                    p-8 transition-all duration-300 relative
                                    ${msg.role === 'user'
                                                ? 'bg-[var(--text-current)] text-[var(--bg-current)] shadow-xl'
                                                : 'bg-transparent p-0 pl-0'} 
                                `}>
                                            <div className={`font-serif text-lg leading-loose ${msg.role === 'assistant' ? '' : ''}`}>
                                                {msg.role === 'assistant' ? (
                                                    <MarkdownRenderer content={msg.content} />
                                                ) : (
                                                    <p>{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`font-mono text-[10px] mt-3 opacity-30 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <motion.div className="flex-none absolute bottom-0 w-full p-8 bg-gradient-to-t from-[var(--bg-current)] via-[var(--bg-current)] to-transparent z-20" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.4 }}>
                    <div className="max-w-3xl mx-auto">
                        <ChatInput onSend={handleSend} />
                    </div>
                </motion.div>
            </main>
        </div>
    );
};
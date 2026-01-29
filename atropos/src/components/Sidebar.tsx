import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { EASE_EDITORIAL } from '../utils/animations';

export const Sidebar = () => {
    const { currentPage, navigate } = useAppStore(); // Removed demoMode

    const menuItems = [
        { id: 'home', label: 'Home' },
        { id: 'tasks', label: 'Chronicles' },
        { id: 'stats', label: 'Quantified' },
        { id: 'chat', label: 'Oracle' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <motion.aside
            className="flex-none w-24 md:w-32 border-r border-current/10 flex flex-col items-center py-8 z-50 bg-[var(--bg-current)]"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
        >
            {/* Logo Area */}
            <div className="mb-16 cursor-pointer" onClick={() => navigate('home')}>
                <div className="w-10 h-10 md:w-12 md:h-12 border border-current rounded-full flex items-center justify-center font-heading text-xl md:text-2xl">
                    M
                </div>
            </div>

            {/* Nav Icons */}
            <nav className="flex-1 flex flex-col gap-8 w-full items-center">
                {menuItems.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => navigate(item.id as any)}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-mono text-xs md:text-sm uppercase tracking-widest transition-all duration-300 relative
              ${currentPage === item.id
                                ? 'bg-[var(--text-current)] text-[var(--bg-current)]'
                                : 'text-current/40 hover:bg-current/5'
                            }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {item.label[0]}
                        {currentPage === item.id && (
                            <motion.div
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--accent-current)] rounded-l-full"
                                layoutId="activeTabIndicator"
                            />
                        )}
                    </motion.button>
                ))}
            </nav>

            {/* Footer Info */}
            <div className="text-[8px] md:text-[10px] font-mono opacity-30 text-center rotate-180 vertical-rl">
                V0.0.1 BETA
            </div>
        </motion.aside>
    );
};
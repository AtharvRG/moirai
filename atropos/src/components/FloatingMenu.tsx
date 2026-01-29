import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { AppState } from '../store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_EDITORIAL, EASE_EXPO } from '../utils/animations';

export const FloatingMenu = () => {
    const { isMenuOpen, toggleMenu, isMenuVisible, setMenuVisible, navigate } = useAppStore();
    const timeoutRef = useRef<number | null>(null);

    // Auto-hide logic: Hide the button after 5 seconds of inactivity unless menu is open
    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setMenuVisible(true);

        timeoutRef.current = window.setTimeout(() => {
            if (!isMenuOpen) {
                setMenuVisible(false);
            }
        }, 5000);
    }, [isMenuOpen, setMenuVisible]);

    // Initial Timer
    useEffect(() => {
        resetTimer();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resetTimer]);

    // Reset on Mouse Move/Touch across the whole window to detect activity
    useEffect(() => {
        const handleActivity = () => {
            if (!isMenuOpen) resetTimer();
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, [resetTimer, isMenuOpen]);

    const menuItems = [
        { id: 'home', label: 'Home' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'stats', label: 'Stats' },
        { id: 'chat', label: 'Chat' },
        { id: 'settings', label: 'Settings' },
    ];

    const handleNav = (pageId: string) => {
        navigate(pageId as AppState['currentPage']);
        toggleMenu(); // Close menu immediately on click
    };

    const drawerVariants = {
        closed: { x: '100%', transition: { duration: 0.6, ease: EASE_EXPO } },
        open: {
            x: 0,
            transition: {
                duration: 0.8,
                ease: EASE_EDITORIAL,
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        closed: { x: 50, opacity: 0 },
        open: { x: 0, opacity: 1, transition: { duration: 0.5, ease: EASE_EDITORIAL } }
    };

    return (
        <>
            {/* The Floating Button - RIGHT MIDDLE */}
            <motion.div
                className="fixed right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-auto p-4 pr-0"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                    opacity: isMenuVisible ? 1 : 0,
                    scale: isMenuVisible ? 1 : 0.8,
                    y: isMenuVisible ? 0 : 20
                }}
                transition={{ duration: 0.6, ease: EASE_EXPO }}
            >
                <motion.button
                    onClick={toggleMenu}
                    className={`
                        w-14 h-14 rounded-l-full border border-r-0 flex items-center justify-center 
                        shadow-xl backdrop-blur-md transition-all duration-500 group relative overflow-hidden z-10
                        ${isMenuOpen
                            ? 'bg-[var(--text-current)] text-[var(--bg-current)] border-transparent'
                            : 'bg-[var(--bg-current)]/80 text-[var(--text-current)] border-current/20 hover:border-[var(--accent-current)] hover:text-[var(--accent-current)]'
                        }
                    `}
                >
                    {/* Abstract Moirai Icon / Thread Spool */}
                    <svg width="24px" height="24px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" stroke-width="1" fill="var(--text-current)" fill-rule="evenodd">
                            <g id="Dribbble-Light-Preview" transform="translate(-99.000000, -200.000000)" fill="#000000">
                                <g id="icons" transform="translate(56.000000, 160.000000)">
                                    <path d="M60.85,51 L57.7,51 C55.96015,51 54.55,52.343 54.55,54 L54.55,57 C54.55,58.657 55.96015,60 57.7,60 L60.85,60 C62.58985,60 64,58.657 64,57 L64,54 C64,52.343 62.58985,51 60.85,51 M49.3,51 L46.15,51 C44.41015,51 43,52.343 43,54 L43,57 C43,58.657 44.41015,60 46.15,60 L49.3,60 C51.03985,60 52.45,58.657 52.45,57 L52.45,54 C52.45,52.343 51.03985,51 49.3,51 M60.85,40 L57.7,40 C55.96015,40 54.55,41.343 54.55,43 L54.55,46 C54.55,47.657 55.96015,49 57.7,49 L60.85,49 C62.58985,49 64,47.657 64,46 L64,43 C64,41.343 62.58985,40 60.85,40 M52.45,43 L52.45,46 C52.45,47.657 51.03985,49 49.3,49 L46.15,49 C44.41015,49 43,47.657 43,46 L43,43 C43,41.343 44.41015,40 46.15,40 L49.3,40 C51.03985,40 52.45,41.343 52.45,43" id="menu_navigation_grid-[#1529]">

                                    </path>
                                </g>
                            </g>
                        </g>
                    </svg>
                </motion.button>
            </motion.div>

            {/* The Side Drawer (Right Panel) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Cinematic Overlay */}
                        <motion.div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            onClick={toggleMenu}
                        />

                        {/* Drawer Content */}
                        <motion.div
                            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[var(--bg-current)]/98 backdrop-blur-3xl z-50 flex flex-col border-l border-current/10 shadow-2xl"
                            variants={drawerVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            {/* Drawer Header */}
                            <div className="p-12 border-b border-current/10 flex justify-between items-center bg-[var(--bg-current)]/50">
                                <h2 className="font-heading text-4xl tracking-tight text-[var(--text-current)]" id="nav-menu-title">
                                    Menu
                                </h2>
                                <button
                                    onClick={toggleMenu}
                                    aria-label="Close navigation menu"
                                    className="font-mono text-xs uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[var(--accent-current)] transition-colors"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 p-12 flex flex-col justify-center space-y-4" role="navigation" aria-labelledby="nav-menu-title">
                                {menuItems.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        variants={itemVariants}
                                        onClick={() => handleNav(item.id)}
                                        className="group block w-full text-left font-heading text-5xl md:text-6xl py-4 md:py-5 relative transition-colors hover:text-[var(--accent-current)] leading-[1.2]"
                                    >
                                        <span className="relative z-10 inline-block transition-transform duration-500 group-hover:translate-x-4">
                                            {item.label}
                                        </span>

                                        {/* Hover Line Accent */}
                                        <span className="absolute bottom-4 left-0 w-full h-[1px] bg-[var(--accent-current)] transform scale-x-0 origin-left transition-transform duration-500 var(--ease-out-expo) group-hover:scale-x-100" />
                                    </motion.button>
                                ))}
                            </nav>

                            {/* Drawer Footer */}
                            <div className="p-12 border-t border-current/10">
                                <motion.div variants={itemVariants} className="font-mono text-xs uppercase tracking-[0.2em] opacity-40 mb-2">
                                    Project Moirai
                                </motion.div>
                                <motion.div variants={itemVariants} className="font-body italic text-sm opacity-60 text-[var(--text-current)]">
                                    "We weave the threads of time."
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
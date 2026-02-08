export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_QUINT = [0.22, 1, 0.36, 1] as const;
export const EASE_EDITORIAL = [0.19, 1, 0.22, 1] as const; // Custom "Vogue" ease

export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        filter: 'blur(8px)',
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.8,
            ease: EASE_EDITORIAL,
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        filter: 'blur(4px)',
        transition: {
            duration: 0.4,
            ease: EASE_EXPO
        }
    }
};

export const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.9,
            ease: EASE_EDITORIAL
        }
    }
};

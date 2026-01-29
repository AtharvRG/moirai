import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-current)] text-[var(--text-current)] p-8 text-center relative overflow-hidden">

                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-current)_0%,transparent_60%)] opacity-5 blur-3xl pointer-events-none" />

                    <div className="relative z-10 reveal-up">
                        <h1 className="font-heading text-8xl mb-4 tracking-tighter opacity-90">
                            Severed
                        </h1>
                        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-12 opacity-60">
                            Performance Interrupted
                        </h2>

                        <div className="max-w-md mx-auto p-6 border border-current/10 bg-current/5 mb-10 font-mono text-[10px] text-left overflow-auto max-h-40 glass-panel scrollbar-hide">
                            {this.state.error?.toString()}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-[var(--text-current)] text-[var(--bg-current)] font-mono text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
                        >
                            Reconnect Thread
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

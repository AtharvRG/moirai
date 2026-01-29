import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { revealVariants, EASE_EDITORIAL } from '../utils/animations';

// ─── Toggle Component ───
const ToggleSwitch = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
    <button
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        className={`
            w-14 h-7 rounded-full border border-current/20 transition-all duration-500 relative flex items-center
            ${enabled ? 'bg-[var(--accent-current)] border-[var(--accent-current)]' : 'bg-transparent'}
        `}
    >
        <div
            className={`
                w-5 h-5 rounded-full shadow-md absolute top-0.5 transition-all duration-500
                ${enabled ? 'left-[calc(100%-1.4rem)] bg-white' : 'left-0.5 bg-[var(--text-current)]'}
            `}
        />
    </button>
);

// ─── Sub-Component: Basic Settings ───
const BasicSettings = () => {
    const { user, updateUserProfile } = useAppStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        dob: user?.dob || '',
        profession: user?.profession || '',
        interests: user?.interests || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUserProfile(formData);
        alert('Profile Updated');
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-12 max-w-2xl"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <div className="grid gap-8">
                {[
                    { id: 'name', label: 'Full Name', type: 'text', value: formData.name, className: 'font-heading text-3xl' },
                    { id: 'profession', label: 'Profession', type: 'text', value: formData.profession, className: 'font-heading text-3xl' },
                    { id: 'dob', label: 'Date of Birth', type: 'date', value: formData.dob, className: 'font-mono text-lg' },
                    { id: 'interests', label: 'Interests (comma separated)', type: 'text', value: formData.interests, className: 'font-serif italic text-xl' },
                ].map((field, i) => (
                    <motion.div
                        key={field.id}
                        className="group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, ease: EASE_EDITORIAL }}
                    >
                        <label htmlFor={field.id} className="block font-mono text-xs uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">
                            {field.label}
                        </label>
                        <input
                            id={field.id}
                            type={field.type}
                            value={field.value}
                            onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                            className={`w-full bg-transparent border-b border-current/20 py-3 ${field.className} focus:outline-none focus:border-[var(--accent-current)] transition-all placeholder:opacity-20 leading-tight py-4`}
                            placeholder="Not Set"
                            style={{ color: 'var(--text-current)' }}
                        />
                    </motion.div>
                ))}
            </div>

            <motion.button
                type="submit"
                className="px-10 py-4 bg-[var(--text-current)] text-[var(--bg-current)] font-mono text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Save Changes
            </motion.button>
        </motion.form>
    );
};

// ─── Sub-Component: App Settings ───
const AppSettings = () => {
    const { demoMode, toggleDemoMode, setGroqKey } = useAppStore();
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
    const [autoLaunch, setAutoLaunch] = useState(false);
    const [apiKeyInfo, setApiKeyInfo] = useState<{ hasKey: boolean; masked: string }>({ hasKey: false, masked: '' });
    const [newApiKey, setNewApiKey] = useState('');
    const [exportStatus, setExportStatus] = useState('');

    useEffect(() => {
        if (window.electronAPI?.getAutoLaunch) {
            window.electronAPI.getAutoLaunch().then(setAutoLaunch);
        }
        if (window.electronAPI?.getApiKey) {
            window.electronAPI.getApiKey().then(setApiKeyInfo);
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        if (newMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const toggleAutoLaunch = async () => {
        const newVal = !autoLaunch;
        if (window.electronAPI?.setAutoLaunch) {
            const res = await window.electronAPI.setAutoLaunch(newVal);
            if (res.success) setAutoLaunch(newVal);
        }
    };

    const handleDemoToggle = async () => {
        toggleDemoMode();
        if (window.electronAPI?.setDemoMode) {
            await window.electronAPI.setDemoMode(!demoMode);
        }
        setTimeout(() => window.location.reload(), 500);
    };

    const handleSaveApiKey = async () => {
        if (!newApiKey.trim()) return;
        if (window.electronAPI?.setApiKey) {
            const res = await window.electronAPI.setApiKey(newApiKey.trim());
            if (res.success) {
                setNewApiKey('');
                const info = await window.electronAPI.getApiKey();
                setApiKeyInfo(info);
                setGroqKey(newApiKey.trim()); // This function now exists
            }
        }
    };

    const handleDeleteApiKey = async () => {
        if (window.electronAPI?.deleteApiKey) {
            await window.electronAPI.deleteApiKey();
            setApiKeyInfo({ hasKey: false, masked: '' });
        }
    };

    const handleExport = async () => {
        if (window.electronAPI?.exportData) {
            setExportStatus('Exporting...');
            const res = await window.electronAPI.exportData();
            if (res.success) {
                setExportStatus(`Exported to ${res.path}`);
            } else {
                setExportStatus(res.error || 'Export failed');
            }
            setTimeout(() => setExportStatus(''), 5000);
        }
    };

    const handleImport = async () => {
        if (!confirm('This will overwrite your current data. Are you sure?')) return;
        if (window.electronAPI?.importData) {
            const res = await window.electronAPI.importData();
            if (res.success) {
                alert('Data imported successfully. Restart the app to see changes.');
            } else {
                alert(res.error || 'Import failed');
            }
        }
    };

    return (
        <motion.div
            className="space-y-12 max-w-2xl"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <div className="space-y-8">
                {[
                    { label: 'Demo Configuration', desc: 'Use mock data for simulation.', enabled: demoMode, toggle: handleDemoToggle },
                    { label: 'Visual Theme', desc: 'Toggle Light/Dark atmosphere.', enabled: isDark, toggle: toggleTheme },
                    { label: 'System Startup', desc: 'Initialize Moirai on boot.', enabled: autoLaunch, toggle: toggleAutoLaunch }
                ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        className="flex items-center justify-between group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div>
                            <h3 className="font-heading text-2xl mb-1 group-hover:text-[var(--accent-current)] transition-colors">{item.label}</h3>
                            <p className="font-serif text-sm opacity-60">{item.desc}</p>
                        </div>
                        <ToggleSwitch enabled={item.enabled} onToggle={item.toggle} label={`Toggle ${item.label}`} />
                    </motion.div>
                ))}
            </div>

            <div className="w-full h-[1px] bg-current/10" />

            <div className="space-y-4">
                <h3 className="font-heading text-2xl">Intelligence Key</h3>
                <p className="font-serif text-sm opacity-60 mb-4">Required for Clotho analysis (Groq API).</p>

                {apiKeyInfo.hasKey ? (
                    <div className="flex items-center gap-6 p-4 border border-current/20 bg-current/5">
                        <span className="font-mono text-xs opacity-50">STATUS:</span>
                        <code className="font-mono text-sm text-[var(--accent-current)] flex-1">{apiKeyInfo.masked}</code>
                        <button
                            onClick={handleDeleteApiKey}
                            className="font-mono text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Revoke
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <input
                            type="password"
                            value={newApiKey}
                            onChange={e => setNewApiKey(e.target.value)}
                            placeholder="Enter gsk_... key"
                            className="flex-1 bg-transparent border-b border-current/20 py-2 font-mono text-sm focus:outline-none focus:border-[var(--accent-current)] transition-colors"
                        />
                        <button
                            onClick={handleSaveApiKey}
                            className="px-6 py-2 bg-[var(--text-current)] text-[var(--bg-current)] font-mono text-xs uppercase tracking-widest hover:opacity-90"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            <div className="w-full h-[1px] bg-current/10" />

            <div className="space-y-6">
                <h3 className="font-heading text-2xl">Archival</h3>
                <div className="flex gap-6">
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 border border-current/20 font-mono text-xs uppercase tracking-widest hover:border-[var(--accent-current)] hover:text-[var(--accent-current)] transition-colors"
                    >
                        Export Chronicle
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-6 py-3 border border-current/20 font-mono text-xs uppercase tracking-widest hover:border-[var(--accent-current)] hover:text-[var(--accent-current)] transition-colors"
                    >
                        Import Chronicle
                    </button>
                </div>
                {exportStatus && (
                    <p className="font-mono text-xs text-[var(--accent-current)] animate-pulse">{exportStatus}</p>
                )}
            </div>
        </motion.div>
    );
};

// ─── Sub-Component: About ───
const About = () => {
    const [updateInfo, setUpdateInfo] = useState<{ available: boolean; version?: string } | null>(null);
    const [updateDownloaded, setUpdateDownloaded] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (window.electronAPI?.onUpdateAvailable) {
            const cleanup = window.electronAPI.onUpdateAvailable((info) => {
                setUpdateInfo({ available: true, version: info.version });
            });
            return cleanup;
        }
    }, []);

    useEffect(() => {
        if (window.electronAPI?.onUpdateDownloaded) {
            const cleanup = window.electronAPI.onUpdateDownloaded(() => {
                setUpdateDownloaded(true);
            });
            return cleanup;
        }
    }, []);

    const handleCheckUpdates = async () => {
        if (!window.electronAPI?.checkForUpdates) return;
        setChecking(true);
        const res = await window.electronAPI.checkForUpdates();
        setUpdateInfo(res);
        setChecking(false);
    };

    const handleDownloadUpdate = async () => {
        if (window.electronAPI?.downloadUpdate) {
            await window.electronAPI.downloadUpdate();
        }
    };

    const handleInstallUpdate = () => {
        if (window.electronAPI?.installUpdate) {
            window.electronAPI.installUpdate();
        }
    };

    return (
        <motion.div
            className="max-w-3xl space-y-12"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <div className="border-b border-current/10 pb-8">
                <h2 className="font-display text-4xl md:text-5xl mb-2" style={{ color: 'var(--text-current)' }}>Project Moirai</h2>
                <div className="flex items-center gap-4">
                    <p className="font-mono text-xs uppercase tracking-widest opacity-50">System Version 0.0.1 Beta</p>
                    <div className="h-[1px] flex-1 bg-current/10" />
                </div>
            </div>

            <div className="space-y-8 font-serif text-xl leading-relaxed opacity-80">
                <p>
                    <em className="text-[var(--accent-current)]">"We are not recording your life; we are helping you remember it."</em>
                </p>
                <p>
                    Moirai is an experiment in the "Qualified Self." While most tools quantify your hours, we aim to qualify your time. We weave the raw binary of mouse clicks and window switches into a narrative tapestry—a story of intent, focus, and flow.
                </p>
                <p className="text-base font-sans opacity-60">
                    Built with <strong>Clotho</strong> (The Scribe), <strong>Lachesis</strong> (The Weaver), and <strong>Atropos</strong> (The Oracle).
                </p>
            </div>

            <div className="border-t border-current/10 pt-12">
                <div className="flex items-center justify-between bg-current/5 p-6 border border-current/10">
                    <div>
                        <h4 className="font-mono text-xs uppercase tracking-widest mb-1">System Update</h4>
                        <p className="opacity-50 text-xs">Keep the thread unbroken.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCheckUpdates}
                            disabled={checking}
                            className="px-6 py-2 bg-[var(--text-current)] text-[var(--bg-current)] font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            {checking ? 'Checking...' : 'Check Now'}
                        </button>

                        {updateInfo?.available && !updateDownloaded && (
                            <button
                                onClick={handleDownloadUpdate}
                                className="px-6 py-2 border border-[var(--accent-current)] text-[var(--accent-current)] font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-current)] hover:text-white transition-colors"
                            >
                                Download v{updateInfo.version}
                            </button>
                        )}

                        {updateDownloaded && (
                            <button
                                onClick={handleInstallUpdate}
                                className="px-6 py-2 bg-[var(--accent-current)] text-white font-mono text-xs uppercase tracking-widest animate-pulse"
                            >
                                Install
                            </button>
                        )}
                    </div>
                </div>
                {updateInfo && !updateInfo.available && !checking && (
                    <p className="font-mono text-xs uppercase text-center mt-4 opacity-40">System is up to date.</p>
                )}
            </div>

            <footer className="pt-20 opacity-30 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.3em]">Designed for the modern thinker.</p>
            </footer>
        </motion.div>
    );
};

// ─── Main Settings Component ───
export const Settings = () => {
    const [activeTab, setActiveTab] = useState<'basic' | 'app' | 'about'>('basic');

    const tabs = [
        { id: 'basic', label: 'Identity' },
        { id: 'app', label: 'System' },
        { id: 'about', label: 'Manifesto' },
    ];

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-[var(--bg-current)] overflow-hidden">

            <motion.aside
                className="md:w-72 border-b md:border-b-0 md:border-r border-current/10 p-8 flex md:flex-col justify-between"
                role="tablist"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: EASE_EDITORIAL }}
            >
                <div>
                    <h2 className="font-heading text-4xl mb-12 hidden md:block" style={{ color: 'var(--text-current)' }}>
                        Settings
                    </h2>

                    <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                        {tabs.map((tab, i) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'basic' | 'app' | 'about')}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                className={`
                                    whitespace-nowrap px-6 py-4 text-left font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden group
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--text-current)] text-[var(--bg-current)]'
                                        : 'hover:bg-current/5 text-[var(--text-current)] opacity-60 hover:opacity-100'}
                                `}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute left-0 top-0 h-full w-1 bg-[var(--accent-current)]"
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </nav>
                </div>

                <div className="hidden md:block opacity-30">
                    <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center font-heading text-xl">M</div>
                </div>
            </motion.aside>

            <main className="flex-1 p-8 md:p-20 overflow-y-auto custom-scrollbar" role="tabpanel">
                <div className="max-w-3xl mx-auto">
                    <motion.header
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.3 }}
                    >
                        <span className="font-mono text-xs uppercase tracking-widest opacity-40 block mb-8">Configuration</span>
                        <h1 className="font-heading text-6xl capitalize" style={{ color: 'var(--text-current)' }}>
                            {activeTab}
                        </h1>
                    </motion.header>

                    <AnimatePresence mode="wait">
                        {activeTab === 'basic' && <BasicSettings key="basic" />}
                        {activeTab === 'app' && <AppSettings key="app" />}
                        {activeTab === 'about' && <About key="about" />}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
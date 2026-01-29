import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const Onboarding = () => {
    const { setUser, loadUser } = useAppStore();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        profession: '',
        interests: ''
    });

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 500);
        const timer2 = setTimeout(() => setStep(2), 1500);
        const timer3 = setTimeout(() => setStep(3), 2500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (window.electronAPI) {
            await window.electronAPI.saveUserProfile(formData);
            setUser(formData);
            loadUser();
        }
    };

    return (
        // h-full w-full flex center ensures it fits on screen
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,var(--accent-current)_0%,transparent_70%)] blur-3xl" />

            <div className="max-w-xl w-full relative z-10 flex flex-col h-full justify-center">

                {/* Title Sequence - FIXED CLIPPING */}
                <div className={`text-center mb-16 transition-all duration-1000 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h1 className="font-heading text-[6rem] md:text-8xl mb-6 tracking-tighter leading-tight py-4">
                        MOIRAI
                    </h1>
                </div>

                {/* Quote Sequence */}
                <div className={`text-center mb-16 transition-all duration-1000 ease-out delay-200 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <p className="font-body italic text-2xl text-[var(--accent-current)] leading-relaxed">
                        "We are not recording your life;<br />we are helping you remember it."
                    </p>
                </div>

                {/* Form Sequence - Scrollable if height is too small */}
                <form
                    onSubmit={handleSubmit}
                    className={`space-y-8 transition-all duration-1000 ease-out delay-500 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    <div className="group">
                        <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-current/30 py-4 font-heading text-3xl focus:outline-none focus:border-[var(--accent-current)] transition-colors placeholder:opacity-20 leading-tight py-4"
                            placeholder="Identify yourself"
                            autoComplete="off"
                        />
                    </div>

                    <div className="group">
                        <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            required
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-current/30 py-4 font-mono text-lg focus:outline-none focus:border-[var(--accent-current)] transition-colors opacity-80"
                        />
                    </div>

                    <div className="group">
                        <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">Profession</label>
                        <input
                            type="text"
                            name="profession"
                            required
                            value={formData.profession}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-current/30 py-4 font-body text-2xl focus:outline-none focus:border-[var(--accent-current)] transition-colors placeholder:opacity-20 leading-tight"
                            placeholder="Your craft"
                            autoComplete="off"
                        />
                    </div>

                    <div className="group">
                        <label className="block font-mono text-[10px] uppercase tracking-widest mb-3 opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-current)] transition-colors">Interests</label>
                        <input
                            type="text"
                            name="interests"
                            required
                            value={formData.interests}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-current/30 py-4 font-body text-2xl focus:outline-none focus:border-[var(--accent-current)] transition-colors placeholder:opacity-20 leading-tight"
                            placeholder="What moves you?"
                            autoComplete="off"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-5 border border-current mt-4 font-mono text-xs uppercase tracking-[0.25em] hover:bg-[var(--text-current)] hover:text-[var(--bg-current)] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Begin Chronicle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
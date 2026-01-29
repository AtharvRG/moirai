import ReactMarkdown from 'react-markdown';

interface NarrativeViewProps {
    date: string;
    content: string;
}

export const NarrativeView = ({ date, content }: NarrativeViewProps) => {
    return (
        <article className="max-w-4xl mx-auto py-16 px-8 reveal-up">
            <header className="mb-12 border-b border-current/10 pb-8 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 block mb-4">
                    Daily Chronicle
                </span>
                <h1 className="font-heading text-6xl md:text-7xl mb-6 text-[var(--text-current)] tracking-tight leading-tight">
                    {date}
                </h1>
                <div className="mx-auto w-12 h-[1px] bg-[var(--accent-current)] opacity-60" />
            </header>

            <div className={`
        editorial-prose 
        prose-headings:font-heading prose-headings:font-normal
        prose-p:font-body prose-p:text-lg prose-p:leading-8
        prose-a:text-[var(--accent-current)] prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-2 prose-blockquote:border-[var(--accent-current)] prose-blockquote:pl-6 prose-blockquote:italic
        prose-strong:font-bold prose-strong:text-[var(--text-current)]
      `}>
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>

            <footer className="mt-20 pt-8 border-t border-current/10 flex justify-between items-center opacity-40 font-mono text-[10px] uppercase tracking-widest">
                <span>Moirai System</span>
                <span>End of Entry</span>
            </footer>
        </article>
    );
};
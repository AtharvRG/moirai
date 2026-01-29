import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Using VS Code Dark/Light themes

interface Props {
    content: string;
}

export const MarkdownRenderer = ({ content }: Props) => {
    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains('dark');
    const codeTheme = isDark ? vscDarkPlus : vs;

    return (
        <div className="editorial-prose markdown-body">
            <ReactMarkdown
                components={{
                    // 1. Code Blocks (```code```)
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={codeTheme}
                                language={match[1]}
                                PreTag="div"
                                className="!bg-black/10 !border !border-current/20 !rounded-md !mt-4 !mb-4 !p-4 !overflow-x-auto text-sm"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className="bg-current/10 px-1.5 py-0.5 rounded text-[0.8em] font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    // 2. Headings (h1, h2, h3...)
                    h1: ({ children }) => <h1 className="font-heading text-3xl font-bold mb-4 mt-8 text-[var(--text-current)] py-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="font-heading text-2xl font-bold mb-4 mt-6 text-[var(--text-current)] py-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-heading text-xl font-bold mb-3 mt-4 text-[var(--text-current)] py-1">{children}</h3>,
                    // 3. Paragraphs
                    p: ({ children }) => <p className="mb-4 leading-loose">{children}</p>,
                    // 4. Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[var(--accent-current)] pl-4 italic opacity-80 my-4">
                            {children}
                        </blockquote>
                    ),
                    // 5. Unordered Lists
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 ml-4">{children}</ul>,
                    // 6. Ordered Lists
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">{children}</ol>,
                    // 7. Links
                    a: ({ href, children }) => (
                        <a href={href} className="text-[var(--accent-current)] hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                    // 8. Bold & Italic
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

type Props = { md: string };

const components: Components = {
  h1: (p) => <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-2 mb-4 text-bone-light" {...p} />,
  h2: (p) => <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mt-6 mb-3 text-bone-light" {...p} />,
  h3: (p) => <h3 className="text-xl lg:text-2xl font-semibold tracking-tight mt-5 mb-2 text-bone-light" {...p} />,
  p: (p) => <p className="my-3 text-bone" {...p} />,
  ul: (p) => <ul className="my-3 list-disc pl-6 space-y-1 text-bone" {...p} />,
  ol: (p) => <ol className="my-3 list-decimal pl-6 space-y-1 text-bone" {...p} />,
  li: (p) => <li className="my-1" {...p} />,
  strong: (p) => <strong className="font-semibold text-bone-light" {...p} />,
  hr: (p) => <hr className="my-6 border-stone-800" {...p} />,
  blockquote: (p) => (
    <blockquote className="my-4 border-l-4 border-stone-700 pl-4 italic text-stone-300" {...p} />
  ),
  table: (p) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full text-left border-collapse text-bone" {...p} />
    </div>
  ),
  thead: (p) => <thead className="border-b border-stone-800" {...p} />,
  th: (p) => <th className="px-3 py-2 font-semibold text-bone-light" {...p} />,
  td: (p) => <td className="px-3 py-2 align-top" {...p} />,
  code: ({ inline, className, children, ...rest }: any) => {
    if (inline) {
      return (
        <code className="font-mono px-1.5 py-0.5 rounded bg-stone-800 text-bone-light text-[0.9em]" {...rest}>
          {children}
        </code>
      );
    }
    return (
      <pre className="font-mono border border-stone-800 rounded-lg p-3 overflow-x-auto">
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    );
  },
};

export default function MarkdownView({ md }: Props) {
  return (
    <div className="prose prose-invert max-w-none leading-relaxed text-bone">
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {md || ""}
      </ReactMarkdown>
    </div>
  );
}
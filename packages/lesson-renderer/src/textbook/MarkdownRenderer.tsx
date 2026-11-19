"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "../lib/cn";
import { parseMathSegments } from "../lib/parse-math-segments";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const PROSE_CLASSES = [
  // Base
  "prose prose-base max-w-none dark:prose-invert",

  // Headings
  "prose-headings:text-primary prose-headings:tracking-tight",
  "prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4",
  "prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3",
  "prose-h4:text-base prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2",

  // Body text
  "prose-p:text-foreground/90 prose-p:leading-relaxed",

  // Links
  "prose-a:text-primary prose-a:font-medium prose-a:underline-offset-2",

  // Lists
  "prose-li:text-foreground/90 prose-li:marker:text-primary/60",
  "prose-ol:pl-6 prose-ul:pl-6",

  // Inline code — accent-colored chip
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-code:bg-primary/10 prose-code:text-primary prose-code:font-semibold",
  "prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em]",

  // Blockquotes
  "prose-blockquote:border-l-primary prose-blockquote:bg-primary/5",
  "prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4",
  "prose-blockquote:not-italic prose-blockquote:text-foreground/80",

  // Strong
  "prose-strong:text-foreground prose-strong:font-bold",

  // Horizontal rules
  "prose-hr:border-border",
].join(" ");

const mdComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-5 rounded-lg border border-border">
      <table className="m-0 w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-primary/10 text-primary">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider border-b border-border">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-4 py-2.5 border-b border-border/50">{children}</td>,
  tr: ({ children }) => (
    <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors">{children}</tr>
  ),
};

/**
 * Renders markdown content with automatic KaTeX math detection.
 *
 * Supported math delimiters:
 *   Display math: $$...$$ or \[...\]
 *   Inline math:  $...$
 *
 * All other content is rendered via react-markdown with GFM support.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Normalize legacy delimiters while preserving one Markdown document.
  // Splitting at inline math breaks paragraphs, lists, and table cells.
  const markdown = parseMathSegments(content)
    .map((segment) => {
      if (segment.type === "block-math") return `\n$$\n${segment.content}\n$$\n`;
      if (segment.type === "inline-math") return `$${segment.content}$`;
      return segment.content;
    })
    .join("");
  return (
    <div className={cn(PROSE_CLASSES, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={mdComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

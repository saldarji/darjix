"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find embedded script tags (e.g. Mastodon embed script) and execute them dynamically
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const src = oldScript.getAttribute("src");
      if (src) {
        // Prevent duplicate script tags
        if (!document.querySelector(`script[src="${src}"]`)) {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          document.body.appendChild(newScript);
        }
      } else if (oldScript.innerHTML) {
        try {
          const newScript = document.createElement("script");
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          document.body.appendChild(newScript);
        } catch (err) {
          console.warn("Script execution error:", err);
        }
      }
    });
  }, [content]);

  return (
    <div ref={containerRef} className="prose max-w-none text-gray-800 leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-black mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-black mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-black mt-5 mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-4 text-base leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="text-black underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc ml-6 my-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-6 my-4 space-y-2">{children}</ol>,
          code: ({ children }) => (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto my-4 text-sm font-mono">{children}</pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

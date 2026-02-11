
import { cn } from "@/lib/utils";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content?: string | null;
  fallback?: string;
  variant?: 'body2' | 'caption';
  color?: string; // Kept for compatibility, but prefer standard tailwind classes
  maxLines?: number;
  className?: string; // Replaces sx
}

export function MarkdownContent({
  content,
  fallback = '',
  // variant = 'body2', // unused in new implementation, styles controlled by className
  // color = 'text.secondary', // unused in new implementation
  maxLines,
  className,
}: MarkdownContentProps) {
  const text = (content ?? '').trim() || fallback;

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-p:my-0 prose-p:leading-normal",
        "prose-ul:my-0 prose-ul:pl-4",
        "prose-ol:my-0 prose-ol:pl-4",
        "prose-li:my-0",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "text-muted-foreground", // Default color
        maxLines && "line-clamp-" + maxLines, // Requires tailwind line-clamp plugin or custom class
        maxLines && maxLines > 0 && `line-clamp-${maxLines} overflow-hidden text-ellipsis display-[-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:${maxLines})`,
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, className, ...props }) => <p className={cn("mb-1 last:mb-0", className)} {...props} />,
          ul: ({ node, className, ...props }) => <ul className={cn("list-disc ml-4 mb-2", className)} {...props} />,
          ol: ({ node, className, ...props }) => <ol className={cn("list-decimal ml-4 mb-2", className)} {...props} />,
          li: ({ node, className, ...props }) => <li className={cn("mb-0.5", className)} {...props} />,
          a: ({ node, className, ...props }) => (
            <a 
              target="_blank" 
              rel="noopener noreferrer" 
              className={cn("text-primary hover:underline", className)} 
              {...props} 
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  children: string;
}

function extractNodeText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => extractNodeText(child)).join(' ');
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractNodeText(node.props.children);
  }

  return '';
}

export function slugifyMarkdownHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function resolveHeadingId(children: React.ReactNode): string | undefined {
  const candidate = slugifyMarkdownHeading(extractNodeText(children));
  return candidate.length > 0 ? candidate : undefined;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, children, ...props }) => (
          <h1 id={props.id ?? resolveHeadingId(children)} style={{ margin: '1.5rem 0 1rem', lineHeight: 1.2, fontWeight: 900 }} {...props}>
            {children}
          </h1>
        ),
        h2: ({ node, children, ...props }) => (
          <h2 id={props.id ?? resolveHeadingId(children)} style={{ margin: '1.4rem 0 0.85rem', lineHeight: 1.3, fontWeight: 800 }} {...props}>
            {children}
          </h2>
        ),
        h3: ({ node, children, ...props }) => (
          <h3 id={props.id ?? resolveHeadingId(children)} style={{ margin: '1.2rem 0 0.6rem', lineHeight: 1.35, fontWeight: 700 }} {...props}>
            {children}
          </h3>
        ),
        p: ({ node, ...props }) => <p style={{ margin: '0 0 0.95rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #a0a0b3)' }} {...props} />,
        a: ({ node, href, ...props }) => {
          const isInternalAnchor = typeof href === 'string' && href.startsWith('#');
          return (
            <a
              href={href}
              style={{ color: 'var(--color-accent-primary, #7dd3fc)' }}
              target={isInternalAnchor ? undefined : '_blank'}
              rel={isInternalAnchor ? undefined : 'noopener noreferrer'}
              {...props}
            />
          );
        },
        ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.25rem', margin: '0.35rem 0 1rem', color: 'var(--color-text-secondary, #a0a0b3)' }} {...props} />,
        ol: ({ node, ...props }) => <ol style={{ paddingLeft: '1.25rem', margin: '0.35rem 0 1rem', color: 'var(--color-text-secondary, #a0a0b3)' }} {...props} />,
        li: ({ node, ...props }) => <li style={{ marginBottom: '0.45rem', lineHeight: 1.7 }} {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            style={{
              borderLeft: '4px solid var(--color-accent-primary, #7dd3fc)',
              padding: '0.5rem 0 0.5rem 0.85rem',
              margin: '1rem 0',
              background: 'color-mix(in srgb, var(--color-accent-primary, #7dd3fc) 8%, transparent)',
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic',
            }}
            {...props}
          />
        ),
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          return isInline ? (
            <code
              style={{
                background: 'color-mix(in srgb, var(--color-bg-overlay, rgba(255,255,255,0.08)) 100%, transparent)',
                color: 'var(--color-accent-primary, #7dd3fc)',
                padding: '0.12rem 0.32rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85em',
                fontWeight: 700,
              }}
              {...props}
            >
              {children}
            </code>
          ) : (
            <pre
              style={{
                background: 'color-mix(in srgb, var(--color-bg-overlay, rgba(255,255,255,0.08)) 100%, transparent)',
                color: 'var(--color-text-primary, #f0f0f7)',
                padding: '0.95rem',
                borderRadius: '10px',
                overflowX: 'auto',
                margin: '0.85rem 0',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85em',
              }}
            >
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
        img: ({ node, ...props }) => (
          <img
            loading="lazy"
            decoding="async"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '12px',
              margin: '0.9rem 0',
              display: 'block',
            }}
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

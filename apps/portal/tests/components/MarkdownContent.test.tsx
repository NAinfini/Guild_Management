import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownContent } from '@/components/MarkdownContent';

describe('MarkdownContent', () => {
  it('renders markdown formatting for rich descriptions', () => {
    render(<MarkdownContent content={'Event **Briefing**'} />);

    const bold = screen.getByText('Briefing');
    expect(bold.tagName.toLowerCase()).toBe('strong');
  });

  it('shows fallback text when content is empty', () => {
    render(<MarkdownContent content={''} fallback='No description' />);

    expect(screen.getByText('No description')).toBeInTheDocument();
  });
});

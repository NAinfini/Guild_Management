import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TiptapEditor } from '@/components/input/TiptapEditor';

describe('TiptapEditor image insertion', () => {
  it('uses onImageUpload handler instead of URL prompt when provided', async () => {
    const onChange = vi.fn();
    const onImageUpload = vi.fn().mockResolvedValue('https://cdn.example.com/uploaded-image.png');
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://cdn.example.com/prompt-image.png');

    const { container } = render(
      <TiptapEditor content="" onChange={onChange} onImageUpload={onImageUpload} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }));

    const fileInput = container.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement | null;
    expect(fileInput).toBeTruthy();
    const file = new File(['fake-image-data'], 'sample.png', { type: 'image/png' });
    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImageUpload).toHaveBeenCalledTimes(1);
    });
    expect(onImageUpload).toHaveBeenCalledWith(file);
    expect(promptSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const latestHtml = String(onChange.mock.calls.at(-1)?.[0] ?? '');
      expect(latestHtml).toContain('uploaded-image.png');
    });
  });

  it('falls back to URL prompt when onImageUpload is not provided', () => {
    const onChange = vi.fn();
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://cdn.example.com/from-prompt.png');

    render(<TiptapEditor content="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }));
    expect(promptSpy).toHaveBeenCalledTimes(1);
  });
});


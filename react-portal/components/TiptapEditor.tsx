/**
 * Tiptap Rich Text Editor Component
 * Modern WYSIWYG editor with markdown shortcuts, image paste, and custom toolbar
 */

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>; // Returns image URL
  minHeight?: number;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  onImageUpload,
  minHeight = 200,
}: TiptapEditorProps) {
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
      handlePaste: async (view, event) => {
        // Handle image paste
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));

        if (imageItem && onImageUpload) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            try {
              const url = await onImageUpload(file);
              editor?.chain().focus().setImage({ src: url }).run();
            } catch (error) {
              console.error('Image upload failed:', error);
            }
          }
          return true;
        }
        return false;
      },
    },
  });

  const handleImageClick = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleLinkClick = useCallback(() => {
    const url = window.prompt('Enter link URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon: Icon,
    tooltip,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: any;
    tooltip: string;
  }) => (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        size="small"
        sx={{
          borderRadius: 1,
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          color: isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            bgcolor: isActive
              ? alpha(theme.palette.primary.main, 0.2)
              : alpha(theme.palette.action.hover, 0.5),
          },
        }}
      >
        <Icon size={18} />
      </IconButton>
    </Tooltip>
  );

  const charCount = editor.storage.characterCount?.characters() || 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        '& .tiptap-editor': {
          minHeight,
          p: 2,
          outline: 'none',
          '& p': { my: 0.5 },
          '& h1': { fontSize: '2rem', fontWeight: 700, mt: 2, mb: 1 },
          '& h2': { fontSize: '1.5rem', fontWeight: 700, mt: 1.5, mb: 0.75 },
          '& h3': { fontSize: '1.25rem', fontWeight: 700, mt: 1, mb: 0.5 },
          '& ul, & ol': { pl: 3, my: 1 },
          '& li': { my: 0.25 },
          '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 1 },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline',
            '&:hover': { textDecoration: 'none' },
          },
          '& code': {
            bgcolor: alpha(theme.palette.text.primary, 0.08),
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '& .ProseMirror-focused': {
            outline: 'none',
          },
        },
        '& .is-editor-empty:first-child::before': {
          color: 'text.disabled',
          content: 'attr(data-placeholder)',
          float: 'left',
          height: 0,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.default, 0.5),
          p: 1,
        }}
      >
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
            tooltip="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
            tooltip="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={UnderlineIcon}
            tooltip="Underline (Ctrl+U)"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            tooltip="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            tooltip="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            tooltip="Heading 3"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
            tooltip="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            tooltip="Numbered List"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Media */}
          <ToolbarButton
            onClick={handleLinkClick}
            isActive={editor.isActive('link')}
            icon={Link2}
            tooltip="Insert Link"
          />
          <ToolbarButton
            onClick={handleImageClick}
            icon={ImageIcon}
            tooltip="Insert Image"
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={Undo2}
            tooltip="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={Redo2}
            tooltip="Redo (Ctrl+Y)"
          />
        </Stack>
      </Box>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Footer with character count */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.default, 0.3),
          px: 2,
          py: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {charCount} characters
        </Typography>
      </Box>
    </Paper>
  );
}

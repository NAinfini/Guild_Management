import React, { useCallback } from 'react';
import { cn } from "@/lib/utils";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button } from '../button/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../feedback/Tooltip';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CodeIcon from '@mui/icons-material/Code';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import InsertLinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ImageIcon from '@mui/icons-material/Image';
import RemoveIcon from '@mui/icons-material/Remove';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TerminalIcon from '@mui/icons-material/Terminal';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

interface MenuBarProps {
  editor: Editor | null;
}

const MenuButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  children,
  tooltip 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  tooltip: string;
}) => (
  <Tooltip content={tooltip}>
    <span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 p-0",
          active && "bg-accent text-accent-foreground"
        )}
      >
        {children}
      </Button>
    </span>
  </Tooltip>
);

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  const addLink = useCallback(() => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-0.5 p-1 border-b bg-background/50 sticky top-0 z-10">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        tooltip="Bold"
      >
        <FormatBoldIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        tooltip="Italic"
      >
        <FormatItalicIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        tooltip="Strike"
      >
        <StrikethroughSIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        tooltip="Code"
      >
        <CodeIcon sx={{ fontSize: 18 }} />
      </MenuButton>

      <div className="w-px h-4 bg-border mx-1 self-center" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        tooltip="H1"
      >
        <LooksOneIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        tooltip="H2"
      >
        <LooksTwoIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        tooltip="H3"
      >
        <Looks3Icon sx={{ fontSize: 18 }} />
      </MenuButton>

      <div className="w-px h-4 bg-border mx-1 self-center" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        tooltip="Bullet List"
      >
        <FormatListBulletedIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        tooltip="Ordered List"
      >
        <FormatListNumberedIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        tooltip="Quote"
      >
        <FormatQuoteIcon sx={{ fontSize: 18 }} />
      </MenuButton>

      <div className="w-px h-4 bg-border mx-1 self-center" />

      <MenuButton
        onClick={addLink}
        active={editor.isActive('link')}
        tooltip="Add Link"
      >
        <InsertLinkIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        tooltip="Remove Link"
      >
        <LinkOffIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={addImage}
        tooltip="Add Image"
      >
        <ImageIcon sx={{ fontSize: 18 }} />
      </MenuButton>

      <div className="w-px h-4 bg-border mx-1 self-center" />

      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        tooltip="Undo"
      >
        <UndoIcon sx={{ fontSize: 18 }} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        tooltip="Redo"
      >
        <RedoIcon sx={{ fontSize: 18 }} />
      </MenuButton>
    </div>
  );
};

export function TiptapEditor({ 
  content, 
  onChange,
  className,
  placeholder = "Write something..."
}: { 
  content: string; 
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
          className
        ),
      },
    },
  });

  return (
    <div className="border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

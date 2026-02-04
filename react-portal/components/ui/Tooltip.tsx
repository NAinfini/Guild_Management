import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover border border-border rounded-lg text-[10px] font-medium leading-relaxed shadow-xl z-[100] animate-in fade-in zoom-in-95",
          className
        )}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}
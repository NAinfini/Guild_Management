import React from 'react';
import { Search, Visibility, VisibilityOff, Lock, Mail, Close } from '@mui/icons-material';
import { Input, Textarea, Label } from '@/components/input';

export interface TextInputProps {
  className?: string;
}

export function TextInputShowcase({ className = '' }: TextInputProps) {
  return (
    <div className={className}>
      <h2 className="mb-6 text-xl font-semibold">2. Text Input</h2>
      
      <div className="grid gap-8">
        {/* Basic Text Input States */}
        <div>
          <h3 className="mb-4 text-sm font-medium opacity-70">Text Input States</h3>
          <div className="grid gap-4 max-w-[400px]">
            <div className="grid gap-2">
              <Label>Default state</Label>
              <Input 
                type="text"
                placeholder="Default state"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Hover state</Label>
              <Input 
                type="text"
                placeholder="Hover state"
                className="hover:border-primary/50"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Focus state</Label>
              <Input 
                type="text"
                placeholder="Focus state"
                defaultValue="Focused"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Disabled state</Label>
              <Input 
                type="text"
                placeholder="Disabled state"
                disabled
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Error state</Label>
              <Input 
                type="text"
                defaultValue="Error state"
                className="border-destructive focus-visible:ring-destructive"
              />
            </div>
          </div>
        </div>

        {/* Specialized Input Types */}
        <div>
          <h3 className="mb-4 text-sm font-medium opacity-70">Input Types</h3>
          <div className="grid gap-4 max-w-[400px]">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="email"
                placeholder="Email address"
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="password"
                placeholder="Password"
                className="pl-10 pr-10"
              />
              <Visibility className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <h3 className="mb-4 text-sm font-medium opacity-70">Textarea</h3>
          <div className="grid gap-4 max-w-[400px]">
             <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Enter multiple lines of text..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Token/Tag Input */}
        <div>
          <h3 className="mb-4 text-sm font-medium opacity-70">Token / Tag Input</h3>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-transparent max-w-[400px] min-h-[42px]">
            {['React', 'TypeScript', 'CSS'].map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-sm border border-secondary"
              >
                {tag}
                <Close className="h-3.5 w-3.5 cursor-pointer hover:text-foreground" />
              </span>
            ))}
            <input 
              type="text"
              placeholder="Add tag..."
              className="flex-1 bg-transparent outline-none min-w-[100px] px-1 text-sm"
            />
          </div>
        </div>

        {/* Autocomplete */}
        <div>
          <h3 className="mb-4 text-sm font-medium opacity-70">Autocomplete</h3>
          <div className="relative max-w-[400px]">
            <Input 
              type="text"
              defaultValue="TextFields"
              placeholder="Start typing..."
              className="rounded-b-none border-b-0 focus-visible:ring-0"
            />
            <div className="absolute top-full left-0 right-0 bg-popover border border-t-0 rounded-b-md shadow-md z-10 overflow-hidden">
              {['TypeScript', 'Typography', 'TextFields System'].map(item => (
                <div 
                  key={item}
                  className={`px-4 py-3 cursor-pointer text-sm border-b last:border-b-0 hover:bg-accent hover:text-accent-foreground ${item === 'TypeScript' ? 'bg-accent/50' : ''}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


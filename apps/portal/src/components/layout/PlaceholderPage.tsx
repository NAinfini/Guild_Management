
import React from 'react';

type PlaceholderPageProps = {
  title: string;
  description?: string;
  icon?: React.ElementType; 
  className?: string;
};

export function PlaceholderPage({ title, description, icon: Icon, className }: PlaceholderPageProps) {
  return (
    <div className={className} style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
        {Icon && <Icon className="w-12 h-12 opacity-20 text-muted-foreground" />}
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            {description}
          </p>
        )}
    </div>
  );
}

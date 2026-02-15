import React from 'react';
import { Save, Close, RotateLeft, ExpandMore, Add } from '@/ui-bridge/icons-material';
import { Button } from '@/components/button';

export interface ButtonDemoProps {
  className?: string;
}

export function ButtonsShowcase({ className = '' }: ButtonDemoProps) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>1. Buttons</h2>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Primary Button States */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Primary Button</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button>Default</Button>
            <Button className="bg-accent-primary-hover border-accent-primary-hover">Hover</Button>
            <Button className="bg-accent-primary-active border-accent-primary-active">Active</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        {/* Secondary Button States */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Secondary Button</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="outline">Default</Button>
            <Button variant="outline" className="text-accent-primary-hover border-accent-primary-hover bg-accent-primary-subtle">Hover</Button>
            <Button variant="outline" className="text-accent-primary-active border-accent-primary-active bg-accent-primary-subtle">Active</Button>
          </div>
        </div>

        {/* Since Ghost/Link variants aren't explicitly in the original showcase but are standard, we could add them, 
            but for now strict parity with the "Icon Buttons" section which used icon + transparent bg 
        */}

        {/* Icon Buttons */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Icon Buttons</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="icon">
              <Save sx={{ width: 20, height: 20 }} />
            </Button>
            
            <Button size="icon" variant="ghost">
              <Close sx={{ width: 20, height: 20 }} />
            </Button>
            
            <Button size="icon" variant="ghost">
              <RotateLeft sx={{ width: 20, height: 20 }} />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Action Buttons</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button className="bg-status-success border-status-success hover:bg-status-success/90">
              <Save sx={{ width: 16, height: 16, mr: 1 }} />
              Submit
            </Button>
            
            <Button variant="destructive">
              <Close sx={{ width: 16, height: 16, mr: 1 }} />
              Cancel
            </Button>
            
            <Button variant="ghost">
              <RotateLeft sx={{ width: 16, height: 16, mr: 1 }} />
              Reset
            </Button>
          </div>
        </div>

        {/* Split Button - Leveraging ButtonGroup-like styling manually for now */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Split Button</h3>
          <div style={{ display: 'inline-flex', gap: '0' }}>
            <Button className="rounded-r-none border-r-0">
              Save
            </Button>
            <Button className="rounded-l-none px-3">
              <ExpandMore sx={{ width: 16, height: 16 }} />
            </Button>
          </div>
        </div>

        {/* Floating Action Button - simulating with large rounded icon button */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Floating Action Button</h3>
          <Button 
            className="rounded-full w-14 h-14 p-0 shadow-lg"
          >
            <Add sx={{ width: 24, height: 24 }} />
          </Button>
        </div>

        {/* Toggle Button States - simulating with variant changes */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Toggle Button</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="outline">Off</Button>
            <Button>On</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


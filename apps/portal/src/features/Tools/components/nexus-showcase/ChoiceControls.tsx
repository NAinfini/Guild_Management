import React from 'react';
import { Check } from '@/ui-bridge/icons-material';

export interface ChoiceControlsProps {
  className?: string;
}

export function ChoiceControlsShowcase({ className = '' }: ChoiceControlsProps) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>3. Choice Controls (Single / Multiple)</h2>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Checkbox */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Checkbox</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Unchecked', checked: false },
              { label: 'Checked', checked: true },
              { label: 'Disabled', checked: false, disabled: true },
              { label: 'Checked Disabled', checked: true, disabled: true }
            ].map((item, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: item.disabled ? 'not-allowed' : 'pointer' }}>
                <div 
                  className="control"
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: item.checked ? 'var(--color-accent-primary)' : 'var(--color-surface-default)',
                    border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                    borderRadius: 'calc(var(--theme-border-radius) / 2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: item.disabled ? 0.5 : 1
                  }}
                >
                  {item.checked && <Check sx={{ width: 14, height: 14, color: 'var(--color-text-inverse)' }} />}
                </div>
                <span style={{ color: item.disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)' }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Radio Button */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Radio Button</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Option 1', checked: true },
              { label: 'Option 2', checked: false },
              { label: 'Option 3', checked: false }
            ].map((item, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div 
                  className="control"
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'var(--color-surface-default)',
                    border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.checked && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: 'var(--color-accent-primary)',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Toggle Switch */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Toggle Switch</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Off', checked: false },
              { label: 'On', checked: true },
              { label: 'Disabled Off', checked: false, disabled: true },
              { label: 'Disabled On', checked: true, disabled: true }
            ].map((item, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: item.disabled ? 'not-allowed' : 'pointer' }}>
                <div 
                  className="control"
                  style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: item.checked ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
                    border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                    borderRadius: '12px',
                    position: 'relative',
                    opacity: item.disabled ? 0.5 : 1
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    transform: `translate(${item.checked ? '26px' : '3px'}, -50%)`,
                    transition: 'transform var(--theme-duration) var(--theme-easing)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span style={{ color: item.disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)' }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Segmented Control */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Segmented Control</h3>
          <div 
            className="control"
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-bg-secondary)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              padding: '4px'
            }}
          >
            {['Day', 'Week', 'Month'].map((item, idx) => (
              <button
                key={item}
                style={{
                  padding: '8px 16px',
                  backgroundColor: idx === 1 ? 'var(--color-surface-elevated)' : 'transparent',
                  color: idx === 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  border: idx === 1 ? 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)' : 'none',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  cursor: 'pointer',
                  fontWeight: idx === 1 ? 500 : 400,
                  boxShadow: idx === 1 ? 'var(--theme-shadow-sm)' : 'none'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Button Group */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Button Group</h3>
          <div style={{ display: 'inline-flex', gap: '0' }}>
            {['Left', 'Center', 'Right'].map((item, idx) => (
              <button
                key={item}
                className="control"
                style={{
                  padding: '12px 20px',
                  backgroundColor: idx === 1 ? 'var(--color-accent-primary)' : 'var(--color-surface-default)',
                  color: idx === 1 ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  borderRadius: idx === 0 ? 'var(--theme-border-radius) 0 0 var(--theme-border-radius)' : 
                               idx === 2 ? '0 var(--theme-border-radius) var(--theme-border-radius) 0' : '0',
                  borderLeft: idx > 0 ? 'none' : undefined,
                  cursor: 'pointer'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Chips / Pills */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Chips / Pills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { label: 'Default', active: false },
              { label: 'Selected', active: true },
              { label: 'With Icon', active: true, icon: true }
            ].map((item, idx) => (
              <div
                key={idx}
                className="control"
                style={{
                  padding: '8px 16px',
                  backgroundColor: item.active ? 'var(--color-accent-primary)' : 'var(--color-surface-default)',
                  color: item.active ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                {item.label}
                {item.icon && <Check sx={{ width: 14, height: 14 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Listbox */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Listbox</h3>
          <div 
            className="control"
            style={{
              width: '240px',
              backgroundColor: 'var(--color-surface-default)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              overflow: 'hidden',
              padding: '4px'
            }}
          >
            {['Account', 'Notifications', 'Appearance', 'Privacy'].map((item, idx) => (
              <div 
                key={item}
                style={{
                  padding: '8px 12px',
                  backgroundColor: idx === 2 ? 'var(--color-accent-primary)' : 'transparent',
                  color: idx === 2 ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: idx === 2 ? 500 : 400
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

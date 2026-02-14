import React from 'react';
import { ExpandMore, Check, Search, SentimentSatisfiedAlt, Favorite, Star, WbSunny, DarkMode, Cloud } from '@mui/icons-material';

export interface DropdownSelectProps {
  className?: string;
}

export function DropdownSelectShowcase({ className = '' }: DropdownSelectProps) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>4. Dropdown / Select</h2>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Select Dropdown */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Select</h3>
          <div style={{ maxWidth: '300px' }}>
            <div 
              className="control"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>Select an option</span>
              <ExpandMore sx={{ width: 16, height: 16 }} />
            </div>
          </div>
        </div>

        {/* Select with Dropdown Open */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Select (Open State)</h3>
          <div style={{ maxWidth: '300px', position: 'relative' }}>
            <div 
              className="control"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderRadius: 'var(--theme-border-radius)',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>Option 2</span>
              <ExpandMore sx={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
            </div>
            <div 
              className="control"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-surface-elevated)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderTop: 'none',
                borderRadius: '0 0 var(--theme-border-radius) var(--theme-border-radius)',
                boxShadow: 'var(--theme-shadow-md)',
                zIndex: 10
              }}
            >
              {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((opt, idx) => (
                <div
                  key={opt}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: idx === 1 ? 'var(--color-accent-primary-subtle)' : 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: idx < 3 ? '1px solid var(--color-border-subtle)' : 'none'
                  }}
                >
                  {opt}
                  {idx === 1 && <Check sx={{ width: 16, height: 16, color: "var(--color-accent-primary)" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Select */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Multi-Select</h3>
          <div style={{ maxWidth: '300px', position: 'relative' }}>
            <div 
              className="control"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderRadius: 'var(--theme-border-radius)',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>2 selected</span>
              <ExpandMore sx={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
            </div>
            <div 
              className="control"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-surface-elevated)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderTop: 'none',
                borderRadius: '0 0 var(--theme-border-radius) var(--theme-border-radius)',
                boxShadow: 'var(--theme-shadow-md)',
                zIndex: 10
              }}
            >
              {[
                { name: 'Apple', checked: true },
                { name: 'Banana', checked: false },
                { name: 'Cherry', checked: true },
                { name: 'Date', checked: false }
              ].map((opt, idx) => (
                <label
                  key={opt.name}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: opt.checked ? 'var(--color-accent-primary-subtle)' : 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: idx < 3 ? '1px solid var(--color-border-subtle)' : 'none'
                  }}
                >
                  <div 
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: opt.checked ? 'var(--color-accent-primary)' : 'transparent',
                      border: '2px solid var(--color-border-default)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {opt.checked && <Check sx={{ width: 12, height: 12, color: "var(--color-text-inverse)" }} />}
                  </div>
                  {opt.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Combobox (Searchable Select) */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Combobox</h3>
          <div style={{ maxWidth: '300px', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input 
                className="control"
                type="text"
                value="Sea"
                placeholder="Search..."
                style={{
                  padding: '12px 40px 12px 16px',
                  width: '100%',
                  backgroundColor: 'var(--color-surface-default)',
                  color: 'var(--color-text-primary)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                  borderRadius: 'var(--theme-border-radius)',
                  borderBottomLeftRadius: '0',
                  borderBottomRightRadius: '0'
                }}
                readOnly
              />
              <Search sx={{ width: 16, height: 16 }} style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)'
              }} />
            </div>
            <div 
              className="control"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-surface-elevated)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderTop: 'none',
                borderRadius: '0 0 var(--theme-border-radius) var(--theme-border-radius)',
                boxShadow: 'var(--theme-shadow-md)',
                maxHeight: '200px',
                overflow: 'auto',
                zIndex: 10
              }}
            >
              {['Search', 'Seal', 'Season', 'Seattle'].map((opt, idx) => (
                <div
                  key={opt}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: idx === 0 ? 'var(--color-accent-primary-subtle)' : 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    borderBottom: idx < 3 ? '1px solid var(--color-border-subtle)' : 'none'
                  }}
                >
                  <span>
                    <strong>{opt.substring(0, 3)}</strong>{opt.substring(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Color Picker</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div 
              className="control"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--color-accent-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer'
              }}
            />
            <div 
              className="control"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                fontFamily: 'monospace',
                minWidth: '120px'
              }}
            >
              var(--color-accent-primary)
            </div>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Icon Picker</h3>
          <div style={{ maxWidth: '300px', position: 'relative' }}>
            <div 
              className="control"
              style={{
                padding: '12px',
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <SentimentSatisfiedAlt sx={{ width: 20, height: 20 }} />
            </div>
            <div 
              className="control"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                backgroundColor: 'var(--color-surface-elevated)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                boxShadow: 'var(--theme-shadow-md)',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                zIndex: 10
              }}
            >
              {[SentimentSatisfiedAlt, Favorite, Star, WbSunny, DarkMode, Cloud, Check, Search].map((Icon, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px',
                    borderRadius: 'calc(var(--theme-border-radius) / 2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: idx === 0 ? 'var(--color-accent-primary-subtle)' : 'transparent',
                  }}
                >
                  <Icon sx={{ width: 20, height: 20, color: idx === 0 ? 'var(--color-accent-primary)' : 'var(--color-text-primary)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

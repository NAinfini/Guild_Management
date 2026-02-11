// Additional control categories: Search/FilterList, Accessibility

import React from 'react';
import { Search, FilterList, Tune, Close, ArrowUpward, ArrowDownward, Bookmark, Visibility, TextFields, VolumeUp, VolumeDown, VolumeOff, Keyboard } from '@mui/icons-material';

// Category 10: Search / FilterList / Sort
export function SearchFilterShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>10. Search / FilterList / Sort</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Search Input with Filters</h3>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search sx={{ width: 18, height: 18 }} style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)'
              }} />
              <input 
                className="control"
                type="text"
                placeholder="Search products..."
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 48px',
                  backgroundColor: 'var(--color-surface-default)',
                  color: 'var(--color-text-primary)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  borderRadius: 'var(--theme-border-radius)',
                  fontSize: '14px'
                }}
              />
              <button style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FilterList sx={{ width: 18, height: 18 }} />
              </button>
            </div>
            
            {/* Active Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Category: Electronics', 'Price: $100-$500', 'Rating: 4+'].map((filter, idx) => (
                <div 
                  key={idx}
                  className="control"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'var(--color-accent-primary-subtle)',
                    color: 'var(--color-accent-primary)',
                    border: '1px solid var(--color-accent-primary)',
                    borderRadius: 'calc(var(--theme-border-radius) / 2)',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {filter}
                  <Close sx={{ width: 14, height: 14, cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>FilterList Panel</h3>
          <div 
            className="control"
            style={{
              maxWidth: '300px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Tune sx={{ width: 18, height: 18 }} />
                Filters
              </div>
              <button style={{
                padding: '4px 12px',
                backgroundColor: 'transparent',
                color: 'var(--color-text-link)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Clear all
              </button>
            </div>

            {/* Category FilterList */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Category</div>
              {['Electronics', 'Clothing', 'Books'].map((cat, idx) => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: idx === 0 ? 'var(--color-accent-primary)' : 'transparent',
                    border: '2px solid var(--color-border-default)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {idx === 0 && <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-text-inverse)', borderRadius: '2px' }} />}
                  </div>
                  <span style={{ fontSize: '14px' }}>{cat}</span>
                </label>
              ))}
            </div>

            {/* Price Range */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Price Range</div>
              <div style={{ height: '4px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '2px', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '20%',
                  right: '30%',
                  top: 0,
                  bottom: 0,
                  backgroundColor: 'var(--color-accent-primary)',
                  borderRadius: '2px'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <span>$100</span>
                <span>$500</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Sort Control</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              className="control"
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              Sort by: Price
              <ArrowUpward sx={{ width: 14, height: 14 }} />
            </button>
            
            <button 
              className="control"
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Newest First
              <ArrowDownward sx={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Saved Filters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
            {['My Favorites', 'Recently Viewed', 'On Sale'].map((saved, idx) => (
              <div 
                key={idx}
                className="control"
                style={{
                  padding: '12px 16px',
                  backgroundColor: idx === 0 ? 'var(--color-accent-primary-subtle)' : 'var(--color-surface-default)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--theme-border-radius)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Bookmark sx={{ width: 16, height: 16, color: idx === 0 ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)' }} />
                {saved}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Category 16: Assistive / Accessibility Control
export function AccessibilityShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>16. Assistive / Accessibility Control</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Skip Link</h3>
          <button 
            className="control"
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)',
              border: '2px solid var(--color-accent-primary)',
              borderRadius: 'var(--theme-border-radius)',
              cursor: 'pointer',
              fontWeight: 500,
              outline: '3px solid var(--color-accent-primary-subtle)',
              outlineOffset: '2px'
            }}
          >
            Skip to main content
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Keyboard Shortcut Indicator</h3>
          <div 
            className="control"
            style={{
              padding: '14px 20px',
              maxWidth: '400px',
              backgroundColor: 'var(--color-surface-default)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Keyboard sx={{ width: 20, height: 20, color: "var(--color-text-tertiary)" }} />
              <span>Save Document</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['Ctrl', 'S'].map(key => (
                <kbd 
                  key={key}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'calc(var(--theme-border-radius) / 2)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 600
                  }}
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Focus Indicator</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              className="control"
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                outline: '3px solid var(--color-accent-primary-subtle)',
                outlineOffset: '3px'
              }}
            >
              Focused Button
            </button>
            <input 
              className="control"
              type="text"
              value="Focused Input"
              readOnly
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderRadius: 'var(--theme-border-radius)',
                outline: '3px solid var(--color-accent-primary-subtle)',
                outlineOffset: '2px',
                minWidth: '200px'
              }}
            />
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Font Size Toggle</h3>
          <div 
            className="control"
            style={{
              display: 'inline-flex',
              gap: '0',
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '4px',
              borderRadius: 'var(--theme-border-radius)'
            }}
          >
            {['A', 'A', 'A'].map((size, idx) => (
              <button 
                key={idx}
                style={{
                  padding: '8px 16px',
                  backgroundColor: idx === 1 ? 'var(--color-accent-primary)' : 'transparent',
                  color: idx === 1 ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: 'none',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  cursor: 'pointer',
                  fontSize: idx === 0 ? '12px' : idx === 1 ? '16px' : '20px',
                  fontWeight: 600
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>High Contrast Mode Toggle</h3>
          <button 
            className="control"
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-surface-default)',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--color-text-primary)',
              borderRadius: 'var(--theme-border-radius)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 500
            }}
          >
            <Visibility sx={{ width: 18, height: 18 }} />
            Enable High Contrast
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Text-to-Speech Control</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="control"
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 500
              }}
            >
              <VolumeUp sx={{ width: 18, height: 18 }} />
              Read Aloud
            </button>
            <button 
              className="control"
              style={{
                padding: '12px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <VolumeDown sx={{ width: 18, height: 18 }} />
            </button>
            <button 
              className="control"
              style={{
                padding: '12px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <VolumeOff sx={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Screen Reader Announcement</h3>
          <div 
            className="control"
            style={{
              padding: '16px',
              maxWidth: '500px',
              backgroundColor: 'var(--color-status-info-bg)',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--color-status-info)',
              borderRadius: 'var(--theme-border-radius)',
              fontSize: '14px'
            }}
            role="status"
            aria-live="polite"
          >
            <strong>Announcement:</strong> Your changes have been saved. This message will be read by screen readers.
          </div>
        </div>
      </div>
    </div>
  );
}


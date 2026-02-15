import React from 'react';
import { Home, Settings, Person, ChevronRight, ChevronLeft } from '@/ui-bridge/icons-material';

export interface NavigationProps {
  className?: string;
}

export function NavigationShowcase({ className = '' }: NavigationProps) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>7. Navigation</h2>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Link */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Link States</h3>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <a 
              href="#"
              style={{
                color: 'var(--color-text-link)',
                textDecoration: 'none'
              }}
            >
              Default Link
            </a>
            <a 
              href="#"
              style={{
                color: 'var(--color-accent-primary-hover)',
                textDecoration: 'underline'
              }}
            >
              Hover Link
            </a>
            <a 
              href="#"
              style={{
                color: 'var(--color-text-tertiary)',
                textDecoration: 'none',
                cursor: 'not-allowed'
              }}
            >
              Disabled Link
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Tabs</h3>
          <div 
            className="control"
            style={{
              display: 'inline-flex',
              borderBottom: '2px solid var(--color-border-default)'
            }}
          >
            {['Overview', 'Details', 'Settings'].map((tab, idx) => (
              <button
                key={tab}
                className="control"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: idx === 0 ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderBottom: idx === 0 ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: idx === 0 ? 600 : 400,
                  marginBottom: '-2px'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Breadcrumbs */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Breadcrumbs</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: 'var(--color-text-link)', textDecoration: 'none' }}>
              Home
            </a>
            <ChevronRight sx={{ width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
            <a href="#" style={{ color: 'var(--color-text-link)', textDecoration: 'none' }}>
              Products
            </a>
            <ChevronRight sx={{ width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
            <a href="#" style={{ color: 'var(--color-text-link)', textDecoration: 'none' }}>
              Electronics
            </a>
            <ChevronRight sx={{ width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Laptop
            </span>
          </div>
        </div>

        {/* Menu */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Menu</h3>
          <div 
            className="control"
            style={{
              width: '240px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              boxShadow: 'var(--theme-shadow-md)',
              overflow: 'hidden'
            }}
          >
            {[
              { icon: Home, label: 'Home', active: true },
              { icon: Person, label: 'Profile', active: false },
              { icon: Settings, label: 'Settings', active: false }
            ].map((item, idx) => (
              <div
                key={item.label}
                style={{
                  padding: '12px 16px',
                  backgroundColor: item.active ? 'var(--color-accent-primary-subtle)' : 'transparent',
                  color: item.active ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: idx < 2 ? '1px solid var(--color-border-subtle)' : 'none',
                  fontWeight: item.active ? 500 : 400
                }}
              >
                <item.icon sx={{ width: 18, height: 18 }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Pagination</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="control"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-secondary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft sx={{ width: 16, height: 16 }} />
            </button>
            
            {[1, 2, 3, '...', 10].map((page, idx) => (
              <button 
                key={idx}
                className="control"
                style={{
                  minWidth: '36px',
                  height: '36px',
                  padding: '0 12px',
                  backgroundColor: idx === 1 ? 'var(--color-accent-primary)' : 'var(--color-surface-default)',
                  color: idx === 1 ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  borderRadius: 'var(--theme-border-radius)',
                  cursor: page === '...' ? 'default' : 'pointer',
                  fontWeight: idx === 1 ? 600 : 400
                }}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="control"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight sx={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Sidebar / Drawer Preview */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Sidebar / Drawer</h3>
          <div 
            className="control"
            style={{
              width: '280px',
              height: '320px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              boxShadow: 'var(--theme-shadow-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{
              padding: '12px',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              borderBottom: '1px solid var(--color-border-subtle)',
              marginBottom: '8px'
            }}>
              Navigation
            </div>
            {[
              { icon: Home, label: 'Dashboard', active: true },
              { icon: Person, label: 'Users', active: false },
              { icon: Settings, label: 'Settings', active: false }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  backgroundColor: item.active ? 'var(--color-accent-primary)' : 'transparent',
                  color: item.active ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: item.active ? 500 : 400
                }}
              >
                <item.icon sx={{ width: 18, height: 18 }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { ErrorOutline, CheckCircle, Info, Close, WarningAmber } from '@/ui-bridge/icons-material';

export interface FeedbackProps {
  className?: string;
}

export function FeedbackShowcase({ className = '' }: FeedbackProps) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>9. Feedback / Status</h2>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Alerts */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Alerts</h3>
          <div style={{ display: 'grid', gap: '12px', maxWidth: '600px' }}>
            {/* Success Alert */}
            <div 
              className="control"
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-status-success-bg)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-status-success)',
                borderRadius: 'var(--theme-border-radius)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <CheckCircle sx={{ width: 20, height: 20, color: "var(--color-status-success)" }} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Success!</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Your changes have been saved successfully.</div>
              </div>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text-primary)',
                flexShrink: 0
              }}>
                <Close sx={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Warning Alert */}
            <div 
              className="control"
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-status-warning-bg)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-status-warning)',
                borderRadius: 'var(--theme-border-radius)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <WarningAmber sx={{ width: 20, height: 20, color: "var(--color-status-warning)" }} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Warning</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>This action cannot be undone.</div>
              </div>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text-primary)',
                flexShrink: 0
              }}>
                <Close sx={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Error Alert */}
            <div 
              className="control"
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-status-error-bg)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-status-error)',
                borderRadius: 'var(--theme-border-radius)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <ErrorOutline sx={{ width: 20, height: 20, color: "var(--color-status-error)" }} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Error</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Failed to process request. Please try again.</div>
              </div>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text-primary)',
                flexShrink: 0
              }}>
                <Close sx={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Info Alert */}
            <div 
              className="control"
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-status-info-bg)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-status-info)',
                borderRadius: 'var(--theme-border-radius)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <Info sx={{ width: 20, height: 20, color: "var(--color-status-info)" }} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Info</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>New features are available. Check them out!</div>
              </div>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text-primary)',
                flexShrink: 0
              }}>
                <Close sx={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Toast / Snackbar */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Toast / Snackbar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              className="control"
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                boxShadow: 'var(--theme-shadow-lg)',
                display: 'inline-flex',
                gap: '12px',
                alignItems: 'center',
                maxWidth: 'fit-content'
              }}
            >
              <CheckCircle sx={{ width: 20, height: 20, color: "var(--color-status-success)" }} />
              <span>File uploaded successfully</span>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text-primary)',
                marginLeft: '8px'
              }}>
                <Close sx={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Banner</h3>
          <div 
            className="control"
            style={{
              padding: '16px 24px',
              backgroundColor: 'var(--color-accent-primary-subtle)',
              color: 'var(--color-text-primary)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
              borderLeft: '4px solid var(--color-accent-primary)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '800px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Info sx={{ width: 20, height: 20, color: "var(--color-accent-primary)" }} />
              <span>We've updated our privacy policy. Please review the changes.</span>
            </div>
            <button 
              className="control"
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'calc(var(--theme-border-radius) / 2)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Review
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Progress Indicator</h3>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Uploading files...</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>45%</span>
            </div>
            <div 
              className="control"
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: '45%',
                height: '100%',
                backgroundColor: 'var(--color-accent-primary)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Spinner */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Spinner</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div 
              className="control"
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--color-bg-secondary)',
                borderTopColor: 'var(--color-accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
          </div>
        </div>

        {/* Skeleton Loader */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Skeleton Loader</h3>
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              height: '20px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--theme-border-radius)',
              width: '100%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              height: '20px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--theme-border-radius)',
              width: '80%',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.2s'
            }} />
            <div style={{
              height: '20px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--theme-border-radius)',
              width: '60%',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.4s'
            }} />
          </div>
        </div>

        {/* Empty State */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Empty State</h3>
          <div 
            className="control"
            style={{
              padding: '48px 24px',
              maxWidth: '400px',
              backgroundColor: 'var(--color-surface-default)',
              border: '2px dashed var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Info sx={{ width: 32, height: 32, color: "var(--color-text-tertiary)" }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                No items found
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Get started by creating your first item
              </div>
            </div>
            <button 
              className="control"
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-accent-primary)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Create Item
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}


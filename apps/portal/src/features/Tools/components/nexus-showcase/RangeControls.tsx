import React from 'react';
import { Remove, Add, Star } from '@/ui-bridge/icons-material';

export interface RangeControlsProps {
  className?: string;
}

export function RangeControlsShowcase({ className = '' }: RangeControlsProps) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>5. Range / Value Adjuster</h2>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Slider */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Slider</h3>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Value: 60
            </div>
            <div 
              className="control"
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: '4px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '60%',
                backgroundColor: 'var(--color-accent-primary)',
                borderRadius: '4px 0 0 4px'
              }} />
              <div style={{
                position: 'absolute',
                left: '60%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--color-accent-primary)',
                border: '2px solid var(--color-surface-elevated)',
                borderRadius: '50%',
                boxShadow: 'var(--theme-shadow-sm)',
                cursor: 'grab'
              }} />
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Range Slider</h3>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Range: 30 - 75
            </div>
            <div 
              className="control"
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: '4px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute',
                left: '30%',
                right: '25%',
                top: 0,
                bottom: 0,
                backgroundColor: 'var(--color-accent-primary)',
                borderRadius: '4px'
              }} />
              <div style={{
                position: 'absolute',
                left: '30%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--color-accent-primary)',
                border: '2px solid var(--color-surface-elevated)',
                borderRadius: '50%',
                boxShadow: 'var(--theme-shadow-sm)',
                cursor: 'grab'
              }} />
              <div style={{
                position: 'absolute',
                left: '75%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--color-accent-primary)',
                border: '2px solid var(--color-surface-elevated)',
                borderRadius: '50%',
                boxShadow: 'var(--theme-shadow-sm)',
                cursor: 'grab'
              }} />
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Stepper / Spinner</h3>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}>
            <button 
              className="control"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius) 0 0 var(--theme-border-radius)',
                borderRight: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Remove sx={{ width: 16, height: 16 }} />
            </button>
            <div 
              className="control"
              style={{
                padding: '8px 20px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: '0',
                textAlign: 'center',
                minWidth: '60px',
                fontWeight: 500
              }}
            >
              42
            </div>
            <button 
              className="control"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: '0 var(--theme-border-radius) var(--theme-border-radius) 0',
                borderLeft: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Add sx={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Dial / Knob */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Dial / Knob</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div 
              className="control"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-default)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Dial indicator */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '4px',
                height: '40px',
                backgroundColor: 'var(--color-accent-primary)',
                transformOrigin: 'center top',
                transform: 'translate(-50%, -50%) rotate(135deg)',
                borderRadius: '2px'
              }} />
              {/* Center dot */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '12px',
                height: '12px',
                backgroundColor: 'var(--color-accent-primary)',
                borderRadius: '50%',
                border: '2px solid var(--color-surface-elevated)'
              }} />
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>Volume</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)' }}>65%</div>
            </div>
          </div>
        </div>

        {/* Rating Control */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Rating Control</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(rating => (
              <Star 
                key={rating}
                sx={{ 
                  fontSize: 28,
                  color: rating <= 3 ? 'var(--color-accent-primary)' : 'var(--color-border-default)',
                  cursor: 'pointer' 
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Meter / Gauge */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Meter / Gauge</h3>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Storage Used</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>7.5 / 10 GB</span>
            </div>
            <div 
              className="control"
              style={{
                width: '100%',
                height: '12px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: '75%',
                height: '100%',
                backgroundColor: 'var(--color-status-warning)',
                borderRadius: '6px 0 0 6px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Circular Progress */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Circular Gauge</h3>
          <div 
            className="control"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-default)',
              border: '8px solid var(--color-bg-secondary)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `conic-gradient(var(--color-accent-primary) 0deg 252deg, var(--color-bg-secondary) 252deg 360deg)`
            }}
          >
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)' }}>70%</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { Star, Edit, Add, ChevronLeft, ChevronRight, Share } from '@/ui-bridge/icons-material';

export function CardsShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>0. Cards (Adaptive Theme)</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'flex-start' }}>
        
        {/* Card 1: Profile / Dashboard */}
        <div 
          className="control"
          style={{
            width: '340px',
            backgroundColor: 'var(--color-surface-default)',
            border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            padding: '24px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg-secondary)'
              }}>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"
                  alt="Avatar"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>Sam Smith</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Always a winner!</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: 'var(--color-status-info-bg)',
                borderRadius: '20px',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: 'var(--theme-shadow-sm)'
              }}>
                <Star sx={{ width: 12, height: 12 }} /> 15 Stars
              </div>
              <button 
                className="control"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-primary)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--theme-shadow-sm)',
                  padding: 0
                }}>
                <Edit sx={{ width: 14, height: 14, color: "var(--color-text-inverse)" }} />
              </button>
            </div>
          </div>

          {/* Calendar Strip */}
          <div style={{
            border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            padding: '16px',
            backgroundColor: 'var(--color-surface-default)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <ChevronLeft sx={{ width: 20, height: 20, cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: 700 }}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <span key={d}>{d}</span>)}
              </div>
              <ChevronRight sx={{ width: 20, height: 20, cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 }}>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span style={{ 
                backgroundColor: 'var(--color-accent-primary)', 
                color: 'var(--color-text-inverse)', 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--color-border-default)'
              }}>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
            </div>
          </div>

          {/* Content Block */}
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800 }}>Design challenge 5</div>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(s => <Star key={s} sx={{ width: 12, height: 12 }} fill={s<4 ? "currentColor" : "transparent"} />)}
              </div>
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.4', fontWeight: 500 }}>
              We are going to design a CRM dashboard in dark theme. We will share it in our Dribbble!
            </p>
            
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)', overflow: 'hidden', backgroundColor: 'var(--color-surface-default)'
              }}>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sepideh"
                  alt="Person"
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>Sepideh Yazdi</div>
                <div style={{ fontSize: '10px', fontWeight: 500 }}>Start something that matters!</div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)', 
                borderRadius: 'var(--theme-border-radius)', 
                padding: '8px', 
                fontSize: '24px', 
                fontWeight: 800, 
                minWidth: '48px', 
                backgroundColor: 'var(--color-surface-default)', 
                boxShadow: 'var(--theme-shadow-sm)'
              }}>1</div>
              <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: 600, color: 'var(--color-accent-primary)' }}>Days</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-accent-primary)' }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)', 
                borderRadius: 'var(--theme-border-radius)', 
                padding: '8px', 
                fontSize: '24px', 
                fontWeight: 800, 
                minWidth: '48px', 
                backgroundColor: 'var(--color-surface-default)', 
                boxShadow: 'var(--theme-shadow-sm)'
              }}>15</div>
              <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: 600, color: 'var(--color-accent-primary)' }}>Hours</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-accent-primary)' }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)', 
                borderRadius: 'var(--theme-border-radius)', 
                padding: '8px', 
                fontSize: '24px', 
                fontWeight: 800, 
                minWidth: '48px', 
                backgroundColor: 'var(--color-surface-default)', 
                boxShadow: 'var(--theme-shadow-sm)'
              }}>32</div>
              <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: 600, color: 'var(--color-accent-primary)' }}>Minutes</div>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            className="control"
            style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            fontWeight: 800,
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: 'var(--theme-shadow-md)',
            textTransform: 'uppercase'
          }}>
            I'm Done!
          </button>

          {/* Floating Action */}
          <button 
            className="control"
            style={{
            position: 'absolute',
            bottom: '24px',
            right: '-24px',
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--color-bg-primary)',
            border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--theme-shadow-md)',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0
          }}>
            <Add sx={{ width: 32, height: 32 }} />
          </button>
        </div>

        {/* Card 2: Landing Page Style */}
        <div 
          className="control"
          style={{
            width: '320px',
            backgroundColor: 'var(--color-surface-default)',
            border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            overflow: 'hidden',
            boxShadow: 'var(--theme-shadow-lg)'
          }}
        >
          {/* Top Bar */}
          <div style={{ 
            backgroundColor: 'var(--color-accent-primary)', 
            borderBottom: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)', 
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-surface-default)', border: '1px solid var(--color-border-default)' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-surface-default)', border: '1px solid var(--color-border-default)' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-surface-default)', border: '1px solid var(--color-border-default)' }}></div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)', overflow: 'hidden', backgroundColor: 'var(--color-bg-secondary)'
            }}>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Felix"
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
              />
            </div>
            
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Visual System</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                This card adapts its border width, border radius, and shadows based on the selected visual theme.
              </p>
            </div>

            <div style={{
              width: '100%',
              height: '24px',
              backgroundColor: 'var(--color-bg-secondary)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '60%',
                backgroundColor: 'var(--color-accent-primary)',
                borderRight: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)'
              }}></div>
            </div>

            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <button 
                className="control"
                style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'var(--color-surface-default)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                fontWeight: 700,
                boxShadow: 'var(--theme-shadow-sm)',
                cursor: 'pointer'
              }}>
                Cancel
              </button>
              <button 
                className="control"
                style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'var(--color-bg-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                fontWeight: 700,
                boxShadow: 'var(--theme-shadow-sm)',
                cursor: 'pointer'
              }}>
                Confirm
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

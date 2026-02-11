// This file aggregates all control showcases and provides additional categories

import React from 'react';
import {
  Upload,
  Download,
  DragIndicator,
  OpenInFull,
  GridView,
  ViewList,
  ZoomIn,
  Undo,
  Redo,
  WbSunny,
  DarkMode,
  Public,
  Notifications,
  Person,
  Terminal,
  Mic,
  Message,
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  Image,
  MoreHoriz,
  AutoAwesome,
  ErrorOutline,
  ViewColumn,
  ChevronRight,
  ChevronLeft,
  Close,
  ExpandMore,
} from '@mui/icons-material';

// Category 6: Date & Time Picker
export function DateTimeShowcase({ className = '' }: { className?: string }) {
  const today = new Date();
  const daysInMonth = 31;
  
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>6. Date & Time Picker</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Date Picker</h3>
          <div 
            className="control"
            style={{
              width: '280px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              padding: '16px',
              boxShadow: 'var(--theme-shadow-md)'
            }}
          >
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
              February 2026
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', fontSize: '14px' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text-tertiary)', padding: '8px 0' }}>
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6;
                const isCurrentMonth = day > 0 && day <= 28;
                const isSelected = day === 9;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      backgroundColor: isSelected ? 'var(--color-accent-primary)' : 'transparent',
                      color: isSelected ? 'var(--color-text-inverse)' : isCurrentMonth ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                      borderRadius: 'calc(var(--theme-border-radius) / 2)',
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    {day > 0 && day <= 31 ? day : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Time Picker</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              className="control"
              type="text"
              value="14"
              readOnly
              style={{
                width: '60px',
                padding: '12px',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                fontSize: '18px',
                fontWeight: 600
              }}
            />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>:</span>
            <input 
              className="control"
              type="text"
              value="30"
              readOnly
              style={{
                width: '60px',
                padding: '12px',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                fontSize: '18px',
                fontWeight: 600
              }}
            />
            <div 
              className="control"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <button style={{
                padding: '4px 12px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'calc(var(--theme-border-radius) / 2)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}>
                PM
              </button>
              <button style={{
                padding: '4px 12px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'calc(var(--theme-border-radius) / 2)',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                AM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category 8: Disclosure / Container
export function DisclosureShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>8. Disclosure / Container</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Accordion</h3>
          <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Section 1', 'Section 2', 'Section 3'].map((section, idx) => (
              <div 
                key={section}
                className="control"
                style={{
                  backgroundColor: 'var(--color-surface-default)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  borderRadius: 'var(--theme-border-radius)',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 500,
                  backgroundColor: idx === 1 ? 'var(--color-accent-primary-subtle)' : 'transparent'
                }}>
                  {section}
                  <span style={{ transform: idx === 1 ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>
                {idx === 1 && (
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid var(--color-border-subtle)',
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)'
                  }}>
                    This is the expanded content for {section}.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Modal</h3>
          <div style={{
            position: 'relative',
            width: '400px',
            height: '300px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 'var(--theme-border-radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div 
              className="control"
              style={{
                width: '320px',
                backgroundColor: 'var(--color-surface-elevated)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                boxShadow: 'var(--theme-shadow-lg)',
                padding: '24px'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Modal Title</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                This is a modal dialog with important information.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="control" style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button className="control" style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Tooltip & Popover</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button className="control" style={{
                padding: '12px 24px',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer'
              }}>
                Tooltip
              </button>
              <div 
                className="control"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-8px)',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-text-primary)',
                  color: 'var(--color-bg-primary)',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--theme-shadow-md)'
                }}
              >
                This is a tooltip
              </div>
            </div>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button className="control" style={{
                padding: '12px 24px',
                backgroundColor: 'var(--color-surface-default)',
                color: 'var(--color-text-primary)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                borderRadius: 'var(--theme-border-radius)',
                cursor: 'pointer'
              }}>
                Popover
              </button>
              <div 
                className="control"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(8px)',
                  padding: '16px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--theme-border-radius)',
                  border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
                  fontSize: '14px',
                  width: '200px',
                  boxShadow: 'var(--theme-shadow-lg)',
                  zIndex: 10
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Popover Title</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Additional content goes here.</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Carousel</h3>
          <div 
            className="control"
            style={{
              maxWidth: '500px',
              backgroundColor: 'var(--color-surface-default)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              overflow: 'hidden',
              position: 'relative',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontSize: '24px', color: 'var(--color-text-tertiary)' }}>Slide 1</div>
            <button style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '8px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}>
              <ChevronLeft sx={{ width: 20, height: 20 }} />
            </button>
            <button style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '8px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}>
              <ChevronRight sx={{ width: 20, height: 20 }} />
            </button>
            <div style={{
              position: 'absolute',
              bottom: '16px',
              display: 'flex',
              gap: '8px'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i === 0 ? 'var(--color-accent-primary)' : 'var(--color-border-strong)'
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category 11: File & Media Control
export function FileMediaShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>11. File & Media Control</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>File Upload</h3>
          <div 
            className="control"
            style={{
              maxWidth: '400px',
              padding: '32px',
              backgroundColor: 'var(--color-surface-default)',
              border: '2px dashed var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <Upload sx={{ width: 32, height: 32, color: 'var(--color-text-tertiary)', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Drop files here or click to upload</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Supports: PDF, JPG, PNG</div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Media Player Controls</h3>
          <div 
            className="control"
            style={{
              maxWidth: '400px',
              padding: '16px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Timeline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span>0:45</span>
              <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '2px', position: 'relative' }}>
                <div style={{ width: '30%', height: '100%', backgroundColor: 'var(--color-accent-primary)', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', left: '30%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', backgroundColor: 'var(--color-accent-primary)', borderRadius: '50%' }} />
              </div>
              <span>3:20</span>
            </div>
            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
              <SkipPrevious sx={{ width: 20, height: 20, cursor: 'pointer' }} />
              <div style={{ 
                width: '40px', height: '40px', 
                backgroundColor: 'var(--color-accent-primary)', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-inverse)',
                cursor: 'pointer'
              }}>
                <PlayArrow sx={{ width: 20, height: 20 }} />
              </div>
              <SkipNext sx={{ width: 20, height: 20, cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Download Control</h3>
          <button className="control" style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-accent-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--theme-border-radius)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500
          }}>
            <Download sx={{ width: 18, height: 18 }} />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}

// Category 12: Drag / Gesture Control
export function DragGestureShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>12. Drag / Gesture Control</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Drag Handle</h3>
          <div 
            className="control"
            style={{
              maxWidth: '400px',
              padding: '16px',
              backgroundColor: 'var(--color-surface-default)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'move'
            }}
          >
            <DragIndicator sx={{ width: 20, height: 20, color: 'var(--color-text-tertiary)' }} />
            <span>Draggable Item</span>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Drop Zone</h3>
          <div 
            className="control"
            style={{
              maxWidth: '400px',
              height: '120px',
              backgroundColor: 'var(--color-accent-primary-subtle)',
              border: '2px dashed var(--color-accent-primary)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-primary)',
              fontWeight: 500
            }}
          >
            Drop Items Here
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Resize Handle</h3>
          <div 
            className="control"
            style={{
              position: 'relative',
              width: '300px',
              height: '200px',
              backgroundColor: 'var(--color-surface-default)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)'
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              cursor: 'nwse-resize'
            }}>
              <OpenInFull sx={{ width: 16, height: 16, color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category 13: Layout / View Switcher
export function LayoutViewShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>13. Layout / View Switcher</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Grid / List Toggle</h3>
          <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: 'var(--color-bg-secondary)', padding: '4px', borderRadius: 'var(--theme-border-radius)' }}>
            <button className="control" style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'calc(var(--theme-border-radius) / 2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <GridView sx={{ width: 16, height: 16 }} />
              Grid
            </button>
            <button className="control" style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'calc(var(--theme-border-radius) / 2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ViewList sx={{ width: 16, height: 16 }} />
              List
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Column Selector</h3>
          <div 
            className="control"
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-surface-default)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <ViewColumn sx={{ width: 16, height: 16 }} />
            <span>3 Columns</span>
            <ExpandMore sx={{ width: 14, height: 14, marginLeft: '4px' }} />
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Zoom Control</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="control" style={{
              padding: '8px',
              backgroundColor: 'var(--color-surface-default)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ZoomIn sx={{ width: 18, height: 18 }} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: 500, minWidth: '50px', textAlign: 'center' }}>100%</span>
            <button className="control" style={{
              padding: '8px',
              backgroundColor: 'var(--color-surface-default)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ZoomIn sx={{ width: 18, height: 18, transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category 14: Form & Flow Control
export function FormFlowShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>14. Form & Flow Control</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Stepper / Wizard</h3>
          <div style={{ maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {[1, 2, 3].map((step, idx) => (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div 
                    className="control"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: idx === 1 ? 'var(--color-accent-primary)' : idx < 1 ? 'var(--color-status-success)' : 'var(--color-bg-secondary)',
                      color: idx <= 1 ? 'var(--color-text-inverse)' : 'var(--color-text-tertiary)',
                      border: '2px solid ' + (idx === 1 ? 'var(--color-accent-primary)' : idx < 1 ? 'var(--color-status-success)' : 'var(--color-border-default)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600
                    }}
                  >
                    {step}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Step {step}</span>
                </div>
                {idx < 2 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: idx < 1 ? 'var(--color-status-success)' : 'var(--color-border-default)',
                    marginBottom: '24px'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Validation Feedback</h3>
          <div style={{ maxWidth: '300px' }}>
            <div 
              className="control"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-status-error-bg)',
                border: 'var(--theme-border-width) var(--theme-border-style) var(--color-status-error)',
                borderRadius: 'var(--theme-border-radius)',
                color: 'var(--color-text-primary)',
                marginBottom: '4px'
              }}
            >
              Invalid email
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-status-error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ErrorOutline sx={{ width: 12, height: 12 }} />
              Please enter a valid email address
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Undo / Redo</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="control" style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface-default)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Undo sx={{ width: 16, height: 16 }} />
              Undo
            </button>
            <button className="control" style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface-default)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Redo sx={{ width: 16, height: 16 }} />
              Redo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category 15: Global / System Control
export function GlobalSystemShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>15. Global / System Control</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Theme Toggle</h3>
          <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: 'var(--color-bg-secondary)', padding: '4px', borderRadius: 'var(--theme-border-radius)' }}>
            <button className="control" style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'calc(var(--theme-border-radius) / 2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <WbSunny sx={{ width: 16, height: 16 }} />
              Light
            </button>
            <button className="control" style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'calc(var(--theme-border-radius) / 2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <DarkMode sx={{ width: 16, height: 16 }} />
              Dark
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Language Selector</h3>
          <button className="control" style={{
            padding: '10px 16px',
            backgroundColor: 'var(--color-surface-default)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Public sx={{ width: 18, height: 18 }} />
            English (US)
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Notification Control</h3>
          <button className="control" style={{
            position: 'relative',
            padding: '10px',
            backgroundColor: 'var(--color-surface-default)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            <Notifications sx={{ width: 20, height: 20 }} />
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '10px',
              height: '10px',
              backgroundColor: 'var(--color-status-error)',
              borderRadius: '50%',
              border: '2px solid var(--color-surface-default)'
            }} />
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Account Menu</h3>
          <button className="control" style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-surface-default)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--theme-border-radius)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-inverse)',
              fontWeight: 600
            }}>
              JD
            </div>
            <span>John Doe</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Category 17: Advanced / Intelligent Control
export function AdvancedShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>17. Advanced / Intelligent Control</h2>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Command Palette</h3>
          <div 
            className="control"
            style={{
              maxWidth: '500px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              boxShadow: 'var(--theme-shadow-lg)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Terminal sx={{ width: 18, height: 18, color: 'var(--color-text-tertiary)' }} />
              <input 
                type="text"
                placeholder="Type a command..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ padding: '8px' }}>
              {['New File', 'Open File', 'Save', 'Settings'].map((cmd, idx) => (
                <div 
                  key={cmd}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: idx === 0 ? 'var(--color-accent-primary-subtle)' : 'transparent',
                    color: 'var(--color-text-primary)',
                    borderRadius: 'calc(var(--theme-border-radius) / 2)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>AI Prompt Input</h3>
          <div 
            className="control"
            style={{
              maxWidth: '500px',
              padding: '12px',
              backgroundColor: 'var(--color-surface-default)',
              border: '2px solid var(--color-accent-primary)',
              borderRadius: 'var(--theme-border-radius)',
              display: 'flex',
              gap: '12px'
            }}
          >
            <AutoAwesome sx={{ width: 24, height: 24, color: 'var(--color-accent-primary)', marginTop: '2px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea 
                placeholder="Describe what you want to build..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '40px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="control" style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-accent-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Voice Input</h3>
          <button className="control" style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-accent-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--theme-border-radius)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500
          }}>
            <Mic sx={{ width: 18, height: 18 }} />
            Start Recording
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, opacity: 0.7 }}>Chat Widget</h3>
          <div 
            className="control"
            style={{
              width: '300px',
              height: '400px',
              backgroundColor: 'var(--color-surface-elevated)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--color-border-default)',
              borderRadius: 'var(--theme-border-radius)',
              boxShadow: 'var(--theme-shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-inverse)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Message sx={{ width: 20, height: 20 }} />
              Chat Support
            </div>
            <div style={{ flex: 1, padding: '16px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--theme-border-radius)',
                maxWidth: '80%',
                fontSize: '14px'
              }}>
                Hello! How can I help you today?
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-accent-primary-subtle)',
                borderRadius: 'var(--theme-border-radius)',
                maxWidth: '80%',
                marginLeft: 'auto',
                fontSize: '14px'
              }}>
                I need help with my account
              </div>
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'calc(var(--theme-border-radius) / 2)',
                  outline: 'none',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-surface-default)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

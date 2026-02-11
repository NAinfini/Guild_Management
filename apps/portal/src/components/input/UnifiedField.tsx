import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const formFieldVariants = cva('w-full transition-all duration-200', {
  variants: {
    state: {
      default: '',
      error: 'animate-shake',
      success: '',
      loading: 'opacity-70 pointer-events-none',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    state: 'default',
    size: 'md',
  },
});

export interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UnifiedFieldProps extends VariantProps<typeof formFieldVariants> {

  /** Field type */
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch';
  /** Field label */
  label?: string;
  /** Field name (for form submissions) */
  name?: string;
  /** Field value */
  value?: string | number | boolean;
  /** Change handler */
  onChange?: (value: string | number | boolean) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text below field */
  helperText?: string;
  /** Error message (overrides helperText) */
  error?: string;
  /** Success message */
  success?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Options for select fields */
  options?: FormFieldOption[];
  /** Multiline (for textarea) */
  multiline?: boolean;
  /** Number of rows (for textarea) */
  rows?: number;
  /** Max rows (for auto-grow textarea) */
  maxRows?: number;
  /** Start adornment (icon/text) */
  startAdornment?: React.ReactNode;
  /** End adornment (icon/text) */
  endAdornment?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

export const UnifiedField: React.FC<UnifiedFieldProps> = ({

  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  success,
  required,
  disabled,
  loading,
  options = [],
  multiline,
  rows,
  maxRows,
  startAdornment,
  endAdornment,
  state,
  size,
  className,
  autoFocus,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const effectiveState = error ? 'error' : success ? 'success' : loading ? 'loading' : state;
  const displayText = error || success || helperText;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === 'checkbox') {
      onChange?.((e.target as HTMLInputElement).checked);
    } else if (type === 'number') {
      onChange?.(parseFloat(e.target.value) || 0);
    } else {
      onChange?.(e.target.value);
    }
  };

  const handleSelectChange = (e: any) => {
    onChange?.(e.target.value);
  };

  // Checkbox/Switch
  if (type === 'checkbox' || type === 'switch') {
    const ControlComponent = type === 'checkbox' ? Checkbox : Switch;
    return (
      <FormControl
        className={cn(formFieldVariants({ state: effectiveState, size }), className)}
        disabled={disabled || loading}
      >
        <FormControlLabel
          control={
            <ControlComponent
              checked={Boolean(value)}
              onChange={handleChange}
              name={name}
              sx={{
                '&.Mui-checked': {
                  color: 'var(--color-accent-primary)',
                },
                '&:hover': {
                  backgroundColor: 'var(--color-accent-primary-subtle)',
                },
              }}
            />
          }
          label={label || ''}
          sx={{
            '& .MuiFormControlLabel-label': {
              color: 'var(--color-text-primary)',
            },
          }}
        />
        {displayText && (
          <FormHelperText
            sx={{
              color: error
                ? 'var(--color-status-error)'
                : success
                  ? 'var(--color-status-success)'
                  : 'var(--color-text-tertiary)',
            }}
          >
            {displayText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }

  // Select
  if (type === 'select') {
    return (
      <FormControl
        fullWidth
        error={Boolean(error)}
        disabled={disabled || loading}
        className={cn(formFieldVariants({ state: effectiveState, size }), className)}
        size={size === 'sm' ? 'small' : size === 'md' ? 'medium' : undefined}
      >
        {label && (
          <FormLabel
            required={required}
            sx={{ color: 'var(--color-text-primary)', mb: 0.5, fontWeight: 500 }}
          >
            {label}
          </FormLabel>
        )}
        <Select
          value={value || ''}
          onChange={handleSelectChange}
          name={name}
          displayEmpty={Boolean(placeholder)}
          sx={{
            backgroundColor: 'var(--color-surface-default)',
            '&:hover': {
              backgroundColor: 'var(--color-surface-elevated)',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 2px ${error ? 'var(--color-status-error)' : 'var(--color-accent-primary-subtle)'}`,
            },
          }}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {displayText && (
          <FormHelperText
            sx={{
              color: error
                ? 'var(--color-status-error)'
                : success
                  ? 'var(--color-status-success)'
                  : 'var(--color-text-tertiary)',
            }}
          >
            {displayText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }

  // Text fields (text, email, password, number, textarea)
  const passwordEndAdornment = type === 'password' && (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShowPassword(!showPassword)}
        edge="end"
        size="small"
        sx={{
          color: 'var(--color-text-tertiary)',
          '&:hover': { color: 'var(--color-text-secondary)' },
        }}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <FormControl
      fullWidth
      error={Boolean(error)}
      disabled={disabled || loading}
      className={cn(formFieldVariants({ state: effectiveState, size }), className)}
    >
      {label && (
        <FormLabel
          required={required}
          sx={{ color: 'var(--color-text-primary)', mb: 0.5, fontWeight: 500 }}
        >
          {label}
        </FormLabel>
      )}
      <TextField
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled || loading}
        multiline={multiline || type === 'textarea'}
        rows={rows}
        maxRows={maxRows}
        autoFocus={autoFocus}
        error={Boolean(error)}
        size={size === 'sm' ? 'small' : size === 'md' ? 'medium' : undefined}
        InputProps={{
          startAdornment: startAdornment && (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
          endAdornment: endAdornment || passwordEndAdornment,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-surface-default)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'var(--color-surface-elevated)',
            },
            '&.Mui-focused': {
              backgroundColor: 'var(--color-surface-default)',
              boxShadow: `0 0 0 2px ${error ? 'var(--color-status-error)' : success ? 'var(--color-status-success)' : 'var(--color-accent-primary-subtle)'}`,
            },
            '&.Mui-error': {
              borderColor: 'var(--color-status-error)',
            },
          },
        }}
      />
      {displayText && (
        <FormHelperText
          sx={{
            color: error
              ? 'var(--color-status-error)'
              : success
                ? 'var(--color-status-success)'
                : 'var(--color-text-tertiary)',
          }}
        >
          {displayText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import styles from './Select.module.css';

interface SelectSearchContextValue {
  query: string;
  setQuery: (value: string) => void;
}

const SelectSearchContext = React.createContext<SelectSearchContextValue | null>(null);

function useSelectSearchContext() {
  return React.useContext(SelectSearchContext);
}

export type PrimitiveSelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;
export type PrimitiveSelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;
export type PrimitiveSelectValueProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>;
export type PrimitiveSelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
export type PrimitiveSelectGroupProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>;
export type PrimitiveSelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;
export type PrimitiveSelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;

export interface PrimitiveSelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  searchValue?: string;
}

export type PrimitiveSelectSearchProps = React.InputHTMLAttributes<HTMLInputElement>;
export interface PrimitiveMultiSelectOption {
  value: string;
  label: string;
  searchValue?: string;
}

export interface PrimitiveMultiSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: PrimitiveMultiSelectOption[];
  value: string[];
  onValueChange: (next: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

/**
 * Select primitives standardize dropdown semantics while keeping feature-level composition open.
 * Search and item filtering live in this layer so screens can opt in without duplicate logic.
 */
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

/**
 * MultiSelect provides a lightweight token-friendly fallback where multiple values are needed.
 * It intentionally stays composable and avoids heavy opinionated behavior.
 */
export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Search options',
  emptyText = 'No options',
  searchPlaceholder,
  disabled,
  className,
  ...props
}: PrimitiveMultiSelectProps) {
  const [query, setQuery] = React.useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      (option.searchValue ?? option.label).toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, options]);

  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggleOption = React.useCallback(
    (optionValue: string) => {
      if (disabled) return;
      if (selectedSet.has(optionValue)) {
        onValueChange(value.filter((item) => item !== optionValue));
        return;
      }
      onValueChange([...value, optionValue]);
    },
    [disabled, onValueChange, selectedSet, value],
  );

  return (
    <div
      role="group"
      aria-disabled={disabled ? 'true' : undefined}
      className={cn(styles.content, className)}
      {...props}
    >
      <div className={styles.searchWrapper}>
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={searchPlaceholder ?? placeholder}
          className={styles.searchInput}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className={styles.viewport}>
        {filteredOptions.length === 0 ? (
          <div className={styles.empty}>{emptyText}</div>
        ) : (
          filteredOptions.map((option) => {
            const checked = selectedSet.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={disabled}
                className={cn(styles.item, checked && styles.itemSelected)}
                onClick={() => toggleOption(option.value)}
              >
                <span className={styles.itemIndicator}>{checked ? '✓' : ''}</span>
                <span>{option.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  PrimitiveSelectTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn(styles.trigger, className)} {...props}>
      <span className={styles.value}>{children}</span>
      <SelectPrimitive.Icon className={styles.icon}>▾</SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  PrimitiveSelectContentProps
>(({ className, children, onCloseAutoFocus, ...props }, ref) => {
  const [query, setQuery] = React.useState('');

  return (
    <SelectSearchContext.Provider value={{ query, setQuery }}>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(styles.content, className)}
          position="popper"
          sideOffset={6}
          onCloseAutoFocus={(event) => {
            setQuery('');
            onCloseAutoFocus?.(event);
          }}
          {...props}
        >
          <SelectPrimitive.Viewport className={styles.viewport}>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectSearchContext.Provider>
  );
});

SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectSearch = React.forwardRef<HTMLInputElement, PrimitiveSelectSearchProps>(
  ({ className, onKeyDown, onChange, ...props }, ref) => {
    const context = useSelectSearchContext();

    if (!context) {
      return null;
    }

    return (
      <div className={styles.searchWrapper}>
        <input
          ref={ref}
          type="text"
          value={context.query}
          className={cn(styles.searchInput, className)}
          onKeyDown={(event) => {
            event.stopPropagation();
            onKeyDown?.(event);
          }}
          onChange={(event) => {
            context.setQuery(event.target.value);
            onChange?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);

SelectSearch.displayName = 'SelectSearch';

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  PrimitiveSelectItemProps
>(({ className, children, searchValue, textValue, ...props }, ref) => {
  const context = useSelectSearchContext();
  const searchable = (searchValue ?? textValue ?? (typeof children === 'string' ? children : '')).toLowerCase();
  const query = context?.query.trim().toLowerCase() ?? '';

  if (query && searchable && !searchable.includes(query)) {
    return null;
  }

  if (query && !searchable) {
    return null;
  }

  return (
    <SelectPrimitive.Item ref={ref} textValue={textValue ?? searchValue} className={cn(styles.item, className)} {...props}>
      <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>✓</SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  PrimitiveSelectLabelProps
>(({ className, ...props }, ref) => {
  return <SelectPrimitive.Label ref={ref} className={cn(styles.empty, className)} {...props} />;
});

SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  PrimitiveSelectSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn(className)}
      style={{ height: 1, margin: '0.25rem 0', background: 'var(--color-border-subtle, rgba(255, 255, 255, 0.1))' }}
      {...props}
    />
  );
});

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

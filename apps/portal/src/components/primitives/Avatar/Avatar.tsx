import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Avatar.module.css';

export type PrimitiveAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PrimitiveAvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: string;
  size?: PrimitiveAvatarSize;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

/**
 * Primitive avatar renders user imagery with robust fallback behavior.
 * Composed cards and navigation elements use this for profile identity.
 */
export function Avatar({ src, alt, name, fallback, size = 'md', className, ...rest }: PrimitiveAvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = Boolean(src) && !imageFailed;
  const fallbackText = fallback ?? getInitials(name);
  const imageDimension = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 44 : 52;

  return (
    <div className={cn(styles.avatar, styles[size], className)} {...rest}>
      {showImage ? (
        // Avatar images use explicit intrinsic dimensions and async decode to keep list-heavy layouts stable.
        <img
          className={styles.image}
          src={src}
          alt={alt ?? name ?? 'avatar'}
          width={imageDimension}
          height={imageDimension}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={styles.fallback} aria-hidden="true">
          {fallbackText}
        </span>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from "@/ui-bridge/material";

function Avatar({
  className,
  ...props
}: MuiAvatarProps) {
  return (
    <MuiAvatar
      data-slot="avatar"
      className={className}
      sx={{
        position: 'relative',
        display: 'flex',
        width: '2.5rem',
        height: '2.5rem',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '50%',
        backgroundColor: 'var(--muted)',
        color: 'inherit',
      }}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={{
        aspectRatio: '1/1',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-fallback"
      className={className}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontSize: '0.875rem',
        fontWeight: 500,
        backgroundColor: 'var(--muted)',
      }}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

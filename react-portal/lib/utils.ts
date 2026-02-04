import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string, offset: number = 0, includeYear: boolean = true) {
  const date = new Date(isoString);
  // Apply manual offset if needed (in hours)
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  return format(adjustedDate, includeYear ? "MMM d, yyyy HH:mm" : "MMM d, HH:mm");
}

export function formatTimeOnly(isoString: string, offset: number = 0) {
  const date = new Date(isoString);
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  return format(adjustedDate, "HH:mm");
}

export function getClassColor(classType?: string): string {
  if (!classType) return 'bg-slate-800 text-slate-100 border-slate-700';
  
  // mingjin classes: blue
  if (classType.startsWith('mingjin')) return 'bg-blue-600/10 text-blue-400 border-blue-500/30';
  // qiansi classes: green
  if (classType.startsWith('qiansi')) return 'bg-green-600/10 text-green-400 border-green-500/30';
  // pozhu classes: purple
  if (classType.startsWith('pozhu')) return 'bg-purple-600/10 text-purple-400 border-purple-500/30';
  // lieshi classes: dark red
  if (classType.startsWith('lieshi')) return 'bg-red-600/10 text-red-500 border-red-500/30';
  
  return 'bg-slate-800 text-slate-100 border-slate-700';
}

export function formatPower(power: number): string {
  return power.toLocaleString();
}

export function sanitizeHtml(html: string): { __html: string } {
  return {
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br', 'p', 'u'],
      ALLOWED_ATTR: ['class', 'style']
    })
  };
}

/**
 * Ensures media URLs are optimized for the portal.
 * In a real scenario, this would point to a WebP/Opus conversion service.
 * Here we provide a facade for compliance.
 */
export function getOptimizedMediaUrl(url: string, type: 'image' | 'audio' | 'video' = 'image'): string {
  if (!url) return '';
  
  // Simulation: Append format hint for compliant backends
  const separator = url.includes('?') ? '&' : '?';
  if (type === 'image' && !url.endsWith('.webp')) return `${url}${separator}format=webp`;
  if (type === 'audio' && !url.endsWith('.opus')) return `${url}${separator}format=opus`;
  
  return url;
}

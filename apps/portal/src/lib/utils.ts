import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import DOMPurify from "dompurify";
import i18n, { getDateFormat } from "../i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get locale object for date-fns based on current language
function getDateLocale() {
  return i18n.language === 'zh' ? zhCN : enUS;
}

export function formatDateTime(isoString: string, offset: number = 0, includeYear: boolean = true) {
  const date = new Date(isoString);
  // Apply manual offset if needed (in hours)
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  const formatStr = includeYear ? getDateFormat('shortDateTime') : getDateFormat('shortDateTimeNoYear');
  return format(adjustedDate, formatStr, { locale: getDateLocale() });
}

export function formatDate(isoString: string, offset: number = 0, includeYear: boolean = true): string {
  const date = new Date(isoString);
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  const formatStr = includeYear ? getDateFormat('shortDate') : getDateFormat('shortDateNoYear');
  return format(adjustedDate, formatStr, { locale: getDateLocale() });
}

export function formatTimeOnly(isoString: string, offset: number = 0) {
  const date = new Date(isoString);
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  return format(adjustedDate, getDateFormat('shortTime'), { locale: getDateLocale() });
}

export function formatLongDate(isoString: string, offset: number = 0): string {
  const date = new Date(isoString);
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  return format(adjustedDate, getDateFormat('longDate'), { locale: getDateLocale() });
}

export function formatMonthYear(isoString: string, offset: number = 0): string {
  const date = new Date(isoString);
  const adjustedDate = new Date(date.getTime() + offset * 3600000);
  return format(adjustedDate, getDateFormat('monthYear'), { locale: getDateLocale() });
}

export function formatWeekday(date: Date): string {
  return format(date, getDateFormat('weekday'), { locale: getDateLocale() });
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

export function getClassBaseColor(className?: string): string {
  const raw = className || '';
  const normalized = raw.toLowerCase();
  if (normalized.startsWith('mingjin') || raw.startsWith('鸣金')) return '#2563eb';
  if (normalized.startsWith('qiansi') || raw.startsWith('牵丝')) return '#16a34a';
  if (normalized.startsWith('pozhu') || raw.startsWith('破竹')) return '#7e22ce';
  if (normalized.startsWith('lieshi') || raw.startsWith('裂石')) return '#7f1d1d';
  return '#2563eb';
}

export function formatClassDisplayName(className?: string): string {
  if (!className) return '';

  // Keep Chinese class labels as-is when backend already returns display text.
  if (/[\u4e00-\u9fff]/.test(className)) return className;

  const normalized = className.toLowerCase().replace(/-/g, '_');
  const keys = [`common.class.${normalized}`, `class.${normalized}`];
  const i18nKey = keys.find((key) => i18n.exists(key));
  if (i18nKey) return i18n.t(i18nKey);

  return className.replace(/_/g, ' ');
}

export function formatPower(power: number): string {
  return power.toLocaleString();
}

export function getAvatarInitial(username?: string | null): string {
  const trimmed = username?.trim();
  if (!trimmed) return '?';
  return Array.from(trimmed)[0]?.toUpperCase() ?? '?';
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

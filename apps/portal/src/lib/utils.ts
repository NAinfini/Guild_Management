import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import DOMPurify from "dompurify";
import i18n, { getDateFormat } from "../i18n/config";
import { Theme } from "@/ui-bridge/material";
import { alpha } from "@/ui-bridge/material/styles";
import { GAME_CLASS_COLORS } from "@/theme/tokens";

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

/**
 * Get theme-aware class color from CSS variables
 * Falls back to hardcoded colors if CSS variables are not available
 */
export function getClassBaseColor(className?: string): string {
  const raw = className || '';
  const normalized = raw.toLowerCase();

  // Determine class type
  let classType: 'mingjin' | 'qiansi' | 'pozhu' | 'lieshi' = 'mingjin';
  if (normalized.startsWith('qiansi') || raw.startsWith('鐗典笣')) classType = 'qiansi';
  else if (normalized.startsWith('pozhu') || raw.startsWith('鐮寸')) classType = 'pozhu';
  else if (normalized.startsWith('lieshi') || raw.startsWith('瑁傜煶')) classType = 'lieshi';

  // Try to read CSS variable from current theme
  if (typeof window !== 'undefined') {
    const cssVarName = `--member-card-${classType}`;
    const cssValue = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    if (cssValue) return cssValue;
  }

  // Fallback to hardcoded colors
  return GAME_CLASS_COLORS[classType].main;
}

export function getClassPillTone(classType: string | undefined, theme: Theme) {
  const baseColor = getClassBaseColor(classType);
  return {
    main: baseColor,
    bg: alpha(baseColor, 0.12),
    text: theme.palette.mode === 'dark' ? alpha(baseColor, 0.9) : baseColor,
  };
}

export function getMemberCardAccentColors(classes: string[] | undefined, theme?: Theme): string[] {
  if (!classes || classes.length === 0) {
    return [theme?.palette.primary.main ?? '#3b5fc4']; // Fallback to a default blue if theme is missing
  }
  return classes.map(c => getClassBaseColor(c));
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

export function sanitizeHtml(html: string): { __html: string } {
  return {
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br', 'p', 'u'],
      ALLOWED_ATTR: ['class', 'style']
    })
  };
}

export function formatPower(power: number): string {
  return (power || 0).toLocaleString();
}

export function buildMemberAccentGradient(accentColors: string[]): string {
  const [first, second, third] = accentColors;
  const opacity = 0.5;

  if (third) {
    // Three colors: diagonal sections with sharp cuts
    return `
      linear-gradient(135deg, ${alpha(first, opacity)} 0%, ${alpha(first, opacity)} 33.33%, transparent 33.33%),
      linear-gradient(225deg, ${alpha(second, opacity)} 0%, ${alpha(second, opacity)} 33.33%, transparent 33.33%),
      linear-gradient(315deg, ${alpha(third, opacity)} 0%, ${alpha(third, opacity)} 33.33%, transparent 33.33%)
    `.replace(/\s+/g, ' ').trim();
  }
  if (second) {
    // Two colors: diagonal split with sharp cut at 50%
    return `linear-gradient(135deg, ${alpha(first, opacity)} 0%, ${alpha(first, opacity)} 50%, ${alpha(second, opacity)} 50%, ${alpha(second, opacity)} 100%)`;
  }
  // Single color
  return alpha(first, opacity);
}

/**
 * Get theme-aware class background color (uses same source as getClassBaseColor)
 * This is just an alias for consistency
 */
export function getClassBackgroundColor(primaryClass: string | undefined): string {
  return getClassBaseColor(primaryClass);
}


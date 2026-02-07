import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getDateFormat } from '../i18n/config';

/**
 * Hook for localized date/time formatting
 * Automatically updates when language changes
 */
export function useLocaleDate() {
  const { i18n } = useTranslation();

  const getDateLocale = () => {
    return i18n.language === 'zh' ? zhCN : enUS;
  };

  /**
   * Format date and time
   */
  const formatDateTime = (isoString: string, offset: number = 0, includeYear: boolean = true): string => {
    const date = new Date(isoString);
    const adjustedDate = new Date(date.getTime() + offset * 3600000);
    const formatStr = includeYear ? getDateFormat('shortDateTime') : getDateFormat('shortDateTimeNoYear');
    return format(adjustedDate, formatStr, { locale: getDateLocale() });
  };

  /**
   * Format date only
   */
  const formatDate = (isoString: string, offset: number = 0, includeYear: boolean = true): string => {
    const date = new Date(isoString);
    const adjustedDate = new Date(date.getTime() + offset * 3600000);
    const formatStr = includeYear ? getDateFormat('shortDate') : getDateFormat('shortDateNoYear');
    return format(adjustedDate, formatStr, { locale: getDateLocale() });
  };

  /**
   * Format time only
   */
  const formatTime = (isoString: string, offset: number = 0): string => {
    const date = new Date(isoString);
    const adjustedDate = new Date(date.getTime() + offset * 3600000);
    return format(adjustedDate, getDateFormat('shortTime'), { locale: getDateLocale() });
  };

  /**
   * Format long date
   */
  const formatLongDate = (isoString: string, offset: number = 0): string => {
    const date = new Date(isoString);
    const adjustedDate = new Date(date.getTime() + offset * 3600000);
    return format(adjustedDate, getDateFormat('longDate'), { locale: getDateLocale() });
  };

  /**
   * Format month and year
   */
  const formatMonthYear = (isoString: string, offset: number = 0): string => {
    const date = new Date(isoString);
    const adjustedDate = new Date(date.getTime() + offset * 3600000);
    return format(adjustedDate, getDateFormat('monthYear'), { locale: getDateLocale() });
  };

  /**
   * Format weekday
   */
  const formatWeekday = (date: Date): string => {
    return format(date, getDateFormat('weekday'), { locale: getDateLocale() });
  };

  /**
   * Format short weekday (Mon, Tue, etc.)
   */
  const formatWeekdayShort = (date: Date): string => {
    return format(date, getDateFormat('weekdayShort'), { locale: getDateLocale() });
  };

  /**
   * Get locale object for date-fns
   */
  const getDateLocaleObj = () => getDateLocale();

  return {
    formatDateTime,
    formatDate,
    formatTime,
    formatLongDate,
    formatMonthYear,
    formatWeekday,
    formatWeekdayShort,
    getDateLocale: getDateLocaleObj,
  };
}

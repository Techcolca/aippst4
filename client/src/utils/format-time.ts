import { TFunction } from 'react-i18next';

export function formatRelativeTime(date: string | Date, t: TFunction): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return t('time.just_now');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  // Less than an hour
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) {
      return t('time.minutes_ago', { count: diffInMinutes });
    }
    return t('time.minutes_ago_plural', { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  // Less than a day
  if (diffInHours < 24) {
    if (diffInHours === 1) {
      return t('time.hours_ago', { count: diffInHours });
    }
    return t('time.hours_ago_plural', { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  // Less than a week
  if (diffInDays < 7) {
    if (diffInDays === 1) {
      return t('time.days_ago', { count: diffInDays });
    }
    return t('time.days_ago_plural', { count: diffInDays });
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  // Less than a month (approximately 4 weeks)
  if (diffInWeeks < 4) {
    if (diffInWeeks === 1) {
      return t('time.weeks_ago', { count: diffInWeeks });
    }
    return t('time.weeks_ago_plural', { count: diffInWeeks });
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) {
    return t('time.months_ago', { count: diffInMonths });
  }
  return t('time.months_ago_plural', { count: diffInMonths });
}
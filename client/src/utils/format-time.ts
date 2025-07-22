import { TFunction } from 'i18next';

export function formatRelativeTime(date: string | Date, t: TFunction): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  // Debug log
  console.log('⏰ formatRelativeTime DEBUG:', {
    date,
    diffInSeconds,
    testTranslation: t('hours_ago_plural', { count: 3 })
  });

  // Less than a minute
  if (diffInSeconds < 60) {
    return t('just_now');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  // Less than an hour
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 
      ? t('minutes_ago', { count: diffInMinutes })
      : t('minutes_ago_plural', { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  // Less than a day
  if (diffInHours < 24) {
    return diffInHours === 1 
      ? t('hours_ago', { count: diffInHours })
      : t('hours_ago_plural', { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  // Less than a week
  if (diffInDays < 7) {
    return diffInDays === 1 
      ? t('days_ago', { count: diffInDays })
      : t('days_ago_plural', { count: diffInDays });
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  // Less than a month (approximately 4 weeks)
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 
      ? t('weeks_ago', { count: diffInWeeks })
      : t('weeks_ago_plural', { count: diffInWeeks });
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return diffInMonths === 1 
    ? t('time.months_ago', { count: diffInMonths })
    : t('time.months_ago_plural', { count: diffInMonths });
}
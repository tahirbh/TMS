import moment from 'moment-hijri';

// Set moment to use Arabic locale for Hijri if needed
moment.locale('en');

export const convertGregorianToHijri = (date: Date | string | null): string => {
  if (!date) return '';
  return moment(date).format('iYYYY-iMM-iDD');
};

export const convertHijriToGregorian = (hijriDate: string): string => {
  if (!hijriDate) return '';
  return moment(hijriDate, 'iYYYY-iMM-iDD').format('YYYY-MM-DD');
};

export const getRemainingDays = (expiryDate: Date | string | null): number => {
  if (!expiryDate) return 0;
  const expiry = moment(expiryDate);
  const now = moment();
  return expiry.diff(now, 'days');
};

export const getExpiryStatus = (expiryDate: Date | string | null) => {
  const days = getRemainingDays(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'near_expiry';
  return 'valid';
};

export const formatHijri = (hijriDate: string | null): string => {
  if (!hijriDate) return '—';
  return hijriDate; // Already in format if coming from DB
};

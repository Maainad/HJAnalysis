/**
 * Date formatting utilities for Arabic dates
 */

/**
 * Format date to DD/MM/YYYY HH:MM with Arabic AM/PM (م/ص)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in Saudi time
 */
export function formatArabicDate(dateString: string | Date): string {
  const date = new Date(dateString);

  // Subtract 4 hours to correct the offset
  const correctedTime = new Date(date.getTime() - (4 * 60 * 60 * 1000));

  const day = String(correctedTime.getUTCDate()).padStart(2, '0');
  const month = String(correctedTime.getUTCMonth() + 1).padStart(2, '0');
  const year = correctedTime.getUTCFullYear();

  let hours = correctedTime.getUTCHours();
  const minutes = String(correctedTime.getUTCMinutes()).padStart(2, '0');

  // Determine AM/PM in Arabic
  const period = hours >= 12 ? 'م' : 'ص';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} ${hoursStr}:${minutes} ${period}`;
}

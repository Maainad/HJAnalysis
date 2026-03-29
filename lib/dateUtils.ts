/**
 * Date formatting utilities for Arabic dates
 * Properly converts timestamps to Saudi Arabia timezone (Asia/Riyadh)
 */

/**
 * Format date to DD/MM/YYYY HH:MM with Arabic AM/PM (م/ص)
 * @param dateString - Unix timestamp (seconds) or ISO date string or Date object
 * @returns Formatted date string in Saudi Arabia time (UTC+3)
 */
export function formatArabicDate(dateString: string | Date | number): string {
  let date: Date;

  // Handle Unix timestamp in seconds (multiply by 1000 for milliseconds)
  if (typeof dateString === 'number' || (typeof dateString === 'string' && /^\d+$/.test(dateString))) {
    date = new Date(Number(dateString) * 1000);
  } else {
    date = new Date(dateString);
  }

  // Add 3 hours to UTC to get Saudi time (UTC+3)
  const saudiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));

  const day = String(saudiTime.getUTCDate()).padStart(2, '0');
  const month = String(saudiTime.getUTCMonth() + 1).padStart(2, '0');
  const year = saudiTime.getUTCFullYear();
  let hours = saudiTime.getUTCHours();
  const minutes = String(saudiTime.getUTCMinutes()).padStart(2, '0');

  // Determine AM/PM in Arabic
  const period = hours >= 12 ? 'م' : 'ص';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} ${hoursStr}:${minutes} ${period}`;
}

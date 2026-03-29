/**
 * Convert Unix timestamp to Saudi time
 */

const unixTimestamp = 1774795694;

// Convert to milliseconds
const date = new Date(unixTimestamp * 1000);

console.log('Original Unix timestamp:', unixTimestamp);
console.log('GMT time:', date.toISOString());
console.log('GMT readable:', date.toUTCString());

// Add 3 hours for Saudi time (UTC+3)
const saudiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));

const day = String(saudiTime.getUTCDate()).padStart(2, '0');
const month = String(saudiTime.getUTCMonth() + 1).padStart(2, '0');
const year = saudiTime.getUTCFullYear();
let hours = saudiTime.getUTCHours();
const minutes = String(saudiTime.getUTCMinutes()).padStart(2, '0');
const seconds = String(saudiTime.getUTCSeconds()).padStart(2, '0');

// Determine AM/PM in Arabic
const period = hours >= 12 ? 'م' : 'ص';

// Convert to 12-hour format
hours = hours % 12;
hours = hours === 0 ? 12 : hours;
const hoursStr = String(hours).padStart(2, '0');

console.log('\nSaudi Time (UTC+3):');
console.log(`${day}/${month}/${year} ${hoursStr}:${minutes}:${seconds} ${period}`);
console.log(`Formatted: ${day}/${month}/${year} ${hoursStr}:${minutes} ${period}`);

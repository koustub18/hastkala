import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a Firestore Timestamp, ISO string, or Date object to milliseconds.
 * Returns 0 if invalid or null.
 */
export const getSafeMillis = (dateObj: Timestamp | Date | string | number | Record<string, unknown> | null | undefined): number => {
  if (!dateObj) return 0;
  
  const obj = dateObj as any;
  // If it's a Firestore Timestamp, it has a toMillis() method
  if (typeof obj.toMillis === 'function') {
    return obj.toMillis();
  }
  
  // If it's a Firestore Timestamp and has toDate()
  if (typeof obj.toDate === 'function') {
    return obj.toDate().getTime();
  }
  
  // If it's a JavaScript Date object
  if (dateObj instanceof Date) {
    return dateObj.getTime();
  }
  
  // If it's a string (like ISO string) or number
  const parsed = new Date(dateObj as string | number | Date).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Safely converts a date representation to a JavaScript Date object.
 * Returns null if invalid or null.
 */
export const getSafeDate = (dateObj: Timestamp | Date | string | number | Record<string, unknown> | null | undefined): Date | null => {
  if (!dateObj) return null;
  
  const obj = dateObj as any;
  if (typeof obj.toDate === 'function') {
    return obj.toDate();
  }
  
  if (typeof obj.toMillis === 'function') {
    return new Date(obj.toMillis());
  }
  
  const parsed = new Date(dateObj as string | number | Date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

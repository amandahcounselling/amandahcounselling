import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True when value has non-whitespace text (empty/null/undefined collapse). */
export function hasText(value: unknown): boolean {
  if (value == null) return false;
  return String(value).trim().length > 0;
}

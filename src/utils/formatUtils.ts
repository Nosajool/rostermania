/**
 * Utility functions for formatting values in the UI
 */

/**
 * Formats a number to exactly one decimal place
 */
export function formatToOneDecimal(value: number | null | undefined): string {
  if (value == null) return '0';
  return value.toFixed(1);
}

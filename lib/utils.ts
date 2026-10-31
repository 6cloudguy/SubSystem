import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  taxRatePercent = 0,
  discountAmount = 0
): { subtotal: number; taxAmount: number; total: number } {
  const baseSubtotal = Math.round(quantity * unitPrice * 100) / 100;
  const taxableSubtotal = Math.max(0, baseSubtotal - discountAmount);
  const taxAmount = Math.round(((taxableSubtotal * taxRatePercent) / 100) * 100) / 100;
  const total = Math.round((taxableSubtotal + taxAmount) * 100) / 100;

  return {
    subtotal: baseSubtotal,
    taxAmount,
    total,
  };
}

export function generateDocNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

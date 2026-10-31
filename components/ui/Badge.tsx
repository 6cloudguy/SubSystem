import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'ACTIVE'
  | 'PAUSED'
  | 'CLOSED'
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONVERTED'
  | 'LEAD'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'PENDING'
  | 'FAILED'
  | 'ADMIN'
  | 'INTERNAL_STAFF'
  | string;

interface BadgeProps {
  status?: StatusType;
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ status, children, variant, size = 'sm', className }: BadgeProps) {
  // Compute style based on status if variant not explicitly provided
  let styleVariant = variant;

  if (!styleVariant && status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'PAID':
      case 'ACCEPTED':
      case 'CONVERTED':
      case 'COMPLETED':
        styleVariant = 'success';
        break;
      case 'PAUSED':
      case 'PENDING':
      case 'LEAD':
        styleVariant = 'warning';
        break;
      case 'OVERDUE':
      case 'REJECTED':
      case 'FAILED':
      case 'SUSPENDED':
        styleVariant = 'danger';
        break;
      case 'CONFIRMED':
      case 'SENT':
        styleVariant = 'info';
        break;
      case 'ADMIN':
        styleVariant = 'purple';
        break;
      case 'DRAFT':
      case 'CLOSED':
      case 'CANCELLED':
      case 'INTERNAL_STAFF':
      default:
        styleVariant = 'neutral';
        break;
    }
  }

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10',
    info: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-600/10',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-600/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/10',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full font-medium',
    md: 'text-sm px-2.5 py-1 rounded-full font-medium',
  };

  const displayText = children || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border shrink-0',
        variantStyles[styleVariant || 'default'],
        sizeStyles[size],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {displayText}
    </span>
  );
}

export type UserRole = 'ADMIN' | 'INTERNAL_STAFF' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  assignedCustomersCount?: number;
  lastActive?: string;
  passwordHash?: string;
  createdAt: string;
}

export type CustomerStatus = 'ACTIVE' | 'LEAD' | 'SUSPENDED';

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  billingAddress: string;
  taxId?: string;
  notes?: string;
  status: CustomerStatus;
  createdAt: string;
  totalSpent: number;
  outstandingBalance: number;
}

export type ProductType = 'SOFTWARE' | 'ADDON' | 'SERVICE';
export type ProductStatus = 'ACTIVE' | 'ARCHIVED';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceAdjustment: number; // e.g. +20 or -10
  finalPrice: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string;
  status: ProductStatus;
  variants: ProductVariant[];
  createdAt: string;
}

export type BillingInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingInterval: BillingInterval;
  minQuantity: number;
  startDate?: string;
  endDate?: string;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenewal: boolean;
  autoClose: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  subscribersCount?: number;
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';

export interface QuotationLine {
  id: string;
  productId: string;
  variantId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage, e.g. 10 for 10%
  discountAmount: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  templateName?: string;
  validityDate: string;
  status: QuotationStatus;
  lines: QuotationLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  convertedSubscriptionId?: string;
}

export type SubscriptionStatus = 'DRAFT' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface SubscriptionLine {
  id: string;
  productId: string;
  variantId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount: number;
  lineTotal: number;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  eventType: 'CREATED' | 'CONFIRMED' | 'ACTIVATED' | 'PAUSED' | 'RESUMED' | 'RENEWED' | 'CLOSED' | 'INVOICED';
  timestamp: string;
  actor: string;
  note: string;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  billingInterval: BillingInterval;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  paymentTerms: string; // e.g. 'Net 30'
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  totalAmount: number;
  pauseDate?: string;
  resumeExpectedDate?: string;
  closeReason?: string;
  createdAt: string;
  events: SubscriptionEvent[];
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'OVERDUE';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  lines: InvoiceLine[];
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'CHECK';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmount: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  allocations: PaymentAllocation[];
  notes?: string;
  createdAt: string;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // percentage, e.g. 15 for 15%
  applicability: 'ALL' | 'PRODUCTS' | 'SERVICES';
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // % or $
  minAmount: number;
  validFrom: string;
  validTo?: string;
  usageLimit: number;
  usageCount: number;
  scope: 'ALL' | 'SUBSCRIPTIONS' | 'PLANS';
  status: 'ACTIVE' | 'EXPIRED';
}

export interface DashboardMetrics {
  activeSubscriptionsCount: number;
  totalMonthlyRevenue: number;
  cashReceivedThisMonth: number;
  invoicedThisMonth: number;
  totalOutstandingBalance: number;
  overdueInvoicesCount: number;
  overdueAmount: number;
  customersCount: number;
}

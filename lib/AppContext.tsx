'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Customer,
  Product,
  Plan,
  Quotation,
  Subscription,
  Invoice,
  Payment,
  TaxRule,
  Discount,
  User,
  DashboardMetrics,
  SubscriptionEvent,
} from './types';
import {
  initialUsers,
  initialCustomers,
  initialProducts,
  initialPlans,
  initialQuotations,
  initialSubscriptions,
  initialInvoices,
  initialPayments,
  initialTaxRules,
  initialDiscounts,
} from './mockData';
import { generateDocNumber } from './utils';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'outstandingBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;

  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id'>) => Plan;
  updatePlan: (id: string, updates: Partial<Plan>) => void;

  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'quotationNumber'>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  convertQuotationToSubscription: (quotationId: string) => Subscription | null;

  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'subscriptionNumber' | 'events'>) => Subscription;
  pauseSubscription: (id: string, reason: string, expectedResumeDate?: string) => void;
  resumeSubscription: (id: string, note?: string) => void;
  renewSubscription: (id: string, newEndDate: string, note?: string) => void;
  closeSubscription: (id: string, reason: string) => void;
  generateRecurringInvoice: (subscriptionId: string) => Invoice | null;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber' | 'amountPaid' | 'balanceDue'>) => Invoice;
  confirmInvoice: (id: string) => void;
  cancelInvoice: (id: string, reason?: string) => void;

  payments: Payment[];
  recordPayment: (payment: {
    customerId: string;
    customerName: string;
    amount: number;
    method: Payment['method'];
    reference: string;
    notes?: string;
    allocations: { invoiceId: string; amount: number }[];
  }) => Payment;

  taxRules: TaxRule[];
  addTaxRule: (rule: Omit<TaxRule, 'id'>) => void;
  updateTaxRule: (id: string, updates: Partial<TaxRule>) => void;

  discounts: Discount[];
  addDiscount: (discount: Omit<Discount, 'id' | 'usageCount'>) => void;
  updateDiscount: (id: string, updates: Partial<Discount>) => void;

  metrics: DashboardMetrics;

  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // default Sarah Connor (Admin)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [taxRules, setTaxRules] = useState<TaxRule[]>(initialTaxRules);
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // User actions
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      assignedCustomersCount: 0,
      lastActive: 'Never',
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`Staff account for ${newUser.name} created successfully.`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    showToast('Staff member updated.');
  };

  // Customer actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'outstandingBalance'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      outstandingBalance: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" created.`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Customer record updated.');
  };

  // Product actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added to catalog.`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Product updated successfully.');
  };

  // Plan actions
  const addPlan = (planData: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}`,
      subscribersCount: 0,
    };
    setPlans((prev) => [newPlan, ...prev]);
    showToast(`Plan "${newPlan.name}" configured.`);
    return newPlan;
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Plan rules updated.');
  };

  // Quotation actions
  const addQuotation = (quotData: Omit<Quotation, 'id' | 'createdAt' | 'quotationNumber'>) => {
    const newQuot: Quotation = {
      ...quotData,
      id: `quot-${Date.now()}`,
      quotationNumber: generateDocNumber('QT'),
      createdAt: new Date().toISOString(),
    };
    setQuotations((prev) => [newQuot, ...prev]);
    showToast(`Quotation ${newQuot.quotationNumber} generated.`);
    return newQuot;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
    showToast('Quotation updated.');
  };

  const convertQuotationToSubscription = (quotationId: string): Subscription | null => {
    const quot = quotations.find((q) => q.id === quotationId);
    if (!quot) return null;

    const matchedPlan = plans[0]; // fallback default plan
    const subNumber = generateDocNumber('SUB');
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: subNumber,
      customerId: quot.customerId,
      customerName: quot.customerName,
      planId: matchedPlan.id,
      planName: matchedPlan.name,
      billingInterval: matchedPlan.billingInterval,
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      status: 'CONFIRMED',
      totalAmount: quot.totalAmount,
      createdAt: new Date().toISOString(),
      lines: quot.lines.map((l) => ({
        id: `sl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: l.productId,
        variantId: l.variantId,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        discountAmount: l.discountAmount,
        lineTotal: l.lineTotal,
      })),
      events: [
        {
          id: `ev-${Date.now()}`,
          subscriptionId: `sub-${Date.now()}`,
          eventType: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          note: `Converted from accepted Quotation ${quot.quotationNumber}`,
        },
      ],
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status: 'CONVERTED', convertedSubscriptionId: newSub.id } : q))
    );
    showToast(`Quotation converted to Subscription ${subNumber}!`);
    return newSub;
  };

  // Subscription lifecycle actions
  const addSubscription = (subData: Omit<Subscription, 'id' | 'createdAt' | 'subscriptionNumber' | 'events'>) => {
    const subNumber = generateDocNumber('SUB');
    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}`,
      subscriptionNumber: subNumber,
      createdAt: new Date().toISOString(),
      events: [
        {
          id: `ev-${Date.now()}`,
          subscriptionId: `sub-${Date.now()}`,
          eventType: 'CREATED',
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          note: 'Subscription manually created by internal staff.',
        },
      ],
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    showToast(`Subscription ${subNumber} created.`);
    return newSub;
  };

  const pauseSubscription = (id: string, reason: string, expectedResumeDate?: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newEvent: SubscriptionEvent = {
          id: `ev-${Date.now()}`,
          subscriptionId: id,
          eventType: 'PAUSED',
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          note: `Subscription paused: ${reason} (Resume target: ${expectedResumeDate || 'Open'})`,
        };
        return {
          ...s,
          status: 'PAUSED',
          pauseDate: new Date().toISOString().split('T')[0],
          resumeExpectedDate: expectedResumeDate,
          events: [newEvent, ...s.events],
        };
      })
    );
    showToast('Subscription paused according to plan lifecycle policy.', 'warning');
  };

  const resumeSubscription = (id: string, note = 'Subscription resumed') => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newEvent: SubscriptionEvent = {
          id: `ev-${Date.now()}`,
          subscriptionId: id,
          eventType: 'RESUMED',
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          note,
        };
        return {
          ...s,
          status: 'ACTIVE',
          pauseDate: undefined,
          resumeExpectedDate: undefined,
          events: [newEvent, ...s.events],
        };
      })
    );
    showToast('Subscription resumed and reactivated.');
  };

  const renewSubscription = (id: string, newEndDate: string, note = 'Renewed for next term') => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newEvent: SubscriptionEvent = {
          id: `ev-${Date.now()}`,
          subscriptionId: id,
          eventType: 'RENEWED',
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          note: `${note}. New term until ${newEndDate}`,
        };
        return {
          ...s,
          status: 'ACTIVE',
          endDate: newEndDate,
          events: [newEvent, ...s.events],
        };
      })
    );
    showToast('Subscription renewed successfully.');
  };

  const closeSubscription = (id: string, reason: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newEvent: SubscriptionEvent = {
          id: `ev-${Date.now()}`,
          subscriptionId: id,
          eventType: 'CLOSED',
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          note: `Early termination: ${reason}`,
        };
        return {
          ...s,
          status: 'CLOSED',
          closeReason: reason,
          events: [newEvent, ...s.events],
        };
      })
    );
    showToast('Subscription closed.', 'warning');
  };

  const generateRecurringInvoice = (subscriptionId: string): Invoice | null => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return null;

    const invoiceNum = generateDocNumber('INV');
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subtotal = sub.lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
    const tax = sub.lines.reduce((acc, l) => acc + ((l.quantity * l.unitPrice * l.taxRate) / 100), 0);
    const total = Math.round((subtotal + tax) * 100) / 100;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: sub.customerId,
      customerName: sub.customerName,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      issueDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'CONFIRMED',
      currency: 'USD',
      subtotal,
      taxAmount: tax,
      discountAmount: 0,
      totalAmount: total,
      amountPaid: 0,
      balanceDue: total,
      lines: sub.lines.map((l) => ({
        id: `il-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        description: `${l.description} (Billing interval: ${sub.billingInterval})`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        discountAmount: l.discountAmount,
        lineTotal: l.lineTotal,
      })),
      notes: `Recurring billing for ${sub.subscriptionNumber}. Payment terms: ${sub.paymentTerms}`,
      createdAt: now.toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update customer outstanding balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === sub.customerId ? { ...c, outstandingBalance: c.outstandingBalance + total } : c
      )
    );

    // Record invoice event in subscription
    const invoicedEvent: SubscriptionEvent = {
      id: `ev-${Date.now()}`,
      subscriptionId: sub.id,
      eventType: 'INVOICED',
      timestamp: now.toISOString(),
      actor: currentUser.name,
      note: `Generated Invoice ${invoiceNum} for amount $${total.toFixed(2)}`,
    };

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, events: [invoicedEvent, ...s.events] } : s))
    );

    showToast(`Recurring invoice ${invoiceNum} generated!`);
    return newInvoice;
  };

  // Invoice actions
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber' | 'amountPaid' | 'balanceDue'>) => {
    const invNumber = generateDocNumber('INV');
    const newInv: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      amountPaid: 0,
      balanceDue: invoiceData.totalAmount,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Invoice ${invNumber} drafted.`);
    return newInv;
  };

  const confirmInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'CONFIRMED' } : i)));
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === inv.customerId ? { ...c, outstandingBalance: c.outstandingBalance + inv.balanceDue } : c
      )
    );
    showToast(`Invoice ${inv.invoiceNumber} confirmed.`);
  };

  const cancelInvoice = (id: string, reason?: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'CANCELLED', notes: `${i.notes || ''} [Cancelled: ${reason || 'N/A'}]` } : i))
    );
    if (inv.status === 'CONFIRMED' || inv.status === 'OVERDUE') {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === inv.customerId ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - inv.balanceDue) } : c
        )
      );
    }
    showToast(`Invoice ${inv.invoiceNumber} cancelled.`, 'warning');
  };

  // Payment recording & allocation
  const recordPayment = ({
    customerId,
    customerName,
    amount,
    method,
    reference,
    notes,
    allocations,
  }: {
    customerId: string;
    customerName: string;
    amount: number;
    method: Payment['method'];
    reference: string;
    notes?: string;
    allocations: { invoiceId: string; amount: number }[];
  }): Payment => {
    const payNumber = generateDocNumber('PAY');
    const paymentId = `pay-${Date.now()}`;

    const newPayment: Payment = {
      id: paymentId,
      paymentNumber: payNumber,
      date: new Date().toISOString().split('T')[0],
      customerId,
      customerName,
      amount,
      method,
      reference,
      status: 'COMPLETED',
      notes,
      createdAt: new Date().toISOString(),
      allocations: allocations.map((a) => {
        const inv = invoices.find((i) => i.id === a.invoiceId);
        return {
          id: `pa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          paymentId,
          invoiceId: a.invoiceId,
          invoiceNumber: inv?.invoiceNumber || a.invoiceId,
          allocatedAmount: a.amount,
        };
      }),
    };

    // Update allocated invoices
    setInvoices((prev) =>
      prev.map((inv) => {
        const allocation = allocations.find((a) => a.invoiceId === inv.id);
        if (!allocation) return inv;
        const newAmountPaid = inv.amountPaid + allocation.amount;
        const newBalanceDue = Math.max(0, inv.totalAmount - newAmountPaid);
        const newStatus = newBalanceDue <= 0.01 ? 'PAID' : inv.status;
        return {
          ...inv,
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        };
      })
    );

    // Update customer outstanding balance & total spent
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          totalSpent: c.totalSpent + amount,
          outstandingBalance: Math.max(0, c.outstandingBalance - amount),
        };
      })
    );

    setPayments((prev) => [newPayment, ...prev]);
    showToast(`Payment of $${amount.toFixed(2)} recorded and allocated.`);
    return newPayment;
  };

  // Tax rule actions
  const addTaxRule = (ruleData: Omit<TaxRule, 'id'>) => {
    const newRule: TaxRule = {
      ...ruleData,
      id: `tax-${Date.now()}`,
    };
    setTaxRules((prev) => [newRule, ...prev]);
    showToast(`Tax rule "${newRule.name}" added.`);
  };

  const updateTaxRule = (id: string, updates: Partial<TaxRule>) => {
    setTaxRules((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Tax rule updated.');
  };

  // Discount actions
  const addDiscount = (discData: Omit<Discount, 'id' | 'usageCount'>) => {
    const newDisc: Discount = {
      ...discData,
      id: `disc-${Date.now()}`,
      usageCount: 0,
    };
    setDiscounts((prev) => [newDisc, ...prev]);
    showToast(`Discount code ${newDisc.code} configured.`);
  };

  const updateDiscount = (id: string, updates: Partial<Discount>) => {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Discount updated.');
  };

  // Calculated Dashboard metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const activeSubscriptionsCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;

    // Monthly recurring value
    const totalMonthlyRevenue = subscriptions
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => {
        if (s.billingInterval === 'MONTHLY') return sum + s.totalAmount;
        if (s.billingInterval === 'YEARLY') return sum + s.totalAmount / 12;
        if (s.billingInterval === 'WEEKLY') return sum + s.totalAmount * 4.33;
        if (s.billingInterval === 'DAILY') return sum + s.totalAmount * 30;
        return sum + s.totalAmount;
      }, 0);

    const cashReceivedThisMonth = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoicedThisMonth = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalOutstandingBalance = invoices
      .filter((i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + i.balanceDue, 0);

    const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
    const overdueInvoicesCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

    return {
      activeSubscriptionsCount,
      totalMonthlyRevenue: Math.round(totalMonthlyRevenue * 100) / 100,
      cashReceivedThisMonth: Math.round(cashReceivedThisMonth * 100) / 100,
      invoicedThisMonth: Math.round(invoicedThisMonth * 100) / 100,
      totalOutstandingBalance: Math.round(totalOutstandingBalance * 100) / 100,
      overdueInvoicesCount,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      customersCount: customers.length,
    };
  }, [subscriptions, payments, invoices, customers]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        customers,
        addCustomer,
        updateCustomer,
        products,
        addProduct,
        updateProduct,
        plans,
        addPlan,
        updatePlan,
        quotations,
        addQuotation,
        updateQuotation,
        convertQuotationToSubscription,
        subscriptions,
        addSubscription,
        pauseSubscription,
        resumeSubscription,
        renewSubscription,
        closeSubscription,
        generateRecurringInvoice,
        invoices,
        addInvoice,
        confirmInvoice,
        cancelInvoice,
        payments,
        recordPayment,
        taxRules,
        addTaxRule,
        updateTaxRule,
        discounts,
        addDiscount,
        updateDiscount,
        metrics,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

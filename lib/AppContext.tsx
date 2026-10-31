'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
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
} from './types';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'outstandingBalance'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;

  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;

  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id'>) => Promise<Plan>;
  updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;

  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'quotationNumber'>) => Promise<Quotation>;
  updateQuotation: (id: string, updates: Partial<Quotation>) => Promise<void>;
  convertQuotationToSubscription: (quotationId: string) => Promise<Subscription | null>;

  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'subscriptionNumber' | 'events'>) => Promise<Subscription>;
  pauseSubscription: (id: string, reason: string, expectedResumeDate?: string) => Promise<void>;
  resumeSubscription: (id: string, note?: string) => Promise<void>;
  renewSubscription: (id: string, newEndDate: string, note?: string) => Promise<void>;
  closeSubscription: (id: string, reason: string) => Promise<void>;
  generateRecurringInvoice: (subscriptionId: string) => Promise<Invoice | null>;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber' | 'amountPaid' | 'balanceDue'>) => Promise<Invoice>;
  confirmInvoice: (id: string) => Promise<void>;
  cancelInvoice: (id: string, reason?: string) => Promise<void>;

  payments: Payment[];
  recordPayment: (payment: {
    customerId: string;
    customerName: string;
    amount: number;
    method: Payment['method'];
    reference: string;
    notes?: string;
    allocations: { invoiceId: string; amount: number }[];
  }) => Promise<Payment>;

  taxRules: TaxRule[];
  addTaxRule: (rule: Omit<TaxRule, 'id'>) => Promise<void>;
  updateTaxRule: (id: string, updates: Partial<TaxRule>) => Promise<void>;

  discounts: Discount[];
  addDiscount: (discount: Omit<Discount, 'id' | 'usageCount'>) => Promise<void>;
  updateDiscount: (id: string, updates: Partial<Discount>) => Promise<void>;

  metrics: DashboardMetrics;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  dbConnectionError: string | null;

  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const defaultUser: User = {
  id: '',
  name: 'Operations Staff',
  email: '',
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnectionError, setDbConnectionError] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all initial data from Postgres via API routes
  const refreshData = useCallback(async () => {
    try {
      const endpoints = [
        '/api/users',
        '/api/customers',
        '/api/products',
        '/api/plans',
        '/api/quotations',
        '/api/subscriptions',
        '/api/invoices',
        '/api/payments',
        '/api/tax-rules',
        '/api/discounts',
      ];

      const responses = await Promise.all(
        endpoints.map((ep) =>
          fetch(ep).catch((err) => ({
            ok: false,
            status: 0,
            json: async () => ({ error: err.message }),
          }))
        )
      );

      const failedIndex = responses.findIndex((r) => !r.ok);
      if (failedIndex !== -1) {
        const failedResp = responses[failedIndex];
        let detail = `Status ${failedResp.status || 'Network Error'} on ${endpoints[failedIndex]}`;
        try {
          const errData = await failedResp.json();
          if (errData.error) detail = `${errData.error}`;
        } catch {}
        setDbConnectionError(detail);
        console.warn('[AppContext] Database sync issue detected:', detail);
      } else {
        setDbConnectionError(null);
      }

      const [
        usersRes,
        customersRes,
        productsRes,
        plansRes,
        quotationsRes,
        subscriptionsRes,
        invoicesRes,
        paymentsRes,
        taxesRes,
        discountsRes,
      ] = await Promise.all(
        responses.map(async (r) => {
          if (!r.ok) return [];
          try {
            return await r.json();
          } catch {
            return [];
          }
        })
      );

      setUsers(usersRes);
      try {
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated && authData.user) {
            setCurrentUser(authData.user);
          } else if (usersRes.length > 0) {
            setCurrentUser((prev) => {
              const match = usersRes.find((u: User) => u.id === prev.id);
              return match || usersRes[0];
            });
          }
        } else if (usersRes.length > 0) {
          setCurrentUser((prev) => {
            const match = usersRes.find((u: User) => u.id === prev.id);
            return match || usersRes[0];
          });
        }
      } catch {
        if (usersRes.length > 0) {
          setCurrentUser((prev) => {
            const match = usersRes.find((u: User) => u.id === prev.id);
            return match || usersRes[0];
          });
        }
      }
      setCustomers(customersRes);
      setProducts(productsRes);
      setPlans(plansRes);
      setQuotations(quotationsRes);
      setSubscriptions(subscriptionsRes);
      setInvoices(invoicesRes);
      setPayments(paymentsRes);
      setTaxRules(taxesRes);
      setDiscounts(discountsRes);
    } catch (err: any) {
      console.error('Failed to load database data:', err);
      setDbConnectionError(err.message || 'Network error syncing with PostgreSQL');
      showToast('Error syncing with database', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // User actions
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Failed to create user');
      const newUser = await res.json();
      setUsers((prev) => [newUser, ...prev]);
      showToast(`Staff account for ${newUser.name} created.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      showToast('Staff member updated.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Customer actions
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'outstandingBalance'>) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to create customer', 'error');
      throw new Error(err.error || 'Failed to create customer');
    }
    const newCustomer = await res.json();
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" created in database.`);
    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update customer');
      const updated = await res.json();
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast('Customer record updated in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Product actions
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to add product', 'error');
      throw new Error(err.error || 'Failed to add product');
    }
    const newProd = await res.json();
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" saved to database.`);
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Product updated successfully in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Plan actions
  const addPlan = async (planData: Omit<Plan, 'id'>) => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to create plan', 'error');
      throw new Error(err.error || 'Failed to create plan');
    }
    const newPlan = await res.json();
    setPlans((prev) => [newPlan, ...prev]);
    showToast(`Plan "${newPlan.name}" configured in database.`);
    return newPlan;
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      const updated = await res.json();
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Plan rules updated in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Quotation actions
  const addQuotation = async (quotData: Omit<Quotation, 'id' | 'createdAt' | 'quotationNumber'>) => {
    const res = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotData),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to create quotation', 'error');
      throw new Error(err.error || 'Failed to create quotation');
    }
    const newQuot = await res.json();
    setQuotations((prev) => [newQuot, ...prev]);
    showToast(`Quotation ${newQuot.quotationNumber} saved in database.`);
    return newQuot;
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update quotation');
      const updated = await res.json();
      setQuotations((prev) => prev.map((q) => (q.id === id ? updated : q)));
      showToast('Quotation updated in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const convertQuotationToSubscription = async (quotationId: string): Promise<Subscription | null> => {
    try {
      const res = await fetch(`/api/quotations/${quotationId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: currentUser.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Conversion failed');
      }
      const newSub = await res.json();
      await refreshData();
      showToast(`Quotation converted to Subscription ${newSub.subscriptionNumber}!`);
      return newSub;
    } catch (err: any) {
      showToast(err.message, 'error');
      return null;
    }
  };

  // Subscription lifecycle actions
  const addSubscription = async (subData: Omit<Subscription, 'id' | 'createdAt' | 'subscriptionNumber' | 'events'>) => {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...subData, actor: currentUser.name }),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to create subscription', 'error');
      throw new Error(err.error || 'Failed to create subscription');
    }
    const newSub = await res.json();
    setSubscriptions((prev) => [newSub, ...prev]);
    showToast(`Subscription ${newSub.subscriptionNumber} created.`);
    return newSub;
  };

  const pauseSubscription = async (id: string, reason: string, expectedResumeDate?: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, expectedResumeDate, actor: currentUser.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Pause failed');
      }
      await refreshData();
      showToast('Subscription paused according to plan lifecycle policy.', 'warning');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const resumeSubscription = async (id: string, note = 'Subscription resumed') => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, actor: currentUser.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Resume failed');
      }
      await refreshData();
      showToast('Subscription resumed and reactivated in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const renewSubscription = async (id: string, newEndDate: string, note = 'Renewed for next term') => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEndDate, note, actor: currentUser.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Renewal failed');
      }
      await refreshData();
      showToast('Subscription renewed successfully in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const closeSubscription = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, actor: currentUser.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Close failed');
      }
      await refreshData();
      showToast('Subscription closed in database.', 'warning');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const generateRecurringInvoice = async (subscriptionId: string): Promise<Invoice | null> => {
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: currentUser.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate recurring invoice');
      }
      const newInvoice = await res.json();
      await refreshData();
      showToast(`Recurring invoice ${newInvoice.invoiceNumber} generated!`);
      return newInvoice;
    } catch (err: any) {
      showToast(err.message, 'error');
      return null;
    }
  };

  // Invoice actions
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber' | 'amountPaid' | 'balanceDue'>) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to draft invoice', 'error');
      throw new Error(err.error || 'Failed to draft invoice');
    }
    const newInv = await res.json();
    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Invoice ${newInv.invoiceNumber} drafted in database.`);
    return newInv;
  };

  const confirmInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/confirm`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Confirm failed');
      }
      await refreshData();
      showToast('Invoice confirmed and balance added to customer receivables.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const cancelInvoice = async (id: string, reason?: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cancel failed');
      }
      await refreshData();
      showToast('Invoice cancelled in database.', 'warning');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Payment recording & allocation
  const recordPayment = async (paymentData: {
    customerId: string;
    customerName: string;
    amount: number;
    method: Payment['method'];
    reference: string;
    notes?: string;
    allocations: { invoiceId: string; amount: number }[];
  }): Promise<Payment> => {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to record payment', 'error');
      throw new Error(err.error || 'Failed to record payment');
    }
    const newPayment = await res.json();
    await refreshData();
    showToast(`Payment of $${paymentData.amount.toFixed(2)} recorded and allocated in database!`);
    return newPayment;
  };

  // Tax rule actions
  const addTaxRule = async (ruleData: Omit<TaxRule, 'id'>) => {
    try {
      const res = await fetch('/api/tax-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      });
      if (!res.ok) throw new Error('Failed to create tax rule');
      const newRule = await res.json();
      setTaxRules((prev) => [newRule, ...prev]);
      showToast(`Tax rule "${newRule.name}" saved in database.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateTaxRule = async (id: string, updates: Partial<TaxRule>) => {
    try {
      const res = await fetch(`/api/tax-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update tax rule');
      const updated = await res.json();
      setTaxRules((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('Tax rule updated in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Discount actions
  const addDiscount = async (discData: Omit<Discount, 'id' | 'usageCount'>) => {
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discData),
      });
      if (!res.ok) throw new Error('Failed to create discount');
      const newDisc = await res.json();
      setDiscounts((prev) => [newDisc, ...prev]);
      showToast(`Discount code ${newDisc.code} configured in database.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateDiscount = async (id: string, updates: Partial<Discount>) => {
    try {
      const res = await fetch(`/api/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update discount');
      const updated = await res.json();
      setDiscounts((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast('Discount updated in database.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Live Calculated Dashboard metrics from state loaded from DB
  const metrics: DashboardMetrics = useMemo(() => {
    const activeSubscriptionsCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;

    const totalMonthlyRevenue = subscriptions
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => {
        const val = Number(s.totalAmount) || 0;
        if (s.billingInterval === 'MONTHLY') return sum + val;
        if (s.billingInterval === 'YEARLY') return sum + val / 12;
        if (s.billingInterval === 'WEEKLY') return sum + val * 4.33;
        if (s.billingInterval === 'DAILY') return sum + val * 30;
        return sum + val;
      }, 0);

    const cashReceivedThisMonth = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const invoicedThisMonth = invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
    const totalOutstandingBalance = invoices
      .filter((i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + (Number(i.balanceDue) || 0), 0);

    const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
    const overdueInvoicesCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (Number(i.balanceDue) || 0), 0);

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
        isLoading,
        refreshData,
        dbConnectionError,
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

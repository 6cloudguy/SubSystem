import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedUsers = [
  {
    id: 'user-1',
    name: 'Sarah Connor',
    email: 'sarah.admin@brightloop.io',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    assignedCustomersCount: 12,
    createdAt: '2026-01-15T09:00:00Z',
    passwordHash: '$2b$10$7hHVnWTrqYiXWsfb8yN44OasO.TNSHXigqVyVxjHIA4rL84.crUcS',
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@brightloop.io',
    role: 'INTERNAL_STAFF',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    assignedCustomersCount: 8,
    createdAt: '2026-02-01T10:30:00Z',
    passwordHash: '$2b$10$RT/0M1zc1HoHp8mMRhxzIelz16JrHg5zaI9qIi5OZkeySPWPWDBU.',
  },
  {
    id: 'user-3',
    name: 'Jordan Lee',
    email: 'jordan.lee@brightloop.io',
    role: 'INTERNAL_STAFF',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    assignedCustomersCount: 6,
    createdAt: '2026-03-10T14:15:00Z',
    passwordHash: '$2b$10$RT/0M1zc1HoHp8mMRhxzIelz16JrHg5zaI9qIi5OZkeySPWPWDBU.',
  },
  {
    id: 'user-4',
    name: 'Marcus Vance',
    email: 'marcus.v@brightloop.io',
    role: 'INTERNAL_STAFF',
    status: 'INACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    assignedCustomersCount: 0,
    createdAt: '2026-01-20T11:00:00Z',
    passwordHash: '$2b$10$RT/0M1zc1HoHp8mMRhxzIelz16JrHg5zaI9qIi5OZkeySPWPWDBU.',
  },
];

const seedCustomers = [
  {
    id: 'cust-1',
    name: 'Acme Corporation',
    company: 'Acme Corp Global',
    email: 'billing@acmecorp.com',
    phone: '+1 (555) 234-5678',
    billingAddress: '100 Industrial Parkway, Suite 400, Chicago, IL 60601',
    taxId: 'US-849204123',
    notes: 'Key enterprise account. Prefers Net 30 terms and annual consolidated invoicing.',
    status: 'ACTIVE',
    createdAt: '2026-01-10T12:00:00Z',
    totalSpent: 42500,
    outstandingBalance: 3200,
  },
  {
    id: 'cust-2',
    name: 'NovaTech Labs',
    company: 'NovaTech Solutions Inc.',
    email: 'accounts@novatech.io',
    phone: '+1 (555) 789-0123',
    billingAddress: '742 Innovation Way, Austin, TX 78701',
    taxId: 'US-773419042',
    notes: 'High-growth AI startup. Upgraded from Starter to Enterprise in March.',
    status: 'ACTIVE',
    createdAt: '2026-02-14T08:30:00Z',
    totalSpent: 18900,
    outstandingBalance: 0,
  },
  {
    id: 'cust-3',
    name: 'Horizon Media Group',
    company: 'Horizon Digital Ltd.',
    email: 'finance@horizonmedia.com',
    phone: '+1 (555) 456-7890',
    billingAddress: '500 Madison Avenue, 18th Floor, New York, NY 10022',
    taxId: 'US-129482910',
    notes: 'Invoice #INV-2026-104 is overdue. Payment promised by end of week.',
    status: 'ACTIVE',
    createdAt: '2026-02-28T16:00:00Z',
    totalSpent: 9600,
    outstandingBalance: 1450,
  },
  {
    id: 'cust-4',
    name: 'Apex Financial Advisors',
    company: 'Apex Partners LLC',
    email: 'contact@apexadvisors.com',
    phone: '+1 (555) 987-6543',
    billingAddress: '1200 Wall Street, 9th Floor, New York, NY 10005',
    taxId: 'US-554910293',
    notes: 'Requested custom quotation for 50 additional user seat licenses.',
    status: 'LEAD',
    createdAt: '2026-03-15T11:20:00Z',
    totalSpent: 0,
    outstandingBalance: 0,
  },
  {
    id: 'cust-5',
    name: 'Zenith Retail Systems',
    company: 'Zenith Cloud Services',
    email: 'support@zenithretail.net',
    phone: '+1 (555) 321-6549',
    billingAddress: '300 Market Street, San Francisco, CA 94105',
    taxId: 'US-993821033',
    notes: 'Suspended temporarily pending updated credit verification.',
    status: 'SUSPENDED',
    createdAt: '2026-01-05T09:10:00Z',
    totalSpent: 7200,
    outstandingBalance: 850,
  },
];

const seedProducts = [
  {
    id: 'prod-1',
    name: 'Brightloop Platform Core',
    type: 'SOFTWARE',
    salesPrice: 299,
    costPrice: 45,
    notes: 'Primary subscription SaaS license covering base platform access and data sync.',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    variants: [
      {
        id: 'var-1-1',
        name: 'Standard (Up to 10 Seats)',
        sku: 'BL-CORE-STD',
        priceAdjustment: 0,
        finalPrice: 299,
        status: 'ACTIVE',
      },
      {
        id: 'var-1-2',
        name: 'Pro Tier (Up to 50 Seats)',
        sku: 'BL-CORE-PRO',
        priceAdjustment: 200,
        finalPrice: 499,
        status: 'ACTIVE',
      },
      {
        id: 'var-1-3',
        name: 'Enterprise Tier (Unlimited Seats)',
        sku: 'BL-CORE-ENT',
        priceAdjustment: 700,
        finalPrice: 999,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'AI Automation & Analytics Add-on',
    type: 'ADDON',
    salesPrice: 150,
    costPrice: 30,
    notes: 'Autonomous workflow automation engine and predictive churn reporting module.',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
    variants: [
      {
        id: 'var-2-1',
        name: 'Standard Processing (10k ops/mo)',
        sku: 'BL-AI-STD',
        priceAdjustment: 0,
        finalPrice: 150,
        status: 'ACTIVE',
      },
      {
        id: 'var-2-2',
        name: 'Turbo Processing (100k ops/mo)',
        sku: 'BL-AI-TURBO',
        priceAdjustment: 200,
        finalPrice: 350,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Priority 24/7 SLA Support',
    type: 'SERVICE',
    salesPrice: 120,
    costPrice: 50,
    notes: 'Guaranteed 1-hour response SLA, dedicated customer success manager, and phone access.',
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00Z',
    variants: [],
  },
  {
    id: 'prod-4',
    name: 'Dedicated Cloud Database Instance',
    type: 'ADDON',
    salesPrice: 450,
    costPrice: 180,
    notes: 'Isolated PostgreSQL compute cluster with automated hourly backups and VPC peering.',
    status: 'ACTIVE',
    createdAt: '2026-02-01T00:00:00Z',
    variants: [],
  },
];

const seedPlans = [
  {
    id: 'plan-1',
    name: 'Professional Monthly',
    description: 'Designed for scaling teams requiring robust subscription billing automation.',
    price: 499,
    billingInterval: 'MONTHLY',
    minQuantity: 1,
    startDate: '2026-01-01',
    allowPause: true,
    allowEarlyClose: true,
    allowRenewal: true,
    autoClose: false,
    status: 'ACTIVE',
  },
  {
    id: 'plan-2',
    name: 'Enterprise Annual',
    description: 'Full-featured enterprise plan with dedicated SLA and custom API rate limits.',
    price: 4999,
    billingInterval: 'YEARLY',
    minQuantity: 1,
    startDate: '2026-01-01',
    allowPause: true,
    allowEarlyClose: false,
    allowRenewal: true,
    autoClose: false,
    status: 'ACTIVE',
  },
  {
    id: 'plan-3',
    name: 'Starter Weekly Pilot',
    description: 'Short-term trial sprint with weekly recurring billing.',
    price: 99,
    billingInterval: 'WEEKLY',
    minQuantity: 1,
    startDate: '2026-02-01',
    allowPause: false,
    allowEarlyClose: true,
    allowRenewal: false,
    autoClose: true,
    status: 'ACTIVE',
  },
  {
    id: 'plan-4',
    name: 'Basic Daily Burst',
    description: 'On-demand compute burst billed daily for high-volume data migration periods.',
    price: 25,
    billingInterval: 'DAILY',
    minQuantity: 1,
    startDate: '2026-01-01',
    allowPause: false,
    allowEarlyClose: true,
    allowRenewal: true,
    autoClose: true,
    status: 'ACTIVE',
  },
];

const seedQuotations = [
  {
    id: 'quot-1',
    quotationNumber: 'QT-2026-0101',
    customerId: 'cust-4',
    customerName: 'Apex Financial Advisors',
    templateName: 'Enterprise SaaS Proposal',
    validityDate: '2026-11-30',
    status: 'SENT',
    notes: 'Quotation sent to Chief Technology Officer. Includes 10% promotional discount.',
    createdAt: '2026-10-15T10:00:00Z',
    subtotal: 5149,
    taxTotal: 411.92,
    discountTotal: 514.9,
    totalAmount: 5046.02,
    lines: [
      {
        id: 'ql-1',
        productId: 'prod-1',
        variantId: 'var-1-3',
        description: 'Brightloop Platform Core - Enterprise Tier (Unlimited Seats)',
        quantity: 1,
        unitPrice: 999,
        taxRate: 8.25,
        discountAmount: 99.9,
        lineTotal: 973.27,
      },
      {
        id: 'ql-2',
        productId: 'prod-2',
        variantId: 'var-2-2',
        description: 'AI Automation & Analytics Add-on (Turbo Processing)',
        quantity: 1,
        unitPrice: 350,
        taxRate: 8.25,
        discountAmount: 35.0,
        lineTotal: 340.99,
      },
      {
        id: 'ql-3',
        productId: 'prod-4',
        description: 'Dedicated Cloud Database Instance',
        quantity: 1,
        unitPrice: 450,
        taxRate: 8.25,
        discountAmount: 45.0,
        lineTotal: 438.41,
      },
    ],
  },
  {
    id: 'quot-2',
    quotationNumber: 'QT-2026-0098',
    customerId: 'cust-1',
    customerName: 'Acme Corporation',
    templateName: 'Annual Renewal Plan',
    validityDate: '2026-10-25',
    status: 'CONVERTED',
    convertedSubscriptionId: 'sub-1',
    notes: 'Successfully accepted and converted to Subscription #SUB-2026-001.',
    createdAt: '2026-09-10T14:30:00Z',
    subtotal: 4999,
    taxTotal: 399.92,
    discountTotal: 0,
    totalAmount: 5398.92,
    lines: [
      {
        id: 'ql-4',
        productId: 'prod-1',
        variantId: 'var-1-3',
        description: 'Brightloop Enterprise Annual License',
        quantity: 1,
        unitPrice: 4999,
        taxRate: 8.0,
        discountAmount: 0,
        lineTotal: 5398.92,
      },
    ],
  },
];

const seedSubscriptions = [
  {
    id: 'sub-1',
    subscriptionNumber: 'SUB-2026-001',
    customerId: 'cust-1',
    customerName: 'Acme Corporation',
    planId: 'plan-2',
    planName: 'Enterprise Annual',
    billingInterval: 'YEARLY',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    nextBillingDate: '2027-01-01',
    paymentTerms: 'Net 30',
    status: 'ACTIVE',
    totalAmount: 4999,
    createdAt: '2026-01-01T00:00:00Z',
    lines: [
      {
        id: 'sl-1',
        productId: 'prod-1',
        variantId: 'var-1-3',
        description: 'Brightloop Platform Core - Enterprise Tier',
        quantity: 1,
        unitPrice: 4999,
        taxRate: 8.0,
        discountAmount: 0,
        lineTotal: 5398.92,
      },
    ],
    events: [
      {
        id: 'ev-1',
        eventType: 'CREATED',
        timestamp: '2026-01-01T09:00:00Z',
        actor: 'Sarah Connor (Admin)',
        note: 'Subscription initiated from confirmed quotation QT-2026-0098',
      },
      {
        id: 'ev-2',
        eventType: 'ACTIVATED',
        timestamp: '2026-01-01T09:05:00Z',
        actor: 'System Automation',
        note: 'Activated upon primary payment clearance.',
      },
    ],
  },
  {
    id: 'sub-2',
    subscriptionNumber: 'SUB-2026-002',
    customerId: 'cust-2',
    customerName: 'NovaTech Labs',
    planId: 'plan-1',
    planName: 'Professional Monthly',
    billingInterval: 'MONTHLY',
    startDate: '2026-02-01',
    nextBillingDate: '2026-11-01',
    paymentTerms: 'Net 15',
    status: 'ACTIVE',
    totalAmount: 649,
    createdAt: '2026-02-01T10:00:00Z',
    lines: [
      {
        id: 'sl-2',
        productId: 'prod-1',
        variantId: 'var-1-2',
        description: 'Brightloop Platform Core - Pro Tier',
        quantity: 1,
        unitPrice: 499,
        taxRate: 8.0,
        discountAmount: 0,
        lineTotal: 538.92,
      },
      {
        id: 'sl-3',
        productId: 'prod-2',
        variantId: 'var-2-1',
        description: 'AI Automation Add-on (Standard)',
        quantity: 1,
        unitPrice: 150,
        taxRate: 8.0,
        discountAmount: 0,
        lineTotal: 162.0,
      },
    ],
    events: [
      {
        id: 'ev-3',
        eventType: 'ACTIVATED',
        timestamp: '2026-02-01T10:00:00Z',
        actor: 'Alex Rivera',
        note: 'Setup completed and welcome token generated.',
      },
    ],
  },
];

const seedInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-101',
    customerId: 'cust-1',
    customerName: 'Acme Corporation',
    subscriptionId: 'sub-1',
    subscriptionNumber: 'SUB-2026-001',
    issueDate: '2026-01-01',
    dueDate: '2026-01-31',
    status: 'PAID',
    currency: 'USD',
    subtotal: 4999.0,
    taxAmount: 399.92,
    discountAmount: 0,
    totalAmount: 5398.92,
    amountPaid: 5398.92,
    balanceDue: 0,
    lines: [
      {
        id: 'il-1',
        description: 'Brightloop Enterprise Annual License (2026-01-01 to 2027-01-01)',
        quantity: 1,
        unitPrice: 4999.0,
        taxRate: 8.0,
        discountAmount: 0,
        lineTotal: 5398.92,
      },
    ],
    notes: 'Thank you for your business. Paid via ACH Wire.',
    createdAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-102',
    customerId: 'cust-2',
    customerName: 'NovaTech Labs',
    subscriptionId: 'sub-2',
    subscriptionNumber: 'SUB-2026-002',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    status: 'PAID',
    currency: 'USD',
    subtotal: 649.0,
    taxAmount: 51.92,
    discountAmount: 0,
    totalAmount: 700.92,
    amountPaid: 700.92,
    balanceDue: 0,
    lines: [
      {
        id: 'il-2',
        description: 'Brightloop Platform Core - Pro Tier (October 2026)',
        quantity: 1,
        unitPrice: 499.0,
        taxRate: 8.0,
        discountAmount: 0,
        lineTotal: 538.92,
      },
    ],
    notes: 'Automatic monthly recurring billing cycle.',
    createdAt: '2026-10-01T08:00:00Z',
  },
];

const seedPayments = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2026-042',
    date: '2026-01-15',
    customerId: 'cust-1',
    customerName: 'Acme Corporation',
    amount: 5398.92,
    method: 'BANK_TRANSFER',
    reference: 'WIRE-ACH-8910482',
    status: 'COMPLETED',
    notes: 'Cleared through Wells Fargo settlement.',
    createdAt: '2026-01-15T15:00:00Z',
    allocations: [
      {
        id: 'pa-1',
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-2026-101',
        allocatedAmount: 5398.92,
      },
    ],
  },
];

const seedTaxRules = [
  {
    id: 'tax-1',
    name: 'State Sales Tax (Standard)',
    rate: 8.25,
    applicability: 'ALL',
    effectiveFrom: '2026-01-01',
    status: 'ACTIVE',
  },
];

const seedDiscounts = [
  {
    id: 'disc-1',
    code: 'WELCOME10',
    name: 'New Client Onboarding Discount',
    type: 'PERCENTAGE',
    value: 10,
    minAmount: 200,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    usageLimit: 100,
    scope: 'ALL',
    status: 'ACTIVE',
  },
];

async function main() {
  console.log('Seeding initial data if empty...');

  const userCount = await prisma.user.count();
  if (userCount === 0) {
    for (const u of seedUsers) {
      await prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as any,
          status: u.status as any,
          avatarUrl: u.avatarUrl,
          assignedCustomersCount: u.assignedCustomersCount,
          createdAt: new Date(u.createdAt),
        },
      });
    }

    for (const c of seedCustomers) {
      await prisma.customer.create({
        data: {
          id: c.id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          billingAddress: c.billingAddress,
          taxId: c.taxId,
          notes: c.notes,
          status: c.status as any,
          totalSpent: c.totalSpent,
          outstandingBalance: c.outstandingBalance,
          createdAt: new Date(c.createdAt),
        },
      });
    }

    for (const p of seedProducts) {
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          type: p.type as any,
          salesPrice: p.salesPrice,
          costPrice: p.costPrice,
          notes: p.notes,
          status: p.status as any,
          createdAt: new Date(p.createdAt),
          variants: {
            create: p.variants.map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              priceAdjustment: v.priceAdjustment,
              finalPrice: v.finalPrice,
              status: v.status as any,
            })),
          },
        },
      });
    }

    for (const pl of seedPlans) {
      await prisma.plan.create({
        data: {
          id: pl.id,
          name: pl.name,
          description: pl.description,
          price: pl.price,
          billingInterval: pl.billingInterval as any,
          minQuantity: pl.minQuantity,
          startDate: pl.startDate ? new Date(pl.startDate) : null,
          allowPause: pl.allowPause,
          allowEarlyClose: pl.allowEarlyClose,
          allowRenewal: pl.allowRenewal,
          autoClose: pl.autoClose,
          status: pl.status as any,
        },
      });
    }
  }

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

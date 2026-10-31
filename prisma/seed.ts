import { PrismaClient } from '@prisma/client';
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
} from '../lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse dependency order
  await prisma.paymentAllocation.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.subscriptionEvent.deleteMany({});
  await prisma.subscriptionLine.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.quotationLine.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.taxRule.deleteMany({});
  await prisma.discount.deleteMany({});

  console.log('Seeding Users...');
  for (const u of initialUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        status: u.status as any,
        avatarUrl: u.avatarUrl,
        assignedCustomersCount: u.assignedCustomersCount || 0,
        createdAt: new Date(u.createdAt),
      },
    });
  }

  console.log('Seeding Customers...');
  for (const c of initialCustomers) {
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

  console.log('Seeding Products and Variants...');
  for (const p of initialProducts) {
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

  console.log('Seeding Plans...');
  for (const pl of initialPlans) {
    await prisma.plan.create({
      data: {
        id: pl.id,
        name: pl.name,
        description: pl.description,
        price: pl.price,
        billingInterval: pl.billingInterval as any,
        minQuantity: pl.minQuantity,
        startDate: pl.startDate ? new Date(pl.startDate) : null,
        endDate: pl.endDate ? new Date(pl.endDate) : null,
        allowPause: pl.allowPause,
        allowEarlyClose: pl.allowEarlyClose,
        allowRenewal: pl.allowRenewal,
        autoClose: pl.autoClose,
        status: pl.status as any,
      },
    });
  }

  console.log('Seeding Quotations...');
  for (const q of initialQuotations) {
    await prisma.quotation.create({
      data: {
        id: q.id,
        quotationNumber: q.quotationNumber,
        customerId: q.customerId,
        customerName: q.customerName,
        templateName: q.templateName,
        validityDate: new Date(q.validityDate),
        status: q.status as any,
        subtotal: q.subtotal,
        taxTotal: q.taxTotal,
        discountTotal: q.discountTotal,
        totalAmount: q.totalAmount,
        notes: q.notes,
        convertedSubscriptionId: q.convertedSubscriptionId,
        createdAt: new Date(q.createdAt),
        lines: {
          create: q.lines.map((l) => ({
            id: l.id,
            productId: l.productId,
            variantId: l.variantId,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            discountAmount: l.discountAmount,
            lineTotal: l.lineTotal,
          })),
        },
      },
    });
  }

  console.log('Seeding Subscriptions...');
  for (const s of initialSubscriptions) {
    await prisma.subscription.create({
      data: {
        id: s.id,
        subscriptionNumber: s.subscriptionNumber,
        customerId: s.customerId,
        customerName: s.customerName,
        planId: s.planId,
        planName: s.planName,
        billingInterval: s.billingInterval as any,
        startDate: new Date(s.startDate),
        endDate: s.endDate ? new Date(s.endDate) : null,
        nextBillingDate: new Date(s.nextBillingDate),
        paymentTerms: s.paymentTerms,
        status: s.status as any,
        totalAmount: s.totalAmount,
        pauseDate: s.pauseDate ? new Date(s.pauseDate) : null,
        resumeExpectedDate: s.resumeExpectedDate ? new Date(s.resumeExpectedDate) : null,
        closeReason: s.closeReason,
        createdAt: new Date(s.createdAt),
        lines: {
          create: s.lines.map((l) => ({
            id: l.id,
            productId: l.productId,
            variantId: l.variantId,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            discountAmount: l.discountAmount,
            lineTotal: l.lineTotal,
          })),
        },
        events: {
          create: s.events.map((e) => ({
            id: e.id,
            eventType: e.eventType,
            timestamp: new Date(e.timestamp),
            actor: e.actor,
            note: e.note,
          })),
        },
      },
    });
  }

  console.log('Seeding Invoices...');
  for (const inv of initialInvoices) {
    await prisma.invoice.create({
      data: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: inv.customerName,
        subscriptionId: inv.subscriptionId,
        subscriptionNumber: inv.subscriptionNumber,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        status: inv.status as any,
        currency: inv.currency,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        discountAmount: inv.discountAmount,
        totalAmount: inv.totalAmount,
        amountPaid: inv.amountPaid,
        balanceDue: inv.balanceDue,
        notes: inv.notes,
        createdAt: new Date(inv.createdAt),
        lines: {
          create: inv.lines.map((l) => ({
            id: l.id,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            discountAmount: l.discountAmount,
            lineTotal: l.lineTotal,
          })),
        },
      },
    });
  }

  console.log('Seeding Payments...');
  for (const p of initialPayments) {
    await prisma.payment.create({
      data: {
        id: p.id,
        paymentNumber: p.paymentNumber,
        date: new Date(p.date),
        customerId: p.customerId,
        customerName: p.customerName,
        amount: p.amount,
        method: p.method as any,
        reference: p.reference,
        status: p.status as any,
        notes: p.notes,
        createdAt: new Date(p.createdAt),
        allocations: {
          create: p.allocations.map((a) => ({
            id: a.id,
            invoiceId: a.invoiceId,
            invoiceNumber: a.invoiceNumber,
            allocatedAmount: a.allocatedAmount,
          })),
        },
      },
    });
  }

  console.log('Seeding Tax Rules...');
  for (const tr of initialTaxRules) {
    await prisma.taxRule.create({
      data: {
        id: tr.id,
        name: tr.name,
        rate: tr.rate,
        applicability: tr.applicability,
        effectiveFrom: new Date(tr.effectiveFrom),
        effectiveTo: tr.effectiveTo ? new Date(tr.effectiveTo) : null,
        status: tr.status,
      },
    });
  }

  console.log('Seeding Discounts...');
  for (const d of initialDiscounts) {
    await prisma.discount.create({
      data: {
        id: d.id,
        code: d.code,
        name: d.name,
        type: d.type,
        value: d.value,
        minAmount: d.minAmount,
        validFrom: new Date(d.validFrom),
        validTo: d.validTo ? new Date(d.validTo) : null,
        usageLimit: d.usageLimit,
        usageCount: d.usageCount,
        scope: d.scope,
        status: d.status,
      },
    });
  }

  console.log('Seeding completed successfully! 🚀');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductList } from '@/components/catalog/ProductList';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Product Catalog & Variants
              </h1>
              <p className="text-sm text-slate-500">
                Manage software licenses, add-ons, services, and price-adjusting variants.
              </p>
            </div>
          </div>
        </div>

        <ProductList />
      </div>
    </AppLayout>
  );
}

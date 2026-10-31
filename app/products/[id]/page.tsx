'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Tag } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products } = useApp();

  const product = products.find((p) => p.id === params?.id);

  if (!product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Product not found.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/products')} icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Products
        </Button>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <Badge status={product.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">{product.notes}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(product.salesPrice)}</span>
            <span className="text-xs text-slate-500 block">Base Price</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Configured Variants</h3>
          {product.variants.length === 0 ? (
            <p className="text-xs text-slate-500">No variants defined.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {product.variants.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{v.name}</p>
                    <p className="text-xs text-slate-500">SKU: {v.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(v.finalPrice)}</p>
                    <p className="text-xs text-slate-500">Adjustment: {v.priceAdjustment >= 0 ? `+${v.priceAdjustment}` : v.priceAdjustment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function ProductModal({ isOpen, onClose, productToEdit }: ProductModalProps) {
  const { addProduct, updateProduct } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<Product['type']>('SOFTWARE');
  const [salesPrice, setSalesPrice] = useState<number>(100);
  const [costPrice, setCostPrice] = useState<number>(20);
  const [status, setStatus] = useState<Product['status']>('ACTIVE');
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setType(productToEdit.type);
      setSalesPrice(productToEdit.salesPrice);
      setCostPrice(productToEdit.costPrice);
      setStatus(productToEdit.status);
      setNotes(productToEdit.notes || '');
      setVariants(productToEdit.variants || []);
    } else {
      setName('');
      setType('SOFTWARE');
      setSalesPrice(100);
      setCostPrice(20);
      setStatus('ACTIVE');
      setNotes('');
      setVariants([]);
    }
  }, [productToEdit, isOpen]);

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      productId: productToEdit?.id || 'new',
      name: `Tier ${variants.length + 1}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      priceAdjustment: 0,
      finalPrice: salesPrice,
      status: 'ACTIVE',
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, ...updates };
        if (updates.priceAdjustment !== undefined) {
          updated.finalPrice = Math.max(0, salesPrice + updates.priceAdjustment);
        }
        return updated;
      })
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name,
        type,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        status,
        notes,
        variants,
      });
    } else {
      addProduct({
        name,
        type,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        status,
        notes,
        variants,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={productToEdit ? `Edit Product: ${productToEdit.name}` : 'Add Catalog Product'}
      description="Define product attributes, base sales/cost pricing, and variants with price adjustments."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {productToEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Product Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brightloop Platform Core"
            />
          </div>
          <Select
            label="Product Type"
            value={type}
            onChange={(e) => setType(e.target.value as Product['type'])}
            options={[
              { label: 'Software License', value: 'SOFTWARE' },
              { label: 'Add-on Module', value: 'ADDON' },
              { label: 'Service / Support', value: 'SERVICE' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Base Sales Price ($)"
            type="number"
            step="0.01"
            min="0"
            required
            value={salesPrice}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setSalesPrice(val);
              // Recalculate variant final prices
              setVariants((prev) =>
                prev.map((v) => ({ ...v, finalPrice: Math.max(0, val + v.priceAdjustment) }))
              );
            }}
          />
          <Input
            label="Cost Price ($)"
            type="number"
            step="0.01"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
          />
          <Select
            label="Catalog Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Product['status'])}
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
            Product Description / Internal Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Usage terms, scope, inclusions..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {/* Section 2.2: Product Variants with Price Adjustment */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-brand" />
                Product Variants ({variants.length})
              </h4>
              <p className="text-xs text-slate-500">
                Variants adjust the base price (e.g. +$200 for Pro tier). Server enforces totals.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No variants configured. This product will be sold at its standard base price.
            </div>
          ) : (
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div
                  key={variant.id || index}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Variant Name (e.g. 50 Seats)"
                      value={variant.name}
                      onChange={(e) => handleUpdateVariant(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => handleUpdateVariant(index, { sku: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Adjustment"
                      value={variant.priceAdjustment}
                      onChange={(e) =>
                        handleUpdateVariant(index, {
                          priceAdjustment: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="w-28 text-right pr-2">
                    <span className="text-[11px] text-slate-400 block">Calculated</span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatCurrency(variant.finalPrice)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

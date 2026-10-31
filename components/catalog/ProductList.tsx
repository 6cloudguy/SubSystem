'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Edit2, Layers, Tag } from 'lucide-react';
import { ProductModal } from './ProductModal';

export function ProductList() {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.notes && prod.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || prod.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <Input
            placeholder="Search products by name or notes..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-44 shrink-0">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: 'All Product Types', value: 'ALL' },
                { label: 'Software Licenses', value: 'SOFTWARE' },
                { label: 'Add-on Modules', value: 'ADDON' },
                { label: 'Services', value: 'SERVICE' },
              ]}
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Product
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name & Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Sales Price</TableHead>
            <TableHead className="text-right">Cost Price</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                No products found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>
                  <p className="font-semibold text-slate-900 text-sm">{prod.name}</p>
                  <p className="text-xs text-slate-500 max-w-md truncate mt-0.5">{prod.notes || '-'}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {prod.type}
                  </span>
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {formatCurrency(prod.salesPrice)}
                </TableCell>
                <TableCell className="text-right text-slate-500 text-xs">
                  {formatCurrency(prod.costPrice)}
                </TableCell>
                <TableCell>
                  {prod.variants.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {prod.variants.length} variant{prod.variants.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Base only</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge status={prod.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingProduct(prod);
                      setIsModalOpen(true);
                    }}
                    icon={<Edit2 className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
}

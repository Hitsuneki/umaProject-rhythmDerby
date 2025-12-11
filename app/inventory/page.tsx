'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Package, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface InventoryItem {
  userItemId: string;
  itemId: string;
  code: string;
  name: string;
  type: string;
  rarity?: string; // Optional - items table doesn't have rarity
  description: string;
  quantity: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function loadInventory() {
      try {
        const res = await fetch('/api/inventory');

        if (!res.ok) {
          throw new Error('Failed to load inventory');
        }

        const data = await res.json();

        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        console.error('Failed to fetch inventory:', e);
        if (!cancelled) {
          setError('Failed to load inventory');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted) return null;

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'text-gray-600';
    const r = rarity.toUpperCase();
    switch (r) {
      case 'SSR': return 'text-yellow-600';
      case 'SR': return 'text-purple-600';
      case 'R': return 'text-blue-600';
      case 'N': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity?: string) => {
    if (!rarity) return 'bg-gray-100 border-gray-300';
    const r = rarity.toUpperCase();
    switch (r) {
      case 'SSR': return 'bg-yellow-50 border-yellow-300';
      case 'SR': return 'bg-purple-50 border-purple-300';
      case 'R': return 'bg-blue-50 border-blue-300';
      case 'N': return 'bg-gray-100 border-gray-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getRarityLabel = (rarity?: string) => {
    if (!rarity) return 'Common';
    const r = rarity.toUpperCase();
    switch (r) {
      case 'SSR': return 'SSR - Legendary';
      case 'SR': return 'SR - Epic';
      case 'R': return 'R - Rare';
      case 'N': return 'N - Common';
      default: return rarity;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-(--charcoal) mb-2">
          Inventory
        </h1>
        <p className="text-(--grey-dark)">
          View your collected items from gacha pulls
        </p>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-(--accent) animate-spin" />
            <p className="text-(--grey-dark)">Loading inventory...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-(--accent) text-white rounded hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-(--grey-medium)" />
            <p className="text-(--grey-dark) mb-2">Your inventory is empty</p>
            <p className="text-sm text-(--grey-medium)">
              Try pulling from the gacha to get items!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.userItemId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border-2 ${getRarityBg(item.rarity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-display text-lg font-bold ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </h3>
                    <Badge variant="default" className="mt-1 text-xs">
                      {getRarityLabel(item.rarity)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="stat-mono text-2xl font-bold text-(--charcoal)">
                      ×{item.quantity}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-(--grey-medium) uppercase tracking-wide mb-1">
                    Type: {item.type}
                  </p>
                  <p className="text-xs text-(--grey-medium) uppercase tracking-wide">
                    Code: {item.code}
                  </p>
                </div>

                <p className="text-sm text-(--grey-dark)">
                  {item.description || 'No description available'}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

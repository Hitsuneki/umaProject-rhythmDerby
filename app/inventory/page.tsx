'use client';

import { useEffect, useState } from 'react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useUmaStore } from '@/stores/umaStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Package, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InventoryPage() {
  const { inventory, getAllItems, getInventoryItem, useItem, getItem, activeBoost } = useInventoryStore();
  const { umas, updateUma } = useUmaStore();
  const [mounted, setMounted] = useState(false);
  const [selectedUma, setSelectedUma] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const allItems = getAllItems();

  const handleUseItem = (itemId: string) => {
    const item = getItem(itemId);
    if (!item) return;

    if (item.effect.type === 'restore_energy') {
      if (!selectedUma) {
        alert('Please select an Uma first');
        return;
      }

      const uma = umas.find(u => u.id === selectedUma);
      if (!uma) return;

      const success = useItem(itemId, selectedUma);
      if (success) {
        const newEnergy = Math.min(uma.maxEnergy, uma.energy + (item.effect.value || 0));
        updateUma(selectedUma, { energy: newEnergy, lastEnergyUpdate: Date.now() });
      }
    } else {
      useItem(itemId);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'rare': return 'bg-blue-50 border-blue-300';
      case 'epic': return 'bg-purple-50 border-purple-300';
      case 'legendary': return 'bg-yellow-50 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-(--charcoal) mb-2">
          Inventory
        </h1>
        <p className="text-(--grey-dark)">
          Manage and use your items
        </p>
      </div>

      {activeBoost && (
        <Card className="bg-yellow-50 border-yellow-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-display text-sm font-semibold text-yellow-900">
                Active Boost
              </p>
              <p className="text-sm text-yellow-700">
                +{activeBoost.value}% Training Quality for next session
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-6">
          <Select
            label="Select Uma (for energy items)"
            value={selectedUma}
            onChange={(e) => setSelectedUma(e.target.value)}
            options={[
              { value: '', label: 'Choose Uma...' },
              ...umas.map((uma) => ({ value: uma.id, label: `${uma.name} (Energy: ${uma.energy}/${uma.maxEnergy})` })),
            ]}
          />
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-(--grey-medium)" />
            <p className="text-(--grey-dark)">Your inventory is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allItems.map((item) => {
              const inventoryItem = getInventoryItem(item.id);
              if (!inventoryItem) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border-2 ${getRarityBg(item.rarity)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`font-display text-lg font-bold ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </h3>
                      <Badge variant="default" className="mt-1 text-xs">
                        {item.rarity}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="stat-mono text-2xl font-bold text-(--charcoal)">
                        ×{inventoryItem.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-(--grey-dark) mb-4">
                    {item.description}
                  </p>

                  <Button
                    variant="primary"
                    className="w-full text-sm"
                    onClick={() => handleUseItem(item.id)}
                    disabled={inventoryItem.quantity === 0}
                  >
                    Use Item
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
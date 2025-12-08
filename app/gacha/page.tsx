'use client';

import { useEffect, useState } from 'react';
import { useGachaStore } from '@/stores/gachaStore';
import { useCurrencyStore } from '@/stores/currencyStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useUmaStore } from '@/stores/umaStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Star, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GachaPull } from '@/types';

const SINGLE_PULL_COST = 100;
const MULTI_PULL_COST = 900; // 10% discount

export default function GachaPage() {
  const { pull, multiPull, getHistory, getTemplate } = useGachaStore();
  const { balance, spendCurrency } = useCurrencyStore();
  const { addItem } = useInventoryStore();
  const { addUma } = useUmaStore();
  
  const [mounted, setMounted] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [revealedPulls, setRevealedPulls] = useState<GachaPull[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSinglePull = () => {
    if (balance < SINGLE_PULL_COST) {
      alert('Not enough coins!');
      return;
    }

    const success = spendCurrency(SINGLE_PULL_COST, 'Gacha single pull');
    if (!success) return;

    setPulling(true);
    
    setTimeout(() => {
      const result = pull();
      processReward(result);
      setRevealedPulls([result]);
      setPulling(false);
    }, 1500);
  };

  const handleMultiPull = () => {
    if (balance < MULTI_PULL_COST) {
      alert('Not enough coins!');
      return;
    }

    const success = spendCurrency(MULTI_PULL_COST, 'Gacha 10x pull');
    if (!success) return;

    setPulling(true);
    
    setTimeout(() => {
      const results = multiPull(10);
      results.forEach(processReward);
      setRevealedPulls(results);
      setPulling(false);
    }, 1500);
  };

  const processReward = (pullResult: GachaPull) => {
    if (pullResult.rewardType === 'uma') {
      const template = getTemplate(pullResult.rewardId);
      if (template) {
        addUma({
          name: template.name,
          level: 1,
          speed: template.baseStats.speed,
          stamina: template.baseStats.stamina,
          technique: template.baseStats.technique,
          temperament: template.temperament,
          style: template.style,
          trait: template.trait,
          energy: 100,
          maxEnergy: 100,
          comfortZone: 50,
        });
      }
    } else if (pullResult.rewardType === 'item') {
      addItem(pullResult.rewardId, 1);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const history = getHistory();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-(--charcoal) mb-2">
          Gacha
        </h1>
        <p className="text-(--grey-dark) mb-4">
          Try your luck and recruit new Uma Musume!
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-(--accent)/10 rounded-lg">
          <Star className="w-5 h-5 text-(--accent)" />
          <span className="stat-mono text-2xl font-bold text-(--accent)">
            {balance}
          </span>
          <span className="text-sm text-(--grey-dark)">Coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-(--accent)" />
          <h2 className="font-display text-xl font-bold mb-2 text-(--charcoal)">
            Single Pull
          </h2>
          <p className="text-sm text-(--grey-dark) mb-4">
            One random reward
          </p>
          <p className="stat-mono text-3xl font-bold text-(--accent) mb-4">
            {SINGLE_PULL_COST}
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSinglePull}
            disabled={pulling || balance < SINGLE_PULL_COST}
          >
            {pulling ? 'Pulling...' : 'Pull'}
          </Button>
        </Card>

        <Card className="text-center border-2 border-(--accent)">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-(--accent)" />
          <h2 className="font-display text-xl font-bold mb-2 text-(--charcoal)">
            10x Pull
          </h2>
          <p className="text-sm text-(--grey-dark) mb-4">
            Ten rewards at once (10% discount!)
          </p>
          <p className="stat-mono text-3xl font-bold text-(--accent) mb-4">
            {MULTI_PULL_COST}
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleMultiPull}
            disabled={pulling || balance < MULTI_PULL_COST}
          >
            {pulling ? 'Pulling...' : 'Pull 10x'}
          </Button>
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {revealedPulls.length > 0 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card>
              <h2 className="font-display text-2xl font-bold text-center mb-6 text-(--charcoal)">
                ✨ Results ✨
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {revealedPulls.map((pullResult, index) => {
                  const template = pullResult.rewardType === 'uma' ? getTemplate(pullResult.rewardId) : null;
                  const itemName = pullResult.rewardType === 'item' ? pullResult.rewardId.replace(/-/g, ' ') : '';

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, rotateY: 180 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${getRarityColor(pullResult.rarity)} text-white text-center`}
                    >
                      <div className="text-3xl mb-2">
                        {pullResult.rewardType === 'uma' ? '🏇' : '🎁'}
                      </div>
                      <p className="font-display text-sm font-bold uppercase mb-1">
                        {pullResult.rarity}
                      </p>
                      <p className="text-xs font-semibold">
                        {template ? template.name : itemName}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <Button variant="secondary" onClick={() => setRevealedPulls([])}>
                  Close
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-(--charcoal)">
            Pull History
          </h2>
          <Button
            variant="secondary"
            className="text-sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showHistory && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-(--grey-dark) py-8">
                No pulls yet
              </p>
            ) : (
              history.slice(0, 50).map((pullResult) => {
                const template = pullResult.rewardType === 'uma' ? getTemplate(pullResult.rewardId) : null;
                const itemName = pullResult.rewardType === 'item' ? pullResult.rewardId.replace(/-/g, ' ') : '';

                return (
                  <div
                    key={pullResult.id}
                    className="flex items-center justify-between p-3 bg-(--grey-light) rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {pullResult.rewardType === 'uma' ? '🏇' : '🎁'}
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-(--charcoal)">
                          {template ? template.name : itemName}
                        </p>
                        <Badge variant={pullResult.rarity === 'legendary' || pullResult.rarity === 'epic' ? 'accent' : 'default'} className="text-xs">
                          {pullResult.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-(--grey-dark)">
                      {new Date(pullResult.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
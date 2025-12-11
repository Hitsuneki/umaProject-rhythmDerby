'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Star, Gift, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SINGLE_PULL_COST = 100;
const MULTI_PULL_COST = 900; // 10% discount

interface GachaReward {
  id: string;
  rewardType: 'uma' | 'item';
  rewardId: string;
  rarity: string;
  name: string;
}

interface GachaHistoryItem {
  id: string;
  rewardType: string;
  rewardId: string;
  rarity: string;
  timestamp: number;
}

export default function GachaPage() {
  const { user, fetchUser } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [revealedPulls, setRevealedPulls] = useState<GachaReward[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GachaHistoryItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchUser(); // Ensure we have latest balance
  }, [fetchUser]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/gacha-history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  if (!mounted) return null;

  const handleSinglePull = async () => {
    if (!user || user.currency_balance < SINGLE_PULL_COST) {
      setError('Not enough coins!');
      return;
    }

    setError('');
    setPulling(true);

    try {
      const res = await fetch('/api/gacha/draw', { method: 'POST' });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Pull failed');
        setPulling(false);
        return;
      }

      const data = await res.json();

      // Update user balance
      await fetchUser();

      // Show reward with animation delay
      setTimeout(() => {
        setRevealedPulls([data.reward]);
        setPulling(false);
      }, 1500);
    } catch (err) {
      setError('Failed to pull. Please try again.');
      setPulling(false);
    }
  };

  const handleMultiPull = async () => {
    if (!user || user.currency_balance < MULTI_PULL_COST) {
      setError('Not enough coins!');
      return;
    }

    setError('');
    setPulling(true);

    try {
      // Make 10 sequential pulls
      const pulls: GachaReward[] = [];
      for (let i = 0; i < 10; i++) {
        const res = await fetch('/api/gacha/draw', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          pulls.push(data.reward);
        }
      }

      // Update user balance
      await fetchUser();

      // Show rewards with animation delay
      setTimeout(() => {
        setRevealedPulls(pulls);
        setPulling(false);
      }, 1500);
    } catch (err) {
      setError('Failed to pull. Please try again.');
      setPulling(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

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
            {user?.currency_balance?.toLocaleString() || 0}
          </span>
          <span className="text-sm text-(--grey-dark)">Coins</span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </motion.div>
      )}

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
            disabled={pulling || !user || user.currency_balance < SINGLE_PULL_COST}
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
            disabled={pulling || !user || user.currency_balance < MULTI_PULL_COST}
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
                {revealedPulls.map((reward, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${getRarityColor(reward.rarity)} text-white text-center`}
                  >
                    <div className="text-3xl mb-2">
                      {reward.rewardType === 'uma' ? '🏇' : '🎁'}
                    </div>
                    <p className="font-display text-sm font-bold uppercase mb-1">
                      {reward.rarity}
                    </p>
                    <p className="text-xs font-semibold">
                      {reward.name}
                    </p>
                  </motion.div>
                ))}
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
              history.slice(0, 50).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-(--grey-light) rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {item.rewardType === 'uma' ? '🏇' : '🎁'}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-(--charcoal)">
                        {item.rewardType} #{item.rewardId}
                      </p>
                      <Badge variant={item.rarity === 'legendary' || item.rarity === 'epic' ? 'accent' : 'default'} className="text-xs">
                        {item.rarity}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-(--grey-dark)">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

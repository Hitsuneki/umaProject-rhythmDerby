'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SINGLE_PULL_COST = 100;
const MULTI_PULL_COST = 900;
const LEGENDARY_RATE = 1.2;

interface GachaReward {
  kind: 'ITEM' | 'UMA';
  id: number;
  name: string;
  code?: string;
  type?: string;
  rarity: string;
  description?: string;
}

interface GachaHistoryItem {
  id: string;
  rewardType: string;
  rewardId: string;
  rarity: string;
  timestamp: number;
  name?: string;
}

// Rarity gradient colors
const RARITY_GRADIENTS: Record<string, string> = {
  'common': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
  'rare': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  'epic': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
  'legendary': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
};

export default function GachaPage() {
  const { user, fetchUser } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [revealedPulls, setRevealedPulls] = useState<GachaReward[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GachaHistoryItem[]>([]);
  const [error, setError] = useState('');
  const [balanceChanged, setBalanceChanged] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
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

  const animateLoading = () => {
    const texts = ['Accessing recruitment pool', 'Calculating probabilities', 'Generating node...'];
    let textIndex = 0;
    let progress = 0;

    setLoadingText(texts[0]);

    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress(progress);

      if (progress === 40 || progress === 70) {
        textIndex++;
        if (textIndex < texts.length) {
          setLoadingText(texts[textIndex]);
        }
      }

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  };

  const handleSinglePull = async () => {
    if (!user || user.currency_balance < SINGLE_PULL_COST) {
      setError('Insufficient balance');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setError('');
    setPulling(true);
    setLoadingProgress(0);
    animateLoading();

    try {
      const res = await fetch('/api/gacha/draw', { method: 'POST' });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Pull failed');
        setPulling(false);
        return;
      }

      const data = await res.json();

      // Trigger balance update animation
      setBalanceChanged(true);
      setTimeout(() => setBalanceChanged(false), 500);

      await fetchUser();

      setTimeout(() => {
        setRevealedPulls([data.reward]);
        setPulling(false);
        setLoadingProgress(0);
      }, 1500);
    } catch (err) {
      setError('Failed to pull. Please try again.');
      setPulling(false);
      setLoadingProgress(0);
    }
  };

  const handleMultiPull = async () => {
    if (!user || user.currency_balance < MULTI_PULL_COST) {
      setError('Insufficient balance');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setError('');
    setPulling(true);
    setLoadingProgress(0);
    animateLoading();

    try {
      const pulls: GachaReward[] = [];
      for (let i = 0; i < 10; i++) {
        const res = await fetch('/api/gacha/draw', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          pulls.push(data.reward);
        }
      }

      setBalanceChanged(true);
      setTimeout(() => setBalanceChanged(false), 500);

      await fetchUser();

      setTimeout(() => {
        setRevealedPulls(pulls);
        setPulling(false);
        setLoadingProgress(0);
      }, 1500);
    } catch (err) {
      setError('Failed to pull. Please try again.');
      setPulling(false);
      setLoadingProgress(0);
    }
  };

  const getRaritySummary = (pulls: GachaReward[]) => {
    const counts: Record<string, number> = {};
    pulls.forEach(p => {
      const rarity = p.rarity.toLowerCase();
      counts[rarity] = (counts[rarity] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([rarity, count]) => `${count} ${rarity.toUpperCase()}`)
      .join(', ');
  };

  if (!mounted) return null;

  return (
    <div 
      className="mx-auto"
      style={{ 
        maxWidth: '1200px',
        padding: '0 32px'
      }}
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span 
            className="font-semibold"
            style={{ 
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-teal-primary)',
              letterSpacing: '0.05em'
            }}
          >
            [GACHA] RECRUITMENT SYSTEM
          </span>
          <div 
            className="w-px bg-current opacity-30"
            style={{ height: '14px' }}
          />
          <div className="flex items-center gap-2">
            <span 
              className="tech-mono"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              STATUS: ONLINE
            </span>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="rounded-full"
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#22c55e'
              }}
            />
          </div>
        </div>
        <div 
          className="mb-4"
          style={{ 
            height: '1px',
            backgroundColor: 'var(--color-navbar-border)'
          }}
        />
        <p 
          className="mb-4"
          style={{ 
            fontSize: '14px',
            color: 'var(--color-text-tertiary)'
          }}
        >
          Deploy resources to recruit new Uma nodes
        </p>

        {/* Balance Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              [BALANCE]
            </span>
            <motion.span 
              className="tech-mono font-semibold"
              style={{ 
                fontSize: '24px',
                color: 'var(--color-teal-primary)'
              }}
              animate={balanceChanged ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              ¥{user?.currency_balance?.toLocaleString() || 0}
            </motion.span>
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="rounded-full"
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: 'var(--color-teal-primary)'
              }}
            />
          </div>
          <div 
            className="w-px bg-current opacity-30"
            style={{ height: '20px' }}
          />
          <span 
            className="tech-mono"
            style={{ 
              fontSize: '9px',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase'
            }}
          >
            [RATE] {LEGENDARY_RATE}% LEGENDARY
          </span>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--accent-danger)'
            }}
          >
            <p 
              className="tech-mono font-semibold"
              style={{ 
                fontSize: '11px',
                color: 'var(--accent-danger)',
                textTransform: 'uppercase'
              }}
            >
              [ERROR] {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull Options Grid */}
      {!pulling && revealedPulls.length === 0 && (
        <div 
          className="grid gap-6 mb-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}
        >
          {/* Single Pull Card */}
          <PullOptionCard
            title="SINGLE"
            subtitle="RECRUITMENT PROTOCOL"
            icon="◆"
            description="One random Uma or item node"
            cost={SINGLE_PULL_COST}
            enabled={!pulling && user ? user.currency_balance >= SINGLE_PULL_COST : false}
            onPull={handleSinglePull}
            recommended={false}
          />

          {/* Multi Pull Card */}
          <PullOptionCard
            title="MULTI"
            subtitle="RECRUITMENT PROTOCOL"
            icon="◆◆◆"
            description="Ten nodes at once (10% discount)"
            cost={MULTI_PULL_COST}
            savings={100}
            enabled={!pulling && user ? user.currency_balance >= MULTI_PULL_COST : false}
            onPull={handleMultiPull}
            recommended={true}
          />
        </div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {pulling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-8 border text-center"
            style={{
              backgroundColor: 'var(--color-navbar-bg)',
              borderColor: 'var(--color-navbar-border)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-4"
              style={{ 
                fontSize: '48px',
                color: 'var(--color-teal-primary)'
              }}
            >
              ◆
            </motion.div>
            <p 
              className="tech-mono font-semibold mb-4"
              style={{ 
                fontSize: '11px',
                color: 'var(--color-text-primary)',
                textTransform: 'uppercase'
              }}
            >
              [◆] PROCESSING REQUEST...
            </p>
            
            {/* Progress Bar */}
            <div 
              className="relative mx-auto mb-4 overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '8px',
                backgroundColor: '#e5e5e5'
              }}
            >
              <motion.div
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.15 }}
                style={{
                  height: '100%',
                  backgroundColor: 'var(--color-teal-primary)'
                }}
              />
            </div>

            <div className="space-y-1">
              <p 
                style={{ 
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                {loadingText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Display */}
      <AnimatePresence>
        {revealedPulls.length > 0 && !pulling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-6 border"
            style={{
              backgroundColor: 'var(--color-navbar-bg)',
              borderColor: 'var(--color-navbar-border)'
            }}
          >
            <div 
              className="flex items-center justify-between mb-4 pb-3 border-b"
              style={{ borderColor: 'var(--color-navbar-border)' }}
            >
              <span 
                className="tech-mono font-semibold"
                style={{ 
                  fontSize: '11px',
                  color: 'var(--color-text-primary)',
                  textTransform: 'uppercase'
                }}
              >
                [RESULT] {revealedPulls.length === 1 ? 'NODE ACQUIRED' : `${revealedPulls.length} NODES ACQUIRED`}
              </span>
            </div>

            <div 
              className="grid gap-4 mb-6"
              style={{
                gridTemplateColumns: revealedPulls.length === 1 
                  ? '1fr' 
                  : 'repeat(auto-fill, minmax(100px, 1fr))'
              }}
            >
              {revealedPulls.map((reward, index) => (
                <RewardCard
                  key={index}
                  reward={reward}
                  index={index}
                  isSingle={revealedPulls.length === 1}
                />
              ))}
            </div>

            {revealedPulls.length > 1 && (
              <p 
                className="text-center mb-4 tech-mono"
                style={{ 
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase'
                }}
              >
                SUMMARY: {getRaritySummary(revealedPulls)}
              </p>
            )}

            <div className="flex gap-2 justify-center">
              <Link href="/inventory">
                <button
                  className="px-6 py-2 border font-semibold transition-colors"
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    backgroundColor: 'transparent',
                    borderColor: 'var(--color-teal-primary)',
                    color: 'var(--color-teal-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-teal-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-teal-primary)';
                  }}
                >
                  [VIEW INVENTORY]
                </button>
              </Link>
              <button
                onClick={() => setRevealedPulls([])}
                className="px-6 py-2 border font-semibold transition-colors"
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--color-text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                [CLOSE]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Log */}
      <HistoryLog
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        history={history}
      />
    </div>
  );
}

// Pull Option Card Component
interface PullOptionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  cost: number;
  savings?: number;
  enabled: boolean;
  onPull: () => void;
  recommended: boolean;
}

function PullOptionCard({
  title,
  subtitle,
  icon,
  description,
  cost,
  savings,
  enabled,
  onPull,
  recommended
}: PullOptionCardProps) {
  return (
    <div 
      className="relative overflow-hidden border"
      style={{
        backgroundColor: 'var(--color-navbar-bg)',
        borderColor: recommended ? 'var(--color-teal-primary)' : 'var(--color-navbar-border)',
        borderWidth: recommended ? '2px' : '1px'
      }}
    >
      {/* Scanline Animation */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(to bottom, transparent, rgba(20, 184, 166, 0.05), transparent)',
          zIndex: 1
        }}
      />

      {/* Recommended Badge */}
      {recommended && (
        <div 
          className="absolute top-3 right-3 px-2 py-1 tech-mono font-semibold z-10"
          style={{
            fontSize: '8px',
            backgroundColor: 'var(--color-teal-primary)',
            color: 'white',
            textTransform: 'uppercase'
          }}
        >
          RECOMMENDED
        </div>
      )}

      {/* Header */}
      <div 
        className="px-4 py-2 relative z-10"
        style={{
          backgroundColor: '#eeeeee'
        }}
      >
        <span 
          className="tech-mono font-semibold"
          style={{ 
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase'
          }}
        >
          [{title}] {subtitle}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 text-center relative z-10">
        <div 
          className="mb-4"
          style={{ 
            fontSize: '48px',
            color: 'var(--color-teal-primary)'
          }}
        >
          {icon}
        </div>

        <p 
          className="mb-6"
          style={{ 
            fontSize: '12px',
            color: 'var(--color-text-tertiary)'
          }}
        >
          {description}
        </p>

        <div className="mb-6">
          <p 
            className="tech-mono font-semibold"
            style={{ 
              fontSize: '20px',
              color: 'var(--color-teal-primary)'
            }}
          >
            COST: ¥{cost.toLocaleString()}
          </p>
          {savings && (
            <p 
              className="tech-mono mt-1"
              style={{ 
                fontSize: '10px',
                color: '#22c55e'
              }}
            >
              [SAVE ¥{savings}]
            </p>
          )}
        </div>

        <motion.button
          onClick={onPull}
          disabled={!enabled}
          className="w-full px-6 py-3 font-semibold transition-colors"
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            backgroundColor: enabled ? 'var(--color-teal-primary)' : '#9ca3af',
            color: 'white',
            border: 'none',
            cursor: enabled ? 'pointer' : 'not-allowed',
            opacity: enabled ? 1 : 0.5
          }}
          whileHover={enabled ? { scale: 1.02 } : {}}
          whileTap={enabled ? { scale: 0.98 } : {}}
          animate={recommended && enabled ? {
            boxShadow: [
              '0 0 0 0 rgba(20, 184, 166, 0)',
              '0 0 8px 2px rgba(20, 184, 166, 0.3)',
              '0 0 0 0 rgba(20, 184, 166, 0)'
            ]
          } : {}}
          transition={recommended && enabled ? {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          } : {}}
        >
          [EXECUTE {title} DRAW]
        </motion.button>
      </div>
    </div>
  );
}

// Reward Card Component
interface RewardCardProps {
  reward: GachaReward;
  index: number;
  isSingle: boolean;
}

function RewardCard({ reward, index, isSingle }: RewardCardProps) {
  const rarity = reward.rarity.toLowerCase();
  const gradient = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS['common'];

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 180 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.4,
        ease: 'easeOut'
      }}
      className="text-center text-white"
      style={{
        background: gradient,
        padding: isSingle ? '32px' : '16px',
        minHeight: isSingle ? '240px' : '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div 
        className="mb-2"
        style={{ 
          fontSize: isSingle ? '48px' : '32px'
        }}
      >
        {reward.kind === 'UMA' ? '🏇' : '🎁'}
      </div>
      
      <p 
        className="tech-mono font-semibold mb-2"
        style={{ 
          fontSize: isSingle ? '11px' : '9px',
          textTransform: 'uppercase',
          opacity: 0.9
        }}
      >
        [{reward.rarity}]
      </p>
      
      <p 
        className="font-semibold"
        style={{ 
          fontSize: isSingle ? '14px' : '11px',
          wordBreak: 'break-word'
        }}
      >
        {reward.name}
      </p>

      {reward.type && (
        <p 
          className="tech-mono mt-1"
          style={{ 
            fontSize: isSingle ? '10px' : '8px',
            opacity: 0.8,
            textTransform: 'uppercase'
          }}
        >
          [{reward.type}]
        </p>
      )}
    </motion.div>
  );
}

// History Log Component
interface HistoryLogProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  history: GachaHistoryItem[];
}

function HistoryLog({ showHistory, setShowHistory, history }: HistoryLogProps) {
  return (
    <div 
      className="border"
      style={{
        backgroundColor: 'var(--color-navbar-bg)',
        borderColor: 'var(--color-navbar-border)'
      }}
    >
      {/* Header */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{
          backgroundColor: '#eeeeee'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e5e5e5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#eeeeee';
        }}
      >
        <span 
          className="tech-mono font-semibold"
          style={{ 
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase'
          }}
        >
          [HISTORY] RECRUITMENT LOG | LAST 50 PULLS
        </span>
        {showHistory ? (
          <ChevronUp style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
        ) : (
          <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {history.length === 0 ? (
              <div className="text-center py-12">
                <p 
                  className="tech-mono font-semibold mb-2"
                  style={{ 
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase'
                  }}
                >
                  [NO HISTORY DATA]
                </p>
                <p 
                  style={{ 
                    fontSize: '12px',
                    color: 'var(--color-text-tertiary)'
                  }}
                >
                  No recruitment activity recorded<br />
                  Execute draws to populate history
                </p>
              </div>
            ) : (
              <div 
                className="overflow-x-auto"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <table className="w-full">
                  <thead>
                    <tr 
                      className="border-b"
                      style={{ borderColor: 'var(--color-navbar-border)' }}
                    >
                      <th 
                        className="text-left px-4 py-2 tech-mono font-semibold"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        TIMESTAMP
                      </th>
                      <th 
                        className="text-left px-4 py-2 tech-mono font-semibold"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        TYPE
                      </th>
                      <th 
                        className="text-left px-4 py-2 tech-mono font-semibold"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        NAME
                      </th>
                      <th 
                        className="text-left px-4 py-2 tech-mono font-semibold"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        RARITY
                      </th>
                      <th 
                        className="text-left px-4 py-2 tech-mono font-semibold"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        NODE ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 50).map((item, index) => {
                      const date = new Date(item.timestamp);
                      const rarity = item.rarity.toLowerCase();
                      const gradient = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS['common'];

                      return (
                        <tr
                          key={item.id}
                          className="border-b transition-colors"
                          style={{ 
                            borderColor: 'var(--color-navbar-border)',
                            height: '48px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-navbar-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td 
                            className="px-4 py-2 tech-mono"
                            style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}
                          >
                            {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}<br />
                            <span style={{ fontSize: '9px', opacity: 0.7 }}>
                              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span 
                              className="px-2 py-1 border tech-mono"
                              style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                backgroundColor: 'transparent',
                                borderColor: 'var(--color-teal-primary)',
                                color: 'var(--color-teal-primary)'
                              }}
                            >
                              [{item.rewardType}]
                            </span>
                          </td>
                          <td 
                            className="px-4 py-2"
                            style={{ fontSize: '11px', color: 'var(--color-text-primary)' }}
                          >
                            {item.name || `${item.rewardType} #${item.rewardId}`}
                          </td>
                          <td className="px-4 py-2">
                            <span 
                              className="px-2 py-1 tech-mono font-semibold"
                              style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                background: gradient,
                                color: 'white'
                              }}
                            >
                              [{item.rarity}]
                            </span>
                          </td>
                          <td 
                            className="px-4 py-2 tech-mono"
                            style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}
                          >
                            {item.rewardType}_{item.rewardId.toString().substring(0, 6)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
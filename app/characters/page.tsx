'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Zap, Trophy, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Uma } from '@/types';

// Stat bar colors
const STAT_COLORS = {
  speed: '#14b8a6',    // teal
  stamina: '#3b82f6',  // blue
  technique: '#22c55e', // green
  energy: '#f59e0b',   // amber (low) / teal (healthy)
};

export default function CharactersPage() {
  const router = useRouter();
  const [umas, setUmas] = useState<Uma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUmas();
  }, []);

  const fetchUmas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/uma');
      if (!response.ok) throw new Error('Failed to fetch umas');
      const data = await response.json();
      setUmas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/uma/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete character');
      setUmas(umas.filter(uma => uma.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  const handleTrain = (id: string) => {
    router.push(`/training?id=${id}`);
  };

  const handleRace = (id: string) => {
    router.push(`/racing?id=${id}`);
  };

  const formatNodeId = (id: string): string => {
    return id.substring(0, 8).toUpperCase();
  };

  const calculatePower = (uma: Uma): number => {
    return Math.round((uma.speed + uma.stamina + uma.technique) / 3);
  };

  const activeCount = umas.filter(uma => uma.energy > 20).length;

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div 
          className="text-center p-8 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
            style={{ 
              width: '40px',
              height: '40px',
              color: 'var(--color-teal-primary)'
            }}
          >
            ◆
          </motion.div>
          <p 
            className="tech-mono font-semibold mb-2"
            style={{ 
              fontSize: '11px',
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase'
            }}
          >
            [◆] LOADING...
          </p>
          <p 
            style={{ 
              fontSize: '12px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            Fetching Uma nodes
          </p>
          <div className="flex gap-1 justify-center mt-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
                style={{
                  width: '4px',
                  height: '4px',
                  backgroundColor: 'var(--color-teal-primary)',
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-16">
        <div 
          className="inline-block p-6 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--accent-danger)'
          }}
        >
          <p 
            className="tech-mono font-semibold mb-4"
            style={{ 
              fontSize: '11px',
              color: 'var(--accent-danger)',
              textTransform: 'uppercase'
            }}
          >
            [SYS-ERROR] {error}
          </p>
          <button
            onClick={fetchUmas}
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
            [RETRY] Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mx-auto"
      style={{ 
        maxWidth: '1400px',
        padding: '0 32px'
      }}
    >
      {/* Header Section */}
      <div 
        className="flex items-center justify-between pb-4 mb-8 border-b"
        style={{ borderColor: 'var(--color-navbar-border)' }}
      >
        <div className="flex items-center gap-3">
          <span 
            className="font-semibold"
            style={{ 
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-teal-primary)',
              letterSpacing: '0.05em'
            }}
          >
            [STABLE] UMA ROSTER
          </span>
          <div 
            className="w-px bg-current opacity-30"
            style={{ height: '14px' }}
          />
          <span 
            className="tech-mono"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            TOTAL: {umas.length}
          </span>
          <div 
            className="w-px bg-current opacity-30"
            style={{ height: '14px' }}
          />
          <span 
            className="tech-mono"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            ACTIVE: {activeCount}
          </span>
        </div>

        <Link href="/characters/new">
          <button
            className="flex items-center gap-2 px-4 py-2 border font-semibold transition-all"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              backgroundColor: 'transparent',
              borderColor: 'var(--color-teal-primary)',
              color: 'var(--color-teal-primary)',
              letterSpacing: '0.05em'
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
            <Plus style={{ width: '14px', height: '14px' }} />
            CREATE UMA
          </button>
        </Link>
      </div>

      {/* Empty State */}
      {umas.length === 0 ? (
        <div 
          className="text-center p-12 border"
          style={{
            backgroundColor: 'var(--color-navbar-bg)',
            borderColor: 'var(--color-navbar-border)',
            maxWidth: '500px',
            margin: '0 auto'
          }}
        >
          <p 
            className="tech-mono font-semibold mb-4"
            style={{ 
              fontSize: '10px',
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            [SYS-ALERT] NO UMA NODES DETECTED
          </p>
          <p 
            className="mb-6"
            style={{ 
              fontSize: '14px',
              color: 'var(--color-text-tertiary)',
              lineHeight: '1.6'
            }}
          >
            Initialize your first Uma Musume<br />
            to begin training operations
          </p>
          <Link href="/characters/new">
            <button
              className="px-6 py-3 font-semibold transition-colors"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: 'var(--color-teal-primary)',
                color: 'white',
                border: 'none',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-teal-primary)';
              }}
            >
              + CREATE FIRST UMA
            </button>
          </Link>
        </div>
      ) : (
        /* Character Grid */
        <div 
          className="grid gap-5"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))'
          }}
        >
          {umas.map((uma, index) => (
            <UmaCard
              key={uma.id}
              uma={uma}
              index={index}
              deleteConfirm={deleteConfirm}
              onDelete={handleDelete}
              onTrain={handleTrain}
              onRace={handleRace}
              onDeleteConfirm={setDeleteConfirm}
              formatNodeId={formatNodeId}
              calculatePower={calculatePower}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Uma Card Component
interface UmaCardProps {
  uma: Uma;
  index: number;
  deleteConfirm: string | null;
  onDelete: (id: string) => void;
  onTrain: (id: string) => void;
  onRace: (id: string) => void;
  onDeleteConfirm: (id: string | null) => void;
  formatNodeId: (id: string) => string;
  calculatePower: (uma: Uma) => number;
}

function UmaCard({
  uma,
  index,
  deleteConfirm,
  onDelete,
  onTrain,
  onRace,
  onDeleteConfirm,
  formatNodeId,
  calculatePower
}: UmaCardProps) {
  const power = calculatePower(uma);
  const energyPercentage = Math.round((uma.energy / uma.maxEnergy) * 100);
  const isLowEnergy = energyPercentage < 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.3,
        ease: 'easeOut'
      }}
      whileHover={{ 
        y: -2,
        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)'
      }}
      className="relative overflow-hidden border"
      style={{
        backgroundColor: 'var(--color-navbar-bg)',
        borderColor: 'var(--color-navbar-border)',
        transition: 'all 200ms ease-out'
      }}
    >
      {/* Scanline Animation */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
          delay: index * 0.5
        }}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(to bottom, transparent, rgba(20, 184, 166, 0.04), transparent)',
          zIndex: 1
        }}
      />

      {/* Header Strip */}
      <div 
        className="flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: '#eeeeee',
          height: '32px'
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
          [UMA NODE] {formatNodeId(uma.id)}
        </span>
        <div className="flex items-center gap-2">
          <span 
            className="tech-mono"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase'
            }}
          >
            STATUS: READY
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

      {/* Card Content */}
      <div className="p-4 space-y-4 relative z-10">
        {/* Portrait Section */}
        <div className="flex items-start gap-4">
          <div 
            className="flex-shrink-0 border flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              borderColor: 'var(--color-teal-primary)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <span 
              className="font-display font-bold"
              style={{ 
                fontSize: '48px',
                color: 'var(--color-teal-primary)',
                opacity: 0.3
              }}
            >
              {uma.name.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold truncate mb-2"
              style={{ 
                fontSize: '18px',
                color: 'var(--color-text-primary)'
              }}
            >
              {uma.name}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <span 
                className="px-2 py-1 border tech-mono"
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-teal-primary)',
                  color: 'var(--color-teal-primary)'
                }}
              >
                [{uma.style}]
              </span>
              <span 
                className="px-2 py-1 border tech-mono"
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-teal-primary)',
                  color: 'var(--color-teal-primary)'
                }}
              >
                [{uma.temperament}]
              </span>
            </div>
            
            <div className="flex gap-3">
              <span 
                className="tech-mono"
                style={{ 
                  fontSize: '10px',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                LVL {uma.level}
              </span>
              <span 
                className="tech-mono"
                style={{ 
                  fontSize: '10px',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                | PWR {power}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span 
              className="tech-mono font-semibold"
              style={{ 
                fontSize: '9px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              [STATS] PERFORMANCE METRICS
            </span>
          </div>
          <div 
            className="mb-3"
            style={{ 
              height: '1px',
              backgroundColor: 'var(--border-subtle)'
            }}
          />
          
          <div className="space-y-2">
            <StatRow label="SPD" value={uma.speed} color={STAT_COLORS.speed} />
            <StatRow label="STA" value={uma.stamina} color={STAT_COLORS.stamina} />
            <StatRow label="TEC" value={uma.technique} color={STAT_COLORS.technique} />
            <StatRow 
              label="ENR" 
              value={uma.energy} 
              maxValue={uma.maxEnergy}
              color={isLowEnergy ? STAT_COLORS.energy : STAT_COLORS.speed}
              status={isLowEnergy ? 'LOW' : 'MAX'}
            />
          </div>
        </div>

        {/* Trait Display */}
        <div 
          className="px-3 py-2"
          style={{
            backgroundColor: '#e5e5e5'
          }}
        >
          <span 
            className="tech-mono font-semibold"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            [TRAIT] {uma.trait.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onTrain(uma.id)}
            className="px-3 py-2 font-semibold transition-colors"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              backgroundColor: 'var(--color-teal-primary)',
              color: 'white',
              border: 'none',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0d9488';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-teal-primary)';
            }}
          >
            TRAIN
          </button>
          
          <button
            onClick={() => onRace(uma.id)}
            className="px-3 py-2 border font-semibold transition-colors"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              backgroundColor: 'transparent',
              borderColor: 'var(--color-teal-primary)',
              color: 'var(--color-teal-primary)',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-navbar-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            RACE
          </button>
          
          <Link href={`/characters/${uma.id}/edit`} className="block">
            <button
              className="w-full px-3 py-2 border font-semibold transition-colors"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: 'transparent',
                borderColor: 'var(--border-primary)',
                color: 'var(--color-text-secondary)',
                height: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-teal-primary)';
                e.currentTarget.style.color = 'var(--color-teal-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              EDIT
            </button>
          </Link>
          
          {deleteConfirm === uma.id ? (
            <div className="col-span-1 flex gap-1">
              <button
                onClick={() => onDelete(uma.id)}
                className="flex-1 px-2 py-2 border font-semibold transition-colors"
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  borderColor: 'var(--accent-danger)',
                  color: 'var(--accent-danger)',
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-danger)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--accent-danger)';
                }}
              >
                ✓
              </button>
              <button
                onClick={() => onDeleteConfirm(null)}
                className="px-2 py-2 border font-semibold transition-colors"
                style={{
                  fontSize: '11px',
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--color-text-secondary)',
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDeleteConfirm(uma.id)}
              className="px-3 py-2 border font-semibold transition-colors"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: 'transparent',
                borderColor: 'var(--border-primary)',
                color: 'var(--color-text-secondary)',
                height: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-danger)';
                e.currentTarget.style.color = 'var(--accent-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              DEL
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Stat Row Component
interface StatRowProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  status?: string;
}

function StatRow({ label, value, maxValue = 100, color, status }: StatRowProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barCount = Math.round(percentage / 10);

  return (
    <div className="flex items-center gap-2">
      <span 
        className="tech-mono font-semibold"
        style={{ 
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          minWidth: '28px'
        }}
      >
        {label}
      </span>
      
      <div className="flex-1 flex items-center gap-1">
        <div className="flex gap-px">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '4px',
                backgroundColor: i < barCount ? color : '#d1d5db'
              }}
            />
          ))}
        </div>
      </div>
      
      <span 
        className="tech-mono"
        style={{ 
          fontSize: '11px',
          color: 'var(--color-text-primary)',
          minWidth: '45px',
          textAlign: 'right'
        }}
      >
        {value}/{maxValue}
      </span>
      
      {status && (
        <span 
          className="tech-mono"
          style={{ 
            fontSize: '9px',
            color: status === 'LOW' ? STAT_COLORS.energy : color,
            minWidth: '32px'
          }}
        >
          [{status}]
        </span>
      )}
    </div>
  );
}
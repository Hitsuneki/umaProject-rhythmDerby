'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUmaStore } from '@/stores/umaStore';
import { useTrainingStore } from '@/stores/trainingStore';
import { useRaceStore } from '@/stores/raceStore';
import { useCurrencyStore } from '@/stores/currencyStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatBar } from '@/components/ui/StatBar';
import { Badge } from '@/components/ui/Badge';
import { Zap, Trophy, Star, User, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Uma } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { umas, selectedUmaId, selectUma, regenerateEnergy, getTimeToNextEnergy, fetchUmas, loading, error } = useUmaStore();
  const { getLatestLog } = useTrainingStore();
  const { getLatestRace } = useRaceStore();
  const { balance } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);
  const [timeToNext, setTimeToNext] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Fetch characters from API on mount
    fetchUmas();
  }, [fetchUmas]);

  // Select first uma if none selected
  useEffect(() => {
    if (umas.length > 0 && !selectedUmaId) {
      selectUma(umas[0].id);
    }
  }, [umas, selectedUmaId, selectUma]);

  const selectedUma = umas.find((u) => u.id === selectedUmaId) || umas[0];

  // Regenerate energy periodically
  useEffect(() => {
    if (!selectedUma) return;

    regenerateEnergy(selectedUma.id);

    const interval = setInterval(() => {
      regenerateEnergy(selectedUma.id);
      setTimeToNext(getTimeToNextEnergy(selectedUma.id));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedUma, regenerateEnergy, getTimeToNextEnergy]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-tertiary)' }}>Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--accent-danger)' }}>{error}</p>
          <Button onClick={fetchUmas} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const latestTraining = selectedUma ? getLatestLog(selectedUma.id) : null;
  const latestRace = selectedUma ? getLatestRace(selectedUma.id) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateOverallPower = (uma: Uma) => {
    return Math.floor((uma.speed + uma.stamina + uma.technique) / 3);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div className="border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-panel)' }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                WELCOME BACK, {user?.username.toUpperCase()}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Character Selection • Uma Rhythm Derby
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 border rounded" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-secondary)' }}>
              <Star className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
              <span className="tech-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {balance}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>COINS</span>
            </div>
          </div>
        </div>
      </div>

      {umas.length === 0 ? (
        <div className="max-w-[1600px] mx-auto px-6 py-12">
          <Card className="text-center py-16">
            <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              NO UMA MUSUME YET
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-tertiary)' }}>
              Create your first character to start training and racing
            </p>
            <Link href="/characters/new">
              <Button variant="primary" icon={<User />}>
                Create Uma
              </Button>
            </Link>
          </Card>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex gap-6 h-[calc(100vh-180px)]">
            {/* Left Panel - Character List */}
            <div className="w-1/3 flex flex-col">
              <div className="mb-4">
                <h2 className="font-display text-sm font-semibold tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  YOUR ROSTER ({umas.length})
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ scrollbarWidth: 'thin' }}>
                {umas.map((uma, index) => {
                  const isSelected = uma.id === selectedUmaId;
                  const power = calculateOverallPower(uma);
                  
                  return (
                    <motion.button
                      key={uma.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => selectUma(uma.id)}
                      className="w-full text-left p-4 border rounded transition-all"
                      style={{
                        background: isSelected ? 'var(--highlight-primary)' : 'var(--bg-panel)',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)',
                        borderWidth: isSelected ? '2px' : '1px',
                        boxShadow: isSelected ? 'var(--glow-accent)' : 'var(--shadow-sm)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded flex items-center justify-center"
                            style={{
                              background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                            }}
                          >
                            <User className="w-6 h-6" style={{ color: isSelected ? 'white' : 'var(--text-tertiary)' }} />
                          </div>
                          <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'var(--accent-primary)', color: 'white' }}
                          >
                            {uma.level}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-display text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                              {uma.name}
                            </h3>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: 'var(--accent-primary)' }} />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                              {uma.style}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                              {uma.temperament}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="tech-label">POWER</span>
                              <span className="tech-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{power}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${power}%`,
                                  background: 'var(--accent-primary)',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Character Details */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedUma && (
                  <motion.div
                    key={selectedUma.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Character Header */}
                    <div className="p-6 border rounded" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-primary)' }}>
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <div
                            className="w-24 h-24 rounded-lg flex items-center justify-center ring-2"
                            style={{
                              background: 'var(--accent-primary)',
                              ringColor: 'var(--accent-primary)',
                              opacity: 0.9,
                            }}
                          >
                            <User className="w-12 h-12 text-white" />
                          </div>
                          <div
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-display text-lg font-bold"
                            style={{ background: 'var(--accent-primary)', color: 'white' }}
                          >
                            {selectedUma.level}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                {selectedUma.name}
                              </h2>
                              <div className="flex items-center gap-2">
                                <Badge variant="accent">{selectedUma.style}</Badge>
                                <Badge>{selectedUma.temperament}</Badge>
                                <span
                                  className="px-2 py-1 text-xs font-semibold rounded flex items-center gap-1"
                                  style={{ background: 'var(--highlight-success)', color: 'var(--accent-success)' }}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  ACTIVE
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="p-6 border rounded" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-primary)' }}>
                      <h3 className="font-display text-sm font-semibold tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
                        STATISTICS
                      </h3>
                      <div className="space-y-4">
                        <StatBar label="Speed" value={selectedUma.speed} color="#E53E3E" />
                        <StatBar label="Stamina" value={selectedUma.stamina} color="#0066CC" />
                        <StatBar label="Technique" value={selectedUma.technique} color="#38A169" />
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="tech-label">ENERGY</span>
                            <div className="text-right">
                              <span className="tech-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {selectedUma.energy}/{selectedUma.maxEnergy}
                              </span>
                              {selectedUma.energy < selectedUma.maxEnergy && (
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                  Next: {formatTime(timeToNext)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(selectedUma.energy / selectedUma.maxEnergy) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: 'var(--accent-warning)' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trait Panel */}
                    <div className="p-6 border rounded" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-primary)' }}>
                      <h3 className="font-display text-sm font-semibold tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                        TRAIT ABILITY
                      </h3>
                      <div className="p-4 rounded" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="font-display text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {selectedUma.trait.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {selectedUma.trait === 'speed_boost' && 'Focuses on explosive speed training and race performance.'}
                          {selectedUma.trait === 'stamina_regen' && 'Enhances stamina recovery and endurance capabilities.'}
                          {selectedUma.trait === 'technique_master' && 'Improves technical skills and precision in all activities.'}
                          {selectedUma.trait === 'all_rounder' && 'Balanced development across all stats and abilities.'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="primary" className="w-full py-4" icon={<CheckCircle />}>
                        Set as Active
                      </Button>
                      <Link href={`/training?id=${selectedUma.id}`} className="block">
                        <Button variant="secondary" className="w-full py-4" icon={<Zap />}>
                          Start Training
                        </Button>
                      </Link>
                      <Link href={`/racing?id=${selectedUma.id}`} className="block">
                        <Button variant="secondary" className="w-full py-4" icon={<Trophy />}>
                          Enter Race
                        </Button>
                      </Link>
                    </div>

                    {/* Footer - Last Activity */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Last Training */}
                      <div className="p-4 border rounded" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                          <h4 className="tech-label">LAST TRAINING</h4>
                        </div>
                        {latestTraining ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Type</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                                {latestTraining.sessionType}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Quality</span>
                              <span className="tech-mono text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                                {latestTraining.quality}%
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                              <div className="text-center">
                                <p className="tech-mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>+{latestTraining.statGains.speed}</p>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>SPD</p>
                              </div>
                              <div className="text-center">
                                <p className="tech-mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>+{latestTraining.statGains.stamina}</p>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>STA</p>
                              </div>
                              <div className="text-center">
                                <p className="tech-mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>+{latestTraining.statGains.technique}</p>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>TEC</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-center py-4" style={{ color: 'var(--text-disabled)' }}>
                            No training data
                          </p>
                        )}
                      </div>

                      {/* Last Race */}
                      <div className="p-4 border rounded" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                          <h4 className="tech-label">LAST RACE</h4>
                        </div>
                        {latestRace ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Placement</span>
                              <span className="tech-mono text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                                {latestRace.placement}
                                {latestRace.placement === 1 ? 'st' : latestRace.placement === 2 ? 'nd' : latestRace.placement === 3 ? 'rd' : 'th'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Score</span>
                              <span className="tech-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                {latestRace.score}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Distance</span>
                              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {latestRace.distanceType}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-center py-4" style={{ color: 'var(--text-disabled)' }}>
                            No race data
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
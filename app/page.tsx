'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUmaStore } from '@/stores/umaStore';
import { useTrainingStore } from '@/stores/trainingStore';
import { useRaceStore } from '@/stores/raceStore';
import { useCurrencyStore } from '@/stores/currencyStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatBar } from '@/components/ui/StatBar';
import { Badge } from '@/components/ui/Badge';
import { Zap, Trophy, Users, TrendingUp, Award, Star, Package, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { umas, selectedUmaId, regenerateEnergy, getTimeToNextEnergy } = useUmaStore();
  const { getLatestLog } = useTrainingStore();
  const { getLatestRace } = useRaceStore();
  const { balance } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);
  const [timeToNext, setTimeToNext] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentUma = umas.find((u) => u.id === selectedUmaId) || umas[0];

  // Regenerate energy on mount and periodically
  useEffect(() => {
    if (!currentUma) return;

    regenerateEnergy(currentUma.id);

    const interval = setInterval(() => {
      regenerateEnergy(currentUma.id);
      setTimeToNext(getTimeToNextEnergy(currentUma.id));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUma, regenerateEnergy, getTimeToNextEnergy]);

  if (!mounted) return null;

  const latestTraining = currentUma ? getLatestLog(currentUma.id) : null;
  const latestRace = currentUma ? getLatestRace(currentUma.id) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-(--charcoal) to-(--foreground) p-8 md:p-12 text-white"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute inset-0 bg-gradient-to-l from-(--accent) to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
                UMA RACING DASHBOARD
              </h1>
              <p className="text-lg text-white/80 font-body">
                Train your Uma Musume • Compete in races • Build your legacy
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="stat-mono text-xl font-bold">
                {balance}
              </span>
              <span className="text-sm opacity-80">Coins</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/inventory">
              <Button variant="secondary" icon={<Package className="w-4 h-4" />}>
                Inventory
              </Button>
            </Link>
            <Link href="/gacha">
              <Button variant="secondary" icon={<Sparkles className="w-4 h-4" />}>
                Gacha
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {currentUma ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Uma Card */}
          <Card className="lg:col-span-2">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-(--accent) text-white rounded-full w-8 h-8 flex items-center justify-center font-display text-sm font-bold">
                  {currentUma.level}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-(--charcoal) mb-1">
                      {currentUma.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="accent">{currentUma.style}</Badge>
                      <Badge>{currentUma.temperament}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <StatBar label="Speed" value={currentUma.speed} color="#FF4F00" />
                  <StatBar label="Stamina" value={currentUma.stamina} color="#00A4F0" />
                  <StatBar label="Technique" value={currentUma.technique} color="#8FED1D" />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display uppercase tracking-wider text-(--grey-dark)">
                        Energy
                      </span>
                      <div className="text-right">
                        <span className="stat-mono text-sm font-semibold text-(--charcoal)">
                          {currentUma.energy}/{currentUma.maxEnergy}
                        </span>
                        {currentUma.energy < currentUma.maxEnergy && (
                          <p className="text-xs text-(--grey-dark)">
                            Next: {formatTime(timeToNext)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-(--grey-light) rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentUma.energy / currentUma.maxEnergy) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-yellow-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-(--grey-light) rounded-lg">
                  <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-1">
                    Trait
                  </p>
                  <p className="text-sm font-body text-(--charcoal)">
                    {currentUma.trait.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-display text-lg font-semibold mb-4 text-(--charcoal)">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/training">
                <Button variant="primary" className="w-full" icon={<Zap />}>
                  Start Training
                </Button>
              </Link>
              <Link href="/racing">
                <Button variant="secondary" className="w-full" icon={<Trophy />}>
                  Enter Race
                </Button>
              </Link>
              <Link href="/characters">
                <Button variant="secondary" className="w-full" icon={<Users />}>
                  Manage Characters
                </Button>
              </Link>
            </div>
          </Card>

          {/* Latest Training */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-(--accent)" />
              <h3 className="font-display text-lg font-semibold text-(--charcoal)">
                Last Training
              </h3>
            </div>
            {latestTraining ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-(--grey-dark)">Session Type</span>
                  <Badge variant="accent">{latestTraining.sessionType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-(--grey-dark)">Quality</span>
                  <span className="stat-mono text-lg font-bold text-(--accent)">
                    {latestTraining.quality}%
                  </span>
                </div>
                <div className="pt-3 border-t border-(--border)">
                  <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-2">
                    Stat Gains
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="stat-mono text-sm font-semibold text-(--charcoal)">
                        +{latestTraining.statGains.speed}
                      </p>
                      <p className="text-xs text-(--grey-dark)">SPD</p>
                    </div>
                    <div>
                      <p className="stat-mono text-sm font-semibold text-(--charcoal)">
                        +{latestTraining.statGains.stamina}
                      </p>
                      <p className="text-xs text-(--grey-dark)">STA</p>
                    </div>
                    <div>
                      <p className="stat-mono text-sm font-semibold text-(--charcoal)">
                        +{latestTraining.statGains.technique}
                      </p>
                      <p className="text-xs text-(--grey-dark)">TEC</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--grey-dark) text-center py-8">
                No training sessions yet
              </p>
            )}
          </Card>

          {/* Latest Race */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-(--accent)" />
              <h3 className="font-display text-lg font-semibold text-(--charcoal)">
                Last Race Result
              </h3>
            </div>
            {latestRace ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-(--grey-light) rounded-lg">
                  <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-1">
                    Placement
                  </p>
                  <p className="stat-mono text-3xl font-bold text-(--accent)">
                    {latestRace.placement}
                    {latestRace.placement === 1 ? 'st' : latestRace.placement === 2 ? 'nd' : latestRace.placement === 3 ? 'rd' : 'th'}
                  </p>
                </div>
                <div className="text-center p-4 bg-(--grey-light) rounded-lg">
                  <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-1">
                    Score
                  </p>
                  <p className="stat-mono text-3xl font-bold text-(--charcoal)">
                    {latestRace.score}
                  </p>
                </div>
                <div className="text-center p-4 bg-(--grey-light) rounded-lg">
                  <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-1">
                    Distance
                  </p>
                  <p className="stat-mono text-3xl font-bold text-(--charcoal)">
                    {latestRace.distanceType}
                  </p>
                </div>
                <div className="text-center p-4 bg-(--grey-light) rounded-lg">
                  <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-1">
                    Date
                  </p>
                  <p className="text-sm font-body text-(--charcoal)">
                    {new Date(latestRace.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--grey-dark) text-center py-8">
                No races completed yet
              </p>
            )}
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-(--grey-medium)" />
          <h2 className="font-display text-2xl font-bold mb-2 text-(--charcoal)">
            No Uma Musume Yet
          </h2>
          <p className="text-(--grey-dark) mb-6">
            Create your first character to start training and racing
          </p>
          <Link href="/characters/new">
            <Button variant="primary" icon={<Users />}>
              Create Uma
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
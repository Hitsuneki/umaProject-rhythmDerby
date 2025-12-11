'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useUmaStore } from '@/stores/umaStore';
import { Zap, Activity, Server, Wifi, Shield, Database, TrendingUp, Award, User } from 'lucide-react';
import type { Uma } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const { umas, selectedUmaId, selectUma, regenerateEnergy, getTimeToNextEnergy, fetchUmas, loading, error } = useUmaStore();
  const [mounted, setMounted] = useState(false);
  const [timeToNext, setTimeToNext] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [raceHistory, setRaceHistory] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchUmas();
    fetchUser();
  }, [fetchUmas, fetchUser]);

  // Select first uma if none selected
  useEffect(() => {
    if (umas.length > 0 && !selectedUmaId) {
      selectUma(umas[0].id);
    }
  }, [umas, selectedUmaId, selectUma]);

  const selectedUma = umas.find((u) => u.id === selectedUmaId);

  // Fetch training and race history for selected Uma
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedUma) return;

      try {
        const [trainingRes, raceRes] = await Promise.all([
          fetch('/api/training'),
          fetch('/api/races')
        ]);

        if (trainingRes.ok) {
          const trainingData = await trainingRes.json();
          const umaTraining = trainingData.filter((t: any) => t.umaId === selectedUma.id);
          setTrainingHistory(umaTraining.slice(0, 1)); // Latest only
        }

        if (raceRes.ok) {
          const raceData = await raceRes.json();
          const umaRaces = raceData.filter((r: any) => r.umaId === selectedUma.id);
          setRaceHistory(umaRaces.slice(0, 1)); // Latest only
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    fetchHistory();
  }, [selectedUma]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xs text-gray-500 uppercase tracking-wide font-mono font-bold">
            [SYS] LOADING UMA NODES...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 font-mono mb-4">{error.toUpperCase()}</p>
          <button
            onClick={fetchUmas}
            className="px-4 py-2 bg-cyan-600 text-white font-mono text-xs uppercase tracking-wide"
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  if (umas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="font-mono text-xl font-black uppercase tracking-wider text-gray-900 mb-2">
            NO UMA NODES DETECTED
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Initialize your first Uma character to access the neural rhythm interface.
          </p>
          <Link href="/characters">
            <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-sm uppercase tracking-wide transition-colors">
              CREATE UMA NODE
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const calculateOverallPower = (uma: Uma) => {
    return Math.floor((uma.speed + uma.stamina + uma.technique) / 3);
  };

  const formatTimestamp = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const getStatChange = (current: number, previous: number = 0) => {
    const change = current - previous;
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute inset-0 grid-pattern"
          animate={{
            backgroundPosition: ['0px 0px', '32px 32px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ y: '-100vh' }}
        animate={{ y: '100vh' }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Column - System Status & Roster (30%) */}
        <motion.div
          className="w-[30%] bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col p-6 relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Vertical Data Stream on right edge */}
          <div className="absolute right-0 top-0 w-1 h-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent h-32"
              animate={{
                y: ['-100%', '400%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>

          {/* System Header */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-lg border border-cyan-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-mono text-lg text-gray-900 font-black uppercase tracking-wider">
                  RHYTHMDERBY
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono font-semibold">
                  NEURAL INTERFACE v2.4.1
                </p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-cyan-500/50 via-cyan-500/20 to-transparent" />
          </motion.div>

          {/* Core Modules Status */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold mb-3 border-b border-gray-200 pb-2">
              [SYS-STATUS] CORE MODULES
            </p>
            <div className="space-y-2">
              {[
                { label: 'AUTH', status: 'ONLINE', latency: '12ms', color: 'green' },
                { label: 'DB', status: 'SYNC', latency: '8ms', color: 'green' },
                { label: 'NET', status: 'ONLINE', latency: '15ms', color: 'green' },
                { label: 'TRAINING', status: 'READY', load: '23%', color: 'green' },
                { label: 'RACING', status: 'READY', load: '18%', color: 'green' },
              ].map((module, i) => (
                <div key={module.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${module.color === 'green' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                    <span className="text-xs font-mono text-gray-700 uppercase">{module.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-green-600 font-bold">{module.status}</span>
                    {module.latency && (
                      <span className="text-xs font-mono text-cyan-600">{module.latency}</span>
                    )}
                    {module.load && (
                      <span className="text-xs font-mono text-yellow-600">{module.load}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Roster Panel */}
          <motion.div
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold mb-3 border-b border-gray-200 pb-2">
              [ROSTER] UMA NODES ({umas.length})
            </p>
            <div className="flex-1 overflow-y-auto space-y-1">
              {umas.map((uma, index) => {
                const isSelected = uma.id === selectedUmaId;
                const power = calculateOverallPower(uma);

                return (
                  <motion.button
                    key={uma.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    onClick={() => selectUma(uma.id)}
                    className={`w-full text-left px-3 py-2 font-mono text-xs transition-all relative group ${isSelected
                        ? 'bg-cyan-50 border-l-2 border-cyan-600'
                        : 'hover:bg-gray-50 border-l-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`font-bold truncate ${isSelected ? 'text-cyan-700' : 'text-gray-900'}`}>
                          {uma.name.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-500">{uma.style.toUpperCase()}</span>
                        <span className={isSelected ? 'text-cyan-600 font-bold' : 'text-gray-700'}>{power}</span>
                      </div>
                    </div>
                    {/* Hover underline effect */}
                    {!isSelected && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-px bg-cyan-600/60"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Active Uma Console (70%) */}
        <div className="flex-1 flex flex-col p-6">
          <AnimatePresence mode="wait">
            {selectedUma && (
              <motion.div
                key={selectedUma.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col h-full"
              >
                {/* Header Strip */}
                <div className="bg-gray-50 px-6 py-3 border border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono font-bold">
                      MODULE: DASHBOARD | CHANNEL: OPERATOR | ACTIVE UMA: {selectedUma.name.toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs font-mono text-gray-600 font-bold uppercase">◆ SECURE</span>
                    </div>
                  </div>
                </div>

                {/* Active Uma Card */}
                <div className="bg-white border border-gray-200 shadow-lg flex-1 relative overflow-hidden">
                  {/* Scanline Effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ y: '-120px' }}
                    animate={{ y: 'calc(100% + 120px)' }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <div className="w-full h-[120px] bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
                  </motion.div>

                  <div className="p-6 relative z-10">
                    {/* Uma Name and Portrait */}
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-48 h-48 bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                        <User className="w-24 h-24 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-mono text-3xl font-black uppercase tracking-wider text-gray-900 mb-3">
                          {selectedUma.name}
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 border-2 border-cyan-600 text-cyan-700 font-mono text-xs uppercase font-bold">
                            {selectedUma.style}
                          </span>
                          <span className="px-3 py-1 border border-gray-300 text-gray-600 font-mono text-xs uppercase">
                            {selectedUma.temperament}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 font-mono text-xs uppercase">
                            LVL {selectedUma.level}
                          </span>
                        </div>

                        {/* Stats Display */}
                        <div className="space-y-3">
                          {[
                            { label: 'SPD', value: selectedUma.speed, max: 100, change: '+3' },
                            { label: 'STA', value: selectedUma.stamina, max: 100, change: '+1' },
                            { label: 'TEC', value: selectedUma.technique, max: 100, change: '+5' },
                            { label: 'ENR', value: selectedUma.energy, max: selectedUma.maxEnergy, change: selectedUma.energy === selectedUma.maxEnergy ? 'MAX' : '' },
                          ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-3">
                              <span className="text-xs font-mono text-gray-500 w-8">{stat.label}</span>
                              <div className="flex-1 h-1 bg-gray-200 overflow-hidden">
                                <motion.div
                                  className="h-full bg-cyan-600"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                />
                              </div>
                              <span className="text-xs font-mono text-gray-900 font-bold w-16 text-right">
                                {stat.value}/{stat.max}
                              </span>
                              {stat.change && (
                                <span className={`text-xs font-mono w-12 ${stat.change === 'MAX' ? 'text-green-600 font-bold' : 'text-cyan-600'
                                  }`}>
                                  [{stat.change}]
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-3 mb-6">
                      <Link href="/training" className="flex-1">
                        <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono font-bold py-3 px-4 transition-all text-sm uppercase tracking-wide">
                          START TRAINING
                        </button>
                      </Link>
                      <Link href="/racing" className="flex-1">
                        <button className="w-full border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 font-mono font-bold py-3 px-4 transition-all text-sm uppercase tracking-wide">
                          ENTER RACE
                        </button>
                      </Link>
                      <Link href="/inventory" className="flex-1">
                        <button className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-mono font-bold py-3 px-4 transition-all text-sm uppercase tracking-wide">
                          INVENTORY
                        </button>
                      </Link>
                    </div>

                    {/* Footer Logs */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold mb-3">
                        [ACTIVITY] RECENT LOGS
                      </p>
                      <div className="space-y-2 font-mono text-xs text-gray-600">
                        {trainingHistory.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">[LOG]</span>
                            <span>LAST TRAINING:</span>
                            <span className="text-gray-900">{formatTimestamp(trainingHistory[0].createdAt)}</span>
                            <span>|</span>
                            <span className="uppercase">{trainingHistory[0].sessionType}</span>
                            <span>|</span>
                            <span className="text-cyan-600">+{trainingHistory[0].speedDelta + trainingHistory[0].staminaDelta + trainingHistory[0].techniqueDelta} STATS</span>
                            <span>|</span>
                            <span className="text-orange-600">-{trainingHistory[0].energyBefore - trainingHistory[0].energyAfter} ENR</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">[LOG]</span>
                            <span className="text-gray-400">NO TRAINING HISTORY AVAILABLE</span>
                          </div>
                        )}

                        {raceHistory.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">[LOG]</span>
                            <span>LAST RACE:</span>
                            <span className="text-gray-900">{formatTimestamp(raceHistory[0].startTime)}</span>
                            <span>|</span>
                            <span className={`font-bold ${raceHistory[0].placement === 1 ? 'text-green-600' :
                                raceHistory[0].placement === 2 ? 'text-cyan-600' :
                                  raceHistory[0].placement === 3 ? 'text-orange-600' :
                                    'text-gray-600'
                              }`}>
                              #{raceHistory[0].placement}
                            </span>
                            <span>|</span>
                            <span className="uppercase">{raceHistory[0].distanceType}</span>
                            <span>|</span>
                            <span className="text-gray-900">{raceHistory[0].score}pts</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">[LOG]</span>
                            <span className="text-gray-400">NO RACE HISTORY AVAILABLE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid pattern CSS */}
      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
    </div>
  );
}
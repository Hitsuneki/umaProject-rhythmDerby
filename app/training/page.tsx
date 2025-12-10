'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatBar } from '@/components/ui/StatBar';
import { Badge } from '@/components/ui/Badge';
import { Zap, Target, Activity, TrendingUp, ArrowLeft, RotateCcw, Circle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SessionType, Uma } from '@/types';

const SESSION_DURATION = 12000; // 12 seconds
const TICK_INTERVAL = 100; // Update every 100ms
const BEAT_CYCLE = 1200; // One beat cycle every 1.2 seconds
const ON_BEAT_WINDOW = 0.15; // 15% of the cycle is "on-beat"
const MAX_CHARGE = 3;

export default function TrainingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const umaId = searchParams.get('id');

  const [currentUma, setCurrentUma] = useState<Uma | null>(null);
  const [availableUmas, setAvailableUmas] = useState<Uma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  
  // Rhythm mechanics
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [beatPosition, setBeatPosition] = useState(0); // 0-1, position in beat cycle
  const [sweetZoneStart, setSweetZoneStart] = useState(0.4); // Sweet zone position (randomized after burst)
  const [goodRhythm, setGoodRhythm] = useState(0);
  const [missRhythm, setMissRhythm] = useState(0);
  const [charge, setCharge] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [result, setResult] = useState<{ quality: number; gains: any; label: string } | null>(null);
  const [lastFeedback, setLastFeedback] = useState<'good' | 'miss' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUmas = async () => {
      try {
        const res = await fetch('/api/uma');
        if (!res.ok) throw new Error('Failed to fetch Umas');
        const data = await res.json();
        setAvailableUmas(data);

        // If ID is in URL, select that Uma
        if (umaId) {
          const selected = data.find((u: Uma) => u.id === umaId);
          if (selected) {
            setCurrentUma(selected);
          } else {
            setError('Selected Uma not found');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load characters');
      } finally {
        setLoading(false);
      }
    };

    fetchUmas();
  }, [umaId]);
  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= TICK_INTERVAL) {
          finishTraining();
          return 0;
        }
        return prev - TICK_INTERVAL;
      });

      // Update beat position (cycles from 0 to 1)
      setBeatPosition((prev) => {
        const increment = TICK_INTERVAL / BEAT_CYCLE;
        const newPos = (prev + increment) % 1;
        return newPos;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isTraining]);

  const startTraining = (sessionType: SessionType) => {
    if (!currentUma) return;
    
    setSelectedSession(sessionType);
    setCountdown(3);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      // Start the actual training
      setCountdown(null);
      setIsTraining(true);
      setTimeLeft(SESSION_DURATION);
      setBeatPosition(0);
      setSweetZoneStart(0.4);
      setGoodRhythm(0);
      setMissRhythm(0);
      setCharge(0);
      setBurstActive(false);
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleClick = () => {
    if (!isTraining || burstActive) return;

    // Check if click is within sweet zone
    const sweetZoneEnd = sweetZoneStart + ON_BEAT_WINDOW;
    const isOnBeat = 
      (beatPosition >= sweetZoneStart && beatPosition <= sweetZoneEnd) ||
      (sweetZoneEnd > 1 && beatPosition <= (sweetZoneEnd - 1)); // Handle wrap-around

    if (isOnBeat) {
      // On-beat: Good rhythm
      setLastFeedback('good');
      setGoodRhythm((prev) => prev + 1);
      setCharge((prev) => {
        const newCharge = Math.min(MAX_CHARGE, prev + 1);
        
        // Trigger burst when charge is full
        if (newCharge === MAX_CHARGE) {
          triggerBurst();
          return 0;
        }
        
        return newCharge;
      });
    } else {
      // Off-beat: Miss
      setLastFeedback('miss');
      setMissRhythm((prev) => prev + 1);
      // Small penalty: lose some charge
      setCharge((prev) => Math.max(0, prev - 0.5));
    }

    // Show feedback animation
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setLastFeedback(null);
    }, 500);
  };

  const triggerBurst = () => {
    setBurstActive(true);
    
    // Randomize sweet zone position after burst
    setSweetZoneStart(Math.random() * 0.7); // Keep it within 0-0.7 so it doesn't wrap too much
    
    // Reset burst after short duration
    setTimeout(() => {
      setBurstActive(false);
    }, 300);
  };

  const finishTraining = useCallback(async () => {
    if (!currentUma || !selectedSession) return;

    setIsTraining(false);

    const totalClicks = goodRhythm + missRhythm;
    let quality = totalClicks > 0 ? Math.round((goodRhythm / totalClicks) * 100) : 0;

    // Calculate stat gains based on session type and quality
    // Ensure meaningful gains even for moderate performance
    let gains = { speed: 0, stamina: 0, technique: 0 };
    
    // Base gain: minimum 1 point for any successful clicks, scaling with quality
    const baseGain = Math.max(1, Math.floor(quality / 10));

    // Energy penalty multiplier
    const energyMultiplier = currentUma.energy < 30 ? 0.5 : 1.0;

    switch (selectedSession) {
      case 'speed':
        gains.speed = Math.max(1, Math.floor(baseGain * energyMultiplier));
        if (quality >= 80) gains.technique += 1; // Bonus for excellent form
        break;

      case 'stamina':
        gains.stamina = Math.max(1, Math.floor(baseGain * energyMultiplier));
        if (quality < 40 && quality > 0) gains.speed = -1; // Small penalty for poor form
        break;

      case 'technique':
        gains.technique = Math.max(1, Math.floor(baseGain * energyMultiplier));
        break;

      case 'mixed':
        const mixedGain = Math.max(1, Math.floor((baseGain / 2) * energyMultiplier));
        gains = { speed: mixedGain, stamina: mixedGain, technique: mixedGain };
        break;
    }

    try {
      // Post training results to API
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          umaId: currentUma.id,
          sessionType: selectedSession,
          qualityPct: quality,
          speedDelta: gains.speed,
          staminaDelta: gains.stamina,
          techniqueDelta: gains.technique,
          energyBefore: currentUma.energy,
          energyAfter: Math.max(0, currentUma.energy - 15),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save training');
      }

      const data = await response.json();

      // Quality label based on actual quality
      let label = 'Rough Session';
      if (data.quality >= 80) label = 'Excellent!';
      else if (data.quality >= 60) label = 'Good Session';
      else if (data.quality >= 40) label = 'Fair Session';

      // Update local state with new stats from API
      setCurrentUma({
        ...currentUma,
        speed: data.uma.speed,
        stamina: data.uma.stamina,
        technique: data.uma.technique,
        energy: data.uma.energy,
      });

      // Use API response data for results
      setResult({ 
        quality: data.quality, 
        gains: data.gains, 
        label 
      });
    } catch (err) {
      setError('Failed to save training results');
    }
  }, [currentUma, selectedSession, goodRhythm, missRhythm]);

  const reset = () => {
    setSelectedSession(null);
    setIsTraining(false);
    setResult(null);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--accent) mx-auto mb-4"></div>
          <p className="text-(--grey-dark)">Loading Uma...</p>
        </div>
      </div>
    );
  }

  if (!currentUma) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-(--charcoal) mb-2">
              Select Uma for Training
            </h1>
            <p className="text-(--grey-dark)">
              Choose a character to start a rhythm training session
            </p>
          </div>
          <Button variant="secondary" icon={<ArrowLeft />} onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>

        {availableUmas.length === 0 ? (
          <Card className="text-center py-16">
            <h2 className="font-display text-xl font-semibold mb-2 text-(--charcoal)">
              No Characters Found
            </h2>
            <p className="text-(--grey-dark) mb-6">
              You need to recruit an Uma Musume before you can train.
            </p>
            <Button variant="primary" onClick={() => router.push('/characters/new')} icon={<Zap />}>
              Recruit New Uma
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableUmas.map((uma, index) => (
              <motion.div
                key={uma.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
                          <User className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-(--accent) text-white rounded-full w-7 h-7 flex items-center justify-center font-display text-xs font-bold">
                          {uma.level}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-bold text-(--charcoal) truncate mb-1">
                          {uma.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="accent">{uma.style}</Badge>
                          <Badge>{uma.temperament}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <StatBar label="SPD" value={uma.speed} maxValue={100} showValue={false} color="#FF4F00" />
                      <StatBar label="STA" value={uma.stamina} maxValue={100} showValue={false} color="#00A4F0" />
                      <StatBar label="TEC" value={uma.technique} maxValue={100} showValue={false} color="#8FED1D" />
                    </div>

                    {/* Trait */}
                    <div className="p-3 bg-(--grey-light) rounded-lg">
                      <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark)">
                        {uma.trait ? (uma.trait as string).replace(/_/g, ' ') : 'No Trait'}
                      </p>
                    </div>

                    {/* Train Action */}
                    <Button
                      variant="primary"
                      className="w-full py-3"
                      onClick={() => {
                        setCurrentUma(uma);
                        // Optional: update URL shallowly so reload keeps selection, or strict push
                        const newUrl = `/training?id=${uma.id}`;
                        window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
                      }}
                      icon={<Zap className="w-4 h-4" />}
                    >
                      TRAIN NOW
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Calculate sweet zone position on the bar (0-100%)
  const sweetZoneStartPercent = sweetZoneStart * 100;
  const sweetZoneEndPercent = ((sweetZoneStart + ON_BEAT_WINDOW) % 1) * 100;
  const beatPositionPercent = beatPosition * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" icon={<ArrowLeft />} onClick={() => router.push('/')}>
            Back
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-(--charcoal)">
              Rhythm Training
            </h1>
            <p className="text-(--grey-dark)">
              Click on-beat to build charge and trigger bursts
            </p>
          </div>
        </div>
      </div>

      {/* Uma Summary */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-(--charcoal) mb-2">
              {currentUma.name}
            </h2>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-(--grey-dark)">Speed</p>
                <p className="stat-mono text-lg font-bold text-(--charcoal)">{currentUma.speed}</p>
              </div>
              <div>
                <p className="text-xs text-(--grey-dark)">Stamina</p>
                <p className="stat-mono text-lg font-bold text-(--charcoal)">{currentUma.stamina}</p>
              </div>
              <div>
                <p className="text-xs text-(--grey-dark)">Technique</p>
                <p className="stat-mono text-lg font-bold text-(--charcoal)">{currentUma.technique}</p>
              </div>
              <div>
                <p className="text-xs text-(--grey-dark)">Level</p>
                <p className="stat-mono text-lg font-bold text-(--accent)">{currentUma.level}</p>
              </div>
              <div>
                <p className="text-xs text-(--grey-dark)">Energy</p>
                <p className="stat-mono text-lg font-bold text-(--accent)">{currentUma.energy}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {!selectedSession && !result && (
          <motion.div
            key="session-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <h2 className="font-display text-xl font-semibold mb-6 text-(--charcoal)">
                Choose Rhythm Session
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: 'speed' as SessionType, icon: Zap, label: 'Speed Session', color: '#FF4F00', desc: 'Focus on Speed (+Technique bonus at 80%+)' },
                  { type: 'stamina' as SessionType, icon: Activity, label: 'Stamina Session', color: '#00A4F0', desc: 'Build Stamina (Speed penalty below 40%)' },
                  { type: 'technique' as SessionType, icon: Target, label: 'Technique Session', color: '#8FED1D', desc: 'Refine Technique' },
                  { type: 'mixed' as SessionType, icon: TrendingUp, label: 'Mixed Session', color: '#9333EA', desc: 'Balanced gains to all stats' },
                ].map(({ type, icon: Icon, label, color, desc }) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startTraining(type)}
                    disabled={currentUma.energy < 15}
                    className="p-6 panel text-left transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold text-(--charcoal) mb-1">
                          {label}
                        </h3>
                        <p className="text-sm text-(--grey-dark)">{desc}</p>
                        <p className="text-xs text-(--grey-dark) mt-2">Energy cost: 15</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {countdown !== null && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Card className="text-center py-20">
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm font-display uppercase tracking-wide text-(--grey-dark) mb-4">
                  Get Ready!
                </p>
                <p className="font-display text-9xl font-black text-(--accent)">
                  {countdown}
                </p>
              </motion.div>
            </Card>
          </motion.div>
        )}

        {isTraining && (
          <motion.div
            key="training"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="accent">{selectedSession} session</Badge>
                    {burstActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-md font-display text-xs font-bold uppercase"
                      >
                        ⚡ BURST!
                      </motion.div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="stat-mono text-2xl font-bold text-(--accent)">
                      {Math.ceil(timeLeft / 1000)}s
                    </p>
                    <p className="text-xs text-(--grey-dark)">Time Left</p>
                  </div>
                </div>

                {/* Rhythm Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-display uppercase tracking-wide text-(--grey-dark)">
                      Rhythm Bar - Click when marker enters GREEN zone
                    </p>
                    <div className="flex items-center gap-4 text-xs stat-mono">
                      <span className="text-green-600 font-bold">✓ Good: {goodRhythm}</span>
                      <span className="text-red-600 font-bold">✗ Miss: {missRhythm}</span>
                    </div>
                  </div>
                  
                  <div 
                    className="relative h-16 rounded-lg overflow-hidden transition-all duration-200"
                    style={{
                      background: showFeedback 
                        ? lastFeedback === 'good' 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(239, 68, 68, 0.2)'
                        : 'var(--grey-light)',
                      boxShadow: showFeedback
                        ? lastFeedback === 'good'
                          ? '0 0 20px rgba(34, 197, 94, 0.5)'
                          : '0 0 20px rgba(239, 68, 68, 0.5)'
                        : 'none'
                    }}
                  >
                    {/* Beat Tick Marks */}
                    {[0, 25, 50, 75].map((pos) => (
                      <div
                        key={pos}
                        className="absolute top-0 bottom-0 w-px bg-(--grey-medium) opacity-30"
                        style={{ left: `${pos}%` }}
                      />
                    ))}

                    {/* Sweet Zone */}
                    <motion.div
                      className="absolute h-full bg-green-400/70 border-l-4 border-r-4 border-green-600"
                      style={{
                        left: `${sweetZoneStartPercent}%`,
                        width: `${ON_BEAT_WINDOW * 100}%`,
                      }}
                      animate={{
                        left: `${sweetZoneStartPercent}%`,
                        opacity: [0.7, 0.9, 0.7],
                      }}
                      transition={{ 
                        left: { duration: 0.3 },
                        opacity: { duration: 1, repeat: Infinity }
                      }}
                    />
                    
                    {/* Beat Marker */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-2 bg-cyan-400 shadow-lg z-10"
                      style={{ 
                        left: `${beatPositionPercent}%`,
                        boxShadow: '0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(34, 211, 238, 0.4)'
                      }}
                      animate={{ 
                        left: `${beatPositionPercent}%`,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        left: { duration: 0 },
                        scale: { duration: 0.3, repeat: Infinity }
                      }}
                    />
                    
                    {/* Feedback Text */}
                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: -10 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        >
                          <span 
                            className="font-display text-4xl font-black tracking-wider"
                            style={{
                              color: lastFeedback === 'good' ? '#22c55e' : '#ef4444',
                              textShadow: lastFeedback === 'good' 
                                ? '0 0 20px rgba(34, 197, 94, 0.8)'
                                : '0 0 20px rgba(239, 68, 68, 0.8)'
                            }}
                          >
                            {lastFeedback === 'good' ? 'GOOD!' : 'MISS!'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Charge Dots */}
                <div className="space-y-2">
                  <p className="text-sm font-display uppercase tracking-wide text-(--grey-dark)">
                    Charge ({charge}/{MAX_CHARGE})
                  </p>
                  <div className="flex items-center gap-3">
                    {[...Array(MAX_CHARGE)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: i < Math.floor(charge) ? 1 : 0.5,
                          opacity: i < Math.floor(charge) ? 1 : 0.3,
                        }}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          i < Math.floor(charge)
                            ? 'bg-(--accent) border-(--accent)'
                            : 'bg-transparent border-(--grey-medium)'
                        }`}
                      >
                        <Circle className={`w-4 h-4 ${i < Math.floor(charge) ? 'text-white fill-white' : 'text-(--grey-medium)'}`} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Click Zone */}
                <button
                  onClick={handleClick}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleClick();
                    }
                  }}
                  className={`w-full h-32 rounded-xl font-display text-2xl font-bold uppercase tracking-wider transition-all active:scale-95 ${
                    burstActive
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-4 border-yellow-300'
                      : 'bg-gradient-to-br from-(--accent)/20 to-(--accent)/5 border-2 border-(--accent) text-(--accent) hover:from-(--accent)/30 hover:to-(--accent)/10'
                  }`}
                >
                  {burstActive ? '⚡ BURST ACTIVE! ⚡' : 'Click Here! (or press Space)'}
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <div className="text-center space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-(--charcoal) mb-2">
                    Training Complete!
                  </h2>
                  <p className="text-lg text-(--grey-dark) mb-4">{result.label}</p>
                  <div className="inline-block">
                    <p className="text-sm text-(--grey-dark) mb-2">Training Quality</p>
                    <p className="stat-mono text-5xl font-bold text-(--accent)">
                      {result.quality}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm stat-mono">
                  <div className="p-3 bg-(--grey-light) rounded-lg">
                    <p className="text-(--grey-dark) mb-1">Good Rhythm</p>
                    <p className="text-2xl font-bold text-green-600">{goodRhythm}</p>
                  </div>
                  <div className="p-3 bg-(--grey-light) rounded-lg">
                    <p className="text-(--grey-dark) mb-1">Missed</p>
                    <p className="text-2xl font-bold text-red-600">{missRhythm}</p>
                  </div>
                </div>

                <div className="p-6 bg-(--grey-light) rounded-xl">
                  <p className="text-sm font-display uppercase tracking-wide text-(--grey-dark) mb-4">
                    Stat Gains
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className={`stat-mono text-3xl font-bold ${result.gains.speed >= 0 ? 'text-(--charcoal)' : 'text-red-600'}`}>
                        {result.gains.speed >= 0 ? '+' : ''}{result.gains.speed}
                      </p>
                      <p className="text-xs text-(--grey-dark) mt-1">Speed</p>
                    </div>
                    <div>
                      <p className={`stat-mono text-3xl font-bold ${result.gains.stamina >= 0 ? 'text-(--charcoal)' : 'text-red-600'}`}>
                        {result.gains.stamina >= 0 ? '+' : ''}{result.gains.stamina}
                      </p>
                      <p className="text-xs text-(--grey-dark) mt-1">Stamina</p>
                    </div>
                    <div>
                      <p className={`stat-mono text-3xl font-bold ${result.gains.technique >= 0 ? 'text-(--charcoal)' : 'text-red-600'}`}>
                        {result.gains.technique >= 0 ? '+' : ''}{result.gains.technique}
                      </p>
                      <p className="text-xs text-(--grey-dark) mt-1">Technique</p>
                    </div>
                  </div>
                </div>

                {currentUma.energy < 30 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Low energy! Gains were reduced by 50%. Rest your Uma to restore energy.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1" onClick={reset} icon={<RotateCcw />}>
                    Train Again
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => router.push('/')}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
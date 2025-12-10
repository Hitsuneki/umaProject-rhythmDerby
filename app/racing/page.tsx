'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trophy, ArrowLeft, Circle, Zap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DistanceType, Uma } from '@/types';

const RACE_DISTANCES = {
  '1200m': { distance: 1000, duration: 20000, label: 'Short' },
  '1600m': { distance: 1200, duration: 24000, label: 'Mid' },
  '2000m': { distance: 1400, duration: 28000, label: 'Mid-Long' },
  '2400m': { distance: 1600, duration: 32000, label: 'Long' },
};

const TICK_INTERVAL = 50; // 50ms updates
const BEAT_CYCLE = 1000; // 1 second beat cycle
const ON_BEAT_WINDOW = 0.15; // 15% of cycle
const MAX_CHARGE = 3;
const NUM_LANES = 3;

type Phase = 'start' | 'mid' | 'final';
type ZoneType = 'neutral' | 'boost' | 'drag';

interface Runner {
  id: string;
  name: string;
  isPlayer: boolean;
  lane: number;
  position: number;
  speed: number;
  stamina: number;
  technique: number;
  burstActive: boolean;
  burstTimer: number;
}

interface TrackZone {
  start: number;
  end: number;
  type: ZoneType;
  lane: number;
}

export default function RacingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const umaId = searchParams.get('id');

  const [currentUma, setCurrentUma] = useState<Uma | null>(null);
  const [availableUmas, setAvailableUmas] = useState<Uma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<DistanceType | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  
  // Race state
  const [runners, setRunners] = useState<Runner[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('start');
  const [trackZones, setTrackZones] = useState<TrackZone[]>([]);
  
  // Beat mechanics
  const [beatPosition, setBeatPosition] = useState(0);
  const [sweetZoneStart, setSweetZoneStart] = useState(0.4);
  const [charge, setCharge] = useState(0);
  const [goodRhythm, setGoodRhythm] = useState(0);
  const [offBeatClicks, setOffBeatClicks] = useState(0);
  
  const [result, setResult] = useState<{ placement: number; score: number; time: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<'good' | 'miss' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [phaseQualities, setPhaseQualities] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchUmas = async () => {
      try {
        const response = await fetch('/api/uma');
        if (!response.ok) throw new Error('Failed to fetch Umas');
        const data = await response.json();
        setAvailableUmas(data);
        
        // Auto-select from URL param or first character
        if (umaId) {
          const uma = data.find((u: Uma) => u.id === umaId);
          if (uma) setCurrentUma(uma);
        } else if (data.length > 0) {
          setCurrentUma(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Umas');
      } finally {
        setLoading(false);
      }
    };

    fetchUmas();
  }, [umaId]);

  // Generate track zones
  const generateTrackZones = useCallback((distance: number) => {
    const zones: TrackZone[] = [];
    const numSegments = 8;
    const segmentSize = distance / numSegments;

    for (let lane = 0; lane < NUM_LANES; lane++) {
      for (let i = 0; i < numSegments; i++) {
        const start = i * segmentSize;
        const end = (i + 1) * segmentSize;
        
        // Randomize zone types with some strategy
        let type: ZoneType = 'neutral';
        const rand = Math.random();
        
        if (rand < 0.2) type = 'boost';
        else if (rand < 0.35) type = 'drag';
        
        zones.push({ start, end, type, lane });
      }
    }
    
    return zones;
  }, []);

  // Initialize race
  const startRacing = (distance: DistanceType) => {
    if (!currentUma) return;
    
    setSelectedDistance(distance);
    setCountdown(3);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null || !selectedDistance || !currentUma) return;

    if (countdown === 0) {
      // Start the actual race
      setCountdown(null);
      
      const raceConfig = RACE_DISTANCES[selectedDistance];
      const zones = generateTrackZones(raceConfig.distance);
      
      // Create runners
      const playerRunner: Runner = {
        id: currentUma.id,
        name: currentUma.name,
        isPlayer: true,
        lane: 1,
        position: 0,
        speed: currentUma.speed,
        stamina: currentUma.stamina,
        technique: currentUma.technique,
        burstActive: false,
        burstTimer: 0,
      };

      // Create AI runners
      const aiRunners: Runner[] = [
        {
          id: 'ai1',
          name: 'Rival A',
          isPlayer: false,
          lane: 0,
          position: 0,
          speed: 50 + Math.random() * 20,
          stamina: 50 + Math.random() * 20,
          technique: 50 + Math.random() * 20,
          burstActive: false,
          burstTimer: 0,
        },
        {
          id: 'ai2',
          name: 'Rival B',
          isPlayer: false,
          lane: 2,
          position: 0,
          speed: 50 + Math.random() * 20,
          stamina: 50 + Math.random() * 20,
          technique: 50 + Math.random() * 20,
          burstActive: false,
          burstTimer: 0,
        },
      ];

      setIsRacing(true);
      setRunners([playerRunner, ...aiRunners]);
      setTrackZones(zones);
      setTimeElapsed(0);
      setPhase('start');
      setBeatPosition(0);
      setSweetZoneStart(0.4);
      setCharge(0);
      setGoodRhythm(0);
      setOffBeatClicks(0);
      setPhaseQualities([]);
      setPhaseQualities([]);
      setResult(null);
      setStartTime(Date.now());
      
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, selectedDistance, currentUma, generateTrackZones]);

  // Main race loop
  useEffect(() => {
    if (!isRacing || !selectedDistance) return;

    const raceConfig = RACE_DISTANCES[selectedDistance];
    
    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + TICK_INTERVAL;
        
        // Check if race should end
        const playerRunner = runners.find(r => r.isPlayer);
        if (playerRunner && playerRunner.position >= raceConfig.distance) {
          finishRace();
          return prev;
        }
        
        if (newTime >= raceConfig.duration) {
          finishRace();
          return prev;
        }
        
        return newTime;
      });

      // Update beat position
      setBeatPosition((prev) => (prev + (TICK_INTERVAL / BEAT_CYCLE)) % 1);

      // Update phase
      setPhase((prev) => {
        const progress = timeElapsed / raceConfig.duration;
        if (progress < 0.33) return 'start';
        if (progress < 0.66) return 'mid';
        return 'final';
      });

      // Update runners
      setRunners((prevRunners) => 
        prevRunners.map((runner) => {
          // Base speed calculation
          let baseSpeed = runner.speed / 20; // Normalize
          
          // Phase modifiers
          if (phase === 'start') {
            baseSpeed *= 1.1; // Slight boost in start phase
          } else if (phase === 'mid') {
            // Stamina check
            const staminaMultiplier = runner.stamina > 50 ? 1.0 : 0.85;
            baseSpeed *= staminaMultiplier;
          } else if (phase === 'final') {
            // Technique and stamina matter
            const finalMultiplier = (runner.technique / 100) * 0.3 + (runner.stamina / 100) * 0.2 + 0.5;
            baseSpeed *= finalMultiplier;
          }

          // Burst multiplier
          let burstMultiplier = 1.0;
          let newBurstTimer = runner.burstTimer;
          
          if (runner.burstActive) {
            burstMultiplier = 1.5 + (runner.technique / 200); // 1.5-2.0x
            newBurstTimer -= TICK_INTERVAL;
            
            if (newBurstTimer <= 0) {
              return { ...runner, burstActive: false, burstTimer: 0 };
            }
          }

          // Lane zone multiplier
          const currentZone = trackZones.find(
            z => z.lane === runner.lane && 
                 runner.position >= z.start && 
                 runner.position < z.end
          );
          
          let laneMultiplier = 1.0;
          if (currentZone) {
            if (currentZone.type === 'boost' && runner.burstActive) {
              laneMultiplier = 1.3; // Extra boost when bursting in boost zone
            } else if (currentZone.type === 'drag') {
              laneMultiplier = 0.85; // Drag penalty
            }
          }

          // Calculate effective speed
          const effectiveSpeed = baseSpeed * burstMultiplier * laneMultiplier;
          const newPosition = Math.min(raceConfig.distance, runner.position + effectiveSpeed);

          // AI behavior - simple lane switching
          let newLane = runner.lane;
          if (!runner.isPlayer && Math.random() < 0.01) {
            // Occasionally switch lanes
            newLane = Math.floor(Math.random() * NUM_LANES);
          }

          return {
            ...runner,
            position: newPosition,
            lane: newLane,
            burstTimer: newBurstTimer,
          };
        })
      );
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isRacing, selectedDistance, timeElapsed, phase, runners, trackZones]);

  // Handle click
  const handleClick = () => {
    if (!isRacing) return;

    const sweetZoneEnd = (sweetZoneStart + ON_BEAT_WINDOW) % 1;
    const isOnBeat = 
      (beatPosition >= sweetZoneStart && beatPosition <= sweetZoneEnd) ||
      (sweetZoneEnd < sweetZoneStart && (beatPosition >= sweetZoneStart || beatPosition <= sweetZoneEnd));

    if (isOnBeat) {
      // On-beat: Build charge
      setLastFeedback('good');
      setGoodRhythm((prev) => prev + 1);
      setCharge((prev) => {
        const newCharge = Math.min(MAX_CHARGE, prev + 1);
        
        if (newCharge === MAX_CHARGE) {
          triggerBurst();
          return 0;
        }
        
        return newCharge;
      });
    } else {
      // Off-beat: Switch lane
      setLastFeedback('miss');
      setOffBeatClicks((prev) => prev + 1);
      setRunners((prevRunners) =>
        prevRunners.map((runner) => {
          if (runner.isPlayer) {
            const newLane = (runner.lane + 1) % NUM_LANES;
            return { ...runner, lane: newLane };
          }
          return runner;
        })
      );
    }
    
    // Show feedback animation
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setLastFeedback(null);
    }, 500);
  };

  const triggerBurst = () => {
    // Activate burst for player
    setRunners((prevRunners) =>
      prevRunners.map((runner) => {
        if (runner.isPlayer) {
          return {
            ...runner,
            burstActive: true,
            burstTimer: 2000, // 2 second burst
          };
        }
        return runner;
      })
    );

    // Randomize sweet zone
    setSweetZoneStart(Math.random() * 0.7);
  };

  const finishRace = useCallback(async () => {
    if (!currentUma || !selectedDistance) return;

    setIsRacing(false);

    // Calculate placement
    const sortedRunners = [...runners].sort((a, b) => b.position - a.position);
    const playerRunner = sortedRunners.find(r => r.isPlayer);
    const placement = playerRunner ? sortedRunners.indexOf(playerRunner) + 1 : 4;

    // Calculate score
    const baseScore = 10000;
    const placementBonus = (4 - placement) * 3000;
    const rhythmBonus = goodRhythm * 100;
    const totalScore = baseScore + placementBonus + rhythmBonus;

    // Calculate phase qualities
    const totalClicks = goodRhythm + offBeatClicks;
    const overallQuality = totalClicks > 0 ? Math.round((goodRhythm / totalClicks) * 100) : 0;
    const qualities = [overallQuality, overallQuality, overallQuality]; // Simplified

    try {
      // Post race results to API
      const endTime = Date.now();
      await fetch('/api/races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          umaId: currentUma.id,
          distanceType: selectedDistance,
          startTime: startTime || (endTime - timeElapsed), // Fallback if startTime missing
          endTime,
          startQuality: qualities[0],
          midQuality: qualities[1],
          finalQuality: qualities[2],
          overallQuality,
          raceScore: totalScore,
          placement,
          participants: runners.map(r => ({
            isPlayer: r.isPlayer,
            name: r.name,
            speed: r.speed,
            stamina: r.stamina,
            technique: r.technique,
            lanePath: r.lane.toString(),
            finalPos: r.position,
          })),
        }),
      });

      // Award XP (update local state)
      const xpGain = placement === 1 ? 1 : 0;
      if (currentUma.level < 99 && xpGain > 0) {
        setCurrentUma({
          ...currentUma,
          level: currentUma.level + xpGain,
        });
      }

      setResult({
        placement,
        score: totalScore,
        time: Math.round(timeElapsed / 1000)
      });
    } catch (err) {
      setError('Failed to save race results');
    }
  }, [currentUma, selectedDistance, runners, goodRhythm, offBeatClicks, timeElapsed, startTime]);

  const reset = () => {
    setSelectedDistance(null);
    setIsRacing(false);
    setResult(null);
  };

  // Calculate variables used in render
  const raceConfig = selectedDistance ? RACE_DISTANCES[selectedDistance] : null;
  const playerRunner = runners.find(r => r.isPlayer);
  const sortedRunners = [...runners].sort((a, b) => b.position - a.position);
  const currentPlacement = playerRunner ? sortedRunners.indexOf(playerRunner) + 1 : 4;
  const sweetZoneStartPercent = sweetZoneStart * 100;
  const beatPositionPercent = beatPosition * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--accent) mx-auto mb-4"></div>
          <p className="text-(--grey-dark)">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" icon={<ArrowLeft />} onClick={() => router.push('/')}>
            Back
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-(--charcoal)">
              Lane Pulse Racing
            </h1>
            <p className="text-(--grey-dark)">
              Click on-beat to charge, off-beat to switch lanes
            </p>
          </div>
        </div>
        
        {/* Character Selector */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-(--grey-dark) block mb-1">Select Uma</label>
            <select
              value={currentUma?.id || ''}
              onChange={(e) => {
                const uma = availableUmas.find(u => u.id === e.target.value);
                setCurrentUma(uma || null);
              }}
              className="px-4 py-2 border border-(--border) rounded-lg font-display text-sm bg-white text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-(--accent)"
            >
              <option value="">Select Uma...</option>
              {availableUmas.map((uma) => (
                <option key={uma.id} value={uma.id}>
                  {uma.name} - {uma.style} Lv.{uma.level}
                </option>
              ))}
            </select>
          </div>
          <Button 
            variant="secondary" 
            className="mt-5"
            onClick={() => router.push('/characters')}
          >
            Manage
          </Button>
        </div>
      </div>

      {!currentUma ? (
        <Card className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-(--grey-medium)" />
          <h2 className="font-display text-xl font-bold mb-2 text-(--charcoal)">
            No Uma Selected
          </h2>
          <p className="text-(--grey-dark) mb-4">
            Please select an Uma from the dropdown above to start racing
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
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

          {!selectedDistance && !result && !countdown && (
          <motion.div
            key="distance-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <h2 className="font-display text-xl font-semibold mb-6 text-(--charcoal)">
                Select Race Distance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(RACE_DISTANCES) as DistanceType[]).map((distance) => {
                  const config = RACE_DISTANCES[distance];
                  return (
                    <motion.button
                      key={distance}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startRacing(distance)}
                      className="p-6 panel text-center transition-all hover:shadow-lg"
                    >
                      <Trophy className="w-8 h-8 mx-auto mb-3 text-(--accent)" />
                      <p className="font-display text-xl font-bold text-(--charcoal)">
                        {distance}
                      </p>
                      <p className="text-xs text-(--grey-dark) mt-1">{config.label}</p>
                      <p className="text-xs text-(--grey-dark) mt-1">{config.duration / 1000}s</p>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {isRacing && raceConfig && (
          <motion.div
            key="racing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Race Header */}
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-(--charcoal)">
                      {currentUma.name}
                    </h2>
                    <Badge variant="accent">{selectedDistance}</Badge>
                  </div>
                </div>

                {/* Phase Pills */}
                <div className="flex items-center gap-2">
                  {(['start', 'mid', 'final'] as Phase[]).map((p) => (
                    <div
                      key={p}
                      className={`px-3 py-1 rounded-full text-xs font-display uppercase tracking-wide transition-all ${
                        phase === p
                          ? 'bg-(--accent) text-white'
                          : 'bg-(--grey-light) text-(--grey-dark)'
                      }`}
                    >
                      {p}
                    </div>
                  ))}
                </div>

                {/* Placement */}
                <div className="text-right">
                  <p className="text-sm text-(--grey-dark)">Position</p>
                  <p className="stat-mono text-2xl font-bold text-(--accent)">
                    {currentPlacement}/{runners.length}
                  </p>
                </div>
              </div>
            </Card>

            {/* Mini-Map / Progress Bar */}
            <Card className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="text-xs font-display font-bold uppercase text-(--grey-dark) w-16">
                  Progress
                </div>
                <div className="relative flex-1 h-3 bg-(--grey-light) rounded-full overflow-visible">
                  {/* Track Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-(--grey-medium) -translate-y-1/2 z-0" />
                  
                  {/* Runners Dots */}
                  {runners.map((runner) => {
                    const progress = (runner.position / raceConfig.distance) * 100;
                    return (
                      <motion.div
                        key={`mini-${runner.id}`}
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 z-10 ${
                          runner.isPlayer 
                            ? 'bg-(--accent) border-white w-4 h-4 shadow-[0_0_8px_rgba(6,182,212,0.8)]' 
                            : 'bg-(--charcoal) border-white'
                        }`}
                        style={{ left: `${progress}%` }}
                        animate={{ left: `${progress}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    );
                  })}
                </div>
                <div className="text-xs font-display font-bold uppercase text-(--grey-dark) w-16 text-right">
                  {Math.round((playerRunner?.position || 0) / raceConfig.distance * 100)}%
                </div>
              </div>
            </Card>

            {/* Beat Bar & Charge */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-display font-bold uppercase tracking-wide text-(--charcoal)">
                    BEAT BAR — CLICK ON GREEN TO CHARGE, OFF-BEAT SWITCHES LANE
                  </p>
                  <div className="flex items-center gap-6 text-xs stat-mono">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-green-600 font-bold">GOOD: {goodRhythm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-red-500" />
                       <span className="text-red-600 font-bold">SWITCH: {offBeatClicks}</span>
                    </div>
                  </div>
                </div>

                {/* Beat Bar */}
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
                          {lastFeedback === 'good' ? 'GOOD!' : 'CHANGED!'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Charge Dots */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-display uppercase text-(--grey-dark)">
                    Charge:
                  </span>
                  {[...Array(MAX_CHARGE)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i < Math.floor(charge) ? 1 : 0.6,
                        opacity: i < Math.floor(charge) ? 1 : 0.3,
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        i < Math.floor(charge)
                          ? 'bg-(--accent) border-(--accent)'
                          : 'bg-transparent border-(--grey-medium)'
                      }`}
                    >
                      <Circle className={`w-3 h-3 ${i < Math.floor(charge) ? 'text-white fill-white' : 'text-(--grey-medium)'}`} />
                    </motion.div>
                  ))}
                  {playerRunner?.burstActive && (
                    <Badge variant="accent" className="ml-2">
                      <Zap className="w-3 h-3 mr-1" />
                      BURST!
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

             {/* Track */}
            <Card className="overflow-hidden">
              <div className="space-y-1">
                {[...Array(NUM_LANES)].map((_, laneIndex) => {
                  const laneRunners = runners.filter(r => r.lane === laneIndex);
                  /* Check if the player is currently in this lane to highlight it */
                  const isPlayerLane = playerRunner?.lane === laneIndex;
                  
                  return (
                    <div 
                      key={laneIndex} 
                      className={`relative h-24 rounded-lg overflow-hidden transition-colors duration-300 ${
                        isPlayerLane 
                          ? 'bg-cyan-50/50 border-2 border-cyan-200 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]' 
                          : 'bg-(--bg-surface) border border-(--grey-light)'
                      }`}
                    >
                      {/* Lane Label */}
                      <div className={`absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center border-r z-10 ${
                        isPlayerLane ? 'bg-cyan-100/50 border-cyan-200 text-cyan-800' : 'bg-(--grey-light) border-(--border) text-(--grey-dark)'
                      }`}>
                        <span className="writing-mode-vertical rotate-180 font-display font-bold text-[10px] uppercase tracking-wider">
                          Lane {laneIndex + 1}
                        </span>
                      </div>

                      {/* Track Area (offset left due to label) */}
                      <div className="absolute left-8 right-0 top-0 bottom-0">
                         {/* Grid Lines */}
                         <div className="absolute inset-0 flex pointer-events-none z-0">
                           {[...Array(8)].map((_, i) => (
                             <div key={i} className="flex-1 border-r border-(--border) opacity-30 last:border-r-0" />
                           ))}
                         </div>

                         {/* Zone segments */}
                         <div className="absolute inset-0">
                           {trackZones
                             .filter(z => z.lane === laneIndex)
                             .map((zone, zIndex) => {
                               const widthPercent = ((zone.end - zone.start) / raceConfig.distance) * 100;
                               const leftPercent = (zone.start / raceConfig.distance) * 100;
                               
                               let bgStyle = { backgroundColor: 'transparent' };
                               if (zone.type === 'boost') bgStyle = { backgroundColor: 'rgba(34, 197, 94, 0.1)' }; // Subtle Green
                               if (zone.type === 'drag') bgStyle = { backgroundColor: 'rgba(239, 68, 68, 0.1)' }; // Subtle Red
                               
                               return (
                                 <div
                                   key={zIndex}
                                   className="absolute h-full border-r border-dotted border-black/5"
                                   style={{
                                     left: `${leftPercent}%`,
                                     width: `${widthPercent}%`,
                                     ...bgStyle
                                   }}
                                 >
                                    {/* Zone Icon/Indicator if needed */}
                                    {zone.type === 'boost' && <div className="absolute bottom-1 right-1 text-[10px] font-bold text-green-600/50">{">>>"}</div>}
                                    {zone.type === 'drag' && <div className="absolute bottom-1 right-1 text-[10px] font-bold text-red-600/50">!!!</div>}
                                 </div>
                               );
                             })}
                         </div>

                        {/* Runners */}
                        {laneRunners.map((runner) => {
                          const positionPercent = (runner.position / raceConfig.distance) * 100;
                          
                          return (
                            <motion.div
                              key={runner.id}
                              className={`absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center`}
                              style={{ left: `${positionPercent}%` }}
                              animate={{ left: `${positionPercent}%` }}
                              transition={{ duration: 0.2, ease: "linear" }}
                              layoutId={`runner-${runner.id}`} // Enforce smooth layout transitions between lanes if possible
                            >
                              {runner.isPlayer ? (
                                /* Player Marker */
                                <div className="relative group">
                                  {/* Runner Body */}
                                  <motion.div 
                                    className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-sm shadow-lg border-[3px] transition-all
                                      ${runner.burstActive 
                                        ? 'bg-yellow-400 text-yellow-900 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.6)]' 
                                        : 'bg-white text-cyan-600 border-cyan-500 shadow-[0_4px_12px_rgba(6,182,212,0.4)]'
                                      }
                                    `}
                                    animate={
                                      runner.burstActive ? {
                                        scale: [1, 1.1, 1],
                                        rotate: [0, -2, 2, 0]
                                      } : lastFeedback === 'good' && showFeedback ? {
                                        scale: [1, 1.2, 1],
                                        filter: 'brightness(1.2)',
                                        borderColor: '#22c55e'
                                      } : lastFeedback === 'miss' && showFeedback ? {
                                        borderColor: '#ef4444',
                                        x: [-2, 2, -2, 2, 0]
                                      } : {}
                                    }
                                    transition={{ duration: 0.3 }}
                                  >
                                    YOU
                                  </motion.div>
                                  
                                  {/* Trailing Highlight (Speed lines) */}
                                   <div className="absolute top-1/2 right-full -mr-2 w-12 h-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                                     <div className="w-full h-full bg-gradient-to-l from-cyan-400/30 to-transparent transform -skew-x-12" />
                                   </div>
                                </div>
                              ) : (
                                /* Opponent Marker */
                                <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-red-300 flex items-center justify-center text-white text-xs font-bold shadow-md opacity-90">
                                  {runner.name.slice(0, 1)}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Click Button */}
            <button
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleClick();
                }
              }}
              className="w-full h-24 bg-gradient-to-br from-(--accent)/20 to-(--accent)/5 border-2 border-(--accent) rounded-xl font-display text-xl font-bold uppercase tracking-wider text-(--accent) hover:from-(--accent)/30 hover:to-(--accent)/10 transition-all active:scale-95"
            >
              Click Here! (On-beat = Charge | Off-beat = Switch Lane)
            </button>
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
                  <Trophy className={`w-20 h-20 mx-auto mb-4 ${
                    result.placement === 1 ? 'text-yellow-500' : 
                    result.placement === 2 ? 'text-gray-400' : 
                    result.placement === 3 ? 'text-orange-600' : 
                    'text-(--grey-dark)'
                  }`} />
                  <h2 className="font-display text-3xl font-bold text-(--charcoal) mb-2">
                    {result.placement === 1 ? '🏆 Victory!' : 
                     result.placement === 2 ? '🥈 2nd Place' : 
                     result.placement === 3 ? '🥉 3rd Place' : 
                     `${result.placement}th Place`}
                  </h2>
                  <p className="stat-mono text-5xl font-bold text-(--accent) mb-2">
                    {result.score.toLocaleString()}
                  </p>
                  <p className="text-sm text-(--grey-dark)">Race Score</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-(--grey-light) rounded-lg">
                    <p className="text-xs text-(--grey-dark) mb-1">Time</p>
                    <p className="stat-mono text-2xl font-bold text-(--charcoal)">
                      {result.time}s
                    </p>
                  </div>
                  <div className="p-4 bg-(--grey-light) rounded-lg">
                    <p className="text-xs text-(--grey-dark) mb-1">On-beat</p>
                    <p className="stat-mono text-2xl font-bold text-green-600">
                      {goodRhythm}
                    </p>
                  </div>
                  <div className="p-4 bg-(--grey-light) rounded-lg">
                    <p className="text-xs text-(--grey-dark) mb-1">Lane Switches</p>
                    <p className="stat-mono text-2xl font-bold text-(--charcoal)">
                      {offBeatClicks}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1" onClick={reset}>
                    Race Again
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => router.push('/history')}>
                    View History
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => router.push('/')}>
                    Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Database, Wifi, Zap, Trophy, User, Target, Battery, 
  Activity, TrendingUp, Award, Clock, ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// Mock data - replace with real data
const mockSystemModules = [
  { id: 'AUTH', label: 'AUTHENTICATION', status: 'ONLINE', value: '99.7%', color: 'green' },
  { id: 'DB', label: 'DATABASE', status: 'SYNC', value: '2.1GB', color: 'cyan' },
  { id: 'NET', label: 'NETWORK', status: 'LAT', value: '18MS', color: 'blue' },
  { id: 'TRAINING', label: 'TRAINING_SYS', status: 'LOAD', value: '3/12', color: 'yellow' },
  { id: 'RACING', label: 'RACING_SYS', status: 'READY', value: '0/8', color: 'green' },
];

const mockUmaRoster = [
  { id: '1', name: 'LIGHTNING_BOLT', style: 'RUNNER', power: 2847, isActive: true },
  { id: '2', name: 'THUNDER_STRIKE', style: 'LEADER', power: 3124, isActive: false },
  { id: '3', name: 'STORM_CHASER', style: 'CHASER', power: 2456, isActive: false },
  { id: '4', name: 'WIND_DANCER', style: 'RUNNER', power: 2189, isActive: false },
  { id: '5', name: 'FIRE_BOLT', style: 'LEADER', power: 1987, isActive: false },
];

const mockActiveUmaData = {
  '1': {
    id: '1',
    name: 'LIGHTNING_BOLT',
    style: 'RUNNER',
    temperament: 'ENERGETIC',
    level: 25,
    stats: { speed: 85, stamina: 72, technique: 78, energy: 90 },
    lastTraining: { type: 'SPEED_TRAINING', result: 'SUCCESS', timestamp: '2024.03.15_14:32:07' },
    lastRace: { event: 'G3_SPRING_CUP', placement: '2ND', timestamp: '2024.03.14_19:45:23', score: '2847' }
  },
  '2': {
    id: '2',
    name: 'THUNDER_STRIKE',
    style: 'LEADER',
    temperament: 'CALM',
    level: 30,
    stats: { speed: 92, stamina: 88, technique: 85, energy: 95 },
    lastTraining: { type: 'STAMINA_TRAINING', result: 'SUCCESS', timestamp: '2024.03.15_16:45:12' },
    lastRace: { event: 'G2_AUTUMN_DERBY', placement: '1ST', timestamp: '2024.03.13_15:30:45', score: '3124' }
  },
  '3': {
    id: '3',
    name: 'STORM_CHASER',
    style: 'CHASER',
    temperament: 'AGGRESSIVE',
    level: 22,
    stats: { speed: 78, stamina: 65, technique: 82, energy: 75 },
    lastTraining: { type: 'TECHNIQUE_TRAINING', result: 'FAILED', timestamp: '2024.03.15_12:15:33' },
    lastRace: { event: 'G3_WINTER_STAKES', placement: '3RD', timestamp: '2024.03.12_14:20:18', score: '2456' }
  }
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [selectedUmaId, setSelectedUmaId] = useState('1');
  const [systemTime, setSystemTime] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSystemTime = () => {
    return systemTime.toISOString().replace('T', '_').substring(0, 19);
  };

  const handleUmaSelection = (umaId: string) => {
    if (umaId !== selectedUmaId) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedUmaId(umaId);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const activeUma = mockActiveUmaData[selectedUmaId as keyof typeof mockActiveUmaData];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-24 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(8, 145, 178, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(8, 145, 178, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          
          {/* Animated Vertical Divider with Data Stream */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2 overflow-hidden">
            {/* Main data stream */}
            <motion.div
              className="absolute w-full h-32 bg-gradient-to-b from-transparent via-cyan-600/40 to-transparent"
              animate={{ 
                y: ['-100%', '400%'],
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            {/* Secondary data pulse */}
            <motion.div
              className="absolute w-full h-16 bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent"
              animate={{ 
                y: ['-50%', '450%'],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                delay: 1.5
              }}
            />
            {/* Tertiary data segment */}
            <motion.div
              className="absolute w-full h-8 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent"
              animate={{ 
                y: ['-25%', '425%'],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
                delay: 3
              }}
            />
          </div>

          {/* Left Column - System Status & Roster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* System Header */}
            <div className="bg-[#E6E8EC] border border-gray-300 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-300 bg-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-md border border-cyan-500/20">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-mono text-lg font-black uppercase tracking-[0.15em] text-gray-900">
                      RHYTHMDERBY
                    </h1>
                    <p className="text-xs font-mono text-gray-600 uppercase tracking-[0.2em] -mt-1 font-bold">
                      [SYS-STATUS] CORE MODULES
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {mockSystemModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-2 border-b border-gray-300 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className={`w-2 h-2 ${
                            module.color === 'green' ? 'bg-green-500' :
                            module.color === 'cyan' ? 'bg-cyan-500' :
                            module.color === 'blue' ? 'bg-blue-500' :
                            module.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          animate={{ 
                            scale: [0.9, 1.1, 0.9],
                            opacity: [0.6, 1, 0.6] 
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.4
                          }}
                        />
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-gray-900">
                          {module.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs font-bold text-gray-700">
                          {module.value}
                        </span>
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-gray-600">
                          {module.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Uma Roster */}
            <div className="bg-[#E6E8EC] border border-gray-300 shadow-sm">
              <div className="px-6 py-3 border-b border-gray-300 bg-gray-200">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-gray-900">
                    [ROSTER] UMA NODES ({mockUmaRoster.length}/24)
                  </p>
                  <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em] font-bold">
                    {formatSystemTime()}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-300">
                {mockUmaRoster.map((uma, index) => (
                  <motion.button
                    key={uma.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => handleUmaSelection(uma.id)}
                    className={`
                      w-full px-6 py-3 text-left transition-all duration-200 group relative overflow-hidden
                      ${uma.isActive ? 'bg-cyan-50 border-l-4 border-cyan-600' : 'hover:bg-gray-100'}
                      ${selectedUmaId === uma.id ? 'bg-blue-50' : ''}
                    `}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Hover underline animation */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-cyan-600/60"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-6 h-6 flex items-center justify-center font-mono font-bold text-xs border border-gray-400
                          ${uma.isActive ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-gray-300 text-gray-700'}
                        `}>
                          {uma.name.substring(0, 2)}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-gray-900">
                            {uma.name}
                          </span>
                          <span className={`
                            px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-[0.1em] border
                            ${uma.style === 'RUNNER' ? 'bg-cyan-100 text-cyan-700 border-cyan-300' :
                              uma.style === 'LEADER' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                              'bg-purple-100 text-purple-700 border-purple-300'}
                          `}>
                            {uma.style}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {uma.power.toLocaleString()}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Active Uma Console */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Console Header */}
            <div className="bg-[#E6E8EC] border border-gray-300 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-300 bg-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-gray-900">
                      MODULE: DASHBOARD
                    </span>
                    <div className="w-px h-4 bg-gray-400" />
                    <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-gray-600">
                      CHANNEL: OPERATOR
                    </span>
                    <div className="w-px h-4 bg-gray-400" />
                    <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-cyan-600">
                      ACTIVE UMA
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 bg-green-500"
                      animate={{ 
                        scale: [0.9, 1.1, 0.9],
                        opacity: [0.6, 1, 0.6] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-green-600">
                      ONLINE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Uma Card with Content Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedUmaId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-[#E6E8EC] border border-gray-300 shadow-sm relative overflow-hidden"
              >
                {/* Scanning line animation */}
                <motion.div
                  className="absolute inset-0 pointer-events-none z-10"
                  initial={{ y: '-100%' }}
                  animate={{ y: '100%' }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 2
                  }}
                >
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                </motion.div>

                <div className="p-8 relative z-20">
                  {/* Uma Name */}
                  <motion.h2 
                    className="font-mono text-3xl font-black uppercase tracking-[0.2em] text-gray-900 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {activeUma.name}
                  </motion.h2>

                  {/* Portrait Placeholder */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-48 h-48 bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center mx-auto mb-6 shadow-lg border border-cyan-500/20"
                  >
                    <User className="w-24 h-24 text-white" />
                  </motion.div>

                  {/* Style and Temperament Pills */}
                  <motion.div 
                    className="flex items-center justify-center gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="px-4 py-2 bg-cyan-100 border border-cyan-300">
                      <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-cyan-700">
                        {activeUma.style}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-orange-100 border border-orange-300">
                      <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-orange-700">
                        {activeUma.temperament}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-gray-200 border border-gray-400">
                      <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-gray-700">
                        LV.{activeUma.level}
                      </span>
                    </div>
                  </motion.div>

                  {/* Stats Grid - Single Color Teal Bars */}
                  <motion.div 
                    className="space-y-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {Object.entries(activeUma.stats).map(([stat, value], index) => (
                      <div key={stat} className="flex items-center justify-between py-2 border-b border-gray-300 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {stat === 'speed' && <Zap className="w-4 h-4 text-gray-600" />}
                            {stat === 'stamina' && <Shield className="w-4 h-4 text-gray-600" />}
                            {stat === 'technique' && <Target className="w-4 h-4 text-gray-600" />}
                            {stat === 'energy' && <Battery className="w-4 h-4 text-gray-600" />}
                          </div>
                          <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-gray-700">
                            {stat}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-2 bg-gray-300 border border-gray-400 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                              className="h-full bg-cyan-600"
                            />
                          </div>
                          <span className="font-mono text-sm font-bold text-gray-900 w-12 text-right">
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="grid grid-cols-3 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono font-bold py-3 px-4 transition-all duration-200 shadow-sm hover:shadow-md text-sm uppercase tracking-[0.15em] border border-cyan-700"
                    >
                      SET AS ACTIVE
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-transparent hover:bg-cyan-50 text-cyan-600 border-2 border-cyan-600 hover:border-cyan-700 font-mono font-bold py-3 px-4 transition-all duration-200 text-sm uppercase tracking-[0.15em]"
                    >
                      START TRAINING
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-transparent hover:bg-gray-100 text-gray-700 border-2 border-gray-400 hover:border-gray-500 font-mono font-bold py-3 px-4 transition-all duration-200 text-sm uppercase tracking-[0.15em]"
                    >
                      ENTER RACE
                    </motion.button>
                  </motion.div>
                </div>

                {/* Footer Logs */}
                <div className="bg-gray-200 border-t border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300">
                    {/* Last Training Log */}
                    <motion.div 
                      className="p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
                        <TrendingUp className="w-4 h-4 text-cyan-600" />
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-700">
                          [LOG] LAST TRAINING
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em]">TYPE:</span>
                          <span className="font-mono text-xs font-bold text-gray-900 uppercase tracking-[0.1em]">
                            {activeUma.lastTraining.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em]">RESULT:</span>
                          <span className={`font-mono text-xs font-bold uppercase tracking-[0.1em] ${
                            activeUma.lastTraining.result === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {activeUma.lastTraining.result}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em]">TIMESTAMP:</span>
                          <span className="font-mono text-xs text-gray-900 tracking-[0.05em]">
                            {activeUma.lastTraining.timestamp}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Last Race Log */}
                    <motion.div 
                      className="p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
                        <Award className="w-4 h-4 text-orange-600" />
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-700">
                          [LOG] LAST RACE
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em]">EVENT:</span>
                          <span className="font-mono text-xs font-bold text-gray-900 uppercase tracking-[0.1em]">
                            {activeUma.lastRace.event}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em]">PLACEMENT:</span>
                          <span className="font-mono text-xs font-bold text-orange-600 uppercase tracking-[0.1em]">
                            {activeUma.lastRace.placement}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-600 uppercase tracking-[0.1em]">TIMESTAMP:</span>
                          <span className="font-mono text-xs text-gray-900 tracking-[0.05em]">
                            {activeUma.lastRace.timestamp}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-300">
                          <div className="text-center">
                            <p className="font-mono text-lg font-bold text-gray-900">
                              {activeUma.lastRace.score}
                            </p>
                            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.1em]">FINAL SCORE</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
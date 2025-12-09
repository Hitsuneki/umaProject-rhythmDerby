import { motion } from 'framer-motion';
import { Zap, Target, Clock, TrendingUp } from 'lucide-react';

interface GameplayHUDProps {
  score: number;
  combo: number;
  accuracy: number;
  timeRemaining: string;
  health: number;
  multiplier: number;
}

export function GameplayHUD({
  score,
  combo,
  accuracy,
  timeRemaining,
  health,
  multiplier
}: GameplayHUDProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        {/* Score Panel */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="label mb-1">SCORE</p>
              <p className="text-mono text-2xl font-bold text-cyan-600">
                {score.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div>
              <p className="label mb-1">MULTIPLIER</p>
              <p className="text-mono text-xl font-bold text-orange-600">
                x{multiplier.toFixed(1)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Time Panel */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-mono text-lg font-bold text-gray-900">{timeRemaining}</span>
          </div>
        </motion.div>
      </div>

      {/* Center Combo Display */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
        <motion.div
          key={combo}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: combo > 0 ? 1 : 0 }}
          className="text-center"
        >
          <p className="text-display text-6xl text-cyan-600 mb-2 font-black">
            {combo}
          </p>
          <p className="label text-cyan-600">COMBO</p>
        </motion.div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Health Bar */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-auto flex-1 max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="label">SYNC INTEGRITY</span>
          </div>
          <div className="progress">
            <motion.div
              animate={{ width: `${health}%` }}
              className={`progress-bar ${
                health > 60 ? 'bg-green-600' :
                health > 30 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
            />
          </div>
        </motion.div>

        {/* Accuracy Panel */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Target className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
              <p className="label mb-1">ACCURACY</p>
              <p className="text-mono text-xl font-bold text-cyan-600">
                {accuracy.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

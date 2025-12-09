import { motion } from 'framer-motion';
import { Trophy, Target, Zap, TrendingUp, Star } from 'lucide-react';
import { TechPanel } from './TechPanel';
import { TechButton } from './TechButton';
import { StatusBar } from './StatusBar';

interface ResultsScreenProps {
  score: number;
  accuracy: number;
  maxCombo: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  perfect: number;
  great: number;
  good: number;
  miss: number;
  onRetry: () => void;
  onMenu: () => void;
}

export function ResultsScreen({
  score,
  accuracy,
  maxCombo,
  grade,
  perfect,
  great,
  good,
  miss,
  onRetry,
  onMenu
}: ResultsScreenProps) {
  const gradeColors = {
    S: 'text-(--accent-primary)',
    A: 'text-(--accent-success)',
    B: 'text-(--accent-warning)',
    C: 'text-(--accent-secondary)',
    D: 'text-(--accent-danger)',
  };

  return (
    <div className="min-h-screen tech-grid-bg flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TechPanel 
            title="OPERATION COMPLETE" 
            subtitle="PERFORMANCE ANALYSIS"
            coordinates="[RESULT]"
            variant="accent"
          >
            <div className="space-y-8">
              {/* Grade Display */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className={`display-font text-9xl font-black ${gradeColors[grade]} mb-4`}
                >
                  {grade}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="tech-mono text-4xl font-bold text-(--accent-primary)"
                >
                  {score.toLocaleString()}
                </motion.p>
                <p className="tech-label mt-2">FINAL SCORE</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <Target className="w-8 h-8 text-(--accent-primary) mx-auto mb-2" />
                  <p className="tech-mono text-2xl font-bold">{accuracy.toFixed(1)}%</p>
                  <p className="tech-label">ACCURACY</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <Zap className="w-8 h-8 text-(--accent-secondary) mx-auto mb-2" />
                  <p className="tech-mono text-2xl font-bold">{maxCombo}</p>
                  <p className="tech-label">MAX COMBO</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <Star className="w-8 h-8 text-(--accent-success) mx-auto mb-2" />
                  <p className="tech-mono text-2xl font-bold">{perfect}</p>
                  <p className="tech-label">PERFECT</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <TrendingUp className="w-8 h-8 text-(--accent-warning) mx-auto mb-2" />
                  <p className="tech-mono text-2xl font-bold">{great}</p>
                  <p className="tech-label">GREAT</p>
                </motion.div>
              </div>

              {/* Detailed Breakdown */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="space-y-3"
              >
                <StatusBar label="PERFECT HITS" value={perfect} maxValue={perfect + great + good + miss} color="success" />
                <StatusBar label="GREAT HITS" value={great} maxValue={perfect + great + good + miss} color="warning" />
                <StatusBar label="GOOD HITS" value={good} maxValue={perfect + great + good + miss} color="secondary" />
                <StatusBar label="MISSED" value={miss} maxValue={perfect + great + good + miss} color="danger" />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex gap-4 justify-center"
              >
                <TechButton variant="primary" onClick={onRetry}>
                  RETRY OPERATION
                </TechButton>
                <TechButton variant="secondary" onClick={onMenu}>
                  RETURN TO BASE
                </TechButton>
              </motion.div>
            </div>
          </TechPanel>
        </motion.div>
      </div>
    </div>
  );
}

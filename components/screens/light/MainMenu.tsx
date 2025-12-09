import { motion } from 'framer-motion';
import { Play, Users, Settings, Trophy, Music } from 'lucide-react';
import { TechButton } from '@/components/ui/light/TechButton';
import { TechPanel } from '@/components/ui/light/TechPanel';

export function MainMenuLight() {
  return (
    <div className="min-h-screen tech-grid-bg flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-7xl w-full grid grid-cols-12 gap-6">
        {/* Main Action Panel */}
        <motion.div 
          className="col-span-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TechPanel 
            variant="accent" 
            title="RHYTHM DERBY" 
            subtitle="MAIN TERMINAL"
            coordinates="[A1-M8]"
            className="h-full"
          >
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h1 className="display-font text-6xl text-blue-600 mb-4">
                  RHYTHM DERBY
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Industrial-grade rhythm gaming system. Select your operation mode.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                <TechButton variant="primary" size="lg" icon={<Play />}>
                  START OPERATION
                </TechButton>
                <TechButton variant="secondary" size="lg" icon={<Music />}>
                  SONG DATABASE
                </TechButton>
              </div>
            </div>
          </TechPanel>
        </motion.div>

        {/* Side Panels */}
        <div className="col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TechPanel title="OPERATORS" coordinates="[N1-P4]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="display-font text-sm text-gray-900">ACTIVE UNITS</p>
                    <p className="tech-mono text-gray-600">12/24</p>
                  </div>
                </div>
                <TechButton variant="secondary" className="w-full">
                  MANAGE ROSTER
                </TechButton>
              </div>
            </TechPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TechPanel title="SYSTEM" coordinates="[N5-P8]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <TechButton variant="ghost" size="sm" icon={<Settings />}>
                    CONFIG
                  </TechButton>
                  <TechButton variant="ghost" size="sm" icon={<Trophy />}>
                    RECORDS
                  </TechButton>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="tech-label text-gray-600 mb-2">SYSTEM STATUS</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="tech-mono text-sm text-gray-700">OPERATIONAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </TechPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
                  RHYTHM DERBY
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Industrial-grade rhythm gaming system. Select your operation mode.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                <TechButton variant="primary" size="lg" icon={<Play />}>
                  START OPERATION
                </TechButton>
                <TechButton variant="secondary" size="lg" icon={<Music />}>
                  SONG DATABASE
                </TechButton>

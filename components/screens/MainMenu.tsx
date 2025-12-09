import { motion } from 'framer-motion';
import { Play, Users, Settings, Trophy, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function MainMenu() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="container-main">
        <div className="grid-main">
          {/* Main Action Panel */}
          <motion.div 
            className="col-span-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-display text-6xl text-cyan-600 mb-4">
                    RHYTHM DERBY
                  </h1>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Industrial-grade rhythm gaming system. Select your operation mode.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <Button variant="primary" size="lg" icon={<Play />}>
                    START OPERATION
                  </Button>
                  <Button variant="secondary" size="lg" icon={<Music />}>
                    SONG DATABASE
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Side Panels */}
          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card title="OPERATORS">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-display text-sm text-gray-900">ACTIVE UNITS</p>
                      <p className="text-mono text-gray-600">12/24</p>
                    </div>
                  </div>
                  <Button variant="secondary" fullWidth>
                    MANAGE ROSTER
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card title="SYSTEM">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" size="sm" icon={<Settings />}>
                      CONFIG
                    </Button>
                    <Button variant="ghost" size="sm" icon={<Trophy />}>
                      RECORDS
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="label mb-2">SYSTEM STATUS</p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="status-dot status-online"></div>
                        <span className="text-mono text-sm text-gray-700">OPERATIONAL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BarChart3, ArrowLeft } from 'lucide-react';
import { TechPanel } from '@/components/ui/light/TechPanel';
import { TechInput } from '@/components/ui/light/TechInput';
import { TechButton } from '@/components/ui/light/TechButton';
import { SongCard } from '@/components/ui/light/SongCard';
import { StatusBar } from '@/components/ui/light/StatusBar';
import { TechTabs } from '@/components/ui/light/TechTabs';

const mockSongs = [
  {
    id: '1',
    title: 'INDUSTRIAL COMPLEX',
    artist: 'SYNTH DIVISION',
    bpm: 140,
    duration: '3:42',
    difficulty: 'hard' as const,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'NEON HIGHWAYS',
    artist: 'CYBER UNIT',
    bpm: 128,
    duration: '4:15',
    difficulty: 'normal' as const,
    rating: 4.5,
  },
  {
    id: '3',
    title: 'QUANTUM BREACH',
    artist: 'DATA STORM',
    bpm: 174,
    duration: '2:58',
    difficulty: 'expert' as const,
    rating: 4.9,
  },
];

export function SongSelectionLight() {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'ALL TRACKS', icon: <BarChart3 /> },
    { id: 'favorites', label: 'FAVORITES', icon: <Search /> },
    { id: 'recent', label: 'RECENT', icon: <Filter /> },
  ];

  return (
    <div className="min-h-screen tech-grid-bg p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TechButton variant="ghost" icon={<ArrowLeft />}>
            RETURN
          </TechButton>
          <div>
            <h1 className="display-font text-2xl text-gray-900">TRACK SELECTION</h1>
            <p className="tech-label text-gray-600">Choose your operation target</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Song List Panel */}
          <div className="col-span-8">
            <TechPanel 
              title="TRACK DATABASE" 
              subtitle="SELECT OPERATION TARGET"
              coordinates="A1-L12"
            >
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <TechInput
                      placeholder="SEARCH TRACKS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      coordinates="SEARCH"
                    />
                  </div>
                  <TechButton variant="secondary" icon={<Filter />}>
                    FILTER
                  </TechButton>
                </div>

                {/* Tabs */}
                <TechTabs 
                  tabs={tabs} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                >
                  {/* Song Grid */}
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {mockSongs.map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <SongCard
                          {...song}
                          isSelected={selectedSong === song.id}
                          onClick={() => setSelectedSong(song.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </TechTabs>
              </div>
            </TechPanel>
          </div>

          {/* Preview Panel */}
          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TechPanel 
                title="TRACK PREVIEW" 
                coordinates="M1-P6"
                variant={selectedSong ? 'accent' : 'primary'}
              >
                {selectedSong ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 mx-auto mb-3 flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <p className="tech-label text-gray-600">WAVEFORM PREVIEW</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <StatusBar label="DIFFICULTY" value={75} color="warning" />
                      <StatusBar label="INTENSITY" value={90} color="danger" />
                      <StatusBar label="TECHNICAL" value={60} color="primary" />
                    </div>

                    <TechButton variant="primary" className="w-full">
                      DEPLOY OPERATION
                    </TechButton>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="tech-label text-gray-500">SELECT TRACK FOR PREVIEW</p>
                  </div>
                )}
              </TechPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TechPanel title="OPERATOR STATUS" coordinates="M7-P12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                      <span className="display-font text-xs text-white">OP</span>
                    </div>
                    <div>
                      <p className="display-font text-sm text-gray-900">UNIT-001</p>
                      <p className="tech-mono text-xs text-gray-600">READY</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <StatusBar label="SYNC RATE" value={95} color="success" />
                    <StatusBar label="FOCUS" value={88} color="primary" />
                    <StatusBar label="STAMINA" value={100} color="success" />
                  </div>
                </div>
              </TechPanel>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
    duration: '3:42',
    difficulty: 'hard' as const,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'NEON HIGHWAYS',
    artist: 'CYBER UNIT',
    bpm: 128,
    duration: '4:15',
    difficulty: 'normal' as const,
    rating: 4.5,
  },
  {
    id: '3',
    title: 'QUANTUM BREACH',
    artist: 'DATA STORM',
    bpm: 174,
    duration: '2:58',
    difficulty: 'expert' as const,
    rating: 4.9,
  },
];

export function SongSelectionLight() {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'ALL TRACKS', icon: <BarChart3 /> },
    { id: 'favorites', label: 'FAVORITES', icon: <Search /> },
    { id: 'recent', label: 'RECENT', icon: <Filter /> },
  ];

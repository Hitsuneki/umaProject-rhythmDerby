import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BarChart3, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';

interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert';
  bpm: number;
  duration: string;
  rating: number;
}

const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Thunder Strike',
    artist: 'Electric Pulse',
    difficulty: 'Hard',
    bpm: 140,
    duration: '3:24',
    rating: 4.8
  },
  {
    id: '2',
    title: 'Neon Dreams',
    artist: 'Cyber Wave',
    difficulty: 'Normal',
    bpm: 128,
    duration: '2:56',
    rating: 4.5
  },
  {
    id: '3',
    title: 'Digital Storm',
    artist: 'Tech Noir',
    difficulty: 'Expert',
    bpm: 180,
    duration: '4:12',
    rating: 4.9
  }
];

export function SongSelection() {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'ALL TRACKS', icon: <BarChart3 /> },
    { id: 'favorites', label: 'FAVORITES', icon: <Star /> },
    { id: 'recent', label: 'RECENT', icon: <Filter /> },
  ];

  const difficultyColors = {
    Easy: 'success',
    Normal: 'warning',
    Hard: 'danger',
    Expert: 'primary'
  } as const;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container-main">
        <div className="grid-main">
          {/* Song List */}
          <div className="col-span-8">
            <Card title="SONG DATABASE" subtitle="Select your track">
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="secondary" icon={<Filter />}>
                    FILTER
                  </Button>
                </div>

                {/* Tabs */}
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                  <div className="space-y-4">
                    {mockSongs.map((song) => (
                      <motion.div
                        key={song.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Card
                          hover
                          selected={selectedSong === song.id}
                          onClick={() => setSelectedSong(song.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-orange-600 rounded-lg flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-display text-lg text-gray-900 mb-1">
                                  {song.title}
                                </h3>
                                <p className="text-gray-600 mb-2">{song.artist}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant={difficultyColors[song.difficulty]}>
                                    {song.difficulty}
                                  </Badge>
                                  <span className="text-mono text-sm text-gray-500">
                                    {song.bpm} BPM
                                  </span>
                                  <span className="text-mono text-sm text-gray-500">
                                    {song.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-mono text-sm font-bold">
                                  {song.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </Tabs>
              </div>
            </Card>
          </div>

          {/* Song Details */}
          <div className="col-span-4">
            <Card title="TRACK DETAILS">
              {selectedSong ? (
                <div className="space-y-6">
                  {(() => {
                    const song = mockSongs.find(s => s.id === selectedSong);
                    if (!song) return null;

                    return (
                      <>
                        <div className="text-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-cyan-600 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-display text-xl text-gray-900 mb-2">
                            {song.title}
                          </h3>
                          <p className="text-gray-600 mb-4">{song.artist}</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="label">DIFFICULTY</span>
                            <Badge variant={difficultyColors[song.difficulty]}>
                              {song.difficulty}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="label">BPM</span>
                            <span className="text-mono">{song.bpm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="label">DURATION</span>
                            <span className="text-mono">{song.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="label">RATING</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-mono">{song.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                          <Button variant="primary" fullWidth size="lg" icon={<Play />}>
                            START TRACK
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select a track to view details</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CharacterCard } from '@/components/ui/CharacterCard';

interface Character {
  id: string;
  name: string;
  level: number;
  rarity: number;
  speed: number;
  stamina: number;
  technique: number;
  temperament: string;
  style: string;
}

const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Lightning Bolt',
    level: 25,
    rarity: 4,
    speed: 85,
    stamina: 70,
    technique: 75,
    temperament: 'Energetic',
    style: 'Runner'
  },
  {
    id: '2',
    name: 'Thunder Strike',
    level: 30,
    rarity: 5,
    speed: 90,
    stamina: 85,
    technique: 80,
    temperament: 'Calm',
    style: 'Leader'
  },
  {
    id: '3',
    name: 'Storm Chaser',
    level: 22,
    rarity: 3,
    speed: 75,
    stamina: 80,
    technique: 70,
    temperament: 'Stubborn',
    style: 'Chaser'
  }
];

export function CharacterSelect() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container-main">
        <div className="grid-main">
          {/* Character Grid */}
          <div className="col-span-8">
            <Card title="CHARACTER ROSTER" subtitle="Select your racer">
              <div className="space-y-6">
                {/* Search and Actions */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search characters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="secondary" icon={<Filter />}>
                    FILTER
                  </Button>
                  <Button variant="primary" icon={<Plus />}>
                    NEW CHARACTER
                  </Button>
                </div>

                {/* Character Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      name={character.name}
                      level={character.level}
                      rarity={character.rarity}
                      speed={character.speed}
                      stamina={character.stamina}
                      technique={character.technique}
                      temperament={character.temperament}
                      style={character.style}
                      isSelected={selectedCharacter === character.id}
                      onClick={() => setSelectedCharacter(character.id)}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Character Details */}
          <div className="col-span-4">
            <Card title="CHARACTER DETAILS">
              {selectedCharacter ? (
                <div className="space-y-6">
                  {(() => {
                    const character = mockCharacters.find(c => c.id === selectedCharacter);
                    if (!character) return null;
                    
                    return (
                      <>
                        <div className="text-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-cyan-600 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl font-bold text-white">
                              {character.name.charAt(0)}
                            </span>
                          </div>
                          <h3 className="text-display text-xl text-gray-900 mb-2">
                            {character.name}
                          </h3>
                          <p className="text-gray-600 mb-4">Level {character.level}</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="label">TEMPERAMENT</span>
                            <span className="text-mono">{character.temperament}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="label">STYLE</span>
                            <span className="text-mono">{character.style}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="label">RARITY</span>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-full ${
                                    i < character.rarity ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 space-y-3">
                          <Button variant="primary" fullWidth>
                            SELECT CHARACTER
                          </Button>
                          <Button variant="secondary" fullWidth>
                            VIEW DETAILS
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
                  <p className="text-gray-500">Select a character to view details</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

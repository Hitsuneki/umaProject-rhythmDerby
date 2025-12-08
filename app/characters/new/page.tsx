'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUmaStore } from '@/stores/umaStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatBar } from '@/components/ui/StatBar';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';
import type { Temperament, Style, Trait } from '@/types';

const STAT_BUDGET = 150;

export default function NewCharacterPage() {
  const router = useRouter();
  const { addUma } = useUmaStore();

  const [formData, setFormData] = useState({
    name: '',
    temperament: 'calm' as Temperament,
    style: 'runner' as Style,
    trait: 'speed_boost' as Trait,
    speed: 50,
    stamina: 50,
    technique: 50,
  });

  const totalStats = formData.speed + formData.stamina + formData.technique;
  const remainingPoints = STAT_BUDGET - totalStats;

  const handleStatChange = (stat: 'speed' | 'stamina' | 'technique', value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    const otherStats = ['speed', 'stamina', 'technique'].filter(s => s !== stat);
    const otherTotal = otherStats.reduce((sum, s) => {
      const statValue = formData[s as keyof typeof formData];
      return sum + (typeof statValue === 'number' ? statValue : 0);
    }, 0);
    
    if (newValue + otherTotal <= STAT_BUDGET) {
      setFormData({ ...formData, [stat]: newValue });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addUma({
      ...formData,
      level: 1,
      energy: 100,
      maxEnergy: 100,
      comfortZone: 50,
    });

    router.push('/characters');
  };

  const previewId = `preview-${Date.now()}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/characters">
          <Button variant="secondary" icon={<ArrowLeft />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-(--charcoal)">
            Create New Uma Musume
          </h1>
          <p className="text-(--grey-dark)">
            Design your next racing champion
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <h2 className="font-display text-xl font-semibold mb-6 text-(--charcoal)">
              Character Details
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter Uma name"
                required
              />

              <Select
                label="Temperament"
                value={formData.temperament}
                onChange={(e) => setFormData({ ...formData, temperament: e.target.value as Temperament })}
                options={[
                  { value: 'calm', label: 'Calm' },
                  { value: 'energetic', label: 'Energetic' },
                  { value: 'stubborn', label: 'Stubborn' },
                  { value: 'gentle', label: 'Gentle' },
                ]}
              />

              <Select
                label="Racing Style"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value as Style })}
                options={[
                  { value: 'runner', label: 'Runner' },
                  { value: 'leader', label: 'Leader' },
                  { value: 'chaser', label: 'Chaser' },
                  { value: 'closer', label: 'Closer' },
                ]}
              />

              <Select
                label="Special Trait"
                value={formData.trait}
                onChange={(e) => setFormData({ ...formData, trait: e.target.value as Trait })}
                options={[
                  { value: 'speed_boost', label: 'Speed Boost' },
                  { value: 'stamina_regen', label: 'Stamina Regen' },
                  { value: 'technique_master', label: 'Technique Master' },
                  { value: 'all_rounder', label: 'All Rounder' },
                ]}
              />

              <div className="pt-4 border-t border-(--border)">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-(--charcoal)">
                    Stat Distribution
                  </h3>
                  <div className="text-right">
                    <p className="stat-mono text-lg font-bold text-(--accent)">
                      {remainingPoints}
                    </p>
                    <p className="text-xs text-(--grey-dark)">Points Left</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-display uppercase tracking-wider text-(--grey-dark)">
                        Speed
                      </label>
                      <input
                        type="number"
                        value={formData.speed}
                        onChange={(e) => handleStatChange('speed', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center stat-mono text-sm border border-(--border) rounded"
                        min="0"
                        max="100"
                      />
                    </div>
                    <input
                      type="range"
                      value={formData.speed}
                      onChange={(e) => handleStatChange('speed', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-display uppercase tracking-wider text-(--grey-dark)">
                        Stamina
                      </label>
                      <input
                        type="number"
                        value={formData.stamina}
                        onChange={(e) => handleStatChange('stamina', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center stat-mono text-sm border border-(--border) rounded"
                        min="0"
                        max="100"
                      />
                    </div>
                    <input
                      type="range"
                      value={formData.stamina}
                      onChange={(e) => handleStatChange('stamina', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-display uppercase tracking-wider text-(--grey-dark)">
                        Technique
                      </label>
                      <input
                        type="number"
                        value={formData.technique}
                        onChange={(e) => handleStatChange('technique', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center stat-mono text-sm border border-(--border) rounded"
                        min="0"
                        max="100"
                      />
                    </div>
                    <input
                      type="range"
                      value={formData.technique}
                      onChange={(e) => handleStatChange('technique', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                icon={<Save />}
                disabled={!formData.name.trim() || remainingPoints < 0}
              >
                Create Uma
              </Button>
            </div>
          </Card>

          {/* Preview */}
          <Card>
            <h2 className="font-display text-xl font-semibold mb-6 text-(--charcoal)">
              Preview
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-(--accent) text-white rounded-full w-8 h-8 flex items-center justify-center font-display text-sm font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold text-(--charcoal) mb-2">
                    {formData.name || 'Uma Name'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="accent">{formData.style}</Badge>
                    <Badge>{formData.temperament}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <StatBar label="Speed" value={formData.speed} color="#FF4F00" />
                <StatBar label="Stamina" value={formData.stamina} color="#00A4F0" />
                <StatBar label="Technique" value={formData.technique} color="#8FED1D" />
                <StatBar label="Energy" value={100} color="#FFD700" />
              </div>

              <div className="p-4 bg-(--grey-light) rounded-lg">
                <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark) mb-1">
                  Special Trait
                </p>
                <p className="text-sm font-body text-(--charcoal)">
                  {formData.trait.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="p-4 bg-(--accent)/5 border border-(--accent)/20 rounded-lg">
                <p className="text-xs font-display uppercase tracking-wide text-(--accent) mb-2">
                  Starting Stats
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="stat-mono text-2xl font-bold text-(--charcoal)">{formData.speed}</p>
                    <p className="text-xs text-(--grey-dark)">SPD</p>
                  </div>
                  <div>
                    <p className="stat-mono text-2xl font-bold text-(--charcoal)">{formData.stamina}</p>
                    <p className="text-xs text-(--grey-dark)">STA</p>
                  </div>
                  <div>
                    <p className="stat-mono text-2xl font-bold text-(--charcoal)">{formData.technique}</p>
                    <p className="text-xs text-(--grey-dark)">TEC</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
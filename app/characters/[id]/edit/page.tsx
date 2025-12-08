'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUmaStore } from '@/stores/umaStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';
import type { Temperament, Style, Trait } from '@/types';

export default function EditCharacterPage() {
  const router = useRouter();
  const params = useParams();
  const { getUmaById, updateUma } = useUmaStore();
  const [mounted, setMounted] = useState(false);

  const uma = getUmaById(params.id as string);

  const [formData, setFormData] = useState({
    name: uma?.name || '',
    temperament: (uma?.temperament || 'calm') as Temperament,
    style: (uma?.style || 'runner') as Style,
    trait: (uma?.trait || 'speed_boost') as Trait,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!uma) {
    return (
      <Card className="text-center py-16">
        <h2 className="font-display text-2xl font-bold mb-4 text-(--charcoal)">
          Uma Not Found
        </h2>
        <Link href="/characters">
          <Button variant="primary">Back to Characters</Button>
        </Link>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    updateUma(uma.id, formData);
    router.push('/characters');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/characters">
          <Button variant="secondary" icon={<ArrowLeft />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-(--charcoal)">
            Edit Uma Musume
          </h1>
          <p className="text-(--grey-dark)">
            Update character details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-(--grey-dark)">Level {uma.level}</p>
                <p className="stat-mono text-sm text-(--charcoal)">
                  {uma.speed} SPD • {uma.stamina} STA • {uma.technique} TEC
                </p>
              </div>
            </div>

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
              <p className="text-xs text-(--grey-dark) mb-4">
                Note: Stats can only be improved through training
              </p>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                icon={<Save />}
                disabled={!formData.name.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
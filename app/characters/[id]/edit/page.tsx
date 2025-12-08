'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uma, setUma] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    temperament: 'calm' as Temperament,
    style: 'runner' as Style,
    trait: 'speed_boost' as Trait,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadUma = async () => {
      try {
        const res = await fetch(`/api/uma/${params.id}`);
        if (!res.ok) throw new Error('Uma not found');
        const data = await res.json();
        setUma(data);
        setFormData({
          name: data.name,
          temperament: data.temperament,
          style: data.style,
          trait: data.trait,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Uma');
      } finally {
        setLoading(false);
      }
    };

    loadUma();
  }, [params.id]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--accent) mx-auto mb-4"></div>
          <p className="text-(--grey-dark)">Loading Uma...</p>
        </div>
      </div>
    );
  }

  if (!uma || error) {
    return (
      <Card className="text-center py-16">
        <h2 className="font-display text-2xl font-bold mb-4 text-(--charcoal)">
          {error || 'Uma Not Found'}
        </h2>
        <Link href="/characters">
          <Button variant="primary">Back to Characters</Button>
        </Link>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const res = await fetch(`/api/uma/${uma.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update Uma');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Uma');
      return;
    }

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
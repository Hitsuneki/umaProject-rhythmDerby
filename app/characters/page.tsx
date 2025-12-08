'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatBar } from '@/components/ui/StatBar';
import { Plus, Zap, Trophy, Edit, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Uma } from '@/types';

export default function CharactersPage() {
  const router = useRouter();
  const [umas, setUmas] = useState<Uma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUmas();
  }, []);

  const fetchUmas = async () => {
    try {
      const response = await fetch('/api/uma');
      if (!response.ok) throw new Error('Failed to fetch umas');
      const data = await response.json();
      setUmas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/uma/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete character');
      setUmas(umas.filter(uma => uma.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--accent) mx-auto mb-4"></div>
          <p className="text-(--grey-dark)">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchUmas} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  const handleTrain = (id: string) => {
    router.push(`/training?id=${id}`);
  };

  const handleRace = (id: string) => {
    router.push(`/racing?id=${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-(--charcoal) mb-2">
            Character Stable
          </h1>
          <p className="text-(--grey-dark)">
            Manage your Uma Musume roster
          </p>
        </div>
        <Link href="/characters/new">
          <Button variant="primary" icon={<Plus />}>
            Create Uma
          </Button>
        </Link>
      </div>

      {umas.length === 0 ? (
        <Card className="text-center py-16">
          <h2 className="font-display text-xl font-semibold mb-2 text-(--charcoal)">
            No Characters Yet
          </h2>
          <p className="text-(--grey-dark) mb-6">
            Create your first Uma Musume to get started
          </p>
          <Link href="/characters/new">
            <Button variant="primary" icon={<Plus />}>
              Create Your First Uma
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {umas.map((uma, index) => (
            <motion.div
              key={uma.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center ring-2 ring-(--accent)/20">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-(--accent) text-white rounded-full w-7 h-7 flex items-center justify-center font-display text-xs font-bold">
                        {uma.level}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold text-(--charcoal) truncate mb-1">
                        {uma.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="accent">{uma.style}</Badge>
                        <Badge>{uma.temperament}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <StatBar label="SPD" value={uma.speed} maxValue={100} showValue={false} color="#FF4F00" />
                    <StatBar label="STA" value={uma.stamina} maxValue={100} showValue={false} color="#00A4F0" />
                    <StatBar label="TEC" value={uma.technique} maxValue={100} showValue={false} color="#8FED1D" />
                  </div>

                  {/* Trait */}
                  <div className="p-3 bg-(--grey-light) rounded-lg">
                    <p className="text-xs font-display uppercase tracking-wide text-(--grey-dark)">
                      {uma.trait.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      className="text-xs py-2"
                      onClick={() => handleTrain(uma.id)}
                      icon={<Zap className="w-3.5 h-3.5" />}
                    >
                      Train
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-xs py-2"
                      onClick={() => handleRace(uma.id)}
                      icon={<Trophy className="w-3.5 h-3.5" />}
                    >
                      Race
                    </Button>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-(--border)">
                    <Link href={`/characters/${uma.id}/edit`} className="flex-1">
                      <Button variant="secondary" className="w-full text-xs py-2">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    {deleteConfirm === uma.id ? (
                      <div className="flex-1 flex gap-1">
                        <Button
                          variant="danger"
                          className="flex-1 text-xs py-2"
                          onClick={() => handleDelete(uma.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs py-2 px-3"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="text-xs py-2 px-4"
                        onClick={() => setDeleteConfirm(uma.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
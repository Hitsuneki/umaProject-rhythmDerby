'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Trophy, TrendingUp, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Uma } from '@/types';

export default function HistoryPage() {
  const [umas, setUmas] = useState<Uma[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'races' | 'training'>('races');
  const [filterUma, setFilterUma] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [racesRes, trainingRes, umasRes] = await Promise.all([
        fetch('/api/races'),
        fetch('/api/training'),
        fetch('/api/uma')
      ]);

      if (!racesRes.ok || !trainingRes.ok || !umasRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [racesData, trainingData, umasData] = await Promise.all([
        racesRes.json(),
        trainingRes.json(),
        umasRes.json()
      ]);

      setRaces(racesData);
      setTrainingLogs(trainingData);
      setUmas(umasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  const filteredRaces = filterUma === 'all'
    ? races
    : races.filter((r) => r.umaId === filterUma);

  const filteredLogs = filterUma === 'all'
    ? trainingLogs
    : trainingLogs.filter((l) => l.umaId === filterUma);

  const getTime = (value: any) => {
    const ts = value?.createdAt ?? value?.timestamp ?? value;
    return ts ? new Date(ts).getTime() : 0;
  };

  const sortedRaces = [...filteredRaces].sort((a, b) => getTime(b) - getTime(a));
  const sortedLogs = [...filteredLogs].sort((a, b) => getTime(b) - getTime(a));

  const handleDeleteRace = async (raceId: string) => {
    try {
      await fetch(`/api/races/${raceId}`, { method: 'DELETE' });
      setRaces(races.filter(r => r.id !== raceId));
    } catch (err) {
      setError('Failed to delete race');
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await fetch(`/api/training/${logId}`, { method: 'DELETE' });
      setTrainingLogs(trainingLogs.filter(l => l.id !== logId));
    } catch (err) {
      setError('Failed to delete training log');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--accent) mx-auto mb-4"></div>
          <p className="text-(--grey-dark)">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-(--charcoal) mb-2">
          Performance History
        </h1>
        <p className="text-(--grey-dark)">
          Track your Uma's progress over time
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'races' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('races')}
            icon={<Trophy className="w-4 h-4" />}
          >
            Races
          </Button>
          <Button
            variant={activeTab === 'training' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('training')}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Training
          </Button>
        </div>

        <div className="flex-1" />

        <div className="w-64">
          <Select
            value={filterUma}
            onChange={(e) => setFilterUma(e.target.value)}
            options={[
              { value: 'all', label: 'All Characters' },
              ...umas.map((uma) => ({ value: uma.id, label: uma.name })),
            ]}
          />
        </div>
      </div>

      {/* Race History */}
      {activeTab === 'races' && (
        <Card>
          {sortedRaces.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-(--grey-medium)" />
              <p className="text-(--grey-dark)">No race history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border)">
                    <th className="text-left py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Uma
                    </th>
                    <th className="text-left py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Distance
                    </th>
                    <th className="text-center py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Placement
                    </th>
                    <th className="text-right py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Score
                    </th>
                    <th className="text-right py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRaces.map((race, index) => {
                    const uma = umas.find((u) => u.id === race.umaId);
                    return (
                      <motion.tr
                        key={race.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-(--border) hover:bg-(--grey-light)/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-(--charcoal)">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-(--grey-dark)" />
                            {new Date(race.createdAt ?? race.timestamp ?? Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-(--charcoal)">
                          <div>
                            <div>{race.umaName || 'Unknown'}</div>
                            {race.umaStyle && (
                              <div className="text-xs text-(--grey-dark)">{race.umaStyle}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge>{race.distanceType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={race.placement === 1 ? 'accent' : 'default'}>
                            {race.placement}{race.placement === 1 ? 'st' : race.placement === 2 ? 'nd' : race.placement === 3 ? 'rd' : 'th'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right stat-mono text-sm font-semibold text-(--charcoal)">
                          {race.score.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            onClick={() => handleDeleteRace(race.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Training History */}
      {activeTab === 'training' && (
        <Card>
          {sortedLogs.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-(--grey-medium)" />
              <p className="text-(--grey-dark)">No training history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border)">
                    <th className="text-left py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Uma
                    </th>
                    <th className="text-left py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Session
                    </th>
                    <th className="text-center py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Quality
                    </th>
                    <th className="text-center py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Gains
                    </th>
                    <th className="text-right py-3 px-4 font-display text-xs uppercase tracking-wide text-(--grey-dark)">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((log, index) => {
                    const uma = umas.find((u) => u.id === log.umaId);
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-(--border) hover:bg-(--grey-light)/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-(--charcoal)">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-(--grey-dark)" />
                            {new Date(log.createdAt ?? log.timestamp ?? Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-(--charcoal)">
                          {uma?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="accent">{log.sessionType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center stat-mono text-sm font-semibold text-(--accent)">
                          {log.quality}%
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-3 text-xs stat-mono">
                            <span className="text-(--charcoal)">+{log.speedDelta ?? 0} SPD</span>
                            <span className="text-(--charcoal)">+{log.staminaDelta ?? 0} STA</span>
                            <span className="text-(--charcoal)">+{log.techniqueDelta ?? 0} TEC</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            onClick={() => handleDeleteLog(log.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
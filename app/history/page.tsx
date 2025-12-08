'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUmaStore } from '@/stores/umaStore';
import { useRaceStore } from '@/stores/raceStore';
import { useTrainingStore } from '@/stores/trainingStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Trophy, TrendingUp, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const { umas } = useUmaStore();
  const { races, deleteRace } = useRaceStore();
  const { logs, deleteLog } = useTrainingStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'races' | 'training'>('races');
  const [filterUma, setFilterUma] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredRaces = filterUma === 'all' 
    ? races 
    : races.filter((r) => r.umaId === filterUma);

  const filteredLogs = filterUma === 'all'
    ? logs
    : logs.filter((l) => l.umaId === filterUma);

  const sortedRaces = [...filteredRaces].sort((a, b) => b.timestamp - a.timestamp);
  const sortedLogs = [...filteredLogs].sort((a, b) => b.timestamp - a.timestamp);

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
                            {new Date(race.timestamp).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-(--charcoal)">
                          {uma?.name || 'Unknown'}
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
                            onClick={() => deleteRace(race.id)}
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
                            {new Date(log.timestamp).toLocaleDateString()}
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
                            <span className="text-(--charcoal)">+{log.statGains.speed} SPD</span>
                            <span className="text-(--charcoal)">+{log.statGains.stamina} STA</span>
                            <span className="text-(--charcoal)">+{log.statGains.technique} TEC</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            onClick={() => deleteLog(log.id)}
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
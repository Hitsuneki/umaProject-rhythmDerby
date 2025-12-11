'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Uma } from '@/types';

// Quality color thresholds
const getQualityColor = (quality: number): string => {
  if (quality >= 90) return '#14b8a6'; // teal
  if (quality >= 70) return '#3b82f6'; // blue
  return '#f59e0b'; // amber
};

// Distance type mapping
const DISTANCE_LABELS: Record<string, string> = {
  'SHORT': 'SHORT',
  'MID': 'MEDIUM',
  'LONG': 'LONG',
  '1200m': 'SHORT',
  '1600m': 'MEDIUM',
  '2000m': 'MEDIUM',
  '2400m': 'LONG'
};

export default function HistoryPage() {
  const [umas, setUmas] = useState<Uma[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'races' | 'training'>('races');
  const [filterUma, setFilterUma] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());

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
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (deleteConfirm !== raceId) {
      setDeleteConfirm(raceId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await fetch(`/api/races/${raceId}`, { method: 'DELETE' });
      setRaces(races.filter(r => r.id !== raceId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete race');
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (deleteConfirm !== logId) {
      setDeleteConfirm(logId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await fetch(`/api/training/${logId}`, { method: 'DELETE' });
      setTrainingLogs(trainingLogs.filter(l => l.id !== logId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete training log');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const totalRecords = activeTab === 'races' ? races.length : trainingLogs.length;
  const filteredCount = activeTab === 'races' ? sortedRaces.length : sortedLogs.length;

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div 
          className="text-center p-8 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
            style={{ 
              width: '40px',
              height: '40px',
              color: 'var(--color-teal-primary)',
              fontSize: '40px'
            }}
          >
            ◆
          </motion.div>
          <p 
            className="tech-mono font-semibold mb-2"
            style={{ 
              fontSize: '11px',
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase'
            }}
          >
            [◆] LOADING...
          </p>
          <p 
            style={{ 
              fontSize: '12px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            Fetching performance logs
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-16">
        <div 
          className="inline-block p-6 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--accent-danger)'
          }}
        >
          <p 
            className="tech-mono font-semibold mb-4"
            style={{ 
              fontSize: '11px',
              color: 'var(--accent-danger)',
              textTransform: 'uppercase'
            }}
          >
            [SYS-ERROR] {error}
          </p>
          <button
            onClick={fetchData}
            className="px-6 py-2 border font-semibold transition-colors"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              backgroundColor: 'transparent',
              borderColor: 'var(--color-teal-primary)',
              color: 'var(--color-teal-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-teal-primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-teal-primary)';
            }}
          >
            [RETRY] Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mx-auto"
      style={{ 
        maxWidth: '1600px',
        padding: '0 32px'
      }}
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span 
            className="font-semibold"
            style={{ 
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-teal-primary)',
              letterSpacing: '0.05em'
            }}
          >
            [HISTORY] PERFORMANCE LOG
          </span>
          <div 
            className="w-px bg-current opacity-30"
            style={{ height: '14px' }}
          />
          <span 
            className="tech-mono"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            TOTAL RECORDS: {totalRecords}
          </span>
        </div>
        <div 
          className="mb-4"
          style={{ 
            height: '1px',
            backgroundColor: 'var(--color-navbar-border)'
          }}
        />
        <p 
          style={{ 
            fontSize: '14px',
            color: 'var(--color-text-tertiary)'
          }}
        >
          Track your Uma's progress and session analytics
        </p>
      </div>

      {/* Control Panel */}
      <div className="flex items-center justify-between mb-6">
        {/* Tab Selector */}
        <div className="flex items-center gap-2">
          <span 
            className="tech-mono font-semibold mr-2"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase'
            }}
          >
            [VIEW MODE]
          </span>
          <div 
            className="flex border"
            style={{ borderColor: 'var(--color-navbar-border)' }}
          >
            <button
              onClick={() => setActiveTab('races')}
              className="flex items-center gap-2 px-4 py-2 font-semibold transition-all"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: activeTab === 'races' ? 'var(--color-teal-primary)' : 'transparent',
                color: activeTab === 'races' ? 'white' : 'var(--color-text-secondary)',
                borderRight: '1px solid var(--color-navbar-border)',
                letterSpacing: '0.05em',
                height: '48px'
              }}
            >
              <Trophy style={{ width: '14px', height: '14px' }} />
              RACES
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className="flex items-center gap-2 px-4 py-2 font-semibold transition-all"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: activeTab === 'training' ? 'var(--color-teal-primary)' : 'transparent',
                color: activeTab === 'training' ? 'white' : 'var(--color-text-secondary)',
                letterSpacing: '0.05em',
                height: '48px'
              }}
            >
              <TrendingUp style={{ width: '14px', height: '14px' }} />
              TRAINING
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div>
          <span 
            className="tech-mono font-semibold mr-2"
            style={{ 
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase'
            }}
          >
            [FILTER]
          </span>
          <select
            value={filterUma}
            onChange={(e) => setFilterUma(e.target.value)}
            className="border px-4 py-2 tech-mono"
            style={{
              fontSize: '12px',
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--color-navbar-border)',
              color: 'var(--color-text-primary)',
              width: '240px',
              height: '48px'
            }}
          >
            <option value="all">All Uma Nodes</option>
            {umas.map((uma) => (
              <option key={uma.id} value={uma.id}>
                {uma.name} ({uma.id.substring(0, 8)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Log Table */}
      <div 
        className="relative overflow-hidden border"
        style={{
          backgroundColor: 'var(--color-navbar-bg)',
          borderColor: 'var(--color-navbar-border)'
        }}
      >
        {/* Scanline Animation */}
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: '100px',
            background: 'linear-gradient(to bottom, transparent, rgba(20, 184, 166, 0.04), transparent)',
            zIndex: 1
          }}
        />

        {/* Table Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 relative z-10"
          style={{
            backgroundColor: '#eeeeee',
            height: '40px'
          }}
        >
          <div className="flex items-center gap-3">
            <span 
              className="tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase'
              }}
            >
              [LOG TYPE] {activeTab.toUpperCase()}
            </span>
            <div 
              className="w-px bg-current opacity-30"
              style={{ height: '14px' }}
            />
            <span 
              className="tech-mono"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)'
              }}
            >
              RECORDS: {filteredCount}
            </span>
            <div 
              className="w-px bg-current opacity-30"
              style={{ height: '14px' }}
            />
            <div className="flex items-center gap-2">
              <span 
                className="tech-mono"
                style={{ 
                  fontSize: '10px',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                LAST SYNC: {lastSync.toLocaleTimeString()}
              </span>
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#22c55e'
                }}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="relative z-10">
          {activeTab === 'races' ? (
            <RaceHistoryTable 
              races={sortedRaces}
              umas={umas}
              deleteConfirm={deleteConfirm}
              onDelete={handleDeleteRace}
              onCancelDelete={() => setDeleteConfirm(null)}
              formatTimestamp={formatTimestamp}
            />
          ) : (
            <TrainingHistoryTable 
              logs={sortedLogs}
              umas={umas}
              deleteConfirm={deleteConfirm}
              onDelete={handleDeleteLog}
              onCancelDelete={() => setDeleteConfirm(null)}
              formatTimestamp={formatTimestamp}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Race History Table Component
interface RaceHistoryTableProps {
  races: any[];
  umas: Uma[];
  deleteConfirm: string | null;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
  formatTimestamp: (ts: any) => { date: string; time: string };
}

function RaceHistoryTable({ 
  races, 
  umas, 
  deleteConfirm, 
  onDelete, 
  onCancelDelete,
  formatTimestamp 
}: RaceHistoryTableProps) {
  if (races.length === 0) {
    return (
      <div 
        className="text-center py-16"
        style={{
          backgroundColor: 'var(--color-navbar-bg)'
        }}
      >
        <div 
          className="inline-block p-8 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--color-navbar-border)'
          }}
        >
          <div 
            className="mx-auto mb-4"
            style={{ 
              fontSize: '48px',
              color: 'var(--color-text-tertiary)',
              opacity: 0.5
            }}
          >
            ◆
          </div>
          <p 
            className="tech-mono font-semibold mb-4"
            style={{ 
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase'
            }}
          >
            [◆] NO RACE LOGS
          </p>
          <p 
            className="mb-6"
            style={{ 
              fontSize: '14px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            No racing data has been recorded<br />
            Start racing to build history
          </p>
          <Link href="/racing">
            <button
              className="px-6 py-3 border font-semibold transition-colors"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: 'transparent',
                borderColor: 'var(--color-teal-primary)',
                color: 'var(--color-teal-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-teal-primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-teal-primary)';
              }}
            >
              [VIEW AVAILABLE RACES]
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr 
            className="border-b"
            style={{ borderColor: 'var(--color-navbar-border)' }}
          >
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              TIMESTAMP
            </th>
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              UMA NODE
            </th>
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              DISTANCE
            </th>
            <th 
              className="text-center px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              PLACEMENT
            </th>
            <th 
              className="text-right px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              SCORE
            </th>
            <th 
              className="text-right px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              DELETE
            </th>
          </tr>
        </thead>
        <tbody>
          {races.map((race, index) => {
            const uma = umas.find((u) => u.id === race.umaId);
            const { date, time } = formatTimestamp(race.createdAt ?? race.timestamp ?? Date.now());
            const isFirst = race.placement === 1;

            return (
              <motion.tr
                key={race.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.25,
                  ease: 'easeOut'
                }}
                className="border-b transition-all"
                style={{ 
                  borderColor: 'var(--color-navbar-border)',
                  height: '56px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-navbar-hover)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                  e.currentTarget.style.borderLeft = '2px solid var(--color-teal-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderLeft = 'none';
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
                    <div>
                      <div 
                        style={{ 
                          fontSize: '11px',
                          color: 'var(--color-text-tertiary)'
                        }}
                      >
                        {date}
                      </div>
                      <div 
                        className="tech-mono"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          opacity: 0.7
                        }}
                      >
                        {time}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div 
                    className="font-semibold"
                    style={{ 
                      fontSize: '12px',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {race.umaName || uma?.name || 'Unknown'}
                  </div>
                  {race.umaStyle && (
                    <div 
                      className="tech-mono"
                      style={{ 
                        fontSize: '9px',
                        color: 'var(--color-text-tertiary)',
                        textTransform: 'uppercase'
                      }}
                    >
                      [{race.umaStyle}]
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span 
                    className="px-2 py-1 border tech-mono"
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      backgroundColor: 'transparent',
                      borderColor: 'var(--color-teal-primary)',
                      color: 'var(--color-teal-primary)'
                    }}
                  >
                    [{DISTANCE_LABELS[race.distanceType] || race.distanceType}]
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span 
                    className="px-3 py-1 tech-mono font-semibold"
                    style={{
                      fontSize: '11px',
                      backgroundColor: isFirst ? 'var(--color-teal-primary)' : 'transparent',
                      border: isFirst ? 'none' : '1px solid var(--color-teal-primary)',
                      color: isFirst ? 'white' : 'var(--color-text-tertiary)'
                    }}
                  >
                    [{race.placement}{race.placement === 1 ? 'ST' : race.placement === 2 ? 'ND' : race.placement === 3 ? 'RD' : 'TH'}]
                  </span>
                </td>
                <td 
                  className="px-4 py-3 text-right tech-mono font-semibold"
                  style={{ 
                    fontSize: '12px',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {race.score.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {deleteConfirm === race.id ? (
                    <button
                      onClick={() => onDelete(race.id)}
                      className="px-3 py-1 border tech-mono font-semibold transition-colors"
                      style={{
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        backgroundColor: 'transparent',
                        borderColor: 'var(--accent-danger)',
                        color: 'var(--accent-danger)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-danger)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--accent-danger)';
                      }}
                    >
                      CONFIRM?
                    </button>
                  ) : (
                    <button
                      onClick={() => onDelete(race.id)}
                      className="px-2 py-1 transition-colors"
                      style={{
                        fontSize: '14px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent-danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
                      }}
                    >
                      [×]
                    </button>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Training History Table Component
interface TrainingHistoryTableProps {
  logs: any[];
  umas: Uma[];
  deleteConfirm: string | null;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
  formatTimestamp: (ts: any) => { date: string; time: string };
}

function TrainingHistoryTable({ 
  logs, 
  umas, 
  deleteConfirm, 
  onDelete, 
  onCancelDelete,
  formatTimestamp 
}: TrainingHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div 
        className="text-center py-16"
        style={{
          backgroundColor: 'var(--color-navbar-bg)'
        }}
      >
        <div 
          className="inline-block p-8 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--color-navbar-border)'
          }}
        >
          <div 
            className="mx-auto mb-4"
            style={{ 
              fontSize: '48px',
              color: 'var(--color-text-tertiary)',
              opacity: 0.5
            }}
          >
            ◆
          </div>
          <p 
            className="tech-mono font-semibold mb-4"
            style={{ 
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase'
            }}
          >
            [◆] NO TRAINING LOGS
          </p>
          <p 
            className="mb-6"
            style={{ 
              fontSize: '14px',
              color: 'var(--color-text-tertiary)'
            }}
          >
            No training sessions on record<br />
            Begin training to track progress
          </p>
          <Link href="/training">
            <button
              className="px-6 py-3 border font-semibold transition-colors"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                backgroundColor: 'transparent',
                borderColor: 'var(--color-teal-primary)',
                color: 'var(--color-teal-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-teal-primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-teal-primary)';
              }}
            >
              [START TRAINING SESSION]
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr 
            className="border-b"
            style={{ borderColor: 'var(--color-navbar-border)' }}
          >
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              TIMESTAMP
            </th>
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              UMA NODE
            </th>
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              SESSION TYPE
            </th>
            <th 
              className="text-center px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              QUALITY
            </th>
            <th 
              className="text-left px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              STAT GAINS
            </th>
            <th 
              className="text-right px-4 py-3 tech-mono font-semibold"
              style={{ 
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase'
              }}
            >
              DELETE
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            const uma = umas.find((u) => u.id === log.umaId);
            const { date, time } = formatTimestamp(log.createdAt ?? log.timestamp ?? Date.now());
            const qualityColor = getQualityColor(log.quality);
            const isHighQuality = log.quality >= 90;
            const energyCost = (log.energyBefore ?? 0) - (log.energyAfter ?? 0);

            return (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.25,
                  ease: 'easeOut'
                }}
                className="border-b transition-all"
                style={{ 
                  borderColor: 'var(--color-navbar-border)',
                  height: '56px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-navbar-hover)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                  e.currentTarget.style.borderLeft = '2px solid var(--color-teal-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderLeft = 'none';
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
                    <div>
                      <div 
                        style={{ 
                          fontSize: '11px',
                          color: 'var(--color-text-tertiary)'
                        }}
                      >
                        {date}
                      </div>
                      <div 
                        className="tech-mono"
                        style={{ 
                          fontSize: '9px',
                          color: 'var(--color-text-tertiary)',
                          opacity: 0.7
                        }}
                      >
                        {time}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div 
                    className="font-semibold"
                    style={{ 
                      fontSize: '12px',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {uma?.name || 'Unknown'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span 
                    className="px-2 py-1 border tech-mono"
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      backgroundColor: 'transparent',
                      borderColor: 'var(--color-teal-primary)',
                      color: 'var(--color-teal-primary)'
                    }}
                  >
                    [{log.sessionType}]
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <motion.span 
                    className="tech-mono font-semibold"
                    style={{ 
                      fontSize: '14px',
                      color: qualityColor
                    }}
                    animate={isHighQuality ? { 
                      scale: [1, 1.05, 1]
                    } : {}}
                    transition={isHighQuality ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    } : {}}
                  >
                    {log.quality}%
                  </motion.span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 tech-mono" style={{ fontSize: '10px' }}>
                    {log.speedDelta > 0 && (
                      <span style={{ color: 'var(--color-teal-primary)' }}>
                        +{log.speedDelta} SPD
                      </span>
                    )}
                    {log.staminaDelta > 0 && (
                      <span style={{ color: 'var(--color-teal-primary)' }}>
                        +{log.staminaDelta} STA
                      </span>
                    )}
                    {log.techniqueDelta > 0 && (
                      <span style={{ color: 'var(--color-teal-primary)' }}>
                        +{log.techniqueDelta} TEC
                      </span>
                    )}
                    {energyCost > 0 && (
                      <span style={{ color: '#f59e0b' }}>
                        -{energyCost} ENR
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {deleteConfirm === log.id ? (
                    <button
                      onClick={() => onDelete(log.id)}
                      className="px-3 py-1 border tech-mono font-semibold transition-colors"
                      style={{
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        backgroundColor: 'transparent',
                        borderColor: 'var(--accent-danger)',
                        color: 'var(--accent-danger)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-danger)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--accent-danger)';
                      }}
                    >
                      CONFIRM?
                    </button>
                  ) : (
                    <button
                      onClick={() => onDelete(log.id)}
                      className="px-2 py-1 transition-colors"
                      style={{
                        fontSize: '14px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent-danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
                      }}
                    >
                      [×]
                    </button>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
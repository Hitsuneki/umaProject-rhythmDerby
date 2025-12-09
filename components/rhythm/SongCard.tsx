import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Music, Star } from 'lucide-react';
import type { Song, Difficulty } from '@/types/rhythm';
import { formatBPM, formatGenre } from '@/lib/formatters';

interface SongCardProps {
  song: Song;
  selected?: boolean;
  onClick?: () => void;
}

export function SongCard({ song, selected = false, onClick }: SongCardProps) {
  const difficultyStars = song.difficulties.expert?.level || 
                          song.difficulties.hard?.level || 
                          song.difficulties.normal?.level || 
                          song.difficulties.easy?.level || 0;

  return (
    <Card 
      selected={selected} 
      hover={!selected}
      onClick={onClick}
      className="p-4"
    >
      <div className="flex items-start gap-3">
        {/* Album Art */}
        <div 
          className="w-16 h-16 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <Music style={{ width: '32px', height: '32px', color: 'var(--text-tertiary)' }} />
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-display text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {song.title}
            </h4>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  style={{ 
                    width: '12px', 
                    height: '12px',
                    fill: i < difficultyStars ? 'var(--accent-warning)' : 'none',
                    color: i < difficultyStars ? 'var(--accent-warning)' : 'var(--border-primary)'
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            {song.artist} • {formatBPM(song.bpm)}
          </p>

          <div className="flex items-center gap-1.5">
            <Badge variant="default" className="text-xs">
              {formatGenre(song.genre)}
            </Badge>
            {song.bestRank && (
              <Badge variant="accent" className="text-xs">
                {song.bestRank}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
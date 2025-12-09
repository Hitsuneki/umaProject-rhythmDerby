import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, CheckCircle } from 'lucide-react';
import type { Character } from '@/types/rhythm';
import { formatRole } from '@/lib/formatters';

interface CharacterCardProps {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function CharacterCard({ 
  character, 
  selected = false, 
  onClick,
  compact = false 
}: CharacterCardProps) {
  const averageStats = Math.floor(
    (character.stats.accuracy + character.stats.speed + character.stats.stamina + character.stats.skill) / 4
  );

  if (compact) {
    return (
      <Card 
        selected={selected} 
        hover={!selected}
        onClick={onClick}
        className="p-3"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
            style={{ 
              background: selected ? 'var(--accent-primary)' : 'var(--bg-secondary)' 
            }}
          >
            <User 
              style={{ 
                width: '24px', 
                height: '24px', 
                color: selected ? 'white' : 'var(--text-tertiary)' 
              }} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {character.name}
              </h4>
              {character.isActive && (
                <CheckCircle style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="default" className="text-xs">
                LV.{character.level}
              </Badge>
              <span className="tech-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                PWR {averageStats}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      selected={selected} 
      hover={!selected}
      onClick={onClick}
      className="p-4"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div 
          className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            background: selected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            border: selected ? '2px solid var(--accent-primary)' : 'none'
          }}
        >
          <User 
            style={{ 
              width: '40px', 
              height: '40px', 
              color: selected ? 'white' : 'var(--text-tertiary)' 
            }} 
          />
        </div>

        {/* Character Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {character.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatRole(character.role)}
              </p>
            </div>
            {character.isActive && (
              <Badge variant="accent">ACTIVE</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default">LV. {character.level}</Badge>
            <span className="tech-label">PWR: {averageStats}</span>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(character.stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="tech-mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {key.substring(0, 3).toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
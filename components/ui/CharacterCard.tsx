import { motion } from 'framer-motion';
import { User, Zap, Shield, Target, Star } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { Badge } from './Badge';

interface CharacterCardProps {
  name: string;
  level: number;
  rarity: number;
  speed: number;
  stamina: number;
  technique: number;
  temperament?: string;
  style?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CharacterCard({
  name,
  level,
  rarity,
  speed,
  stamina,
  technique,
  temperament,
  style,
  isSelected = false,
  onClick
}: CharacterCardProps) {
  const rarityStars = Array.from({ length: 5 }, (_, i) => i < rarity);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        card cursor-pointer transition-all duration-200
        ${isSelected ? 'card-selected' : ''}
      `}
    >
      {/* Character Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-display text-lg text-gray-900 mb-1">{name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">LV.{level}</Badge>
            <div className="flex gap-1">
              {rarityStars.map((filled, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${filled ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          {(temperament || style) && (
            <div className="flex gap-2">
              {temperament && (
                <Badge variant="primary" className="text-xs">
                  {temperament}
                </Badge>
              )}
              {style && (
                <Badge variant="secondary" className="text-xs">
                  {style}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-600" />
          <StatusBar label="SPEED" value={speed} showValue={false} color="primary" />
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          <StatusBar label="STAMINA" value={stamina} showValue={false} color="success" />
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-600" />
          <StatusBar label="TECHNIQUE" value={technique} showValue={false} color="warning" />
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Star, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroAvatarProps {
  avatar: string;
  name: string;
  role: string;
  level?: number;
  star?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  selected?: boolean;
  isDead?: boolean;
  isEnemy?: boolean;
}

const sizeMap = {
  sm: {
    container: 'w-12 h-12',
    avatar: 'text-2xl',
    level: 'text-[10px] w-4 h-4 -bottom-0.5 -right-0.5',
    star: 'w-3 h-3',
    starContainer: '-top-1 -left-0.5 gap-0.5',
  },
  md: {
    container: 'w-16 h-16',
    avatar: 'text-3xl',
    level: 'text-xs w-5 h-5 -bottom-1 -right-1',
    star: 'w-3.5 h-3.5',
    starContainer: '-top-1.5 -left-1 gap-0.5',
  },
  lg: {
    container: 'w-20 h-20',
    avatar: 'text-4xl',
    level: 'text-sm w-6 h-6 -bottom-1.5 -right-1.5',
    star: 'w-4 h-4',
    starContainer: '-top-2 -left-1.5 gap-1',
  },
  xl: {
    container: 'w-28 h-28',
    avatar: 'text-5xl',
    level: 'text-base w-7 h-7 -bottom-2 -right-2',
    star: 'w-5 h-5',
    starContainer: '-top-2.5 -left-2 gap-1',
  },
};

const getStarColor = (star: number) => {
  if (star <= 2) return 'text-blue-400';
  if (star <= 4) return 'text-purple-400';
  return 'text-orange-400';
};

const getRarityBorderColor = (star: number = 0) => {
  if (star <= 2) return 'border-blue-400/60 shadow-blue-500/20';
  if (star <= 4) return 'border-purple-400/60 shadow-purple-500/20';
  return 'border-orange-400/60 shadow-orange-500/20';
};

const getRarityBg = (star: number = 0) => {
  if (star <= 2) return 'from-blue-900/40 to-blue-800/20';
  if (star <= 4) return 'from-purple-900/40 to-purple-800/20';
  return 'from-orange-900/40 to-orange-800/20';
};

export function HeroAvatar({
  avatar,
  name,
  role,
  level,
  star,
  size = 'md',
  onClick,
  selected,
  isDead,
  isEnemy,
}: HeroAvatarProps) {
  const s = sizeMap[size];
  const rarityBorder = star ? getRarityBorderColor(star) : 'border-yellow-500/60 shadow-yellow-500/20';
  const rarityBg = star ? getRarityBg(star) : 'from-gray-900/40 to-gray-800/20';

  return (
    <motion.div
      className={cn(
        'relative rounded-full cursor-pointer select-none',
        s.container,
        onClick && 'hover:scale-105 active:scale-95 transition-transform',
        selected && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900',
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      title={`${name} - ${role}`}
    >
      <div
        className={cn(
          'w-full h-full rounded-full flex items-center justify-center',
          'bg-gradient-to-br',
          rarityBg,
          'border-2',
          rarityBorder,
          'shadow-lg',
          isEnemy && 'ring-2 ring-red-500/50',
          isDead && 'grayscale opacity-60',
        )}
      >
        <span className={cn(s.avatar, 'drop-shadow-md')}>{avatar}</span>
      </div>

      {star && star > 0 && (
        <div className={cn('absolute flex', s.starContainer)}>
          {Array.from({ length: Math.min(star, 6) }).map((_, i) => (
            <Star
              key={i}
              className={cn(s.star, getStarColor(star), 'fill-current drop-shadow')}
            />
          ))}
        </div>
      )}

      {level !== undefined && (
        <div
          className={cn(
            'absolute flex items-center justify-center rounded-full',
            'bg-gradient-to-br from-yellow-600 to-yellow-800',
            'border border-yellow-400/80 text-white font-bold',
            'shadow-md',
            s.level,
          )}
        >
          {level}
        </div>
      )}

      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skull className="w-1/2 h-1/2 text-red-500 drop-shadow-lg opacity-80" />
        </div>
      )}
    </motion.div>
  );
}

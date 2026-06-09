import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatBarProps {
  current: number;
  max: number;
  type: 'hp' | 'mp' | 'energy' | 'exp' | 'shield';
  showLabel?: boolean;
  label?: string;
  height?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const typeConfig = {
  hp: {
    gradient: 'from-red-600 via-red-500 to-red-400',
    glow: 'shadow-red-500/50',
    bg: 'bg-red-950/50',
    labelText: '生命',
    textColor: 'text-red-300',
  },
  mp: {
    gradient: 'from-blue-600 via-blue-500 to-blue-400',
    glow: 'shadow-blue-500/50',
    bg: 'bg-blue-950/50',
    labelText: '法力',
    textColor: 'text-blue-300',
  },
  energy: {
    gradient: 'from-yellow-600 via-amber-500 to-yellow-400',
    glow: 'shadow-yellow-500/50',
    bg: 'bg-yellow-950/50',
    labelText: '能量',
    textColor: 'text-yellow-300',
  },
  exp: {
    gradient: 'from-cyan-600 via-cyan-500 to-blue-400',
    glow: 'shadow-cyan-500/50',
    bg: 'bg-cyan-950/50',
    labelText: '经验',
    textColor: 'text-cyan-300',
  },
  shield: {
    gradient: 'from-sky-600 via-sky-400 to-cyan-300',
    glow: 'shadow-sky-400/50',
    bg: 'bg-sky-950/50',
    labelText: '护盾',
    textColor: 'text-sky-300',
  },
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const sizeMap = {
  sm: 'w-20',
  md: 'w-32',
  lg: 'w-48',
  full: 'w-full',
};

export function StatBar({
  current,
  max,
  type,
  showLabel = true,
  label,
  height = 'md',
  size = 'md',
}: StatBarProps) {
  const config = typeConfig[type];
  const percentage = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
  const isLow = percentage < 25;

  return (
    <div className={cn('flex flex-col gap-1', sizeMap[size])}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium">
          <span className={cn('drop-shadow', config.textColor)}>
            {label || config.labelText}
          </span>
          <span
            className={cn(
              'tabular-nums font-bold drop-shadow',
              isLow ? 'text-red-400 animate-pulse' : 'text-white/90',
            )}
          >
            {Math.floor(current)}/{max}
          </span>
        </div>
      )}
      <div
        className={cn(
          'relative rounded-full overflow-hidden',
          heightMap[height],
          config.bg,
          'border border-white/10',
          'shadow-inner',
        )}
      >
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            'bg-gradient-to-r',
            config.gradient,
            'shadow-lg',
            config.glow,
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
          }}
        />
      </div>
    </div>
  );
}

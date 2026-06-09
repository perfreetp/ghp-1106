import { motion } from 'framer-motion';
import { Shield, Swords, Heart, Zap, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroAvatar } from './HeroAvatar';
import { StatBar } from './StatBar';
import { skills } from '@/data/skills';
import type { Hero, HeroStats } from '@/data/heroes';
import type { HeroInstance } from '@/types';

interface HeroCardProps {
  heroTemplate: Hero;
  heroInstance?: HeroInstance;
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    card: 'w-40 p-3',
    avatar: 'sm' as const,
    statsGap: 'gap-1.5',
    skillIcon: 'w-6 h-6',
  },
  md: {
    card: 'w-56 p-4',
    avatar: 'md' as const,
    statsGap: 'gap-2',
    skillIcon: 'w-8 h-8',
  },
  lg: {
    card: 'w-72 p-5',
    avatar: 'lg' as const,
    statsGap: 'gap-2.5',
    skillIcon: 'w-10 h-10',
  },
};

const getRarityGradient = (star: number = 0) => {
  if (star <= 2) return 'from-blue-900/60 via-slate-900/80 to-slate-950';
  if (star <= 4) return 'from-purple-900/60 via-slate-900/80 to-slate-950';
  return 'from-orange-900/60 via-slate-900/80 to-slate-950';
};

const getRarityBorder = (star: number = 0) => {
  if (star <= 2) return 'border-blue-500/40 shadow-blue-500/20';
  if (star <= 4) return 'border-purple-500/40 shadow-purple-500/20';
  return 'border-orange-500/40 shadow-orange-500/20';
};

const calculateStats = (base: HeroStats, level: number = 1, star: number = 1): HeroStats => {
  const starMultiplier = 1 + (star - 1) * 0.1;
  return {
    maxHp: Math.floor(base.maxHp * starMultiplier),
    maxMana: Math.floor(base.maxMana * starMultiplier),
    attack: Math.floor(base.attack * starMultiplier),
    defense: Math.floor(base.defense * starMultiplier),
    speed: base.speed,
  };
};

export function HeroCard({
  heroTemplate,
  heroInstance,
  onClick,
  selected,
  showStats = true,
  size = 'md',
}: HeroCardProps) {
  const s = sizeConfig[size];
  const level = heroInstance?.level || 1;
  const star = heroInstance?.star || 3;
  const stats = calculateStats(heroTemplate.baseStats, level, star);

  const heroSkills = heroTemplate.skillIds
    .map((id) => skills.find((sk) => sk.id === id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl cursor-pointer overflow-hidden',
        'bg-gradient-to-b',
        getRarityGradient(star),
        'border-2',
        getRarityBorder(star),
        'shadow-xl backdrop-blur-sm',
        s.card,
        onClick && 'hover:-translate-y-1 transition-transform',
        selected && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950',
      )}
      whileHover={onClick ? { scale: 1.03, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(255,215,0,0.15) 0%, transparent 50%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-3">
        <HeroAvatar
          avatar={heroTemplate.avatar}
          name={heroTemplate.name}
          role={heroTemplate.className}
          level={level}
          star={star}
          size={s.avatar}
        />

        <div className="text-center">
          <h3 className="text-white font-bold text-lg drop-shadow-md">
            {heroTemplate.name}
          </h3>
          <span
            className={cn(
              'inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
              'bg-gradient-to-r from-yellow-600/40 to-amber-600/40',
              'border border-yellow-500/30 text-yellow-200',
            )}
          >
            {heroTemplate.className}
          </span>
        </div>

        {showStats && (
          <div className={cn('w-full flex flex-col', s.statsGap)}>
            <StatBar
              current={stats.maxHp * 0.85}
              max={stats.maxHp}
              type="hp"
              size="full"
              height="sm"
            />
            <StatBar
              current={stats.maxMana * 0.6}
              max={stats.maxMana}
              type="mp"
              size="full"
              height="sm"
            />
          </div>
        )}

        {showStats && size !== 'sm' && (
          <div className="w-full grid grid-cols-3 gap-2 text-xs">
            <StatIcon icon={<Swords className="w-3.5 h-3.5" />} label="攻击" value={stats.attack} color="text-red-400" />
            <StatIcon icon={<Shield className="w-3.5 h-3.5" />} label="防御" value={stats.defense} color="text-blue-400" />
            <StatIcon icon={<Wind className="w-3.5 h-3.5" />} label="速度" value={stats.speed} color="text-green-400" />
          </div>
        )}

        <div className="w-full flex justify-center gap-2 pt-1 border-t border-white/10">
          {heroSkills.map((skill) => (
            skill && (
              <div
                key={skill.id}
                className={cn(
                  'flex items-center justify-center rounded-lg',
                  'bg-slate-800/60 border border-white/10',
                  s.skillIcon,
                )}
                title={`${skill.name}: ${skill.description}`}
              >
                <span className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}>
                  {skill.icon}
                </span>
              </div>
            )
          ))}
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50" />
      )}
    </motion.div>
  );
}

interface StatIconProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatIcon({ icon, label, value, color }: StatIconProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-slate-800/40 border border-white/5">
      <div className={cn('flex items-center gap-1', color)}>
        {icon}
        <span className="font-bold text-white tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}

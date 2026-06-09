import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Skill } from '@/data/skills';

interface SkillIconProps {
  skill: Skill;
  cooldown?: number;
  isReady?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeConfig = {
  sm: {
    container: 'w-10 h-10',
    icon: 'text-lg',
    cooldown: 'text-xs',
    tooltip: 'text-xs',
  },
  md: {
    container: 'w-14 h-14',
    icon: 'text-2xl',
    cooldown: 'text-sm',
    tooltip: 'text-sm',
  },
  lg: {
    container: 'w-18 h-18',
    icon: 'text-3xl',
    cooldown: 'text-base',
    tooltip: 'text-sm',
  },
  xl: {
    container: 'w-20 h-20',
    icon: 'text-4xl',
    cooldown: 'text-lg',
    tooltip: 'text-base',
  },
};

const skillTypeColors: Record<Skill['type'], { bg: string; border: string; glow: string }> = {
  single_damage: {
    bg: 'from-red-900/60 to-red-950/80',
    border: 'border-red-500/50',
    glow: 'shadow-red-500/30',
  },
  aoe_damage: {
    bg: 'from-orange-900/60 to-red-950/80',
    border: 'border-orange-500/50',
    glow: 'shadow-orange-500/30',
  },
  heal: {
    bg: 'from-green-900/60 to-emerald-950/80',
    border: 'border-green-500/50',
    glow: 'shadow-green-500/30',
  },
  buff: {
    bg: 'from-blue-900/60 to-cyan-950/80',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/30',
  },
  debuff: {
    bg: 'from-purple-900/60 to-violet-950/80',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
  },
};

const skillTypeLabels: Record<Skill['type'], string> = {
  single_damage: '单体伤害',
  aoe_damage: '范围伤害',
  heal: '治疗',
  buff: '增益',
  debuff: '减益',
};

export function SkillIcon({
  skill,
  cooldown = 0,
  isReady = true,
  isActive = false,
  onClick,
  showTooltip = true,
  size = 'md',
}: SkillIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const s = sizeConfig[size];
  const typeStyle = skillTypeColors[skill.type];
  const onCooldown = cooldown > 0;
  const disabled = !isReady || onCooldown || skill.isPassive;

  return (
    <div className="relative inline-block">
      <motion.div
        onClick={!disabled && onClick ? onClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative rounded-xl flex items-center justify-center',
          'bg-gradient-to-br',
          typeStyle.bg,
          'border-2',
          typeStyle.border,
          'shadow-lg',
          typeStyle.glow,
          s.container,
          !disabled && onClick && 'cursor-pointer',
          disabled && 'grayscale opacity-60',
          isActive && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900',
        )}
        whileHover={!disabled && onClick ? { scale: 1.1, y: -2 } : undefined}
        whileTap={!disabled && onClick ? { scale: 0.95 } : undefined}
      >
        <div
          className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
          }}
        />

        <span className={cn(s.icon, 'drop-shadow-lg relative z-10')}>
          {skill.icon}
        </span>

        {skill.manaCost > 0 && !skill.isPassive && (
          <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-600 border border-blue-400/60 shadow-md">
            <Zap className="w-2.5 h-2.5 text-blue-200" />
            <span className="text-[10px] font-bold text-white tabular-nums">
              {skill.manaCost}
            </span>
          </div>
        )}

        {skill.isPassive && (
          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-yellow-600 border border-yellow-400/60 shadow-md">
            <span className="text-[10px] font-bold text-white">被动</span>
          </div>
        )}

        {onCooldown && (
          <>
            <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <Clock className="w-1/2 h-1/2 text-gray-300 opacity-50" />
            </div>
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'font-black text-white drop-shadow-lg',
                s.cooldown,
              )}
            >
              {cooldown}
            </div>
          </>
        )}

        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(250, 204, 21, 0.6)',
                '0 0 0 8px rgba(250, 204, 21, 0)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3',
              'w-64 p-3 rounded-xl',
              'bg-slate-900/95 backdrop-blur-md',
              'border border-yellow-500/30',
              'shadow-2xl shadow-black/50',
              s.tooltip,
            )}
            style={{ transformOrigin: 'bottom center' }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <h4 className="font-bold text-white">{skill.name}</h4>
                  <span
                    className={cn(
                      'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium',
                      'bg-gradient-to-r',
                      typeStyle.bg,
                      'border',
                      typeStyle.border,
                      'text-white/80',
                    )}
                  >
                    {skillTypeLabels[skill.type]}
                  </span>
                </div>
              </div>
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
            </div>

            <p className="text-slate-300 leading-relaxed mb-2">
              {skill.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              {!skill.isPassive && (
                <>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>冷却: {skill.cooldown}回合</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <Zap className="w-3 h-3" />
                    <span>消耗: {skill.manaCost}</span>
                  </div>
                </>
              )}
              {skill.damage && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <span>伤害: {skill.damage}</span>
                </div>
              )}
              {skill.heal && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>治疗: {skill.heal}</span>
                </div>
              )}
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderRight: '1px solid rgba(234, 179, 8, 0.3)',
                borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

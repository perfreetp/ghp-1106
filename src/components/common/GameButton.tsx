import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  name?: string;
  value?: string | number;
  autoFocus?: boolean;
  tabIndex?: number;
  ariaLabel?: string;
}

const variantConfig = {
  primary: {
    base: 'bg-gradient-to-b from-yellow-500 via-amber-500 to-yellow-600',
    border: 'border-yellow-300/60',
    text: 'text-yellow-950',
    shadow: 'shadow-yellow-500/40',
    hoverGlow: 'hover:shadow-yellow-400/60',
    active: 'active:from-yellow-600 active:via-amber-600 active:to-yellow-700',
    innerShadow: 'before:from-white/40 before:to-transparent',
  },
  secondary: {
    base: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
    border: 'border-slate-400/60',
    text: 'text-slate-100',
    shadow: 'shadow-slate-600/40',
    hoverGlow: 'hover:shadow-slate-400/60',
    active: 'active:from-slate-700 active:via-slate-800 active:to-slate-900',
    innerShadow: 'before:from-white/20 before:to-transparent',
  },
  danger: {
    base: 'bg-gradient-to-b from-red-500 via-rose-600 to-red-700',
    border: 'border-red-300/60',
    text: 'text-white',
    shadow: 'shadow-red-500/40',
    hoverGlow: 'hover:shadow-red-400/60',
    active: 'active:from-red-600 active:via-rose-700 active:to-red-800',
    innerShadow: 'before:from-white/30 before:to-transparent',
  },
  ghost: {
    base: 'bg-transparent',
    border: 'border-yellow-500/40',
    text: 'text-yellow-200',
    shadow: '',
    hoverGlow: 'hover:bg-yellow-500/10',
    active: 'active:bg-yellow-500/20',
    innerShadow: '',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    gap: 'gap-1',
    icon: 'w-3.5 h-3.5',
    rounded: 'rounded-lg',
  },
  md: {
    padding: 'px-5 py-2.5',
    text: 'text-sm',
    gap: 'gap-2',
    icon: 'w-4 h-4',
    rounded: 'rounded-xl',
  },
  lg: {
    padding: 'px-7 py-3.5',
    text: 'text-base',
    gap: 'gap-2.5',
    icon: 'w-5 h-5',
    rounded: 'rounded-2xl',
  },
};

export function GameButton({
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  loading,
  onClick,
  children,
  className,
  id,
  type = 'button',
  form,
  name,
  value,
  autoFocus,
  tabIndex,
  ariaLabel,
}: GameButtonProps) {
  const v = variantConfig[variant];
  const s = sizeConfig[size];
  const isDisabled = disabled || loading;

  return (
    <motion.button
      id={id}
      type={type}
      form={form}
      name={name}
      value={value}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative font-bold tracking-wide',
        'border-2 border-b-4',
        'shadow-lg',
        v.shadow,
        v.border,
        v.base,
        v.text,
        v.hoverGlow,
        v.active,
        s.padding,
        s.text,
        s.gap,
        s.rounded,
        'inline-flex items-center justify-center',
        'select-none whitespace-nowrap',
        'transition-all duration-150',
        'before:absolute before:inset-0 before:rounded-[inherit]',
        'before:bg-gradient-to-b before:pointer-events-none',
        v.innerShadow,
        'after:absolute after:inset-x-1 after:top-1 after:h-1/3',
        'after:bg-gradient-to-b after:from-white/20 after:to-transparent',
        'after:rounded-t-[calc(inherit-2px)] after:pointer-events-none',
        !isDisabled && 'hover:-translate-y-0.5',
        !isDisabled && 'active:translate-y-0.5 active:border-b-2',
        isDisabled && 'opacity-50 cursor-not-allowed grayscale',
        className,
      )}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      {loading ? (
        <Loader2 className={cn(s.icon, 'animate-spin')} />
      ) : (
        icon && <span className={s.icon}>{icon}</span>
      )}
      <span className="relative z-10 drop-shadow-sm">{children}</span>
    </motion.button>
  );
}

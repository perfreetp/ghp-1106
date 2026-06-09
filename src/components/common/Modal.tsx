import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

const sizeConfig = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closable, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closable) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            variants={backdropVariants}
            onClick={handleBackdropClick}
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(15,23,42,0.7) 0%, rgba(2,6,23,0.95) 100%)',
            }}
          />

          <motion.div
            className={cn(
              'relative w-full',
              sizeConfig[size],
              'rounded-3xl overflow-hidden',
              'bg-slate-900/70 backdrop-blur-xl',
              'border-2 border-yellow-500/30',
              'shadow-2xl',
              'shadow-yellow-500/10',
            )}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0 0 0 1px rgba(234, 179, 8, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 80px -20px rgba(234, 179, 8, 0.15)',
            }}
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 0% 0%, rgba(234, 179, 8, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
              }}
            />

            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.5), transparent)',
              }}
            />

            {title && (
              <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">
                  {title}
                </h2>
                {closable && (
                  <motion.button
                    onClick={onClose}
                    className={cn(
                      'p-2 rounded-xl',
                      'text-slate-400 hover:text-white',
                      'hover:bg-white/10',
                      'transition-colors duration-150',
                    )}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {!title && closable && (
              <motion.button
                onClick={onClose}
                className={cn(
                  'absolute top-4 right-4 z-10',
                  'p-2 rounded-xl',
                  'text-slate-400 hover:text-white',
                  'hover:bg-white/10',
                  'transition-colors duration-150',
                )}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}

            <div className="relative p-6">{children}</div>

            {footer && (
              <div className="relative px-6 py-4 border-t border-white/10 bg-black/20">
                {footer}
              </div>
            )}

            <div
              className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.3), transparent)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

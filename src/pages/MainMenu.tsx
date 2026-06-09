import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  BookOpen,
  Sparkles,
  Castle,
  ShoppingBag,
  Film,
  Trophy,
  Settings,
  Coins,
  Gem,
  Zap,
  Save,
  CalendarCheck,
  Info,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export default function MainMenu() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const gold = useGameStore((state) => state.gold);
  const diamond = useGameStore((state) => state.diamond);
  const currentLineupId = useGameStore((state) => state.currentLineupId);
  const lineups = useGameStore((state) => state.lineups);
  const heroInstances = useGameStore((state) => state.heroInstances);

  const currentLineup = lineups.find((l) => l.id === currentLineupId);

  const lineupPower = currentLineup
    ? currentLineup.slots.reduce((total, slot) => {
        const hero = heroInstances.find((h) => h.id === slot.heroInstanceId);
        if (hero) {
          const basePower = (hero.level * 100 + hero.star * 500) * 10;
          return total + basePower;
        }
        return total;
      }, 0)
    : 0;

  const menuButtons = [
    { icon: Map, label: '开始游戏', path: '/map', color: 'from-blue-600 to-cyan-500' },
    { icon: BookOpen, label: '英雄图鉴', path: '/heroes', color: 'from-purple-600 to-pink-500' },
    { icon: Sparkles, label: '阵容编辑', path: '/lineup', color: 'from-amber-500 to-orange-500' },
    { icon: Castle, label: '关卡地图', path: '/map', color: 'from-green-600 to-emerald-500' },
    { icon: ShoppingBag, label: '商店', path: '/shop', color: 'from-yellow-500 to-amber-500' },
    { icon: Film, label: '战斗回放', path: '/replay', color: 'from-red-600 to-rose-500' },
    { icon: Trophy, label: '成就任务', path: '/settings?tab=achievement', color: 'from-yellow-600 to-amber-600' },
    { icon: Settings, label: '游戏设置', path: '/settings', color: 'from-slate-600 to-gray-500' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      'rgba(212, 175, 55, ',
      'rgba(59, 130, 246, ',
      'rgba(251, 191, 36, ',
      'rgba(168, 85, 247, ',
    ];

    const particleCount = 60;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, p.color + p.opacity + ')');
        gradient.addColorStop(1, p.color + '0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.opacity * 1.2) + ')';
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleButtonClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="game-bg relative min-h-screen w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
      />

      <div className="relative z-10 flex min-h-screen flex-col p-8">
        <div className="flex flex-col items-center pt-8">
          <h1
            className="text-glow text-center text-7xl font-bold tracking-wider md:text-8xl"
            style={{
              fontFamily: 'var(--font-title)',
              color: '#fbbf24',
            }}
          >
            王者荣耀
          </h1>
          <p
            className="mt-4 text-center text-2xl tracking-[0.3em] md:text-3xl"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'rgba(251, 191, 36, 0.8)',
            }}
          >
            回 合 制 对 战 版
          </p>
          <div className="mt-6 h-[2px] w-64 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {menuButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.label}
                  onClick={() => handleButtonClick(btn.path)}
                  className="btn-gold group relative flex aspect-square w-36 flex-col items-center justify-center gap-2 md:w-44"
                >
                  <div
                    className={`absolute inset-0 rounded-lg bg-gradient-to-br ${btn.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                  />
                  <Icon
                    size={36}
                    className="text-slate-900 transition-transform duration-300 group-hover:scale-110 md:size-10"
                  />
                  <span className="text-center text-base font-bold text-slate-900 md:text-lg">
                    {btn.label}
                  </span>
                  <div className="absolute inset-0 rounded-lg ring-2 ring-transparent transition-all duration-300 group-hover:ring-amber-400 group-hover:ring-offset-2 group-hover:ring-offset-transparent" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="card-glass flex items-center gap-6 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-yellow-500/20 p-2">
                <Coins size={22} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">金币</div>
                <div className="font-title text-xl font-bold text-yellow-400">
                  {gold.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-600/50" />

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-cyan-500/20 p-2">
                <Gem size={22} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">钻石</div>
                <div className="font-title text-xl font-bold text-cyan-400">
                  {diamond.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-600/50" />

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-500/20 p-2">
                <Zap size={22} className="text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">阵容战力</div>
                <div className="font-title text-xl font-bold text-amber-400">
                  {lineupPower.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings?tab=save')}
              className="card-glass group flex items-center gap-2 px-4 py-3 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg"
            >
              <Save size={18} className="text-slate-300 transition-colors group-hover:text-amber-400" />
              <span className="text-sm text-slate-300 transition-colors group-hover:text-amber-400">
                存档管理
              </span>
            </button>

            <button
              onClick={() => navigate('/settings?tab=daily')}
              className="card-glass group flex items-center gap-2 px-4 py-3 transition-all duration-300 hover:border-green-500/50 hover:shadow-lg"
            >
              <CalendarCheck size={18} className="text-slate-300 transition-colors group-hover:text-green-400" />
              <span className="text-sm text-slate-300 transition-colors group-hover:text-green-400">
                每日签到
              </span>
            </button>

            <button
              onClick={() => navigate('/settings?tab=about')}
              className="card-glass group flex items-center gap-2 px-4 py-3 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg"
            >
              <Info size={18} className="text-slate-300 transition-colors group-hover:text-blue-400" />
              <span className="text-sm text-slate-300 transition-colors group-hover:text-blue-400">
                关于游戏
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

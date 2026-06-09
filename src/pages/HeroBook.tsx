import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  X,
  Star,
  Shield,
  Sword,
  Heart,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { heroes, type Hero, type HeroClass } from '@/data/heroes';
import { useGameStore } from '@/store/useGameStore';

type LucideIconType = React.ComponentType<{ size?: number | string; className?: string }>;

const CLASSES: { key: HeroClass | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '⚔️' },
  { key: 'warrior', label: '战士', icon: '🗡️' },
  { key: 'mage', label: '法师', icon: '🔮' },
  { key: 'tank', label: '坦克', icon: '🛡️' },
  { key: 'assassin', label: '刺客', icon: '🥷' },
  { key: 'marksman', label: '射手', icon: '🏹' },
  { key: 'support', label: '辅助', icon: '💫' },
];

const RARITY_COLORS: Record<number, string> = {
  1: 'text-slate-400',
  2: 'text-green-400',
  3: 'text-blue-400',
  4: 'text-purple-400',
  5: 'text-amber-400',
  6: 'text-orange-400',
};

function HeroCard({
  hero,
  owned,
  onClick,
  selected,
}: {
  hero: Hero;
  owned: boolean;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`card-glass group relative flex flex-col items-center p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected
          ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
          : ''
      } ${!owned ? 'opacity-50 grayscale-[30%]' : ''}`}
    >
      <div
        className={`hero-avatar-frame mb-2 ${
          owned ? 'legendary' : ''
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-4xl">
          {hero.avatar}
        </div>
      </div>

      <div className="text-center">
        <div className="font-title text-base font-bold text-slate-100">
          {hero.name}
        </div>
        <div className="mt-1 text-xs text-slate-400">{hero.className}</div>
      </div>

      {!owned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/60 backdrop-blur-[1px]">
          <span className="font-title text-sm text-slate-300">未解锁</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="hero-card-shine" />
      </div>
    </button>
  );
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card-glass relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function HeroBook() {
  const navigate = useNavigate();
  const [activeClass, setActiveClass] = useState<HeroClass | 'all'>('all');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(heroes[0]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const heroInstances = useGameStore((state) => state.heroInstances);

  const ownedTemplateIds = useMemo(() => {
    return new Set(heroInstances.map((h) => h.templateId));
  }, [heroInstances]);

  const filteredHeroes = useMemo(() => {
    if (activeClass === 'all') return heroes;
    return heroes.filter((h) => h.heroClass === activeClass);
  }, [activeClass]);

  const selectedOwnedInstance = useMemo(() => {
    if (!selectedHero) return null;
    return heroInstances.find((h) => h.templateId === selectedHero.id);
  }, [selectedHero, heroInstances]);

  return (
    <div className="game-bg relative min-h-screen w-full">
      <div className="relative z-10 flex min-h-screen flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="card-glass flex h-11 w-11 items-center justify-center transition-all hover:border-amber-500/50"
            >
              <ArrowLeft size={22} className="text-slate-300" />
            </button>
            <div>
              <h1
                className="text-glow font-title text-3xl font-bold text-amber-400 md:text-4xl"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                英雄图鉴
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                已收集 {ownedTemplateIds.size} / {heroes.length} 位英雄
              </p>
            </div>
          </div>

          <div className="card-glass flex items-center gap-3 px-4 py-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span className="text-sm text-slate-300">收集进度</span>
            </div>
            <div className="h-4 w-32 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{
                  width: `${(ownedTemplateIds.size / heroes.length) * 100}%`,
                }}
              />
            </div>
            <span className="font-title font-bold text-amber-400">
              {Math.round((ownedTemplateIds.size / heroes.length) * 100)}%
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((cls) => (
              <button
                key={cls.key}
                onClick={() => setActiveClass(cls.key)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-300 ${
                  activeClass === cls.key
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10'
                    : 'border-slate-600/50 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">{cls.icon}</span>
                <span className="font-title text-sm font-medium">
                  {cls.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="w-1/2 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredHeroes.map((hero) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  owned={ownedTemplateIds.has(hero.id)}
                  selected={selectedHero?.id === hero.id}
                  onClick={() => setSelectedHero(hero)}
                />
              ))}
            </div>
          </div>

          <div className="w-1/2">
            {selectedHero ? (
              <div className="card-glass flex h-full flex-col p-6">
                <div className="mb-6 flex items-start gap-6">
                  <div
                    className={`hero-avatar-frame ${
                      selectedOwnedInstance ? 'legendary' : ''
                    }`}
                  >
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 text-6xl">
                      {selectedHero.avatar}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2
                        className="text-glow font-title text-3xl font-bold text-amber-400"
                        style={{ fontFamily: 'var(--font-title)' }}
                      >
                        {selectedHero.name}
                      </h2>
                      <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300">
                        {selectedHero.className}
                      </span>
                    </div>

                    {selectedOwnedInstance && (
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: selectedOwnedInstance.star },
                            (_, i) => (
                              <Star
                                key={i}
                                size={18}
                                className="fill-amber-400 text-amber-400"
                              />
                            ),
                          )}
                        </div>
                        <span className="text-sm text-slate-400">
                          Lv.{selectedOwnedInstance.level}
                        </span>
                        <span
                          className={`font-title font-bold ${
                            RARITY_COLORS[selectedOwnedInstance.star] ||
                            'text-slate-400'
                          }`}
                        >
                          {['', '普通', '稀有', '史诗', '传说', '神话', '至尊'][
                            selectedOwnedInstance.star
                          ] || '未知'}
                        </span>
                      </div>
                    )}

                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {selectedHero.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <StatItem
                    icon={Heart}
                    label="最大生命"
                    value={selectedHero.baseStats.maxHp}
                    growth={selectedHero.growthStats.maxHp}
                    color="text-red-400"
                  />
                  <StatItem
                    icon={Zap}
                    label="最大法力"
                    value={selectedHero.baseStats.maxMana}
                    growth={selectedHero.growthStats.maxMana}
                    color="text-blue-400"
                  />
                  <StatItem
                    icon={Sword}
                    label="攻击力"
                    value={selectedHero.baseStats.attack}
                    growth={selectedHero.growthStats.attack}
                    color="text-orange-400"
                  />
                  <StatItem
                    icon={Shield}
                    label="防御力"
                    value={selectedHero.baseStats.defense}
                    growth={selectedHero.growthStats.defense}
                    color="text-green-400"
                  />
                  <StatItem
                    icon={Target}
                    label="速度"
                    value={selectedHero.baseStats.speed}
                    growth={selectedHero.growthStats.speed}
                    color="text-cyan-400"
                    colSpan
                  />
                </div>

                <div className="flex-1">
                  <h3 className="mb-3 font-title text-lg font-bold text-slate-200">
                    技能列表
                  </h3>
                  <div className="space-y-3">
                    {selectedHero.skillIds.map((skillId, idx) => (
                      <div
                        key={skillId}
                        className="card-glass flex items-center gap-4 p-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-2xl">
                          {['💥', '✨', '⚡'][idx % 3]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-title font-bold text-slate-200">
                              技能 {idx + 1}
                            </span>
                            <span className="text-xs text-slate-500">
                              {skillId}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            数据绑定中...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setDetailModalOpen(true)}
                  className="btn-gold mt-6 w-full"
                >
                  查看完整详情
                </button>
              </div>
            ) : (
              <div className="card-glass flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl">📖</div>
                  <p className="text-slate-400">请从左侧选择一位英雄</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)}>
        {selectedHero && (
          <div className="p-8">
            <div className="mb-6 flex items-center gap-6">
              <div
                className={`hero-avatar-frame ${
                  selectedOwnedInstance ? 'legendary' : ''
                }`}
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-800 text-7xl">
                  {selectedHero.avatar}
                </div>
              </div>
              <div>
                <h2
                  className="text-glow font-title text-4xl font-bold text-amber-400"
                  style={{ fontFamily: 'var(--font-title)' }}
                >
                  {selectedHero.name}
                </h2>
                <p className="mt-2 text-slate-400">{selectedHero.className}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                  {selectedHero.description}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-title text-xl font-bold text-slate-200">
                英雄属性
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <StatItem
                  icon={Heart}
                  label="最大生命"
                  value={selectedHero.baseStats.maxHp}
                  growth={selectedHero.growthStats.maxHp}
                  color="text-red-400"
                />
                <StatItem
                  icon={Zap}
                  label="最大法力"
                  value={selectedHero.baseStats.maxMana}
                  growth={selectedHero.growthStats.maxMana}
                  color="text-blue-400"
                />
                <StatItem
                  icon={Sword}
                  label="攻击力"
                  value={selectedHero.baseStats.attack}
                  growth={selectedHero.growthStats.attack}
                  color="text-orange-400"
                />
                <StatItem
                  icon={Shield}
                  label="防御力"
                  value={selectedHero.baseStats.defense}
                  growth={selectedHero.growthStats.defense}
                  color="text-green-400"
                />
                <StatItem
                  icon={Target}
                  label="速度"
                  value={selectedHero.baseStats.speed}
                  growth={selectedHero.growthStats.speed}
                  color="text-cyan-400"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-title text-xl font-bold text-slate-200">
                技能详情
              </h3>
              <div className="space-y-4">
                {selectedHero.skillIds.map((skillId, idx) => (
                  <div
                    key={skillId}
                    className="card-glass flex items-start gap-4 p-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-3xl">
                      {['💥', '✨', '⚡'][idx % 3]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-title text-lg font-bold text-slate-200">
                          技能 {idx + 1}
                        </span>
                        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                          {skillId}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            style={{ width: '70%' }}
                          />
                        </div>
                        <p className="text-sm text-slate-500">
                          技能详细数据绑定中...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  growth,
  color,
  colSpan,
}: {
  icon: LucideIconType;
  label: string;
  value: number;
  growth: number;
  color: string;
  colSpan?: boolean;
}) {
  return (
    <div
      className={`card-glass flex items-center gap-3 p-3 ${
        colSpan ? 'col-span-2' : ''
      }`}
    >
      <div className={`rounded-lg bg-slate-800/80 p-2 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-title text-xl font-bold ${color}`}
          >
            {value.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">+{growth}/级</span>
        </div>
      </div>
    </div>
  );
}

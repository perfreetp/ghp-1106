import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Lock,
  Crown,
  Swords,
  Coins,
  Gem,
  Sparkles,
  Target,
  Heart,
  Trophy,
  ShieldCheck,
  Zap,
  Skull,
  Play,
  Clock,
  Calendar,
} from 'lucide-react';
import { levels as allLevels, type Level, type Enemy } from '@/data/levels';
import { heroes as heroTemplates } from '@/data/heroes';
import { useGameStore } from '@/store/useGameStore';
import { HeroAvatar } from '@/components/common/HeroAvatar';
import { GameButton } from '@/components/common/GameButton';
import { Modal } from '@/components/common/Modal';
import { STAR_FAST_CLEAR_TURNS } from '@/types';
import { cn } from '@/lib/utils';

const CHAPTERS = [
  { id: 1, name: '第一章 新手试炼', icon: '🌱' },
  { id: 2, name: '第二章 长城守卫', icon: '🏰' },
  { id: 3, name: '第三章 王者之路', icon: '👑' },
];

const ENEMY_TYPE_ICONS: Record<string, string> = {
  warrior: '🗡️',
  mage: '🔮',
  tank: '🛡️',
  assassin: '🥷',
  archer: '🏹',
  support: '💫',
};

const ENEMY_COLORS: Record<string, string> = {
  warrior: 'from-red-900/50 to-red-950/70 border-red-500/40',
  mage: 'from-blue-900/50 to-blue-950/70 border-blue-500/40',
  tank: 'from-green-900/50 to-green-950/70 border-green-500/40',
  assassin: 'from-purple-900/50 to-purple-950/70 border-purple-500/40',
  archer: 'from-orange-900/50 to-orange-950/70 border-orange-500/40',
  support: 'from-cyan-900/50 to-cyan-950/70 border-cyan-500/40',
};

type NodeStatus = 'cleared' | 'current' | 'locked' | 'challenge';

interface MapNode {
  level: Level;
  x: number;
  y: number;
  status: NodeStatus;
  stars: number;
}

export default function LevelMap() {
  const navigate = useNavigate();
  const store = useGameStore();

  const [activeChapter, setActiveChapter] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);

  useEffect(() => {
    if (!store.heroInstances.length) {
      store.initNewGame();
    }
  }, [store]);

  const chapterLevels = useMemo(() => {
    const levels = allLevels.filter((l) => l.chapter === activeChapter);
    const bossLevel: Level = {
      id: `lv_${activeChapter}_boss`,
      chapter: activeChapter,
      chapterName: CHAPTERS[activeChapter - 1].name,
      stage: 6,
      stageName: `第6关·BOSS战`,
      fullName: `${CHAPTERS[activeChapter - 1].name} 第6关·BOSS战`,
      difficulty: 3,
      description: '章节终极挑战，击败强大的BOSS获得丰厚奖励！',
      enemies: [
        {
          id: `boss_${activeChapter}`,
          name: ['暗影暴君', '魔种元帅', '最强王者'][activeChapter - 1],
          type: 'tank',
          typeName: '坦克',
          level: 5 + activeChapter * 5,
          hp: 5000 + activeChapter * 3000,
          attack: 200 + activeChapter * 100,
          defense: 120 + activeChapter * 50,
        },
      ],
      reward: { gold: 800 * activeChapter, exp: 500 * activeChapter },
      recommendedLevel: 5 * activeChapter,
    };
    return [...levels, bossLevel];
  }, [activeChapter]);

  const chapterProgress = useMemo(() => {
    const progress = chapterLevels.map((level) => {
      const prog = store.levelProgress[level.id];
      return prog || { cleared: false, stars: 0 };
    });

    let firstLockedIndex = progress.findIndex((p) => !p.cleared);
    if (firstLockedIndex === -1) firstLockedIndex = progress.length;

    return chapterLevels.map((level, idx): MapNode => {
      const prog = progress[idx];
      const isBoss = idx === chapterLevels.length - 1;
      const stars = prog?.stars || 0;

      let status: NodeStatus;
      if (challengeMode && isBoss && prog?.cleared) {
        status = 'challenge';
      } else if (prog?.cleared) {
        status = 'cleared';
      } else if (idx === firstLockedIndex) {
        status = 'current';
      } else {
        status = 'locked';
      }

      return {
        level,
        x: 10 + (idx % 3) * 30 + (idx % 2 === 0 ? 5 : 25),
        y: 15 + Math.floor(idx / 3) * 35,
        status,
        stars,
      };
    });
  }, [chapterLevels, store.levelProgress, challengeMode]);

  const totalStars = useMemo(
    () => chapterProgress.reduce((sum, n) => sum + n.stars, 0),
    [chapterProgress],
  );
  const maxStars = chapterLevels.length * 3;

  const currentLevelIndex = chapterProgress.findIndex((n) => n.status === 'current');

  const handleNodeClick = (node: MapNode) => {
    if (node.status === 'locked') return;
    setSelectedLevel(node.level);
    setShowModal(true);
  };

  const handleStartBattle = () => {
    if (!selectedLevel) return;
    navigate(`/battle/${selectedLevel.id}`);
  };

  const generateNodePath = () => {
    if (chapterProgress.length < 2) return '';
    let d = '';
    for (let i = 0; i < chapterProgress.length - 1; i++) {
      const from = chapterProgress[i];
      const to = chapterProgress[i + 1];
      const x1 = from.x;
      const y1 = from.y;
      const x2 = to.x;
      const y2 = to.y;
      const cx = (x1 + x2) / 2 + (Math.sin(i) * 10);
      const cy = (y1 + y2) / 2 - 8;
      if (i === 0) {
        d += `M ${x1} ${y1}`;
      }
      d += ` Q ${cx} ${cy} ${x2} ${y2}`;
    }
    return d;
  };

  const pathProgress = useMemo(() => {
    let progress = 0;
    for (let i = 0; i < chapterProgress.length; i++) {
      if (chapterProgress[i].status === 'cleared') progress = i + 1;
      else if (chapterProgress[i].status === 'current') {
        progress = i + 0.5;
        break;
      } else break;
    }
    return progress / (chapterProgress.length - 1 || 1);
  }, [chapterProgress]);

  return (
    <div className="game-bg relative min-h-screen w-full">
      <div className="relative z-10 flex min-h-screen flex-col p-4 lg:p-6">
        {/* 顶部栏 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="card-glass flex h-11 w-11 items-center justify-center transition-all hover:border-amber-500/50"
            >
              <ArrowLeft size={22} className="text-slate-300" />
            </button>
            <div>
              <h1
                className="text-glow font-title text-2xl font-bold text-amber-400 md:text-3xl"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                王者峡谷
              </h1>
              <p className="mt-1 text-xs text-slate-400 md:text-sm">
                征服每一章，成为最强王者
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="card-glass flex items-center gap-2 px-4 py-2">
              <Coins size={18} className="text-yellow-400" />
              <span className="font-title font-bold text-yellow-300 tabular-nums">
                {store.gold.toLocaleString()}
              </span>
            </div>
            <div className="card-glass flex items-center gap-2 px-4 py-2">
              <Gem size={18} className="text-cyan-400" />
              <span className="font-title font-bold text-cyan-300 tabular-nums">
                {store.diamond.toLocaleString()}
              </span>
            </div>
            <div className="card-glass flex items-center gap-2 px-4 py-2">
              <Trophy size={18} className="text-amber-400" />
              <span className="font-title font-bold text-amber-300 tabular-nums">
                {totalStars}/{maxStars}
              </span>
            </div>
          </div>
        </div>

        {/* 章节Tab */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(ch.id)}
              className={`flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 font-title text-sm font-medium transition-all duration-300 ${
                activeChapter === ch.id
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/20 to-orange-500/10 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'border-slate-600/40 bg-slate-800/40 text-slate-400 hover:border-slate-500/60 hover:bg-slate-700/40 hover:text-slate-300'
              }`}
            >
              <span className="text-lg">{ch.icon}</span>
              <span>{ch.name}</span>
            </button>
          ))}
        </div>

        {/* 地图区域 */}
        <div className="card-glass relative flex-1 min-h-[500px] overflow-hidden p-6">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 30% 20%, rgba(234, 179, 8, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59, 130, 247, 0.08) 0%, transparent 50%)',
            }}
          />

          <div className="relative h-full w-full" style={{ minHeight: 480 }}>
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                  <stop offset={`${pathProgress * 100}%`} stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset={`${pathProgress * 100}%`} stopColor="#475569" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
                </linearGradient>
                <filter id="pathGlow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d={generateNodePath()}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#pathGlow)"
              />
            </svg>

            {chapterProgress.map((node, idx) => {
              const isBoss = idx === chapterProgress.length - 1;
              return (
                <div
                  key={node.level.id}
                  className="absolute"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <MapNodeButton
                    node={node}
                    index={idx}
                    isBoss={isBoss}
                    onClick={() => handleNodeClick(node)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部栏 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="card-glass flex flex-1 items-center gap-4 px-4 py-3 min-w-[280px]">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-amber-400" />
              <span className="font-title text-sm font-medium text-slate-300">
                {CHAPTERS[activeChapter - 1].name}
              </span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-500">关卡进度</span>
                <span className="font-bold text-amber-300 tabular-nums">
                  {currentLevelIndex >= 0
                    ? `${Math.min(currentLevelIndex + 1, chapterLevels.length)}/${chapterLevels.length}`
                    : `${chapterLevels.length}/${chapterLevels.length}`}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800 border border-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 shadow-inner shadow-amber-300/30 transition-all duration-500"
                  style={{
                    width: `${((currentLevelIndex >= 0 ? currentLevelIndex + 1 : chapterLevels.length) / chapterLevels.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <label className="card-glass flex cursor-pointer items-center gap-3 px-4 py-3 transition-all hover:border-purple-500/40">
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                className={challengeMode ? 'text-purple-400' : 'text-slate-500'}
              />
              <span className="font-title text-sm font-medium text-slate-300">挑战模式</span>
            </div>
            <div
              className={`relative h-6 w-11 rounded-full border-2 transition-all ${
                challengeMode
                  ? 'border-purple-500/60 bg-purple-500/30'
                  : 'border-slate-600/60 bg-slate-700/50'
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300 ${
                  challengeMode
                    ? 'left-[calc(100%-1.125rem)] bg-gradient-to-b from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50'
                    : 'left-0.5 bg-gradient-to-b from-slate-400 to-slate-600'
                }`}
              />
            </div>
            <input
              type="checkbox"
              checked={challengeMode}
              onChange={(e) => setChallengeMode(e.target.checked)}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* 关卡详情 Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="xl"
        title={selectedLevel?.stageName || '关卡详情'}
        footer={
          <div className="flex items-center justify-between gap-4">
            {selectedLevel && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ShieldCheck size={16} className="text-amber-400" />
                <span>推荐等级: Lv.{selectedLevel.recommendedLevel}</span>
              </div>
            )}
            <div className="flex gap-3">
              <GameButton variant="secondary" onClick={() => setShowModal(false)}>
                取消
              </GameButton>
              <GameButton
                variant="primary"
                size="md"
                icon={<Play size={16} />}
                onClick={handleStartBattle}
              >
                开始挑战
              </GameButton>
            </div>
          </div>
        }
      >
        {selectedLevel && (
          <div className="space-y-5">
            {/* 关卡信息 */}
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-amber-500/40 text-5xl shadow-lg shadow-amber-500/10">
                {chapterLevels.findIndex((l) => l.id === selectedLevel.id) ===
                chapterLevels.length - 1
                  ? '👑'
                  : '⚔️'}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="mb-1 flex items-center gap-2">
                  <h3
                    className="text-glow font-title text-2xl font-bold text-amber-300"
                    style={{ fontFamily: 'var(--font-title)' }}
                  >
                    {selectedLevel.stageName}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">{selectedLevel.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 mr-1">难度</span>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skull
                        key={i}
                        size={16}
                        className={
                          i < selectedLevel.difficulty
                            ? 'text-red-400 fill-red-400/30'
                            : 'text-slate-700'
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-sm font-bold text-amber-300 tabular-nums">
                      推荐战力 {(selectedLevel.recommendedLevel * 1500).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 三星条件 */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-title text-base font-bold text-slate-200">
                <Trophy size={16} className="text-amber-400" />
                三星条件
              </h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { icon: <ShieldCheck size={14} />, text: '通关关卡' },
                  { icon: <Zap size={14} />, text: `回合数 ≤ ${STAR_FAST_CLEAR_TURNS}` },
                  { icon: <Heart size={14} />, text: '无英雄阵亡' },
                ].map((cond, i) => {
                  const stars = store.levelProgress[selectedLevel.id]?.stars || 0;
                  const achieved = stars > i;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                        achieved
                          ? 'border-green-500/40 bg-green-500/10 text-green-300'
                          : 'border-slate-600/40 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          achieved
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700/50 text-slate-500'
                        }`}
                      >
                        {cond.icon}
                      </div>
                      <span>{cond.text}</span>
                      {achieved && (
                        <Star
                          size={14}
                          className="ml-auto fill-amber-400 text-amber-400"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 历史战绩 & 领取状态 */}
            {(() => {
              const prog = store.levelProgress[selectedLevel.id];
              if (!prog?.cleared) return null;
              return (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-title text-base font-bold text-slate-200">
                    <Clock size={16} className="text-cyan-400" />
                    历史战绩
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3 py-2.5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        最高星数
                      </div>
                      <div className="mt-0.5 flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={
                              s <= (prog.stars || 0)
                                ? 'fill-amber-400 text-amber-400 drop-shadow'
                                : 'text-slate-700'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-green-500/20 bg-green-950/20 px-3 py-2.5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        最佳回合
                      </div>
                      <div className="mt-0.5 text-lg font-bold text-green-300 tabular-nums">
                        {prog.bestTurns ?? '-'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 px-3 py-2.5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        通关次数
                      </div>
                      <div className="mt-0.5 text-lg font-bold text-purple-300 tabular-nums">
                        {prog.clearedCount ?? 1}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border',
                        prog.firstClearClaimed
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-slate-900/40 border-slate-700 text-slate-500 line-through',
                      )}
                    >
                      <Crown size={14} />
                      <span>首通奖励</span>
                      <span className="ml-1">
                        {prog.firstClearClaimed ? '✓ 已领取' : '未领取'}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border',
                        prog.threeStarClaimed || prog.stars >= 3
                          ? 'bg-sky-950/30 border-sky-500/30 text-sky-300'
                          : 'bg-slate-900/40 border-slate-700 text-slate-500 line-through',
                      )}
                    >
                      <Star size={14} className="fill-current" />
                      <span>三星奖励</span>
                      <span className="ml-1">
                        {prog.threeStarClaimed || prog.stars >= 3
                          ? '✓ 已领取'
                          : '未达成'}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border',
                        'bg-slate-900/40 border-slate-700 text-slate-400',
                      )}
                    >
                      <Calendar size={14} />
                      <span>首次通关</span>
                      <span className="ml-1 tabular-nums">
                        {prog.firstClearTime
                          ? new Date(prog.firstClearTime).toLocaleDateString('zh-CN')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 敌方阵容 */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-title text-base font-bold text-slate-200">
                <Swords size={16} className="text-red-400" />
                敌方阵容预览
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedLevel.enemies.map((enemy) => (
                  <EnemyCard key={enemy.id} enemy={enemy} />
                ))}
              </div>
            </div>

            {/* 奖励预览 */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-title text-base font-bold text-slate-200">
                <Coins size={16} className="text-yellow-400" />
                奖励预览
              </h4>
              <div className="flex flex-wrap gap-3">
                <RewardCard
                  icon={<Coins size={24} className="text-yellow-400" />}
                  name="金币"
                  value={selectedLevel.reward.gold}
                  bg="from-yellow-900/30 to-yellow-950/50 border-yellow-500/30"
                />
                <RewardCard
                  icon={<Sparkles size={24} className="text-cyan-400" />}
                  name="经验"
                  value={selectedLevel.reward.exp}
                  bg="from-cyan-900/30 to-cyan-950/50 border-cyan-500/30"
                />
                {chapterLevels.findIndex((l) => l.id === selectedLevel.id) ===
                  chapterLevels.length - 1 && (
                  <RewardCard
                    icon={<Gem size={24} className="text-purple-400" />}
                    name="钻石"
                    value={50 * activeChapter}
                    bg="from-purple-900/30 to-purple-950/50 border-purple-500/30"
                  />
                )}
                <RewardCard
                  icon={<Crown size={24} className="text-amber-400" />}
                  name="装备"
                  value="随机"
                  bg="from-amber-900/30 to-amber-950/50 border-amber-500/30"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MapNodeButton({
  node,
  index,
  isBoss,
  onClick,
}: {
  node: MapNode;
  index: number;
  isBoss: boolean;
  onClick: () => void;
}) {
  const sizeClass = isBoss ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12 md:h-14 md:w-14';
  const iconSize = isBoss ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl';
  const labelSize = isBoss ? 'text-sm md:text-base' : 'text-xs md:text-sm';

  const statusStyles: Record<NodeStatus, string> = {
    cleared: isBoss
      ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-700/50 border-emerald-400/60 shadow-emerald-500/30 hover:shadow-emerald-500/50'
      : 'bg-gradient-to-b from-green-500/30 to-green-700/50 border-green-400/60 shadow-green-500/20 hover:shadow-green-500/40',
    current:
      'bg-gradient-to-b from-amber-400/40 to-orange-600/50 border-amber-300/80 shadow-amber-400/50 hover:shadow-amber-400/70',
    locked:
      'bg-gradient-to-b from-slate-700/30 to-slate-900/50 border-slate-600/40 opacity-60 cursor-not-allowed',
    challenge:
      'bg-gradient-to-b from-purple-500/40 to-fuchsia-700/50 border-purple-400/70 shadow-purple-500/40 hover:shadow-purple-500/60',
  };

  const iconMap: Record<number, string> = {
    0: '🌳',
    1: '💀',
    2: '🏰',
    3: '🌋',
    4: '⛰️',
    5: '👑',
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        disabled={node.status === 'locked'}
        className={`group relative flex ${sizeClass} items-center justify-center rounded-full border-2 transition-all duration-300 ${
          statusStyles[node.status]
        } ${node.status !== 'locked' ? 'hover:-translate-y-1 hover:scale-105 active:scale-95' : ''} ${
          node.status === 'current' ? 'animate-pulse' : ''
        } shadow-lg backdrop-blur-sm`}
      >
        {node.status === 'locked' ? (
          <Lock size={isBoss ? 28 : 20} className="text-slate-500" />
        ) : (
          <span className={`${iconSize} drop-shadow-md`}>
            {node.status === 'challenge' ? '💎' : isBoss ? '👑' : iconMap[index] || '⚔️'}
          </span>
        )}

        {node.status === 'current' && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/20 border-2 border-amber-400/30" />
            <div className="absolute -inset-2 rounded-full bg-amber-400/10 blur-md opacity-70" />
          </>
        )}

        {node.status === 'challenge' && (
          <div className="absolute -inset-1 rounded-full bg-purple-400/15 blur-md opacity-70" />
        )}

        {node.status === 'cleared' && node.stars > 0 && (
          <div className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 flex gap-0.5 rounded-full bg-slate-900/90 border border-amber-500/40 px-1.5 py-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={
                  i < node.stars
                    ? 'fill-amber-400 text-amber-400 drop-shadow'
                    : 'text-slate-700'
                }
              />
            ))}
          </div>
        )}
      </button>
      <span
        className={`mt-4 ${labelSize} font-title font-bold drop-shadow ${
          node.status === 'locked'
            ? 'text-slate-600'
            : node.status === 'challenge'
            ? 'text-purple-300'
            : node.status === 'current'
            ? 'text-amber-300'
            : 'text-slate-300'
        }`}
      >
        {isBoss ? 'BOSS' : `${index + 1}`}
      </span>
    </div>
  );
}

function EnemyCard({ enemy }: { enemy: Enemy }) {
  const matchingHero = heroTemplates.find((h) => {
    const typeMap: Record<string, string[]> = {
      warrior: ['warrior'],
      mage: ['mage'],
      tank: ['tank'],
      assassin: ['assassin'],
      archer: ['marksman'],
      support: ['support'],
    };
    return typeMap[enemy.type]?.includes(h.heroClass);
  });

  const avatar = matchingHero?.avatar || ENEMY_TYPE_ICONS[enemy.type] || '👹';
  const roleName = enemy.typeName;

  return (
    <div
      className={`flex flex-col items-center rounded-xl border-2 bg-gradient-to-b p-3 backdrop-blur-sm transition-all hover:-translate-y-0.5 ${
        ENEMY_COLORS[enemy.type] || 'from-slate-800/50 to-slate-900/70 border-slate-600/40'
      }`}
    >
      <HeroAvatar
        avatar={avatar}
        name={enemy.name}
        role={roleName}
        level={enemy.level}
        size="md"
      />
      <div className="mt-2 text-center">
        <div className="font-title text-xs font-bold text-slate-100">{enemy.name}</div>
        <div className="mt-0.5 text-[10px] text-slate-400">
          Lv.{enemy.level} {roleName}
        </div>
      </div>
      <div className="mt-1.5 flex gap-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-0.5">
          <Heart size={10} className="text-red-400/70" />
          {enemy.hp}
        </span>
        <span className="flex items-center gap-0.5">
          <Swords size={10} className="text-orange-400/70" />
          {enemy.attack}
        </span>
      </div>
    </div>
  );
}

function RewardCard({
  icon,
  name,
  value,
  bg,
}: {
  icon: React.ReactNode;
  name: string;
  value: string | number;
  bg: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 bg-gradient-to-br px-4 py-3 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${bg}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/60">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-400">{name}</div>
        <div className="font-title text-lg font-bold text-white tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  );
}

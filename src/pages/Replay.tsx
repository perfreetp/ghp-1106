import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, FastForward,
  Calendar, Trophy, XCircle, Star, Filter, Download,
  ChevronLeft, ChevronRight, Clock, Target, Swords, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/common/GameButton';
import { HeroAvatar } from '@/components/common/HeroAvatar';
import { Modal } from '@/components/common/Modal';
import { StatBar } from '@/components/common/StatBar';
import { useGameStore } from '@/store/useGameStore';
import { heroes } from '@/data/heroes';
import type { BattleLog, BattleStep } from '@/types';

type FilterResult = 'all' | 'win' | 'lose';
type FilterStars = 0 | 1 | 2 | 3;

const speeds = [0.5, 1, 2, 4];

const levelNameMap: Record<string, string> = {
  level_1_1: '第一章·第一关',
  level_1_2: '第一章·第二关',
  level_1_3: '第一章·第三关',
  level_1_4: '第一章·第四关',
  level_1_5: '第一章·BOSS关',
  level_2_1: '第二章·第一关',
  level_2_2: '第二章·第二关',
  level_2_3: '第二章·第三关',
  level_2_4: '第二章·第四关',
  level_2_5: '第二章·BOSS关',
  level_3_1: '第三章·第一关',
  level_3_2: '第三章·第二关',
  level_3_3: '第三章·第三关',
  level_3_4: '第三章·第四关',
  level_3_5: '第三章·最终关',
};

const getLevelName = (levelId?: string) => {
  if (!levelId) return '未知关卡';
  return levelNameMap[levelId] || levelId;
};

const getHeroTemplate = (templateId: string) => {
  return heroes.find((h) => h.id === templateId);
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const formatDuration = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(diff / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const generateMockBattleLogs = (): BattleLog[] => {
  const mockLogs: BattleLog[] = [];
  const results: ('胜利' | '失败')[] = ['胜利', '胜利', '失败', '胜利', '失败'];
  const levels = ['level_1_1', 'level_1_2', 'level_1_3', 'level_1_4', 'level_1_5'];
  const allyIds = ['hero_007', 'hero_003', 'hero_006'];
  const enemyIds = ['hero_001', 'hero_005', 'hero_004'];

  for (let i = 0; i < 5; i++) {
    const startTime = new Date(Date.now() - i * 86400000 - Math.random() * 3600000);
    const endTime = new Date(startTime.getTime() + (60 + Math.random() * 120) * 1000);
    const result = results[i];
    const stars = result === '胜利' ? Math.floor(Math.random() * 3) + 1 : 0;

    const steps: BattleStep[] = [];
    const totalTurns = Math.floor(Math.random() * 8) + 5;
    let stepIdx = 0;

    for (let turn = 1; turn <= totalTurns; turn++) {
      for (let a = 0; a < 6; a++) {
        const isAlly = a < 3;
        const actorId = isAlly ? allyIds[a] : enemyIds[a - 3];
        const targetPool = isAlly ? enemyIds : allyIds;
        const targetId = targetPool[Math.floor(Math.random() * targetPool.length)];

        const actionTypes: ('普通攻击' | '释放技能')[] = ['普通攻击', '普通攻击', '释放技能'];
        const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        const damage = Math.floor(Math.random() * 800) + 100;
        const isCrit = Math.random() > 0.7;

        steps.push({
          turn,
          actorId,
          action,
          targets: [targetId],
          results: [
            {
              targetId,
              damage,
              isCrit,
            },
          ],
          snapshotBefore: {
            actorHP: Math.floor(Math.random() * 3000) + 1000,
            actorEnergy: Math.floor(Math.random() * 100),
          },
          timestamp: startTime.getTime() + stepIdx * 3000,
        });
        stepIdx++;
      }
    }

    mockLogs.push({
      id: `battle_log_${i + 1}`,
      levelId: levels[i],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalTurns,
      result,
      stars,
      allyHeroIds: allyIds,
      enemyHeroIds: enemyIds,
      steps,
      summary: {
        totalDamage: Math.floor(Math.random() * 20000) + 5000,
        totalHeal: Math.floor(Math.random() * 5000) + 1000,
        totalShieldAbsorbed: Math.floor(Math.random() * 2000) + 500,
        totalShieldGained: Math.floor(Math.random() * 3000) + 1000,
        damageByHero: {
          [allyIds[0]]: Math.floor(Math.random() * 10000) + 2000,
          [allyIds[1]]: Math.floor(Math.random() * 8000) + 1500,
          [allyIds[2]]: Math.floor(Math.random() * 6000) + 1000,
        },
        damageTakenByHero: {
          [allyIds[0]]: Math.floor(Math.random() * 8000) + 1000,
          [allyIds[1]]: Math.floor(Math.random() * 6000) + 800,
          [allyIds[2]]: Math.floor(Math.random() * 5000) + 500,
        },
        healByHero: {
          [allyIds[2]]: Math.floor(Math.random() * 4000) + 800,
        },
        shieldAbsorbedByHero: {
          [allyIds[0]]: Math.floor(Math.random() * 1500) + 300,
        },
        shieldGainedByHero: {
          [allyIds[2]]: Math.floor(Math.random() * 2000) + 800,
        },
        isFastClear: totalTurns <= 12,
        isNoDeath: Math.random() > 0.5,
        topDamageHeroId: allyIds[0],
        topHealHeroId: allyIds[2],
        topShieldHeroId: allyIds[0],
      },
    });
  }

  return mockLogs;
};

export default function Replay() {
  const { battleLogs: storeBattleLogs } = useGameStore();

  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<BattleLog | null>(null);
  const [filterResult, setFilterResult] = useState<FilterResult>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterStars, setFilterStars] = useState<FilterStars>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportJson, setExportJson] = useState('');

  useEffect(() => {
    const logs = storeBattleLogs.length > 0 ? storeBattleLogs : generateMockBattleLogs();
    setBattleLogs(logs);
  }, [storeBattleLogs]);

  useEffect(() => {
    if (!isPlaying || !selectedLog) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= selectedLog.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, selectedLog]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedLog]);

  const filteredLogs = useMemo(() => {
    return battleLogs.filter((log) => {
      if (filterResult === 'win' && log.result !== '胜利') return false;
      if (filterResult === 'lose' && log.result !== '失败') return false;
      if (filterStars > 0 && (log.stars || 0) < filterStars) return false;
      if (filterDate) {
        const logDate = new Date(log.startTime).toISOString().slice(0, 10);
        if (logDate !== filterDate) return false;
      }
      if (filterLevel && log.levelId !== filterLevel) return false;
      return true;
    });
  }, [battleLogs, filterResult, filterStars, filterDate, filterLevel]);

  const currentStep = selectedLog ? selectedLog.steps[currentStepIndex] : null;
  const stepsByTurn = useMemo(() => {
    if (!selectedLog) return {};
    const map: Record<number, number[]> = {};
    selectedLog.steps.forEach((step, idx) => {
      if (!map[step.turn]) map[step.turn] = [];
      map[step.turn].push(idx);
    });
    return map;
  }, [selectedLog]);

  const jumpToTurn = (turn: number) => {
    const indices = stepsByTurn[turn];
    if (indices && indices.length > 0) {
      setCurrentStepIndex(indices[0]);
      setIsPlaying(false);
    }
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (!selectedLog) return;
    setCurrentStepIndex((prev) => Math.min(selectedLog.steps.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const skipToStart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const skipToEnd = () => {
    if (!selectedLog) return;
    setCurrentStepIndex(selectedLog.steps.length - 1);
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  const handleExport = () => {
    if (!selectedLog) return;
    const json = JSON.stringify(selectedLog, null, 2);
    setExportJson(json);
    setShowExportModal(true);
  };

  const downloadJson = () => {
    if (!selectedLog) return;
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battle_${selectedLog.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
    } catch {
      // ignore
    }
  };

  const progress = selectedLog
    ? ((currentStepIndex + 1) / selectedLog.steps.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              className="p-3 rounded-xl bg-slate-800/60 border border-white/10 text-white hover:bg-slate-700/60 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                📽️ 战斗回放
              </h1>
              <p className="text-slate-400 text-sm mt-1">回顾精彩战斗，分析战术策略</p>
            </div>
          </div>

          {selectedLog && (
            <GameButton
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              导出录像
            </GameButton>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6" style={{ minHeight: 'calc(100vh - 160px)' }}>
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Filter className="w-4 h-4" />
                <span>筛选条件</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> 日期
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> 胜负
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['all', 'win', 'lose'] as FilterResult[]).map((opt) => (
                    <button
                      key={opt}
                      className={cn(
                        'py-2 rounded-lg text-xs font-bold transition-all',
                        filterResult === opt
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-black/30 text-slate-300 hover:bg-white/5 border border-white/10',
                      )}
                      onClick={() => setFilterResult(opt)}
                    >
                      {opt === 'all' ? '全部' : opt === 'win' ? '胜' : '负'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3" /> 关卡
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">全部关卡</option>
                  {Object.entries(levelNameMap).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" /> 最低星数
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([0, 1, 2, 3] as FilterStars[]).map((s) => (
                    <button
                      key={s}
                      className={cn(
                        'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-0.5',
                        filterStars === s
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-yellow-500/30'
                          : 'bg-black/30 text-slate-300 hover:bg-white/5 border border-white/10',
                      )}
                      onClick={() => setFilterStars(s)}
                    >
                      {s === 0 ? '全部' : Array.from({ length: s }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-slate-200 font-bold text-sm">
                  录像列表 ({filteredLogs.length})
                </span>
              </div>

              <div className="max-h-[560px] overflow-y-auto p-2 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      暂无符合条件的战斗记录
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                          'p-3 rounded-xl cursor-pointer transition-all border-2',
                          selectedLog?.id === log.id
                            ? 'bg-cyan-900/30 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                            : 'bg-black/20 border-transparent hover:bg-white/5 hover:border-white/20',
                        )}
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-mono">
                            {formatDateTime(log.startTime)}
                          </span>
                          {log.result === '胜利' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600/30 border border-green-400/40 text-green-300 text-xs font-bold">
                              <Trophy className="w-3 h-3" /> 胜利
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-400/40 text-red-300 text-xs font-bold">
                              <XCircle className="w-3 h-3" /> 失败
                            </span>
                          )}
                        </div>

                        <h4 className="text-white font-bold text-sm mb-2">
                          {getLevelName(log.levelId)}
                        </h4>

                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {log.allyHeroIds.slice(0, 3).map((hid, idx) => {
                              const hero = getHeroTemplate(hid);
                              return (
                                <div
                                  key={idx}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-500/60 flex items-center justify-center text-lg"
                                >
                                  {hero?.avatar || '❓'}
                                </div>
                              );
                            })}
                          </div>

                          {log.stars && log.stars > 0 && (
                            <div className="flex gap-0.5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'w-4 h-4',
                                    i < log.stars!
                                      ? 'text-yellow-400 fill-yellow-400 drop-shadow'
                                      : 'text-slate-600',
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {!selectedLog ? (
              <div className="h-full flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 border-dashed">
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-600 flex items-center justify-center">
                    <Swords className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 mb-2">请选择要回放的战斗</h3>
                  <p className="text-slate-500 text-sm">从左侧列表中选择一条战斗记录开始回放</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        {getLevelName(selectedLog.levelId)}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(selectedLog.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(selectedLog.startTime, selectedLog.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          {selectedLog.totalTurns} 回合
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {selectedLog.result === '胜利' ? (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-400/40">
                          <Trophy className="w-6 h-6 text-green-400" />
                          <div>
                            <p className="text-green-300 font-bold text-lg">胜利</p>
                            {selectedLog.stars && selectedLog.stars > 0 && (
                              <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'w-3.5 h-3.5',
                                      i < selectedLog.stars!
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-slate-600',
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600/30 to-rose-600/30 border border-red-400/40">
                          <XCircle className="w-6 h-6 text-red-400" />
                          <p className="text-red-300 font-bold text-lg">失败</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">总伤害</p>
                      <p className="text-orange-300 font-bold text-xl tabular-nums">
                        {selectedLog.summary.totalDamage.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">总治疗</p>
                      <p className="text-green-300 font-bold text-xl tabular-nums">
                        {selectedLog.summary.totalHeal.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">护盾吸收</p>
                      <p className="text-sky-300 font-bold text-xl tabular-nums">
                        {(selectedLog.summary.totalShieldAbsorbed || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">回合数</p>
                      <p className="text-cyan-300 font-bold text-xl tabular-nums">
                        {selectedLog.totalTurns}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">战斗步骤</p>
                      <p className="text-purple-300 font-bold text-xl tabular-nums">
                        {selectedLog.steps.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                  <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/10 p-4 overflow-hidden flex flex-col">
                    <h3 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-cyan-400" />
                      回合时间轴
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {Object.keys(stepsByTurn)
                        .map(Number)
                        .sort((a, b) => a - b)
                        .map((turn) => {
                          const stepIndices = stepsByTurn[turn] || [];
                          const isActiveTurn =
                            currentStep && currentStep.turn === turn;
                          const isPastTurn =
                            currentStep && currentStep.turn > turn;

                          return (
                            <motion.button
                              key={turn}
                              className={cn(
                                'w-full text-left p-3 rounded-xl transition-all border-2',
                                isActiveTurn
                                  ? 'bg-cyan-900/40 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                                  : isPastTurn
                                  ? 'bg-black/30 border-green-500/20 hover:border-green-500/40'
                                  : 'bg-black/20 border-white/5 hover:border-white/20',
                              )}
                              onClick={() => jumpToTurn(turn)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                                      isActiveTurn
                                        ? 'bg-cyan-500 text-white'
                                        : isPastTurn
                                        ? 'bg-green-600/40 text-green-200'
                                        : 'bg-slate-700 text-slate-300',
                                    )}
                                  >
                                    {turn}
                                  </div>
                                  <span
                                    className={cn(
                                      'font-bold',
                                      isActiveTurn
                                        ? 'text-cyan-200'
                                        : isPastTurn
                                        ? 'text-green-300'
                                        : 'text-slate-300',
                                    )}
                                  >
                                    回合 {turn}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500">
                                  {stepIndices.length} 步
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/10 p-4 overflow-hidden flex flex-col">
                    <h3 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      战斗棋盘预览
                    </h3>
                    <div className="flex-1 flex flex-col">
                      <div className="mb-2 text-xs text-slate-500 text-center">
                        — 敌方阵营 (后排) —
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[2, 1, 0].map((col) => {
                          const eid = selectedLog.enemyHeroIds[col];
                          const hero = eid ? getHeroTemplate(eid) : null;
                          return (
                            <div
                              key={`enemy-${col}`}
                              className={cn(
                                'aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2',
                                'bg-gradient-to-br from-red-950/40 to-red-900/20',
                                'border-red-500/30',
                                currentStep && currentStep.actorId === eid
                                  ? 'ring-2 ring-red-400 shadow-lg shadow-red-500/40 animate-pulse'
                                  : '',
                              )}
                            >
                              {hero ? (
                                <>
                                  <span className="text-3xl mb-1 drop-shadow">
                                    {hero.avatar}
                                  </span>
                                  <span className="text-[10px] text-red-200 font-bold truncate w-full text-center">
                                    {hero.name}
                                  </span>
                                  <div className="w-full mt-1">
                                    <StatBar
                                      current={
                                        col === 0
                                          ? 3200
                                          : col === 1
                                          ? 2800
                                          : 2500
                                      }
                                      max={3500}
                                      type="hp"
                                      showLabel={false}
                                      height="sm"
                                      size="full"
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className="text-slate-600 text-2xl">—</div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-2" />

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {[0, 1, 2].map((col) => {
                          const aid = selectedLog.allyHeroIds[col];
                          const hero = aid ? getHeroTemplate(aid) : null;
                          return (
                            <div
                              key={`ally-${col}`}
                              className={cn(
                                'aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2',
                                'bg-gradient-to-br from-cyan-950/40 to-cyan-900/20',
                                'border-cyan-500/30',
                                currentStep && currentStep.actorId === aid
                                  ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/40 animate-pulse'
                                  : '',
                              )}
                            >
                              {hero ? (
                                <>
                                  <span className="text-3xl mb-1 drop-shadow">
                                    {hero.avatar}
                                  </span>
                                  <span className="text-[10px] text-cyan-200 font-bold truncate w-full text-center">
                                    {hero.name}
                                  </span>
                                  <div className="w-full mt-1">
                                    <StatBar
                                      current={
                                        col === 0
                                          ? 3800
                                          : col === 1
                                          ? 2900
                                          : 2600
                                      }
                                      max={4200}
                                      type="hp"
                                      showLabel={false}
                                      height="sm"
                                      size="full"
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className="text-slate-600 text-2xl">—</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-xs text-slate-500 text-center">
                        — 我方阵营 (前排) —
                      </div>
                    </div>
                  </div>
                </div>

                {currentStep && (
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-900/80 via-indigo-900/40 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {(() => {
                          const actorHero = getHeroTemplate(currentStep.actorId);
                          const isAlly = selectedLog.allyHeroIds.includes(
                            currentStep.actorId,
                          );
                          return (
                            <div
                              className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center text-3xl border-2',
                                isAlly
                                  ? 'bg-cyan-900/50 border-cyan-400/50'
                                  : 'bg-red-900/50 border-red-400/50',
                              )}
                            >
                              {actorHero?.avatar || '❓'}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-600/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold">
                            回合 {currentStep.turn}
                          </span>
                          <span className="text-white font-bold">
                            {getHeroTemplate(currentStep.actorId)?.name ||
                              '未知'}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-bold',
                              currentStep.action === '释放技能'
                                ? 'bg-purple-600/30 border border-purple-400/40 text-purple-200'
                                : 'bg-orange-600/30 border border-orange-400/40 text-orange-200',
                            )}
                          >
                            {currentStep.action}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {currentStep.results.map((r, idx) => {
                            const targetHero = getHeroTemplate(r.targetId);
                            const isKeyDamage = r.damage && r.damage >= 500;
                            const isKeyHeal = r.heal && r.heal >= 300;
                            const isKeyShield = (r.shieldAbsorbed || 0) >= 200 || (r.shieldGained || 0) >= 200;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  'flex flex-wrap items-center gap-2 text-sm rounded-lg px-3 py-1.5 border',
                                  isKeyDamage || isKeyHeal || isKeyShield
                                    ? 'bg-amber-950/30 border-amber-500/30'
                                    : 'bg-black/20 border-transparent',
                                )}
                              >
                                <span className="text-slate-400">→</span>
                                <span className="text-lg">
                                  {targetHero?.avatar || '❓'}
                                </span>
                                <span className="text-slate-200">
                                  {targetHero?.name || '未知'}
                                </span>
                                <div className="ml-auto flex flex-wrap gap-1 items-center justify-end">
                                  {r.damage !== undefined && (
                                    <span
                                      className={cn(
                                        'font-bold tabular-nums px-2 py-0.5 rounded-md',
                                        r.isCrit
                                          ? 'text-orange-300 bg-orange-950/50 text-base'
                                          : 'text-red-400 bg-red-950/30',
                                      )}
                                    >
                                      {r.isCrit && '💥 '}-
                                      {r.damage.toLocaleString()}
                                      {r.isCrit && ' (暴击!)'}
                                    </span>
                                  )}
                                  {r.shieldAbsorbed ? (
                                    <span className="text-sky-300 font-bold tabular-nums px-2 py-0.5 rounded-md bg-sky-950/30">
                                      🛡️ 吸收 {r.shieldAbsorbed}
                                    </span>
                                  ) : null}
                                  {r.shieldGained ? (
                                    <span className="text-cyan-300 font-bold tabular-nums px-2 py-0.5 rounded-md bg-cyan-950/30">
                                      +{r.shieldGained} 护盾
                                    </span>
                                  ) : null}
                                  {r.heal !== undefined && (
                                    <span className="text-green-400 font-bold tabular-nums px-2 py-0.5 rounded-md bg-emerald-950/30">
                                      +{r.heal.toLocaleString()}
                                    </span>
                                  )}
                                  {r.buffsAdded?.length
                                    ? r.buffsAdded.map((b, bi) => (
                                        <span
                                          key={bi}
                                          className={cn(
                                            'text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums',
                                            b.type === '增益'
                                              ? 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                                              : b.type === '减益'
                                              ? 'bg-purple-950/40 text-purple-300 border border-purple-500/30'
                                              : 'bg-slate-950/40 text-slate-300',
                                          )}
                                        >
                                          [{b.name}] {b.duration}回合
                                        </span>
                                      ))
                                    : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">
                        步骤 {currentStepIndex + 1} /{' '}
                        {selectedLog.steps.length}
                      </span>
                      <span className="text-xs text-cyan-300 font-mono tabular-nums">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={selectedLog.steps.length - 1}
                        value={currentStepIndex}
                        onChange={(e) => {
                          setCurrentStepIndex(Number(e.target.value));
                          setIsPlaying(false);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      className="p-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={skipToStart}
                      title="跳到开始"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      className="p-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      title="上一步"
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      className={cn(
                        'p-4 rounded-2xl border-2 text-white transition-all shadow-lg',
                        isPlaying
                          ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400/60 shadow-red-500/40'
                          : 'bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400/60 shadow-cyan-500/40',
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPlaying(!isPlaying)}
                      title={isPlaying ? '暂停' : '播放'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                      )}
                    </motion.button>

                    <motion.button
                      className="p-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextStep}
                      disabled={
                        currentStepIndex >= selectedLog.steps.length - 1
                      }
                      title="下一步"
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      className="p-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={skipToEnd}
                      title="跳到结尾"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>

                    <div className="w-px h-10 bg-white/10 mx-2" />

                    <motion.button
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all font-bold text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cycleSpeed}
                      title="切换倍速"
                    >
                      <FastForward className="w-4 h-4" />
                      {speed}x
                    </motion.button>
                  </div>

                  <div className="mt-3 text-center text-xs text-slate-500">
                    当前回合：
                    <span className="text-cyan-300 font-bold mx-1">
                      {currentStep?.turn || 1}
                    </span>
                    / {selectedLog.totalTurns}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="导出战斗录像"
        size="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <GameButton
              variant="secondary"
              onClick={() => setShowExportModal(false)}
            >
              关闭
            </GameButton>
            <GameButton variant="secondary" onClick={copyToClipboard}>
              复制 JSON
            </GameButton>
            <GameButton variant="primary" onClick={downloadJson}>
              下载文件
            </GameButton>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            战斗录像已导出为 JSON 格式，您可以下载保存或复制分享。
          </p>
          <div className="bg-black/40 rounded-xl border border-white/10 p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
              {exportJson}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}

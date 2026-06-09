import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Play,
  Pause,
  Gauge,
  Swords,
  Shield,
  Clock,
  Star,
  Coins,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Zap,
  Heart,
  Skull,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBattleStore } from '@/store/useBattleStore';
import { useGameStore } from '@/store/useGameStore';
import { heroes as heroTemplates } from '@/data/heroes';
import { skills as skillData } from '@/data/skills';
import { levels } from '@/data/levels';
import { enemyAiTurn } from '@/utils/ai';
import { HeroAvatar } from '@/components/common/HeroAvatar';
import { StatBar } from '@/components/common/StatBar';
import { GameButton } from '@/components/common/GameButton';
import { SkillIcon } from '@/components/common/SkillIcon';
import { Modal } from '@/components/common/Modal';
import type { BattleHero, BattleStep, SkillTemplate } from '@/types';
import type { Skill } from '@/data/skills';

const GRID_ROWS = 4;
const GRID_COLS = 6;
const SPEED_OPTIONS = [1, 2, 4];

interface FloatingDamage {
  id: string;
  instanceId: string;
  value: number;
  type: 'damage' | 'heal' | 'crit';
}

interface BattleBoardProps {}

export default function BattleBoard(_props: BattleBoardProps) {
  const navigate = useNavigate();
  const { levelId = 'level_1_1' } = useParams<{ levelId: string }>();

  const {
    turn,
    battleHeroes,
    actionOrder,
    currentActorIndex,
    selectedAction,
    selectedSkillId,
    validTargets,
    battleSteps,
    battleResult,
    rewards,
    isPlayerTurn,
    startBattle,
    nextActor,
    setSelectedAction,
    executeAction,
    checkBattleEnd,
    endBattle,
    findSkillById,
  } = useBattleStore();

  const {
    heroInstances,
    lineups,
    currentLineupId,
    settings,
    updateSettings,
    completeLevel,
  } = useGameStore();

  const [showGiveUp, setShowGiveUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [autoBattle, setAutoBattle] = useState(settings.autoBattle);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [battleStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [skillFlashHeroId, setSkillFlashHeroId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const actionLockRef = useRef(false);
  const damageIdRef = useRef(0);

  const currentActorId = actionOrder[currentActorIndex];
  const currentActor = battleHeroes.find((h) => h.instanceId === currentActorId);

  const startedRef = useRef(false);

  const currentLevel = useMemo(() => levels.find((l: any) => l.id === levelId), [levelId]);

  const currentLineup = useMemo(
    () => lineups.find((l) => l.id === currentLineupId) || lineups[0],
    [lineups, currentLineupId]
  );

  const battleSpeed = SPEED_OPTIONS[speedIndex];
  const actionDelay = 1000 / battleSpeed;

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - battleStartTime) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [battleStartTime]);

  useEffect(() => {
    if (startedRef.current) return;
    if (!currentLineup || heroInstances.length === 0) return;
    if (currentLineup.slots.length === 0) return;
    startedRef.current = true;
    startBattle(levelId, currentLineup, heroInstances);
  }, [levelId, currentLineup, heroInstances, startBattle]);

  useEffect(() => {
    if (!currentActor || battleResult || actionLockRef.current) return;

    if (!isPlayerTurn || autoBattle) {
      actionLockRef.current = true;
      timerRef.current = window.setTimeout(() => {
        if (!currentActor.isAlly) {
          executeEnemyTurn();
        } else {
          executeAutoAllyTurn();
        }
      }, actionDelay * 0.6);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentActorIndex, isPlayerTurn, battleResult, autoBattle, battleHeroes.length]);

  useEffect(() => {
    const endResult = checkBattleEnd();
    if (endResult && !battleResult) {
      let starReward = 0;
      if (endResult === 'win') {
        const alliesDead = battleHeroes.filter((h) => h.isAlly && h.isDead).length;
        const noDeath = alliesDead === 0;
        const fastClear = turn <= 12;
        starReward = 1;
        if (fastClear) starReward = 2;
        if (fastClear && noDeath) starReward = 3;
      }
      const levelRewards: any = currentLevel?.reward
        ? {
            base: [
              { type: '金币' as const, count: currentLevel.reward.gold },
              { type: '经验' as const, count: currentLevel.reward.exp },
            ],
          }
        : null;
      endBattle(endResult, levelRewards);
      if (endResult === 'win') {
        completeLevel(levelId, starReward, levelRewards);
      }
    }
  }, [battleHeroes, battleResult]);

  const getHeroTemplate = (templateId: string) => {
    return heroTemplates.find((h) => h.id === templateId);
  };

  const getHeroSkills = (templateId: string): Skill[] => {
    const tpl = getHeroTemplate(templateId);
    if (!tpl) return [];
    return tpl.skillIds
      .map((sid) => skillData.find((s) => s.id === sid))
      .filter(Boolean) as Skill[];
  };

  const getSkillTemplate = (skillId: string): SkillTemplate | null => {
    return findSkillById(skillId);
  };

  const addFloatingDamage = (instanceId: string, value: number, type: FloatingDamage['type']) => {
    const id = `dmg_${++damageIdRef.current}_${Date.now()}`;
    setFloatingDamages((prev) => [...prev, { id, instanceId, value, type }]);
    window.setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== id));
    }, 900);
  };

  const processFloatingFromStep = (step: BattleStep) => {
    for (const r of step.results) {
      if (r.damage && r.damage > 0) {
        addFloatingDamage(r.targetId, r.damage, r.isCrit ? 'crit' : 'damage');
      }
      if (r.heal && r.heal > 0) {
        addFloatingDamage(r.targetId, r.heal, 'heal');
      }
    }
    if (step.action === '释放技能' || step.action === '普通攻击') {
      setSkillFlashHeroId(step.actorId);
      window.setTimeout(() => setSkillFlashHeroId(null), 450);
    }
  };

  useEffect(() => {
    if (battleSteps.length === 0) return;
    const lastStep = battleSteps[battleSteps.length - 1];
    processFloatingFromStep(lastStep);
  }, [battleSteps.length]);

  const executeEnemyTurn = () => {
    if (!currentActor || currentActor.isAlly) {
      actionLockRef.current = false;
      return;
    }

    const allHeroes = useBattleStore.getState().battleHeroes;
    const allies = allHeroes.filter((h) => h.isAlly);
    const decision = enemyAiTurn(currentActor, allHeroes, allies);

    let action: 'attack' | 'skill' | 'defend' | 'wait' = 'attack';
    let skillId: string | undefined;
    let targets: string[] = decision.targetIds;

    if (decision.action === '释放技能' && decision.skillId) {
      action = 'skill';
      skillId = decision.skillId;
    } else if (decision.action === '待机') {
      action = 'wait';
      targets = [];
    }

    const results = executeAction(currentActor.instanceId, action, targets, skillId);

    timerRef.current = window.setTimeout(() => {
      actionLockRef.current = false;
      nextActor();
    }, actionDelay);

    void results;
  };

  const executeAutoAllyTurn = () => {
    if (!currentActor || !currentActor.isAlly) {
      actionLockRef.current = false;
      return;
    }

    const enemies = battleHeroes.filter((h) => !h.isAlly && !h.isDead);
    if (enemies.length === 0) {
      actionLockRef.current = false;
      nextActor();
      return;
    }

    const target = enemies.reduce((best, e) =>
      e.currentHP / e.maxHP < best.currentHP / best.maxHP ? e : best
    );

    const results = executeAction(currentActor.instanceId, 'attack', [target.instanceId]);

    timerRef.current = window.setTimeout(() => {
      actionLockRef.current = false;
      nextActor();
    }, actionDelay);

    void results;
  };

  const handleCellClick = (hero: BattleHero | null) => {
    if (!currentActor || !currentActor.isAlly || battleResult || actionLockRef.current) return;

    if (selectedAction === null) return;

    if (selectedAction === 'defend' || selectedAction === 'wait') {
      actionLockRef.current = true;
      const results = executeAction(currentActor.instanceId, selectedAction, []);
      timerRef.current = window.setTimeout(() => {
        actionLockRef.current = false;
        nextActor();
      }, actionDelay);
      void results;
      return;
    }

    if (!hero) return;

    if (!validTargets.includes(hero.instanceId)) return;

    let action: 'attack' | 'skill' = 'attack';
    let skillId: string | undefined;
    let targets: string[] = [hero.instanceId];

    if (selectedAction === 'skill' && selectedSkillId) {
      action = 'skill';
      skillId = selectedSkillId;
      const tpl = getSkillTemplate(selectedSkillId);
      if (tpl && (tpl.range.type === '全体' || tpl.range.type === '自身')) {
        targets = validTargets;
      }
    }

    actionLockRef.current = true;
    const results = executeAction(currentActor.instanceId, action, targets, skillId);

    timerRef.current = window.setTimeout(() => {
      actionLockRef.current = false;
      nextActor();
    }, actionDelay);

    void results;
  };

  const handleSelectAction = (action: 'attack' | 'skill' | 'defend' | 'wait', skillId?: string) => {
    if (!currentActor || !currentActor.isAlly || battleResult) return;
    if (action === 'skill' && skillId) {
      const skill = getHeroSkills(currentActor.templateId).find((s) => s.id === skillId);
      if (!skill) return;
      const cd = currentActor.skillCooldowns[skillId] || 0;
      if (cd > 0) return;
      if (currentActor.currentEnergy < skill.manaCost) return;
    }
    setSelectedAction(action, skillId);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStepLog = (step: BattleStep) => {
    const actor = battleHeroes.find((h) => h.instanceId === step.actorId);
    const actorTpl = actor ? getHeroTemplate(actor.templateId) : null;
    const actorName = actorTpl?.name || '未知';

    let skillName = '';
    if (step.skillId) {
      const sk = skillData.find((s) => s.id === step.skillId);
      skillName = sk?.name || '';
    }

    const targetParts: string[] = [];
    for (const r of step.results) {
      const tgt = battleHeroes.find((h) => h.instanceId === r.targetId);
      const tpl = tgt ? getHeroTemplate(tgt.templateId) : null;
      const tName = tpl?.name || '未知';
      const extras: string[] = [];
      if (r.damage) extras.push(`造成 ${r.damage} 伤害`);
      if (r.heal) extras.push(`恢复 ${r.heal} 生命`);
      if (r.isCrit) extras.push('暴击！');
      if (r.shieldAbsorbed) extras.push(`护盾吸收 ${r.shieldAbsorbed}`);
      targetParts.push(`对 ${tName} ${extras.join(' ')}`);
    }

    let actionStr = '';
    switch (step.action) {
      case '普通攻击':
        actionStr = '普通攻击';
        break;
      case '释放技能':
        actionStr = `使用 ${skillName}`;
        break;
      case '防御':
        actionStr = '进入防御姿态';
        break;
      case '待机':
        actionStr = '选择待机';
        break;
      default:
        actionStr = step.action;
    }

    return `[回合${step.turn}] ${actorName} ${actionStr}${targetParts.length ? ' ' + targetParts.join('，') : ''}`;
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isEnemyZone = row < 2;
        const hero = battleHeroes.find((h) => {
          return h.position.row === row && h.position.col === col;
        });
        const isCurrentActor = hero?.instanceId === currentActorId;
        const isValidTarget = hero && validTargets.includes(hero.instanceId);
        const isSkillMode = selectedAction === 'skill' || selectedAction === 'attack';
        const isTargetable = isSkillMode && isValidTarget;
        const isNonTargetable = isSkillMode && hero && !isValidTarget && !hero.isDead;

        cells.push(
          <motion.div
            key={`cell-${row}-${col}`}
            className={cn(
              'relative flex items-center justify-center rounded-xl transition-all duration-200',
              'border',
              isEnemyZone ? 'cell-enemy bg-red-950/20 border-red-500/20' : 'cell-ally bg-blue-950/20 border-blue-500/20',
              isTargetable && 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900/50 cursor-pointer',
              isNonTargetable && 'opacity-50',
              !hero && !isEnemyZone && 'bg-gradient-to-br from-blue-900/10 to-transparent',
              !hero && isEnemyZone && 'bg-gradient-to-br from-red-900/10 to-transparent'
            )}
            onClick={() => handleCellClick(hero || null)}
            whileHover={isTargetable ? { scale: 1.02 } : undefined}
          >
            <AnimatePresence>
              {isTargetable && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    boxShadow: [
                      '0 0 0 0 rgba(250,204,21,0.6)',
                      '0 0 20px 4px rgba(250,204,21,0.5)',
                      '0 0 0 0 rgba(250,204,21,0.6)',
                    ],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </AnimatePresence>

            {hero && (
              <div className="relative flex flex-col items-center gap-1 w-full h-full justify-center py-1">
                <motion.div
                  animate={isCurrentActor ? { scale: [1, 1.08, 1] } : {}}
                  transition={isCurrentActor ? { duration: 1, repeat: Infinity } : {}}
                >
                  <HeroAvatar
                    avatar={getHeroTemplate(hero.templateId)?.avatar || '❓'}
                    name={getHeroTemplate(hero.templateId)?.name || ''}
                    role={getHeroTemplate(hero.templateId)?.className || ''}
                    size="lg"
                    isDead={hero.isDead}
                    isEnemy={!hero.isAlly}
                    selected={isCurrentActor}
                  />
                </motion.div>

                <div className="w-20">
                  <StatBar
                    current={hero.currentHP}
                    max={hero.maxHP}
                    type="hp"
                    showLabel={false}
                    height="sm"
                    size="full"
                  />
                </div>

                <AnimatePresence>
                  {skillFlashHeroId === hero.instanceId && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none z-20"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.9, 0],
                        boxShadow: [
                          'inset 0 0 0 rgba(250,204,21,0)',
                          'inset 0 0 40px rgba(250,204,21,0.9)',
                          'inset 0 0 0 rgba(250,204,21,0)',
                        ],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative w-full flex items-center justify-center pointer-events-none">
                  {floatingDamages
                    .filter((d) => d.instanceId === hero.instanceId)
                    .map((d) => (
                      <motion.div
                        key={d.id}
                        initial={{ y: 0, opacity: 1, scale: 0.5 }}
                        animate={{ y: -48, opacity: 0, scale: 1.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className={cn(
                          'absolute font-black text-2xl drop-shadow-lg z-30 tabular-nums',
                          d.type === 'damage' && 'text-red-400 text-glow-red',
                          d.type === 'crit' && 'text-yellow-300 text-glow text-3xl',
                          d.type === 'heal' && 'text-emerald-400'
                        )}
                        style={{ textShadow: '0 0 12px currentColor, 2px 2px 0 rgba(0,0,0,0.8)' }}
                      >
                        {d.type === 'heal' ? '+' : '-'}{d.value}
                        {d.type === 'crit' && <span className="text-sm ml-1">暴击!</span>}
                      </motion.div>
                    ))}
                </div>

                {isCurrentActor && (
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap z-10"
                    style={{
                      background: 'linear-gradient(90deg, #facc15, #f59e0b)',
                      color: '#422006',
                      boxShadow: '0 0 12px rgba(250,204,21,0.6)',
                    }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ⚔ 行动中
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        );
      }
    }
    return cells;
  };

  const renderActionBar = () => {
    return (
      <div className="flex items-center gap-3 h-full px-4 overflow-x-auto">
        {actionOrder.map((id, idx) => {
          const hero = battleHeroes.find((h) => h.instanceId === id);
          if (!hero) return null;
          const tpl = getHeroTemplate(hero.templateId);
          const isCurrent = idx === currentActorIndex;
          const hasActed = hero.actedThisTurn || hero.isDead;
          return (
            <motion.div
              key={id}
              className={cn(
                'relative flex-shrink-0 flex flex-col items-center gap-1 transition-all',
                isCurrent && 'z-10'
              )}
              animate={isCurrent ? { y: -4, scale: 1.1 } : {}}
            >
              <HeroAvatar
                avatar={tpl?.avatar || '❓'}
                name={tpl?.name || ''}
                role={tpl?.className || ''}
                size="sm"
                isDead={hero.isDead}
                isEnemy={!hero.isAlly}
              />
              <div className="w-12">
                <StatBar
                  current={hero.currentHP}
                  max={hero.maxHP}
                  type="hp"
                  showLabel={false}
                  height="sm"
                  size="full"
                />
              </div>
              {isCurrent && (
                <motion.div
                  className="absolute -inset-2 rounded-full pointer-events-none"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    boxShadow: [
                      '0 0 0 0 rgba(250,204,21,0.7)',
                      '0 0 18px 4px rgba(250,204,21,0.6)',
                      '0 0 0 0 rgba(250,204,21,0.7)',
                    ],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              {hasActed && !isCurrent && (
                <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-[1px] pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderRightPanel = () => {
    if (!currentActor) {
      return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
          等待战斗开始...
        </div>
      );
    }
    const tpl = getHeroTemplate(currentActor.templateId);
    const actorSkills = getHeroSkills(currentActor.templateId);
    const activeSkills = actorSkills.filter((s) => !s.isPassive).slice(0, 3);

    return (
      <div className="h-full flex flex-col gap-3 p-3 overflow-y-auto">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-yellow-500/20">
          <HeroAvatar
            avatar={tpl?.avatar || '❓'}
            name={tpl?.name || ''}
            role={tpl?.className || ''}
            size="lg"
            isEnemy={!currentActor.isAlly}
            isDead={currentActor.isDead}
          />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base truncate">{tpl?.name}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  tpl?.heroClass === 'tank' && 'bg-blue-900/60 text-blue-300 border border-blue-500/30',
                  tpl?.heroClass === 'warrior' && 'bg-red-900/60 text-red-300 border border-red-500/30',
                  tpl?.heroClass === 'assassin' && 'bg-violet-900/60 text-violet-300 border border-violet-500/30',
                  tpl?.heroClass === 'mage' && 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/30',
                  tpl?.heroClass === 'marksman' && 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30',
                  tpl?.heroClass === 'support' && 'bg-teal-900/60 text-teal-300 border border-teal-500/30'
                )}
              >
                {tpl?.className}
              </span>
            </div>
            <StatBar current={currentActor.currentHP} max={currentActor.maxHP} type="hp" height="sm" size="full" />
            <StatBar current={currentActor.currentEnergy} max={currentActor.maxEnergy} type="energy" height="sm" size="full" />
          </div>
        </div>

        {currentActor.buffs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900/40 border border-white/5">
            {currentActor.buffs.map((b) => (
              <div
                key={b.id}
                title={`${b.name} (剩余${b.duration}回合)`}
                className={cn(
                  'relative w-8 h-8 flex items-center justify-center rounded-lg text-sm cursor-help border',
                  b.type === '增益' && 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300',
                  b.type === '减益' && 'bg-rose-900/60 border-rose-500/40 text-rose-300',
                  b.type === '控制' && 'bg-violet-900/60 border-violet-500/40 text-violet-300'
                )}
              >
                {b.type === '增益' ? '⬆' : b.type === '减益' ? '⬇' : '💫'}
                <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-slate-800 px-1 rounded border border-white/20 text-white">
                  {b.duration}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {activeSkills.map((sk) => {
            const cd = currentActor.skillCooldowns[sk.id] || 0;
            const noEnergy = currentActor.currentEnergy < sk.manaCost;
            return (
              <div
                key={sk.id}
                className={cn(
                  'relative rounded-xl overflow-hidden transition-all',
                  selectedSkillId === sk.id && 'ring-2 ring-yellow-400',
                  noEnergy && cd === 0 && 'ring-2 ring-red-500/60'
                )}
              >
                <SkillIcon
                  skill={sk}
                  cooldown={cd}
                  isReady={cd === 0 && !noEnergy}
                  isActive={selectedSkillId === sk.id}
                  onClick={() => handleSelectAction('skill', sk.id)}
                  size="md"
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-auto">
          <GameButton
            size="sm"
            variant="danger"
            icon={<Swords className="w-4 h-4" />}
            disabled={!currentActor.isAlly || !!battleResult || actionLockRef.current}
            onClick={() => handleSelectAction('attack')}
          >
            普攻
          </GameButton>
          <GameButton
            size="sm"
            variant="secondary"
            icon={<Shield className="w-4 h-4" />}
            disabled={!currentActor.isAlly || !!battleResult || actionLockRef.current}
            onClick={() => handleSelectAction('defend')}
          >
            防御
          </GameButton>
          <GameButton
            size="sm"
            variant="ghost"
            icon={<Clock className="w-4 h-4" />}
            disabled={!currentActor.isAlly || !!battleResult || actionLockRef.current}
            onClick={() => handleSelectAction('wait')}
          >
            待机
          </GameButton>
        </div>
      </div>
    );
  };

  const renderBattleLog = () => {
    const recentSteps = battleSteps.slice(-10);
    return (
      <div className="h-full p-3 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10 overflow-y-auto flex flex-col-reverse gap-1">
        {recentSteps.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-4">战斗日志将显示在此处...</div>
        )}
        {recentSteps.map((step, i) => {
          const colorClass =
            step.action === '普通攻击'
              ? 'text-red-300'
              : step.action === '释放技能'
              ? 'text-yellow-300'
              : step.action === '防御'
              ? 'text-blue-300'
              : 'text-slate-400';
          return (
            <motion.div
              key={`${step.timestamp}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn('text-xs leading-relaxed', colorClass)}
            >
              {formatStepLog(step)}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const aliveAllies = battleHeroes.filter((h) => h.isAlly && !h.isDead).length;
  const aliveEnemies = battleHeroes.filter((h) => !h.isAlly && !h.isDead).length;
  const totalEnemies = battleHeroes.filter((h) => !h.isAlly).length;

  return (
    <div className="game-bg w-screen h-screen overflow-hidden relative flex flex-col">
      {/* 顶部状态栏 8% */}
      <div className="h-[8%] min-h-[60px] flex items-center px-4 border-b border-yellow-500/20 bg-slate-950/50 backdrop-blur-sm z-30">
        <div className="flex items-center gap-4 flex-1">
          <motion.button
            onClick={() => setShowGiveUp(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-slate-800/80 border border-red-500/30 text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex flex-col">
            <div className="text-sm text-slate-400">关卡</div>
            <div className="font-bold text-yellow-300 text-glow text-lg">
              {currentLevel?.stageName || currentLevel?.fullName || '未知关卡'}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-900/60 to-yellow-900/60 border border-yellow-500/40">
              <span className="font-black text-2xl text-yellow-200 text-glow tabular-nums">
                第 {turn} 回合
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-200 tabular-nums font-mono">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">
              <span className="text-blue-300">{aliveAllies}</span>
              <span className="text-slate-500"> / </span>
              <span className="text-red-400">{aliveEnemies}</span>
              <span className="text-slate-500 text-xs"> ({totalEnemies})</span>
            </span>
          </div>

          <motion.button
            onClick={() => {
              const next = (speedIndex + 1) % SPEED_OPTIONS.length;
              setSpeedIndex(next);
              updateSettings({ battleSpeed: SPEED_OPTIONS[next] });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-yellow-500/30 hover:bg-yellow-900/30 transition-colors"
          >
            <Gauge className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-yellow-300 tabular-nums">{SPEED_OPTIONS[speedIndex]}x</span>
          </motion.button>

          <motion.button
            onClick={() => {
              setAutoBattle((v) => {
                updateSettings({ autoBattle: !v });
                return !v;
              });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors',
              autoBattle
                ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-white/10 text-slate-400 hover:bg-slate-700/60'
            )}
          >
            {autoBattle ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="font-bold text-sm">{autoBattle ? '自动中' : '手动'}</span>
          </motion.button>

          <motion.button
            onClick={() => setShowSettings(true)}
            whileHover={{ scale: 1.05, rotate: 45 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* 上方行动条 10% */}
      <div className="h-[10%] min-h-[70px] bg-gradient-to-b from-slate-900/60 to-slate-900/30 border-b border-white/5">
        {renderActionBar()}
      </div>

      {/* 中部区域：棋盘 + 右侧面板 */}
      <div className="h-[70%] flex gap-3 p-3">
        {/* 棋盘 60% 高度的核心区域 - 这里占 flex-1 */}
        <div className="flex-1 h-full relative">
          <div
            className="w-full h-full rounded-2xl p-4"
            style={{
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(2,6,23,0.95) 100%)',
              border: '2px solid rgba(234,179,8,0.25)',
              boxShadow:
                'inset 0 0 80px rgba(0,0,0,0.6), 0 0 40px rgba(30,58,138,0.2)',
            }}
          >
            <div
              className="w-full h-full grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              }}
            >
              {renderGrid()}
            </div>
          </div>
        </div>

        {/* 右侧信息面板 20%宽 */}
        <div className="w-[20%] min-w-[260px] h-full rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-yellow-500/20">
          {renderRightPanel()}
        </div>
      </div>

      {/* 底部战斗日志 12% */}
      <div className="h-[12%] min-h-[80px] px-3 pb-3">
        {renderBattleLog()}
      </div>

      {/* 放弃战斗确认弹窗 */}
      <Modal
        isOpen={showGiveUp}
        onClose={() => setShowGiveUp(false)}
        title="放弃战斗"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <GameButton variant="secondary" onClick={() => setShowGiveUp(false)}>
              继续战斗
            </GameButton>
            <GameButton
              variant="danger"
              icon={<Skull className="w-4 h-4" />}
              onClick={() => {
                setShowGiveUp(false);
                endBattle('lose');
                navigate(-1);
              }}
            >
              确认放弃
            </GameButton>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-20 h-20 rounded-full bg-red-900/40 border-2 border-red-500/50 flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-medium">确定要放弃这场战斗吗？</p>
            <p className="text-sm text-slate-400 mt-1">放弃将视为战斗失败，且无法获得任何奖励。</p>
          </div>
        </div>
      </Modal>

      {/* 设置弹窗 */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="战斗设置" size="sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/10">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-200">战斗倍速</span>
            </div>
            <div className="flex gap-1">
              {SPEED_OPTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => {
                    setSpeedIndex(i);
                    updateSettings({ battleSpeed: s });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-bold transition-colors',
                    speedIndex === i
                      ? 'bg-yellow-500 text-yellow-950'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'
                  )}
                >
                  {s}x
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-200">自动战斗</span>
            </div>
            <motion.button
              onClick={() => {
                setAutoBattle((v) => {
                  updateSettings({ autoBattle: !v });
                  return !v;
                });
              }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative w-14 h-8 rounded-full transition-colors',
                autoBattle ? 'bg-emerald-500' : 'bg-slate-600'
              )}
            >
              <motion.div
                className="absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-lg"
                animate={{ left: autoBattle ? 'calc(100% - 30px)' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* 战斗结算 Modal */}
      <Modal
        isOpen={!!battleResult}
        onClose={() => {}}
        closable={false}
        size="lg"
        footer={
          <div className="flex justify-center gap-4">
            {battleResult === 'win' ? (
              <GameButton
                variant="primary"
                size="lg"
                icon={<ChevronRight className="w-5 h-5" />}
                onClick={() => navigate(-1)}
              >
                继续
              </GameButton>
            ) : (
              <GameButton
                variant="secondary"
                size="lg"
                icon={<RefreshCw className="w-5 h-5" />}
                onClick={() => navigate(-1)}
              >
                调整阵容
              </GameButton>
            )}
          </div>
        }
      >
        {battleResult === 'win' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="text-6xl"
            >
              🏆
            </motion.div>
            <h2
              className="text-4xl font-black tracking-wider"
              style={{
                background: 'linear-gradient(180deg, #fde047 0%, #f59e0b 60%, #b45309 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(250,204,21,0.4)',
              }}
            >
              战斗胜利
            </h2>

            <div className="flex gap-3">
              {[1, 2, 3].map((s) => {
                const stars = rewards ? 3 : 1;
                const got = s <= stars;
                return (
                  <motion.div
                    key={s}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.25 + s * 0.12 }}
                  >
                    <Star
                      className={cn(
                        'w-16 h-16 drop-shadow-lg',
                        got
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-slate-700/50 text-slate-600'
                      )}
                      style={
                        got
                          ? { filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.8))' }
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </div>

            <div className="w-full p-4 rounded-2xl bg-slate-800/50 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-300">战斗奖励</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-900/60 border border-yellow-500/20"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-900/40 flex items-center justify-center border border-yellow-500/30">
                    <Coins className="w-7 h-7 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-black text-yellow-300 tabular-nums">
                    +{currentLevel?.reward?.gold || 500}
                  </div>
                  <div className="text-xs text-slate-400">金币</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-900/40 flex items-center justify-center border border-cyan-500/30">
                    <Sparkles className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-300 tabular-nums">
                    +{turn * 50 + 200}
                  </div>
                  <div className="text-xs text-slate-400">经验</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-900/60 border border-purple-500/20"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-900/40 flex items-center justify-center border border-purple-500/30">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <div className="text-lg font-bold text-purple-300">{turn < 8 ? '史诗' : '稀有'}</div>
                  <div className="text-xs text-slate-400">装备掉落</div>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full text-center text-sm">
              <div>
                <div className="text-slate-400">总回合</div>
                <div className="text-xl font-bold text-white tabular-nums">{turn}</div>
              </div>
              <div>
                <div className="text-slate-400">用时</div>
                <div className="text-xl font-bold text-white tabular-nums">{formatTime(elapsedTime)}</div>
              </div>
              <div>
                <div className="text-slate-400">存活英雄</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">
                  {aliveAllies}/{battleHeroes.filter((h) => h.isAlly).length}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-slate-800/80 border-2 border-red-500/40 flex items-center justify-center"
            >
              <Skull className="w-14 h-14 text-red-400" />
            </motion.div>
            <h2 className="text-4xl font-black text-red-400 tracking-wider" style={{ textShadow: '0 0 30px rgba(220,38,38,0.5)' }}>
              战斗失败
            </h2>

            <div className="w-full p-4 rounded-2xl bg-slate-800/50 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-300">失败分析</span>
              </div>
              <ul className="space-y-2 text-sm">
                {aliveAllies === 0 && (
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="text-red-400">✗</span>
                    所有英雄已阵亡
                  </li>
                )}
                {turn > 20 && (
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="text-yellow-400">⚠</span>
                    战斗回合过多，建议提升英雄等级
                  </li>
                )}
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-yellow-400">💡</span>
                  建议调整阵容站位，将坦克英雄置于前排
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-yellow-400">💡</span>
                  尝试搭配辅助英雄提供治疗和增益
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full text-center text-sm">
              <div>
                <div className="text-slate-400">坚持回合</div>
                <div className="text-xl font-bold text-white tabular-nums">{turn}</div>
              </div>
              <div>
                <div className="text-slate-400">用时</div>
                <div className="text-xl font-bold text-white tabular-nums">{formatTime(elapsedTime)}</div>
              </div>
              <div>
                <div className="text-slate-400">剩余敌人</div>
                <div className="text-xl font-bold text-red-400 tabular-nums">
                  {aliveEnemies}/{totalEnemies}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}

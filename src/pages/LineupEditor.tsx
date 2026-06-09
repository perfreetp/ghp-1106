import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Save,
  RotateCcw,
  Heart,
  Sword,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { heroes as heroTemplates, type Hero } from '@/data/heroes';
import { useGameStore } from '@/store/useGameStore';
import { HeroAvatar } from '@/components/common/HeroAvatar';
import { GameButton } from '@/components/common/GameButton';
import { Modal } from '@/components/common/Modal';
import type { Lineup, LineupSlot, Position, HeroInstance } from '@/types';

const BOARD_COLS = 6;
const BOARD_ROWS = 4;
const MAX_HEROES = 5;
const ENEMY_ROWS = 2;

const CLASS_COLORS: Record<string, string> = {
  战士: 'border-red-500/50 bg-red-500/10',
  法师: 'border-blue-500/50 bg-blue-500/10',
  坦克: 'border-green-500/50 bg-green-500/10',
  刺客: 'border-purple-500/50 bg-purple-500/10',
  射手: 'border-orange-500/50 bg-orange-500/10',
  辅助: 'border-cyan-500/50 bg-cyan-500/10',
};

const CLASS_ICONS: Record<string, string> = {
  战士: '🗡️',
  法师: '🔮',
  坦克: '🛡️',
  刺客: '🥷',
  射手: '🏹',
  辅助: '💫',
};

const REQUIRED_CLASSES: Record<string, string> = {
  坦克: '缺少坦克，前排防御较弱',
  辅助: '缺少辅助，队伍续航不足',
};

interface DragData {
  type: 'hero-pool' | 'board';
  heroInstanceId?: string;
  position?: Position;
}

export default function LineupEditor() {
  const navigate = useNavigate();
  const store = useGameStore();

  const [selectedLineupId, setSelectedLineupId] = useState<string>(
    store.currentLineupId || store.lineups[0]?.id || '',
  );
  const [slots, setSlots] = useState<LineupSlot[]>([]);
  const [selectedHeroInstanceId, setSelectedHeroInstanceId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Position | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewLineupModal, setShowNewLineupModal] = useState(false);
  const [newLineupName, setNewLineupName] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const lineup = store.lineups.find((l) => l.id === selectedLineupId);
    setSlots(lineup ? [...lineup.slots] : []);
    setSelectedHeroInstanceId(null);
  }, [selectedLineupId, store.lineups]);

  const currentLineup = useMemo(
    () => store.lineups.find((l) => l.id === selectedLineupId),
    [store.lineups, selectedLineupId],
  );

  const getHeroTemplate = (templateId: string): Hero | undefined =>
    heroTemplates.find((h) => h.id === templateId);

  const getHeroInstance = (instanceId: string): HeroInstance | undefined =>
    store.heroInstances.find((h) => h.id === instanceId);

  const calculatePower = (instanceId: string): number => {
    const inst = getHeroInstance(instanceId);
    const tpl = inst ? getHeroTemplate(inst.templateId) : undefined;
    if (!inst || !tpl) return 0;
    const starMult = 1 + (inst.star - 1) * 0.1;
    const levelMult = 1 + (inst.level - 1) * 0.05;
    const base =
      tpl.baseStats.maxHp * 0.5 +
      tpl.baseStats.attack * 3 +
      tpl.baseStats.defense * 2 +
      tpl.baseStats.speed * 1.5;
    return Math.floor(base * starMult * levelMult);
  };

  const totalPower = useMemo(
    () => slots.reduce((sum, s) => sum + calculatePower(s.heroInstanceId), 0),
    [slots],
  );

  const usedInstanceIds = useMemo(
    () => new Set(slots.map((s) => s.heroInstanceId)),
    [slots],
  );

  const availableHeroes = useMemo(
    () => store.heroInstances.filter((h) => !usedInstanceIds.has(h.id)),
    [store.heroInstances, usedInstanceIds],
  );

  const classCoverage = useMemo(() => {
    const classes = new Set<string>();
    slots.forEach((s) => {
      const inst = getHeroInstance(s.heroInstanceId);
      const tpl = inst ? getHeroTemplate(inst.templateId) : undefined;
      if (tpl) classes.add(tpl.className);
    });
    return classes;
  }, [slots]);

  const missingClassWarnings = useMemo(() => {
    const warnings: string[] = [];
    Object.entries(REQUIRED_CLASSES).forEach(([cls, msg]) => {
      if (!classCoverage.has(cls)) warnings.push(msg);
    });
    return warnings;
  }, [classCoverage]);

  const selectedInstance = selectedHeroInstanceId
    ? getHeroInstance(selectedHeroInstanceId)
    : null;
  const selectedTemplate = selectedInstance
    ? getHeroTemplate(selectedInstance.templateId)
    : null;

  const getSlotAt = (pos: Position): LineupSlot | undefined =>
    slots.find((s) => s.position.row === pos.row && s.position.col === pos.col);

  const handleDragStart = (e: React.DragEvent, data: DragData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, pos: Position) => {
    e.preventDefault();
    setDragOver(null);

    if (pos.row < ENEMY_ROWS) return;

    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data: DragData = JSON.parse(raw);

      if (data.type === 'hero-pool' && data.heroInstanceId) {
        const existingSlot = getSlotAt(pos);
        if (existingSlot) {
          setSlots((prev) =>
            prev.map((s) =>
              s.position.row === pos.row && s.position.col === pos.col
                ? { ...s, heroInstanceId: data.heroInstanceId! }
                : s,
            ),
          );
        } else {
          if (slots.length >= MAX_HEROES) return;
          setSlots((prev) => [
            ...prev,
            { heroInstanceId: data.heroInstanceId!, position: pos },
          ]);
        }
      } else if (data.type === 'board' && data.position) {
        const fromPos = data.position;
        if (fromPos.row === pos.row && fromPos.col === pos.col) return;

        const fromSlot = slots.find(
          (s) => s.position.row === fromPos.row && s.position.col === fromPos.col,
        );
        const toSlot = getSlotAt(pos);

        if (!fromSlot) return;

        if (toSlot) {
          setSlots((prev) =>
            prev.map((s) => {
              if (s.position.row === fromPos.row && s.position.col === fromPos.col) {
                return { ...s, position: { ...pos }, heroInstanceId: toSlot.heroInstanceId };
              }
              if (s.position.row === pos.row && s.position.col === pos.col) {
                return { ...s, position: { ...fromPos }, heroInstanceId: fromSlot.heroInstanceId };
              }
              return s;
            }),
          );
        } else {
          setSlots((prev) =>
            prev.map((s) =>
              s.position.row === fromPos.row && s.position.col === fromPos.col
                ? { ...s, position: { ...pos } }
                : s,
            ),
          );
        }
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const handleBoardCellClick = (pos: Position) => {
    if (pos.row < ENEMY_ROWS) return;
    const slot = getSlotAt(pos);
    if (slot) {
      setSelectedHeroInstanceId(slot.heroInstanceId);
    } else if (selectedHeroInstanceId) {
      if (slots.length >= MAX_HEROES) return;
      setSlots((prev) => [
        ...prev,
        { heroInstanceId: selectedHeroInstanceId, position: pos },
      ]);
    }
  };

  const handleHeroPoolClick = (instanceId: string) => {
    setSelectedHeroInstanceId(instanceId);
  };

  const handleRemoveHero = () => {
    if (!selectedHeroInstanceId) return;
    setSlots((prev) => prev.filter((s) => s.heroInstanceId !== selectedHeroInstanceId));
    setSelectedHeroInstanceId(null);
  };

  const handleReset = () => {
    const lineup = store.lineups.find((l) => l.id === selectedLineupId);
    setSlots(lineup ? [...lineup.slots] : []);
    setSelectedHeroInstanceId(null);
  };

  const handleSave = () => {
    if (!currentLineup) return;
    const updated: Lineup = { ...currentLineup, slots };
    store.updateLineup(updated);
    store.setCurrentLineup(selectedLineupId);
    setSaveMessage('阵容保存成功！');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleCreateLineup = () => {
    if (!newLineupName.trim()) return;
    const newLineup = store.createLineup(newLineupName.trim());
    setSelectedLineupId(newLineup.id);
    setNewLineupName('');
    setShowNewLineupModal(false);
  };

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
                阵容编辑
              </h1>
              <p className="mt-1 text-xs text-slate-400 md:text-sm">
                拖拽英雄到棋盘上编排阵容
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="card-glass flex min-w-[180px] items-center justify-between gap-2 px-4 py-2 transition-all hover:border-amber-500/50"
              >
                <span className="font-title text-sm font-medium text-slate-200">
                  {currentLineup?.name || '选择阵容'}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="card-glass absolute right-0 top-full z-30 mt-2 w-full min-w-[200px] overflow-hidden p-1">
                    {store.lineups.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setSelectedLineupId(l.id);
                          setShowDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          l.id === selectedLineupId
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="font-title">{l.name}</span>
                        <span className="text-xs text-slate-500">
                          {l.slots.length}/{MAX_HEROES}
                        </span>
                      </button>
                    ))}
                    {store.lineups.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-500">
                        暂无阵容，请新建
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <GameButton
              variant="secondary"
              size="md"
              icon={<Plus size={18} />}
              onClick={() => setShowNewLineupModal(true)}
            >
              新建阵容
            </GameButton>
          </div>
        </div>

        {/* 主体三栏 */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[25%_50%_25%]">
          {/* 左栏 - 英雄池 */}
          <div className="card-glass flex min-h-[300px] flex-col overflow-hidden p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-title text-lg font-bold text-slate-200">英雄池</h2>
              <span className="text-xs text-slate-500">
                可用 {availableHeroes.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {availableHeroes.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📦</div>
                    <p className="text-sm text-slate-500">所有英雄已上阵</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                  {availableHeroes.map((inst) => {
                    const tpl = getHeroTemplate(inst.templateId);
                    if (!tpl) return null;
                    const power = calculatePower(inst.id);
                    const isSelected = selectedHeroInstanceId === inst.id;
                    return (
                      <div
                        key={inst.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, {
                            type: 'hero-pool',
                            heroInstanceId: inst.id,
                          })
                        }
                        onClick={() => handleHeroPoolClick(inst.id)}
                        className={`card-glass group relative flex cursor-grab flex-col items-center p-2 transition-all active:cursor-grabbing hover:-translate-y-0.5 ${
                          isSelected
                            ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
                            : ''
                        }`}
                      >
                        <HeroAvatar
                          avatar={tpl.avatar}
                          name={tpl.name}
                          role={tpl.className}
                          level={inst.level}
                          star={inst.star}
                          size="md"
                        />
                        <div className="mt-2 w-full text-center">
                          <div className="truncate font-title text-sm font-bold text-slate-100">
                            {tpl.name}
                          </div>
                          <div
                            className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] border ${
                              CLASS_COLORS[tpl.className] ||
                              'border-slate-500/50 bg-slate-500/10'
                            }`}
                          >
                            {CLASS_ICONS[tpl.className]} {tpl.className}
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1 text-xs">
                          <Zap size={12} className="text-amber-400" />
                          <span className="font-bold text-amber-300 tabular-nums">
                            {power}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 中栏 - 战场棋盘 */}
          <div className="card-glass flex min-h-[400px] flex-col overflow-hidden p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-title text-lg font-bold text-slate-200">战场布局</h2>
              <span className="text-xs text-slate-500">
                {slots.length}/{MAX_HEROES} 已上阵
              </span>
            </div>

            <div className="mb-2 flex justify-between px-2 text-xs">
              <span className="text-red-400/70">👹 敌方区域</span>
              <span className="text-blue-400/70">我方区域 🏰</span>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-xl">
                <div
                  className="grid gap-2 p-3"
                  style={{
                    gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${BOARD_ROWS}, 1fr)`,
                  }}
                >
                  {Array.from({ length: BOARD_ROWS * BOARD_COLS }).map((_, idx) => {
                    const row = Math.floor(idx / BOARD_COLS);
                    const col = idx % BOARD_COLS;
                    const pos: Position = { row, col };
                    const isEnemyZone = row < ENEMY_ROWS;
                    const slot = getSlotAt(pos);
                    const isOver =
                      dragOver?.row === row && dragOver?.col === col && !isEnemyZone;
                    const inst = slot ? getHeroInstance(slot.heroInstanceId) : null;
                    const tpl = inst ? getHeroTemplate(inst.templateId) : null;
                    const isSelected =
                      slot && selectedHeroInstanceId === slot.heroInstanceId;

                    return (
                      <div
                        key={idx}
                        onDragOver={(e) => {
                          if (!isEnemyZone) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }
                        }}
                        onDragEnter={() => {
                          if (!isEnemyZone) setDragOver(pos);
                        }}
                        onDragLeave={() => {
                          if (dragOver?.row === row && dragOver?.col === col) {
                            setDragOver(null);
                          }
                        }}
                        onDrop={(e) => handleDrop(e, pos)}
                        onClick={() => handleBoardCellClick(pos)}
                        className={`relative aspect-square rounded-xl transition-all duration-200 ${
                          isEnemyZone
                            ? 'cursor-not-allowed border-2 border-dashed border-red-900/40 bg-red-950/20'
                            : slot
                            ? `cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30 border-2 border-amber-500/60 bg-amber-500/10'
                                  : 'border-2 border-slate-600/40 bg-slate-800/50 hover:border-amber-500/40 hover:bg-slate-700/50'
                              }`
                            : isOver
                            ? 'border-2 border-dashed border-amber-400 bg-amber-500/15 shadow-inner shadow-amber-500/20'
                            : 'cursor-pointer border-2 border-dashed border-slate-600/40 bg-slate-800/20 hover:border-blue-400/50 hover:bg-blue-500/5'
                        }`}
                      >
                        {isEnemyZone ? (
                          <div className="flex h-full w-full items-center justify-center opacity-30">
                            <span className="text-xl">👹</span>
                          </div>
                        ) : slot && tpl && inst ? (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, {
                                type: 'board',
                                position: pos,
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-full w-full cursor-grab items-center justify-center p-1 active:cursor-grabbing"
                          >
                            <HeroAvatar
                              avatar={tpl.avatar}
                              name={tpl.name}
                              role={tpl.className}
                              level={inst.level}
                              star={inst.star}
                              size="md"
                              onClick={() => setSelectedHeroInstanceId(inst.id)}
                              selected={isSelected}
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Plus
                              size={20}
                              className={`${
                                isOver
                                  ? 'text-amber-400'
                                  : 'text-slate-600 group-hover:text-blue-400'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>💡 拖拽英雄到空格放置</span>
              <span>🔄 棋盘内拖拽可交换位置</span>
            </div>
          </div>

          {/* 右栏 - 编队列表+属性 */}
          <div className="flex min-h-[400px] flex-col gap-4 overflow-hidden">
            {/* 编队列表 */}
            <div className="card-glass flex flex-col p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-title text-lg font-bold text-slate-200">编队列表</h2>
                <span className="text-xs text-slate-500">
                  槽位 {slots.length}/{MAX_HEROES}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: MAX_HEROES }).map((_, idx) => {
                  const slot = slots[idx];
                  const inst = slot ? getHeroInstance(slot.heroInstanceId) : null;
                  const tpl = inst ? getHeroTemplate(inst.templateId) : undefined;
                  const isSelected =
                    slot && selectedHeroInstanceId === slot.heroInstanceId;

                  const handleSlotClick = () => {
                    if (!slot) return;
                    setSelectedHeroInstanceId(slot.heroInstanceId);
                  };

                  return (
                    <button
                      key={idx}
                      onClick={handleSlotClick}
                      className={`relative aspect-square rounded-lg border-2 border-dashed transition-all ${
                        slot
                          ? isSelected
                            ? 'border-amber-400 bg-amber-500/10 shadow shadow-amber-500/20'
                            : 'border-slate-600/50 bg-slate-800/40 hover:border-amber-500/50'
                          : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-500/50'
                      }`}
                    >
                      {slot && tpl && inst ? (
                        <div className="flex h-full w-full items-center justify-center p-0.5">
                          <HeroAvatar
                            avatar={tpl.avatar}
                            name={tpl.name}
                            role={tpl.className}
                            level={inst.level}
                            star={inst.star}
                            size="sm"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Plus size={14} className="text-slate-600" />
                        </div>
                      )}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-1 text-[10px] text-slate-500">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 选中英雄属性 */}
            <div className="card-glass flex flex-1 flex-col overflow-hidden p-4">
              {selectedTemplate && selectedInstance ? (
                <div className="flex h-full flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <HeroAvatar
                      avatar={selectedTemplate.avatar}
                      name={selectedTemplate.name}
                      role={selectedTemplate.className}
                      level={selectedInstance.level}
                      star={selectedInstance.star}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="font-title text-lg font-bold text-slate-100">
                        {selectedTemplate.name}
                      </div>
                      <div
                        className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs border ${
                          CLASS_COLORS[selectedTemplate.className] || ''
                        }`}
                      >
                        {CLASS_ICONS[selectedTemplate.className]} {selectedTemplate.className}
                      </div>
                      <div className="mt-1 text-xs text-amber-300">
                        战力: {calculatePower(selectedInstance.id)}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveHero}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20"
                      title="移除英雄"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <StatMini
                      icon={<Heart size={14} />}
                      label="HP"
                      value={selectedTemplate.baseStats.maxHp}
                      color="text-red-400"
                    />
                    <StatMini
                      icon={<Sword size={14} />}
                      label="ATK"
                      value={selectedTemplate.baseStats.attack}
                      color="text-orange-400"
                    />
                    <StatMini
                      icon={<Shield size={14} />}
                      label="DEF"
                      value={selectedTemplate.baseStats.defense}
                      color="text-green-400"
                    />
                    <StatMini
                      icon={<Zap size={14} />}
                      label="SPD"
                      value={selectedTemplate.baseStats.speed}
                      color="text-cyan-400"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="mb-2 text-xs font-bold text-slate-400">
                      装备槽 ({selectedInstance.equipments.length}/6)
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-800/30 flex items-center justify-center"
                        >
                          {selectedInstance.equipments[i] ? (
                            <span className="text-lg">⚔️</span>
                          ) : (
                            <span className="text-slate-700 text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 text-xs font-bold text-slate-400">
                      铭文槽 ({selectedInstance.inscriptions.filter(Boolean).length}/9)
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded border-2 border-dashed border-slate-700/50 bg-slate-800/30 flex items-center justify-center"
                        >
                          {selectedInstance.inscriptions[i] ? (
                            <span className="text-sm">💎</span>
                          ) : (
                            <span className="text-slate-700 text-[10px]">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">👤</div>
                    <p className="text-sm text-slate-500">选择英雄查看属性</p>
                  </div>
                </div>
              )}
            </div>

            {/* 队伍总战力 */}
            <div className="card-glass p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">队伍总战力</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <Zap size={20} className="text-amber-400" />
                    <span
                      className="font-title text-2xl font-bold text-amber-300 tabular-nums"
                      style={{ fontFamily: 'var(--font-title)' }}
                    >
                      {totalPower.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">职业搭配</div>
                  <div className="mt-1 flex flex-wrap justify-end gap-1">
                    {Array.from(classCoverage).map((cls) => (
                      <span
                        key={cls}
                        className={`rounded px-1.5 py-0.5 text-[10px] border ${
                          CLASS_COLORS[cls] || ''
                        }`}
                        title={cls}
                      >
                        {CLASS_ICONS[cls]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {missingClassWarnings.length > 0 && (
                <div className="mt-3 space-y-1">
                  {missingClassWarnings.map((msg, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-2 py-1.5 text-xs text-yellow-300"
                    >
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {missingClassWarnings.length === 0 && slots.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/30 px-2 py-1.5 text-xs text-green-300">
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>职业搭配合理</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部栏 */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {saveMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/15 border border-green-500/40 px-3 py-2 text-sm text-green-300">
                <CheckCircle2 size={16} />
                {saveMessage}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <GameButton
              variant="secondary"
              size="lg"
              icon={<RotateCcw size={18} />}
              onClick={handleReset}
            >
              重置
            </GameButton>
            <GameButton
              variant="primary"
              size="lg"
              icon={<Save size={18} />}
              onClick={handleSave}
            >
              保存阵容
            </GameButton>
          </div>
        </div>
      </div>

      {/* 新建阵容弹窗 */}
      <Modal
        isOpen={showNewLineupModal}
        onClose={() => setShowNewLineupModal(false)}
        title="新建阵容"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <GameButton
              variant="secondary"
              onClick={() => setShowNewLineupModal(false)}
            >
              取消
            </GameButton>
            <GameButton variant="primary" onClick={handleCreateLineup}>
              创建
            </GameButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">阵容名称</label>
            <input
              type="text"
              value={newLineupName}
              onChange={(e) => setNewLineupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLineup()}
              placeholder="请输入阵容名称..."
              autoFocus
              className="w-full rounded-xl border-2 border-slate-600/50 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-amber-500/60 focus:bg-slate-800"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['主力阵容', 'PVP阵容', '推图阵容', 'BOSS战'].map((name) => (
              <button
                key={name}
                onClick={() => setNewLineupName(name)}
                className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-amber-500/50 hover:text-amber-300"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatMini({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 px-2 py-1.5">
      <span className={color}>{icon}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`ml-auto font-bold text-xs tabular-nums ${color}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

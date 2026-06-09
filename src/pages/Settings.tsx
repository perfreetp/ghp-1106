import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Mic,
  Monitor,
  Eye,
  Save,
  Download,
  Upload,
  Trash2,
  Clock,
  Trophy,
  Calendar,
  Gift,
  Info,
  Star,
  Check,
  Coins,
  Gem,
  Sparkles,
  Gamepad2,
  Cpu,
  Maximize,
  Bell,
  Play,
  RotateCcw,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { achievements as achievementList } from '@/data/achievements';
import type { GameSettings, 画质等级, 语言 } from '@/types';

type TabKey = 'audio' | 'graphics' | 'save' | 'achievement' | 'daily' | 'about';

type LucideIconType = React.ComponentType<{ size?: number | string; className?: string }>;

const TABS: { key: TabKey; label: string; icon: LucideIconType }[] = [
  { key: 'audio', label: '声音设置', icon: Volume2 },
  { key: 'graphics', label: '音画设置', icon: Monitor },
  { key: 'save', label: '存档管理', icon: Save },
  { key: 'achievement', label: '成就任务', icon: Trophy },
  { key: 'daily', label: '每日签到', icon: Calendar },
  { key: 'about', label: '关于游戏', icon: Info },
];

const QUALITY_OPTIONS: 画质等级[] = ['低', '中', '高', '极致'];
const LANGUAGE_OPTIONS: 语言[] = ['简体中文', '繁體中文', 'English', '日本語'];
const BATTLE_SPEED_OPTIONS = [1, 1.5, 2, 3];

const DAILY_SIGNIN_REWARDS = [
  { day: 1, gold: 200, diamond: 0 },
  { day: 2, gold: 300, diamond: 0 },
  { day: 3, gold: 400, diamond: 10 },
  { day: 4, gold: 500, diamond: 20 },
  { day: 5, gold: 600, diamond: 30 },
  { day: 6, gold: 800, diamond: 50 },
  { day: 7, gold: 1500, diamond: 200, isSpecial: true },
];

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromQuery = searchParams.get('tab') as TabKey | null;

  const [activeTab, setActiveTab] = useState<TabKey>(tabFromQuery || 'audio');

  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadSave = useGameStore((state) => state.loadSave);
  const achievements = useGameStore((state) => state.achievements);
  const unlockAchievement = useGameStore((state) => state.unlockAchievement);
  const heroInstances = useGameStore((state) => state.heroInstances);
  const lineups = useGameStore((state) => state.lineups);
  const gold = useGameStore((state) => state.gold);
  const diamond = useGameStore((state) => state.diamond);

  useEffect(() => {
    if (tabFromQuery && TABS.some((t) => t.key === tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const [saveSlots, setSaveSlots] = useState(() => {
    const slots = [];
    for (let i = 1; i <= 5; i++) {
      const raw = localStorage.getItem(`game_save_slots_slot_${i}`);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          slots.push({
            slot: i,
            name: data.name || `存档${i}`,
            lastSavedAt: data.lastSavedAt,
            playerLevel: data.playerLevel || 1,
            heroCount: data.heroInstances?.length || 0,
            lineupCount: data.lineups?.length || 0,
            gold: data.currency?.gold || 0,
            diamond: data.currency?.diamond || 0,
          });
        } catch {
          slots.push({ slot: i, empty: true });
        }
      } else {
        slots.push({ slot: i, empty: true });
      }
    }
    return slots;
  });

  const [dailyState, setDailyState] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem('daily_sign_in');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        return {
          lastSignDate: data.lastSignDate || '',
          continuousDays: data.continuousDays || 0,
          signedToday: data.lastSignDate === today,
        };
      } catch {
        return { lastSignDate: '', continuousDays: 0, signedToday: false };
      }
    }
    return { lastSignDate: '', continuousDays: 0, signedToday: false };
  });

  const [showConfirmModal, setShowConfirmModal] = useState<{
    open: boolean;
    type: 'save' | 'load' | 'delete';
    slot?: number;
  }>({ open: false, type: 'save' });

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    updateSettings({ [key]: value });
  };

  const handleConfirmAction = () => {
    const { type, slot } = showConfirmModal;
    if (slot === undefined) return;

    if (type === 'save') {
      saveGame(slot);
    } else if (type === 'load') {
      loadSave(`slot_${slot}`);
    } else if (type === 'delete') {
      localStorage.removeItem(`game_save_slots_slot_${slot}`);
    }
    setShowConfirmModal({ open: false, type: 'save' });
    refreshSaveSlots();
  };

  const refreshSaveSlots = () => {
    const slots = [];
    for (let i = 1; i <= 5; i++) {
      const raw = localStorage.getItem(`game_save_slots_slot_${i}`);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          slots.push({
            slot: i,
            name: data.name || `存档${i}`,
            lastSavedAt: data.lastSavedAt,
            playerLevel: data.playerLevel || 1,
            heroCount: data.heroInstances?.length || 0,
            lineupCount: data.lineups?.length || 0,
            gold: data.currency?.gold || 0,
            diamond: data.currency?.diamond || 0,
          });
        } catch {
          slots.push({ slot: i, empty: true });
        }
      } else {
        slots.push({ slot: i, empty: true });
      }
    }
    setSaveSlots(slots);
  };

  const handleSignIn = () => {
    const today = new Date().toISOString().split('T')[0];
    const newContinuous = (() => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      return dailyState.lastSignDate === yesterday ? dailyState.continuousDays + 1 : 1;
    })();
    const dayIndex = (newContinuous - 1) % 7;
    const { gold, diamond } = DAILY_SIGNIN_REWARDS[dayIndex];
    useGameStore.getState().addGold(gold);
    useGameStore.setState({ diamond: useGameStore.getState().diamond + diamond });
    localStorage.setItem('daily_sign_in', JSON.stringify({
      lastSignDate: today, continuousDays: newContinuous,
    }));
    setDailyState({ lastSignDate: today, continuousDays: newContinuous, signedToday: true });
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const unlockedCount = achievementList.filter(
    (a) => achievements[a.id],
  ).length;

  return (
    <div className="game-bg relative min-h-screen w-full">
      <div className="relative z-10 flex min-h-screen flex-col p-6">
        <div className="mb-6 flex items-center gap-4">
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
              游戏设置
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              个性化您的游戏体验
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="card-glass w-56 shrink-0 p-3">
            <div className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-400'
                        : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-title text-sm font-medium">
                      {tab.label}
                    </span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="card-glass h-full p-6">
              {activeTab === 'audio' && (
                <AudioSettings
                  settings={settings}
                  onChange={handleSettingChange}
                />
              )}
              {activeTab === 'graphics' && (
                <GraphicsSettings
                  settings={settings}
                  onChange={handleSettingChange}
                />
              )}
              {activeTab === 'save' && (
                <SaveManagement
                  slots={saveSlots}
                  onAction={(type, slot) =>
                    setShowConfirmModal({ open: true, type, slot })
                  }
                  formatDate={formatDate}
                />
              )}
              {activeTab === 'achievement' && (
                <AchievementPanel
                  achievements={achievementList}
                  unlocked={achievements}
                  unlockedCount={unlockedCount}
                  onUnlock={unlockAchievement}
                />
              )}
              {activeTab === 'daily' && (
                <DailySignIn dailyState={dailyState} gold={gold} diamond={diamond} onSignIn={handleSignIn} />
              )}
              {activeTab === 'about' && (
                <AboutSection
                  heroCount={heroInstances.length}
                  lineupCount={lineups.length}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showConfirmModal.open}
        onClose={() => setShowConfirmModal({ open: false, type: 'save' })}
        title={
          showConfirmModal.type === 'save'
            ? '保存游戏'
            : showConfirmModal.type === 'load'
            ? '读取存档'
            : '删除存档'
        }
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            {showConfirmModal.type === 'save' &&
              `确定要将游戏保存到存档槽位 ${showConfirmModal.slot} 吗？`}
            {showConfirmModal.type === 'load' &&
              `确定要从槽位 ${showConfirmModal.slot} 读取存档吗？当前未保存的进度将丢失。`}
            {showConfirmModal.type === 'delete' &&
              `确定要删除槽位 ${showConfirmModal.slot} 的存档吗？此操作无法撤销。`}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() =>
                setShowConfirmModal({ open: false, type: 'save' })
              }
              className="rounded-lg border border-slate-600 px-5 py-2 text-slate-300 transition-all hover:bg-slate-700"
            >
              取消
            </button>
            <button
              onClick={handleConfirmAction}
              className={`btn-gold !py-2 ${
                showConfirmModal.type === 'delete'
                  ? '!from-red-600 !to-red-500 !border-red-400'
                  : ''
              }`}
            >
              确认
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AudioSettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <SectionTitle title="音量调节" icon={Volume2} />

      <VolumeSlider
        icon={Music}
        label="背景音乐 (BGM)"
        value={settings.bgmVolume}
        onChange={(v) => onChange('bgmVolume', v)}
        color="from-blue-500 to-cyan-400"
      />

      <VolumeSlider
        icon={Volume2}
        label="音效 (SFX)"
        value={settings.sfxVolume}
        onChange={(v) => onChange('sfxVolume', v)}
        color="from-green-500 to-emerald-400"
      />

      <VolumeSlider
        icon={Mic}
        label="角色语音"
        value={settings.voiceVolume}
        onChange={(v) => onChange('voiceVolume', v)}
        color="from-purple-500 to-pink-400"
      />

      <div className="pt-6">
        <SectionTitle title="其他选项" icon={Bell} />
        <div className="mt-4 space-y-3">
          <ToggleRow
            label="推送通知"
            description="接收游戏相关的推送消息"
            checked={settings.pushNotification}
            onChange={(v) => onChange('pushNotification', v)}
          />
        </div>
      </div>
    </div>
  );
}

function GraphicsSettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <SectionTitle title="画质设置" icon={Cpu} />

      <div className="grid grid-cols-4 gap-3">
        {QUALITY_OPTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onChange('quality', q)}
            className={`rounded-lg border p-4 text-center transition-all ${
              settings.quality === q
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
          >
            <div className="font-title text-lg font-bold">{q}</div>
            <div className="mt-1 text-xs opacity-70">
              {q === '低' && '流畅优先'}
              {q === '中' && '平衡模式'}
              {q === '高' && '画质优先'}
              {q === '极致' && '极致体验'}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <SectionTitle title="战斗设置" icon={Gamepad2} />
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 text-sm text-slate-400">战斗倍速</div>
            <div className="flex gap-2">
              {BATTLE_SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChange('battleSpeed', speed)}
                  className={`rounded-lg border px-5 py-2 transition-all ${
                    settings.battleSpeed === speed
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="font-title font-bold">{speed}x</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <ToggleRow
              icon={Eye}
              label="显示伤害数字"
              description="战斗中显示伤害和治疗数值"
              checked={settings.showDamage}
              onChange={(v) => onChange('showDamage', v)}
            />
            <ToggleRow
              icon={Play}
              label="自动战斗"
              description="战斗中自动选择行动"
              checked={settings.autoBattle}
              onChange={(v) => onChange('autoBattle', v)}
            />
            <ToggleRow
              icon={Maximize}
              label="全屏模式"
              description="以全屏模式运行游戏"
              checked={settings.fullscreen}
              onChange={(v) => onChange('fullscreen', v)}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <SectionTitle title="存档设置" icon={RotateCcw} />
        <div className="mt-4 space-y-3">
          <ToggleRow
            label="自动存档"
            description="游戏过程中定时保存进度"
            checked={settings.autoSave}
            onChange={(v) => onChange('autoSave', v)}
          />
          {settings.autoSave && (
            <div>
              <div className="mb-2 text-sm text-slate-400">
                自动存档间隔（分钟）
              </div>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.autoSaveInterval}
                onChange={(e) =>
                  onChange(
                    'autoSaveInterval',
                    Math.max(1, Math.min(60, parseInt(e.target.value) || 5)),
                  )
                }
                className="w-32 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <SectionTitle title="语言设置" icon={Sparkles} />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang}
              onClick={() => onChange('language', lang)}
              className={`rounded-lg border px-4 py-3 transition-all ${
                settings.language === lang
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="font-title">{lang}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveManagement({
  slots,
  onAction,
  formatDate,
}: {
  slots: any[];
  onAction: (type: 'save' | 'load' | 'delete', slot: number) => void;
  formatDate: (iso: string) => string;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle title="存档槽位" icon={Save} />

      <div className="space-y-4">
        {slots.map((slot: any) => (
          <div
            key={slot.slot}
            className={`card-glass p-5 ${
              slot.empty ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${
                    slot.empty
                      ? 'bg-slate-800 text-slate-600'
                      : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400'
                  }`}
                >
                  {slot.empty ? (
                    <Save size={28} />
                  ) : (
                    <span className="font-title text-2xl font-bold">
                      {slot.slot}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title text-xl font-bold text-slate-200">
                      {slot.empty ? '空存档' : slot.name}
                    </h3>
                    <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                      槽位 {slot.slot}
                    </span>
                  </div>

                  {slot.empty ? (
                    <p className="mt-2 text-sm text-slate-500">
                      此槽位暂无存档数据
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-400">
                          <Clock size={14} className="mr-1 inline" />
                          {formatDate(slot.lastSavedAt)}
                        </span>
                        <span className="text-slate-400">
                          等级 Lv.{slot.playerLevel}
                        </span>
                        <span className="text-slate-400">
                          <Sparkles size={14} className="mr-1 inline" />
                          {slot.heroCount} 位英雄
                        </span>
                        <span className="text-slate-400">
                          {slot.lineupCount} 套阵容
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-yellow-400">
                          <Coins size={14} className="mr-1 inline" />
                          {slot.gold.toLocaleString()}
                        </span>
                        <span className="text-cyan-400">
                          <Gem size={14} className="mr-1 inline" />
                          {slot.diamond.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => onAction('save', slot.slot)}
                  className="btn-gold !px-4 !py-2 !text-sm flex items-center gap-2"
                >
                  <Upload size={16} />
                  <span>保存</span>
                </button>
                {!slot.empty && (
                  <>
                    <button
                      onClick={() => onAction('load', slot.slot)}
                      className="flex items-center gap-2 rounded-lg border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm text-blue-400 transition-all hover:bg-blue-500/20"
                    >
                      <Download size={16} />
                      <span>读取</span>
                    </button>
                    <button
                      onClick={() => onAction('delete', slot.slot)}
                      className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                      <span>删除</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementPanel({
  achievements,
  unlocked,
  unlockedCount,
  onUnlock,
}: {
  achievements: any[];
  unlocked: Record<string, boolean>;
  unlockedCount: number;
  onUnlock: (id: string) => void;
}) {
  const categories = Array.from(
    new Set(achievements.map((a) => a.categoryName)),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="成就任务" icon={Trophy} />
        <div className="card-glass flex items-center gap-3 px-4 py-2">
          <Trophy size={20} className="text-amber-400" />
          <div className="text-sm text-slate-400">已解锁</div>
          <span className="font-title text-xl font-bold text-amber-400">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 transition-all duration-500"
          style={{
            width: `${(unlockedCount / achievements.length) * 100}%`,
          }}
        />
      </div>

      {categories.map((cat) => {
        const catAchievements = achievements.filter(
          (a) => a.categoryName === cat,
        );
        return (
          <div key={cat} className="space-y-3">
            <h3 className="font-title text-lg font-bold text-slate-300">
              {cat}
            </h3>
            <div className="grid gap-3">
              {catAchievements.map((ach) => {
                const isUnlocked = unlocked[ach.id];
                return (
                  <div
                    key={ach.id}
                    className={`card-glass flex items-center gap-4 p-4 transition-all ${
                      isUnlocked
                        ? 'ring-1 ring-amber-500/30'
                        : 'opacity-70 grayscale-[20%]'
                    }`}
                  >
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30'
                          : 'bg-slate-800'
                      }`}
                    >
                      {ach.icon === 'sword' && '⚔️'}
                      {ach.icon === 'skull' && '💀'}
                      {ach.icon === 'fire' && '🔥'}
                      {ach.icon === 'trophy' && '🏆'}
                      {ach.icon === 'axe' && '🪓'}
                      {!['sword', 'skull', 'fire', 'trophy', 'axe'].includes(ach.icon) &&
                        '⭐'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-title text-lg font-bold text-slate-200">
                          {ach.name}
                        </h4>
                        {isUnlocked && (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                            <Check size={12} />
                            已完成
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {ach.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        条件：{ach.condition}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="mb-2 space-x-3 text-xs">
                        {ach.reward.gold && (
                          <span className="text-yellow-400">
                            <Coins size={12} className="mr-1 inline" />
                            {ach.reward.gold}
                          </span>
                        )}
                        {ach.reward.diamond && (
                          <span className="text-cyan-400">
                            <Gem size={12} className="mr-1 inline" />
                            {ach.reward.diamond}
                          </span>
                        )}
                        {ach.reward.exp && (
                          <span className="text-purple-400">
                            <Zap size={12} className="mr-1 inline" />
                            {ach.reward.exp} EXP
                          </span>
                        )}
                      </div>
                      {!isUnlocked && (
                        <button
                          onClick={() => onUnlock(ach.id)}
                          className="rounded-lg border border-slate-600 px-4 py-1.5 text-xs text-slate-400 transition-all hover:border-amber-500/50 hover:text-amber-400"
                        >
                          测试解锁
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DailySignIn({
  dailyState,
  gold,
  diamond,
  onSignIn,
}: {
  dailyState: { lastSignDate: string; continuousDays: number; signedToday: boolean };
  gold: number;
  diamond: number;
  onSignIn: () => void;
}) {
  const rewards = DAILY_SIGNIN_REWARDS;

  return (
    <div className="space-y-8">
      <SectionTitle title="每日签到" icon={Calendar} />

      <div className="card-glass !bg-gradient-to-br !from-amber-500/10 !to-orange-500/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Gift size={24} className="text-amber-400" />
              <h3 className="font-title text-2xl font-bold text-amber-400">
                连续签到 {dailyState.continuousDays} 天
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {dailyState.signedToday
                ? '今日已签到，明天记得来领取更多奖励哦！'
                : '今天还没签到，点击下方按钮领取奖励！'}
            </p>
          </div>

          <button
            disabled={dailyState.signedToday}
            onClick={onSignIn}
            className={`btn-gold !text-xl flex items-center gap-2 ${
              dailyState.signedToday
                ? '!from-slate-600 !to-slate-500 !border-slate-400'
                : ''
            }`}
          >
            {dailyState.signedToday ? (
              <>
                <Check size={22} />
                已签到
              </>
            ) : (
              <>
                <Gift size={22} />
                立即签到
              </>
            )}
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-title text-xl font-bold text-slate-200">
          7日签到奖励
        </h3>
        <div className="grid grid-cols-7 gap-3">
          {rewards.map((r) => {
            const isSigned = r.day <= dailyState.continuousDays;
            const isToday = r.day === dailyState.continuousDays + 1 && !dailyState.signedToday;
            return (
              <div
                key={r.day}
                className={`card-glass relative p-4 text-center transition-all ${
                  r.isSpecial
                    ? 'ring-1 ring-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent'
                    : ''
                } ${isToday ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20' : ''} ${
                  isSigned ? '' : 'opacity-50'
                }`}
              >
                {r.isSpecial && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-xs font-bold text-slate-900">
                    大奖
                  </div>
                )}

                <div
                  className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                    isSigned
                      ? 'bg-green-500/20 text-green-400'
                      : isToday
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isSigned ? (
                    <Check size={24} />
                  ) : (
                    <Star
                      size={24}
                      className={isToday ? 'animate-pulse' : ''}
                    />
                  )}
                </div>

                <div className="font-title text-sm font-bold text-slate-200">
                  第 {r.day} 天
                </div>

                <div className="mt-2 space-y-1">
                  {r.gold > 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs text-yellow-400">
                      <Coins size={12} />
                      {r.gold}
                    </div>
                  )}
                  {r.diamond > 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs text-cyan-400">
                      <Gem size={12} />
                      {r.diamond}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="mb-4 font-title text-xl font-bold text-slate-200">
          签到规则
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <span>每日0点刷新签到，连续签到可获得更丰厚的奖励</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <span>中断签到将重新计算连续签到天数</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <span>第7天为特别大奖，包含大量钻石奖励</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <span>当前金币：{gold.toLocaleString()}，钻石：{diamond.toLocaleString()}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function AboutSection({
  heroCount,
  lineupCount,
}: {
  heroCount: number;
  lineupCount: number;
}) {
  return (
    <div className="space-y-8">
      <SectionTitle title="关于游戏" icon={Info} />

      <div className="card-glass !bg-gradient-to-br !from-amber-500/5 !to-blue-500/5 p-8 text-center">
        <div className="mb-4 text-6xl">⚔️</div>
        <h2
          className="text-glow font-title text-4xl font-bold text-amber-400"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          王者荣耀 - 回合制对战版
        </h2>
        <p className="mt-3 text-slate-400">版本 v1.0.0</p>

        <div className="mt-8 mx-auto grid max-w-xl grid-cols-3 gap-4">
          <StatCard label="已收集英雄" value={heroCount.toString()} />
          <StatCard label="阵容配置" value={lineupCount.toString()} />
          <StatCard label="游戏时长" value="0h" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-title text-xl font-bold text-slate-200">
            <Sparkles size={22} className="text-amber-400" />
            游戏特色
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
              <span>经典回合制战斗，策略为王</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
              <span>百位英雄集结，组建最强阵容</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
              <span>装备铭文系统，养成深度无限</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
              <span>丰富关卡挑战，剧情精彩绝伦</span>
            </li>
          </ul>
        </div>

        <div className="card-glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-title text-xl font-bold text-slate-200">
            <Info size={22} className="text-blue-400" />
            制作信息
          </h3>
          <div className="space-y-3 text-sm">
            <InfoRow label="开发团队" value="Trae AI Studio" />
            <InfoRow label="游戏引擎" value="React + TypeScript" />
            <InfoRow label="图形渲染" value="Canvas + CSS" />
            <InfoRow label="发布日期" value="2025年" />
            <InfoRow label="官方网站" value="www.example.com" />
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="mb-4 flex items-center gap-2 font-title text-xl font-bold text-slate-200">
          <Trophy size={22} className="text-amber-400" />
          特别感谢
        </h3>
        <p className="text-sm leading-relaxed text-slate-400">
          感谢所有玩家的支持与热爱。本游戏作为回合制策略类游戏的爱好者作品，
          致力于为大家带来纯粹的策略乐趣。如果您在游戏过程中有任何建议或发现BUG，
          欢迎通过设置中的反馈功能与我们联系。祝您游戏愉快，百战百胜！
        </p>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIconType;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-2">
        <Icon size={22} className="text-amber-400" />
      </div>
      <h2 className="font-title text-2xl font-bold text-slate-200">{title}</h2>
    </div>
  );
}

function VolumeSlider({
  icon: Icon,
  label,
  value,
  onChange,
  color,
}: {
  icon: LucideIconType;
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const isMuted = value === 0;
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(isMuted ? 70 : 0)}
        className="card-glass flex h-11 w-11 shrink-0 items-center justify-center transition-all hover:border-amber-500/50"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-slate-500" />
        ) : (
          <Icon size={20} className="text-slate-300" />
        )}
      </button>
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-400">{label}</span>
          <span className="font-title font-bold text-slate-200">{value}%</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color}`}
            style={{ width: `${value}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-gradient-to-br ${color} shadow-lg transition-all`}
            style={{ left: `calc(${value}% - 8px)` }}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: LucideIconType;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="card-glass flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-lg bg-slate-800/80 p-2 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <div>
          <div className="font-medium text-slate-200">{label}</div>
          {description && (
            <div className="mt-0.5 text-xs text-slate-500">{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
          checked ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-700'
        }`}
      >
        <div
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-glass p-4">
      <div className="font-title text-3xl font-bold text-amber-400">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card-glass relative z-10 w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all hover:bg-slate-700 hover:text-white"
        >
          <X size={16} />
        </button>
        <h3 className="mb-4 font-title text-xl font-bold text-slate-200">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

import { create } from 'zustand';
import type {
  HeroInstance,
  Lineup,
  GameSettings,
  BattleLog,
  LevelProgress,
  SaveFile,
  Rewards,
} from '../types';

const INITIAL_HERO_TEMPLATES = ['hero_007', 'hero_003', 'hero_006'];
const INITIAL_GOLD = 5000;
const INITIAL_DIAMOND = 0;

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const createHeroInstance = (templateId: string): HeroInstance => ({
  id: generateId(),
  templateId,
  level: 1,
  exp: 0,
  star: 1,
  awaken: 0,
  equipments: [],
  inscriptions: [],
  obtainTime: new Date().toISOString(),
  locked: false,
});

const DEFAULT_SETTINGS: GameSettings = {
  bgmVolume: 70,
  sfxVolume: 80,
  voiceVolume: 60,
  quality: '中',
  fullscreen: false,
  showDamage: true,
  autoSave: true,
  autoSaveInterval: 5,
  language: '简体中文',
  battleSpeed: 1,
  autoBattle: false,
  pushNotification: true,
};

const SAVE_KEY = 'game_save_slots';

export interface GameStoreState {
  heroInstances: HeroInstance[];
  lineups: Lineup[];
  currentLineupId: string;
  gold: number;
  diamond: number;
  levelProgress: Record<string, LevelProgress>;
  achievements: Record<string, boolean>;
  battleLogs: BattleLog[];
  settings: GameSettings;
  currentPage: string;
}

export interface GameStoreActions {
  initNewGame: () => void;
  loadSave: (saveId: string) => boolean;
  saveGame: (slot: number, name?: string) => boolean;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addHero: (templateId: string) => HeroInstance;
  upgradeHero: (heroId: string) => boolean;
  equipItem: (heroId: string, equipmentId: string) => boolean;
  equipInscription: (heroId: string, inscriptionId: string, slot: number) => boolean;
  createLineup: (name: string) => Lineup;
  updateLineup: (lineup: Lineup) => void;
  setCurrentLineup: (lineupId: string) => void;
  completeLevel: (levelId: string, stars: number, rewards?: Rewards) => void;
  unlockAchievement: (id: string) => void;
  addBattleLog: (log: BattleLog) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

export type GameStore = GameStoreState & GameStoreActions;

export const useGameStore = create<GameStore>((set, get) => ({
  heroInstances: [],
  lineups: [],
  currentLineupId: '',
  gold: 0,
  diamond: 0,
  levelProgress: {},
  achievements: {},
  battleLogs: [],
  settings: DEFAULT_SETTINGS,
  currentPage: 'home',

  initNewGame: () => {
    const heroes = INITIAL_HERO_TEMPLATES.map(createHeroInstance);
    const defaultLineupId = generateId();
    const defaultLineup: Lineup = {
      id: defaultLineupId,
      name: '默认阵容',
      slots: heroes.slice(0, 3).map((hero, idx) => ({
        heroInstanceId: hero.id,
        position: { row: idx < 2 ? 0 : 1, col: idx % 2 },
      })),
      isDefault: true,
      createTime: new Date().toISOString(),
    };

    set({
      heroInstances: heroes,
      lineups: [defaultLineup],
      currentLineupId: defaultLineupId,
      gold: INITIAL_GOLD,
      diamond: INITIAL_DIAMOND,
      levelProgress: {},
      achievements: {},
      battleLogs: [],
      settings: DEFAULT_SETTINGS,
      currentPage: 'home',
    });
  },

  loadSave: (saveId: string) => {
    try {
      const raw = localStorage.getItem(`${SAVE_KEY}_${saveId}`);
      if (!raw) return false;
      const save: SaveFile = JSON.parse(raw);

      set({
        heroInstances: save.heroInstances,
        lineups: save.lineups,
        currentLineupId: save.currentLineupId,
        gold: save.currency.gold,
        diamond: save.currency.diamond,
        levelProgress: save.levelProgress,
        achievements: save.achievements,
        battleLogs: save.battleLogs,
        settings: save.settings,
      });
      return true;
    } catch {
      return false;
    }
  },

  saveGame: (slot: number, name?: string) => {
    try {
      const state = get();
      const saveId = `slot_${slot}`;
      const now = new Date().toISOString();
      const existing = localStorage.getItem(`${SAVE_KEY}_${saveId}`);
      const existingSave: Partial<SaveFile> | null = existing ? JSON.parse(existing) : null;

      const save: SaveFile = {
        id: saveId,
        name: name || existingSave?.name || `存档${slot}`,
        slot,
        createdAt: existingSave?.createdAt || now,
        lastSavedAt: now,
        playerLevel: 1,
        playerExp: 0,
        playerName: '玩家',
        currency: {
          gold: state.gold,
          diamond: state.diamond,
          stamina: 100,
        },
        heroInstances: state.heroInstances,
        equipments: [],
        inscriptions: [],
        lineups: state.lineups,
        currentLineupId: state.currentLineupId,
        levelProgress: state.levelProgress,
        achievements: state.achievements,
        battleLogs: state.battleLogs,
        settings: state.settings,
        tutorialStep: 0,
        version: 1,
      };

      localStorage.setItem(`${SAVE_KEY}_${saveId}`, JSON.stringify(save));
      return true;
    } catch {
      return false;
    }
  },

  addGold: (amount: number) => {
    set({ gold: get().gold + amount });
  },

  spendGold: (amount: number) => {
    const { gold } = get();
    if (gold < amount) return false;
    set({ gold: gold - amount });
    return true;
  },

  addHero: (templateId: string) => {
    const newHero = createHeroInstance(templateId);
    set({ heroInstances: [...get().heroInstances, newHero] });
    return newHero;
  },

  upgradeHero: (heroId: string) => {
    const { heroInstances, spendGold } = get();
    const hero = heroInstances.find((h) => h.id === heroId);
    if (!hero) return false;

    const cost = hero.level * 100;
    if (!spendGold(cost)) return false;

    set({
      heroInstances: get().heroInstances.map((h) =>
        h.id === heroId ? { ...h, level: h.level + 1 } : h,
      ),
    });
    return true;
  },

  equipItem: (heroId: string, equipmentId: string) => {
    const { heroInstances } = get();
    const hero = heroInstances.find((h) => h.id === heroId);
    if (!hero) return false;
    if (hero.equipments.length >= 6) return false;
    if (hero.equipments.includes(equipmentId)) return false;

    set({
      heroInstances: get().heroInstances.map((h) =>
        h.id === heroId ? { ...h, equipments: [...h.equipments, equipmentId] } : h,
      ),
    });
    return true;
  },

  equipInscription: (heroId: string, inscriptionId: string, slot: number) => {
    const { heroInstances } = get();
    const hero = heroInstances.find((h) => h.id === heroId);
    if (!hero) return false;
    if (slot < 0 || slot >= 9) return false;

    const newInscriptions = [...hero.inscriptions];
    while (newInscriptions.length < 9) newInscriptions.push('');
    newInscriptions[slot] = inscriptionId;

    set({
      heroInstances: get().heroInstances.map((h) =>
        h.id === heroId ? { ...h, inscriptions: newInscriptions } : h,
      ),
    });
    return true;
  },

  createLineup: (name: string) => {
    const newLineup: Lineup = {
      id: generateId(),
      name,
      slots: [],
      createTime: new Date().toISOString(),
    };
    set({ lineups: [...get().lineups, newLineup] });
    return newLineup;
  },

  updateLineup: (lineup: Lineup) => {
    set({
      lineups: get().lineups.map((l) => (l.id === lineup.id ? lineup : l)),
    });
  },

  setCurrentLineup: (lineupId: string) => {
    set({ currentLineupId: lineupId });
  },

  completeLevel: (levelId: string, stars: number, rewards?: Rewards) => {
    const { levelProgress, addGold } = get();
    const existing = levelProgress[levelId];
    const isFirstClear = !existing?.cleared;
    const firstClearAvailable = isFirstClear && !existing?.firstClearClaimed;
    const threeStarAvailable = stars >= 3 && !(existing?.threeStarClaimed || existing?.stars >= 3);

    const newProgress: LevelProgress = {
      cleared: true,
      stars: Math.max(existing?.stars || 0, stars),
      firstClearTime: existing?.firstClearTime || new Date().toISOString(),
      clearedCount: (existing?.clearedCount || 0) + 1,
      bestTurns: existing?.bestTurns ? Math.min(existing.bestTurns, stars) : stars,
      firstClearClaimed: existing?.firstClearClaimed || firstClearAvailable,
      threeStarClaimed: existing?.threeStarClaimed || threeStarAvailable,
    };

    set({
      levelProgress: { ...get().levelProgress, [levelId]: newProgress },
    });

    if (rewards) {
      if (rewards.base) {
        for (const r of rewards.base) {
          if (r.type === '金币') addGold(r.count);
          if (r.type === '钻石') set({ diamond: get().diamond + r.count });
        }
      }
      if (firstClearAvailable && rewards.firstClear) {
        for (const r of rewards.firstClear) {
          if (r.type === '金币') addGold(r.count);
          if (r.type === '钻石') set({ diamond: get().diamond + r.count });
        }
      }
      if (threeStarAvailable && rewards.threeStar) {
        for (const r of rewards.threeStar) {
          if (r.type === '金币') addGold(r.count);
          if (r.type === '钻石') set({ diamond: get().diamond + r.count });
        }
      }
    }
  },

  unlockAchievement: (id: string) => {
    set({
      achievements: { ...get().achievements, [id]: true },
    });
  },

  addBattleLog: (log: BattleLog) => {
    set({ battleLogs: [log, ...get().battleLogs].slice(0, 100) });
  },

  updateSettings: (settings: Partial<GameSettings>) => {
    set({ settings: { ...get().settings, ...settings } });
  },
}));

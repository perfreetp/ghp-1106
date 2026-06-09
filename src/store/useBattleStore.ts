import { create } from 'zustand';
import type {
  BattleHero,
  BattleStep,
  BattleResult,
  Lineup,
  Rewards,
  SkillTemplate,
  Stats,
  Buff,
  行动类型,
} from '../types';
import { heroes as heroTemplates } from '../data/heroes';
import { skills } from '../data/skills';
import { levels } from '../data/levels';

type SelectedAction = 'attack' | 'skill' | 'defend' | 'wait' | null;
type BattleResultType = 'win' | 'lose' | null;

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const createStats = (base: Partial<Stats> = {}): Stats => ({
  hp: 0,
  atk: 0,
  def: 0,
  speed: 0,
  critRate: 0.1,
  critDmg: 1.5,
  ...base,
});

const resolveStats = (templateId: string, level: number, star: number): Stats => {
  const template = heroTemplates.find((h) => h.id === templateId);
  if (!template) {
    return createStats({ hp: 1000, atk: 100, def: 50, speed: 300 });
  }
  const baseHp = template.baseStats.maxHp;
  const baseAtk = template.baseStats.attack;
  const baseDef = template.baseStats.defense;
  const baseSpeed = template.baseStats.speed;
  const gHp = template.growthStats.maxHp;
  const gAtk = template.growthStats.attack;
  const gDef = template.growthStats.defense;
  const gSpeed = template.growthStats.speed;
  const starMul = 1 + (star - 1) * 0.15;

  return createStats({
    hp: Math.round((baseHp + gHp * (level - 1)) * starMul),
    atk: Math.round((baseAtk + gAtk * (level - 1)) * starMul),
    def: Math.round((baseDef + gDef * (level - 1)) * starMul),
    speed: Math.round((baseSpeed + gSpeed * (level - 1)) * starMul),
    critRate: 0.1 + (star - 1) * 0.02,
    critDmg: 1.5 + (star - 1) * 0.1,
  });
};

const createEnemyBattleHero = (
  templateId: string,
  level: number,
  star: number,
  position: { row: number; col: number },
  idx: number,
): BattleHero => {
  const template = heroTemplates.find((h) => h.id === templateId);
  const stats = resolveStats(templateId, level, star);
  const instanceId = `enemy_${idx}_${generateId()}`;
  return {
    instanceId,
    templateId,
    isAlly: false,
    currentHP: stats.hp,
    maxHP: stats.hp,
    currentEnergy: 0,
    maxEnergy: 100,
    position,
    stats,
    buffs: [],
    skillCooldowns: {},
    isDead: false,
    isControlled: false,
    shield: 0,
    actedThisTurn: false,
  };
};

const createAllyBattleHero = (
  heroInstanceId: string,
  templateId: string,
  level: number,
  star: number,
  position: { row: number; col: number },
): BattleHero => {
  const stats = resolveStats(templateId, level, star);
  return {
    instanceId: heroInstanceId,
    templateId,
    isAlly: true,
    currentHP: stats.hp,
    maxHP: stats.hp,
    currentEnergy: 50,
    maxEnergy: 100,
    position,
    stats,
    buffs: [],
    skillCooldowns: {},
    isDead: false,
    isControlled: false,
    shield: 0,
    actedThisTurn: false,
  };
};

const computeActionOrder = (battleHeroes: BattleHero[]): string[] => {
  const alive = battleHeroes.filter((h) => !h.isDead);
  const sorted = [...alive].sort((a, b) => {
    const aSpeed = a.stats.speed;
    const bSpeed = b.stats.speed;
    if (bSpeed !== aSpeed) return bSpeed - aSpeed;
    return a.instanceId.localeCompare(b.instanceId);
  });
  return sorted.map((h) => h.instanceId);
};

const STAT_KEY_MAP: Record<string, keyof Stats> = {
  attack: 'atk',
  defense: 'def',
  speed: 'speed',
  hp: 'hp',
};

const getEffectiveStats = (hero: BattleHero): Stats => {
  const base = { ...hero.stats };
  for (const buff of hero.buffs) {
    if (!buff.effects) continue;
    for (const [k, v] of Object.entries(buff.effects)) {
      const key = k as keyof Stats;
      if (typeof base[key] === 'number' && typeof v === 'number') {
        if (buff.type === '增益') {
          (base as any)[key] = (base as any)[key] + v;
        } else if (buff.type === '减益') {
          (base as any)[key] = Math.max(0, (base as any)[key] - v);
        }
      }
    }
  }
  return base;
};

const findSkillById = (skillId: string): SkillTemplate | null => {
  const raw = skills.find((s) => s.id === skillId);
  if (!raw) return null;
  const effectTypeMap: Record<string, any> = {
    single_damage: '伤害',
    aoe_damage: '伤害',
    heal: '治疗',
    buff: '增益',
    debuff: '减益',
  };
  const rangeTypeMap: Record<string, any> = {
    single_damage: '单体',
    aoe_damage: '全体',
    heal: '全体',
    buff: '自身',
    debuff: '单体',
  };
  const effects: any[] = [];
  if (raw.damage) {
    effects.push({
      type: '伤害' as const,
      value: raw.damage,
      target: '敌方' as const,
      basedOn: 'atk' as const,
    });
  }
  if (raw.heal) {
    effects.push({
      type: '治疗' as const,
      value: raw.heal,
      target: '友方' as const,
      basedOn: 'hp' as const,
    });
  }
  if (raw.shield) {
    effects.push({
      type: '护盾' as const,
      value: raw.shield,
      target: '友方' as const,
      basedOn: 'hp' as const,
    });
  }
  if (raw.buffEffect) {
    effects.push({
      type: '增益' as const,
      value: raw.buffEffect.value,
      duration: raw.buffEffect.duration,
      stat: STAT_KEY_MAP[raw.buffEffect.stat] || raw.buffEffect.stat,
      target: '友方' as const,
    });
  }
  if (raw.debuffEffect) {
    const isStun = raw.debuffEffect.stat === 'stun';
    effects.push({
      type: isStun ? '减益' : '减益',
      value: raw.debuffEffect.value,
      duration: raw.debuffEffect.duration,
      stat: isStun ? undefined : (STAT_KEY_MAP[raw.debuffEffect.stat] || raw.debuffEffect.stat),
      isControl: isStun,
      target: '敌方' as const,
    });
  }
  return {
    id: raw.id,
    name: raw.name,
    type: raw.isPassive ? '被动' : '主动',
    description: raw.description,
    icon: raw.icon,
    cooldown: raw.cooldown,
    energyCost: raw.manaCost,
    range: { type: (raw.range as any) || rangeTypeMap[raw.type] || '单体', distance: 1 },
    effects,
  };
};

interface LevelEnemyStub {
  templateId: string;
  level: number;
  star: number;
  position: { row: number; col: number };
}

const inferEnemiesFromLegacy = (levelId: string): LevelEnemyStub[] => {
  const lv = levels.find((l: any) => l.id === levelId);
  if (!lv) return [];
  const classToTemplate: Record<string, string> = {
    warrior: 'hero_001',
    mage: 'hero_004',
    archer: 'hero_003',
    tank: 'hero_005',
    assassin: 'hero_002',
    support: 'hero_006',
  };
  return lv.enemies.map((e: any, idx: number) => ({
    templateId: classToTemplate[e.type] || 'hero_001',
    level: e.level,
    star: Math.min(1 + Math.floor(idx / 3), 3),
    position: { row: Math.floor(idx / 3), col: idx % 3 },
  }));
};

export interface BattleStoreState {
  isInBattle: boolean;
  currentLevelId: string;
  turn: number;
  battleHeroes: BattleHero[];
  actionOrder: string[];
  currentActorIndex: number;
  selectedAction: SelectedAction;
  selectedSkillId: string | null;
  validTargets: string[];
  battleSteps: BattleStep[];
  battleResult: BattleResultType;
  rewards: Rewards | null;
  isPlayerTurn: boolean;
}

export interface SkillEffectResult {
  targetId: string;
  damage?: number;
  heal?: number;
  isCrit?: boolean;
  buffsAdded?: Buff[];
  shieldAbsorbed?: number;
  shieldGained?: number;
}

export interface BattleStoreActions {
  startBattle: (levelId: string, lineup: Lineup, heroInstances?: any[]) => void;
  nextTurn: () => void;
  nextActor: () => void;
  setSelectedAction: (action: SelectedAction, skillId?: string) => void;
  executeAction: (
    actorId: string,
    action: SelectedAction,
    targets: string[],
    skillId?: string,
  ) => BattleResult[];
  calculateSkillEffect: (
    skillId: string,
    casterId: string,
    targets: string[],
  ) => SkillEffectResult[];
  checkBattleEnd: () => BattleResultType;
  endBattle: (result: BattleResultType, rewards?: Rewards) => void;
  recordStep: (step: BattleStep) => void;
  findSkillById: (skillId: string) => SkillTemplate | null;
}

export type BattleStore = BattleStoreState & BattleStoreActions;

export const useBattleStore = create<BattleStore>((set, get) => ({
  isInBattle: false,
  currentLevelId: '',
  turn: 0,
  battleHeroes: [],
  actionOrder: [],
  currentActorIndex: 0,
  selectedAction: null,
  selectedSkillId: null,
  validTargets: [],
  battleSteps: [],
  battleResult: null,
  rewards: null,
  isPlayerTurn: true,

  startBattle: (levelId: string, lineup: Lineup, heroInstances: any[] = []) => {
    const enemyStubs = inferEnemiesFromLegacy(levelId);
    const enemyHeroes = enemyStubs.map((s, i) =>
      createEnemyBattleHero(s.templateId, s.level, s.star, { row: s.position.row, col: s.position.col + 1 }, i),
    );
    const allyHeroes = lineup.slots.map((slot) => {
      const hi = heroInstances.find((h: any) => h.id === slot.heroInstanceId);
      const level = hi?.level || 1;
      const star = hi?.star || 1;
      const tplId = hi?.templateId || 'hero_001';
      const pos = { row: slot.position.row + 2, col: slot.position.col + 1 };
      return createAllyBattleHero(slot.heroInstanceId, tplId, level, star, pos);
    });

    const battleHeroes = [...allyHeroes, ...enemyHeroes];
    const order = computeActionOrder(battleHeroes);

    set({
      isInBattle: true,
      currentLevelId: levelId,
      turn: 1,
      battleHeroes,
      actionOrder: order,
      currentActorIndex: 0,
      selectedAction: null,
      selectedSkillId: null,
      validTargets: [],
      battleSteps: [],
      battleResult: null,
      rewards: null,
      isPlayerTurn: order[0] ? battleHeroes.find((h) => h.instanceId === order[0])?.isAlly ?? true : true,
    });
  },

  nextTurn: () => {
    const { battleHeroes } = get();
    const updated = battleHeroes.map((h) => {
      const newCooldowns: Record<string, number> = {};
      for (const [k, v] of Object.entries(h.skillCooldowns)) {
        if (v > 1) newCooldowns[k] = v - 1;
      }
      const newBuffs = h.buffs
        .map((b) => ({ ...b, duration: b.duration - 1 }))
        .filter((b) => b.duration > 0);
      return { ...h, skillCooldowns: newCooldowns, buffs: newBuffs, actedThisTurn: false };
    });
    const order = computeActionOrder(updated);
    set({
      turn: get().turn + 1,
      battleHeroes: updated,
      actionOrder: order,
      currentActorIndex: 0,
      selectedAction: null,
      selectedSkillId: null,
      validTargets: [],
      isPlayerTurn: order[0]
        ? updated.find((h) => h.instanceId === order[0])?.isAlly ?? true
        : true,
    });
  },

  nextActor: () => {
    const { actionOrder, battleHeroes, currentActorIndex } = get();
    let nextIdx = currentActorIndex + 1;
    while (nextIdx < actionOrder.length) {
      const id = actionOrder[nextIdx];
      const h = battleHeroes.find((x) => x.instanceId === id);
      if (h && !h.isDead && !h.actedThisTurn) break;
      nextIdx++;
    }

    if (nextIdx >= actionOrder.length) {
      get().nextTurn();
      return;
    }

    const nextActorId = actionOrder[nextIdx];
    const nextActor = battleHeroes.find((h) => h.instanceId === nextActorId);
    set({
      currentActorIndex: nextIdx,
      selectedAction: null,
      selectedSkillId: null,
      validTargets: [],
      isPlayerTurn: nextActor?.isAlly ?? true,
    });
  },

  setSelectedAction: (action: SelectedAction, skillId?: string) => {
    const { battleHeroes, actionOrder, currentActorIndex } = get();
    const actorId = actionOrder[currentActorIndex];
    const actor = battleHeroes.find((h) => h.instanceId === actorId);
    if (!actor) return;

    let validTargets: string[] = [];

    if (action === 'attack') {
      validTargets = battleHeroes.filter((h) => !h.isDead && h.isAlly !== actor.isAlly).map((h) => h.instanceId);
    } else if (action === 'skill' && skillId) {
      const skill = findSkillById(skillId);
      if (skill) {
        const targetSide = skill.effects.some((e) => e.target === '友方' || e.target === '自身')
          ? actor.isAlly
          : !actor.isAlly;
        const range = skill.range.type;
        if (range === '自身') {
          validTargets = [actor.instanceId];
        } else if (range === '全体') {
          validTargets = battleHeroes
            .filter((h) => !h.isDead && h.isAlly === targetSide)
            .map((h) => h.instanceId);
        } else {
          validTargets = battleHeroes
            .filter((h) => !h.isDead && h.isAlly === targetSide)
            .map((h) => h.instanceId);
        }
      }
    } else if (action === 'defend' || action === 'wait') {
      validTargets = [];
    }

    set({
      selectedAction: action,
      selectedSkillId: skillId || null,
      validTargets,
    });
  },

  calculateSkillEffect: (skillId: string, casterId: string, targets: string[]) => {
    const { battleHeroes } = get();
    const caster = battleHeroes.find((h) => h.instanceId === casterId);
    const skill = findSkillById(skillId);
    if (!caster || !skill) return [];

    const casterStats = getEffectiveStats(caster);
    const results: SkillEffectResult[] = [];
    const isCrit = Math.random() < casterStats.critRate;
    const critMul = isCrit ? casterStats.critDmg : 1;

    for (const tid of targets) {
      const target = battleHeroes.find((h) => h.instanceId === tid);
      if (!target) continue;

      const targetStats = getEffectiveStats(target);
      const r: SkillEffectResult = { targetId: tid, isCrit };

      for (const eff of skill.effects) {
        if (eff.type === '伤害') {
          const baseVal = typeof eff.value === 'string' ? parseInt(eff.value) : eff.value;
          const atkVal = eff.basedOn === 'atk' ? casterStats.atk : casterStats.hp * 0.1;
          const rawDmg = Math.round((baseVal + atkVal * 0.5) * critMul);
          const defVal = targetStats.def * 0.5;
          let dmg = Math.max(1, rawDmg - defVal);
          let absorbed = 0;
          if (target.shield && target.shield > 0) {
            absorbed = Math.min(target.shield, dmg);
            dmg -= absorbed;
            r.shieldAbsorbed = (r.shieldAbsorbed || 0) + absorbed;
          }
          r.damage = (r.damage || 0) + dmg;
        } else if (eff.type === '治疗') {
          const baseVal = typeof eff.value === 'string' ? parseInt(eff.value) : eff.value;
          const hpVal = eff.basedOn === 'hp' ? casterStats.hp : casterStats.atk * 0.5;
          r.heal = Math.round(baseVal + hpVal * 0.3);
        } else if (eff.type === '增益') {
          const buff: Buff = {
            id: generateId(),
            name: skill.name,
            type: '增益',
            duration: eff.duration || 3,
            maxDuration: eff.duration || 3,
            effects: { [eff.stat || 'atk']: eff.value } as any,
            dispellable: true,
            sourceSkillId: skill.id,
            sourceHeroId: casterId,
          };
          r.buffsAdded = [...(r.buffsAdded || []), buff];
        } else if (eff.type === '减益') {
          const buff: Buff = {
            id: generateId(),
            name: skill.name,
            type: eff.isControl ? '控制' : '减益',
            duration: eff.duration || 3,
            maxDuration: eff.duration || 3,
            effects: eff.stat ? ({ [eff.stat]: eff.value } as any) : {},
            dispellable: true,
            sourceSkillId: skill.id,
            sourceHeroId: casterId,
          };
          r.buffsAdded = [...(r.buffsAdded || []), buff];
        } else if (eff.type === '护盾') {
          const baseVal = typeof eff.value === 'string' ? parseInt(eff.value) : eff.value;
          r.shieldGained = (r.shieldGained || 0) + baseVal;
        }
      }
      results.push(r);
    }
    return results;
  },

  executeAction: (
    actorId: string,
    action: SelectedAction,
    targets: string[],
    skillId?: string,
  ) => {
    const { battleHeroes, turn, recordStep } = get();
    const actor = battleHeroes.find((h) => h.instanceId === actorId);
    if (!actor || actor.isDead) return [];

    const results: BattleResult[] = [];
    let actionType: 行动类型 = '待机';

    if (action === 'attack') {
      actionType = '普通攻击';
      const actorStats = getEffectiveStats(actor);
      const isCrit = Math.random() < actorStats.critRate;
      const critMul = isCrit ? actorStats.critDmg : 1;
      for (const tid of targets) {
        const target = battleHeroes.find((h) => h.instanceId === tid);
        if (!target || target.isDead) continue;
        const targetStats = getEffectiveStats(target);
        const rawDmg = Math.round((actorStats.atk * 1.0) * critMul);
        let dmg = Math.max(1, rawDmg - targetStats.def * 0.4);
        let absorbed = 0;
        if (target.shield && target.shield > 0) {
          absorbed = Math.min(target.shield, dmg);
          dmg -= absorbed;
        }
        results.push({
          targetId: tid,
          damage: dmg,
          isCrit,
          shieldAbsorbed: absorbed || undefined,
          energyChange: 15,
        });
      }
    } else if (action === 'skill' && skillId) {
      actionType = '释放技能';
      const skill = findSkillById(skillId);
      if (skill) {
        const effResults = get().calculateSkillEffect(skillId, actorId, targets);
        for (const r of effResults) {
          results.push({
            targetId: r.targetId,
            damage: r.damage,
            heal: r.heal,
            isCrit: r.isCrit,
            buffsAdded: r.buffsAdded,
            shieldAbsorbed: r.shieldAbsorbed,
            shieldGained: r.shieldGained,
          });
        }
      }
    } else if (action === 'defend') {
      actionType = '防御';
    } else {
      actionType = '待机';
    }

    const updatedHeroes = battleHeroes.map((h) => {
      if (h.instanceId === actorId) {
        const newCooldowns = { ...h.skillCooldowns };
        let newEnergy = h.currentEnergy;
        if (action === 'skill' && skillId) {
          const skill = findSkillById(skillId);
          if (skill) {
            newCooldowns[skillId] = skill.cooldown;
            newEnergy = Math.max(0, h.currentEnergy - skill.energyCost);
          }
        } else if (action === 'attack') {
          newEnergy = Math.min(h.maxEnergy, h.currentEnergy + 20);
        } else if (action === 'defend') {
          newEnergy = Math.min(h.maxEnergy, h.currentEnergy + 10);
        }
        return {
          ...h,
          actedThisTurn: true,
          skillCooldowns: newCooldowns,
          currentEnergy: newEnergy,
        };
      }

      const r = results.find((x) => x.targetId === h.instanceId);
      if (!r) return h;

      let newHP = h.currentHP;
      let newShield = h.shield || 0;
      let newBuffs = [...h.buffs];
      let newEnergy = h.currentEnergy;

      if (r.damage) newHP = Math.max(0, newHP - r.damage);
      if (r.shieldAbsorbed) newShield = Math.max(0, newShield - r.shieldAbsorbed);
      if (r.shieldGained) newShield += r.shieldGained;
      if (r.heal) newHP = Math.min(h.maxHP, newHP + r.heal);
      if (r.buffsAdded) newBuffs = [...newBuffs, ...r.buffsAdded];
      if (r.energyChange) newEnergy = Math.max(0, Math.min(h.maxEnergy, newEnergy + r.energyChange));
      if (r.damage) newEnergy = Math.min(h.maxEnergy, newEnergy + 10);

      const isDead = newHP <= 0;

      return {
        ...h,
        currentHP: newHP,
        shield: newShield,
        buffs: newBuffs,
        currentEnergy: newEnergy,
        isDead,
      };
    });

    const step: BattleStep = {
      turn,
      actorId,
      action: actionType,
      skillId: action === 'skill' ? skillId : undefined,
      targets,
      results,
      snapshotBefore: {
        actorHP: actor.currentHP,
        actorEnergy: actor.currentEnergy,
      },
      timestamp: Date.now(),
    };

    set({
      battleHeroes: updatedHeroes,
      selectedAction: null,
      selectedSkillId: null,
      validTargets: [],
    });

    recordStep(step);

    const endResult = get().checkBattleEnd();
    if (endResult) {
      get().endBattle(endResult);
    }

    return results;
  },

  checkBattleEnd: () => {
    const { battleHeroes, isInBattle } = get();
    if (!isInBattle) return null;
    const aliveAllies = battleHeroes.filter((h) => h.isAlly && !h.isDead);
    const aliveEnemies = battleHeroes.filter((h) => !h.isAlly && !h.isDead);
    if (aliveAllies.length === 0) return 'lose';
    if (aliveEnemies.length === 0) return 'win';
    return null;
  },

  endBattle: (result: BattleResultType, rewards?: Rewards) => {
    set({
      battleResult: result,
      rewards: rewards || null,
    });
  },

  recordStep: (step: BattleStep) => {
    set({ battleSteps: [...get().battleSteps, step] });
  },

  findSkillById,
}));

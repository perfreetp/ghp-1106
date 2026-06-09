import type {
  Stats,
  BattleHero,
  HeroInstance,
  HeroTemplate,
  Equipment,
  Inscription,
  Buff,
  SkillTemplate,
  Position,
} from '../types';

const BASE_DAMAGE_MULTIPLIER = 1.0;
const DEFAULT_CRIT_DMG = 1.5;
const MIN_DAMAGE = 1;
const DEFENSE_REDUCTION_FACTOR = 0.5;
const HIT_BASE_RATE = 0.95;
const SPEED_HIT_FACTOR = 0.002;
const MIN_HIT_RATE = 0.1;
const MAX_HIT_RATE = 1.0;

export function calculateDamage(
  attacker: BattleHero,
  defender: BattleHero,
  isCrit: boolean = false,
  ignoreDef: boolean = false
): number {
  const atk = attacker.stats.atk;
  const def = ignoreDef ? 0 : defender.stats.def;
  const effectiveDef = def * DEFENSE_REDUCTION_FACTOR;
  let baseDamage = Math.max(atk - effectiveDef, 1);
  baseDamage *= BASE_DAMAGE_MULTIPLIER;

  if (isCrit) {
    const critDmg = attacker.stats.critDmg || DEFAULT_CRIT_DMG;
    baseDamage *= critDmg;
  }

  return Math.floor(Math.max(baseDamage, MIN_DAMAGE));
}

export function calculateHeal(healer: BattleHero, amount: number | string): number {
  let healAmount: number;

  if (typeof amount === 'string') {
    const isPercent = amount.includes('%');
    const numericValue = parseFloat(amount.replace('%', ''));
    if (isPercent) {
      healAmount = (healer.stats.hp * numericValue) / 100;
    } else {
      healAmount = numericValue;
    }
  } else {
    healAmount = amount;
  }

  const hpRegen = healer.stats.hpRegen || 0;
  healAmount += hpRegen;

  return Math.floor(Math.max(healAmount, 0));
}

export function isHit(attacker: BattleHero, defender: BattleHero): boolean {
  const speedDiff = attacker.stats.speed - defender.stats.speed;
  let hitRate = HIT_BASE_RATE + speedDiff * SPEED_HIT_FACTOR;

  const effectHit = attacker.stats.effectHit || 0;
  const effectResist = defender.stats.effectResist || 0;
  hitRate = hitRate + effectHit - effectResist;

  hitRate = Math.max(MIN_HIT_RATE, Math.min(MAX_HIT_RATE, hitRate));
  return Math.random() < hitRate;
}

export function isCritical(attacker: BattleHero): boolean {
  const critRate = attacker.stats.critRate || 0;
  return Math.random() < critRate;
}

export function getActionOrder(heroes: BattleHero[]): BattleHero[] {
  return [...heroes]
    .filter((hero) => !hero.isDead)
    .sort((a, b) => {
      if (b.stats.speed !== a.stats.speed) {
        return b.stats.speed - a.stats.speed;
      }
      return a.instanceId.localeCompare(b.instanceId);
    });
}

export function calculateRange(
  attackerPos: Position,
  targetPos: Position,
  range: number
): boolean {
  const rowDiff = Math.abs(attackerPos.row - targetPos.row);
  const colDiff = Math.abs(attackerPos.col - targetPos.col);
  const chebyshevDist = Math.max(rowDiff, colDiff);
  return chebyshevDist <= range;
}

function getCrossTargets(positions: Position[], center: Position, range: number): Position[] {
  return positions.filter((p) => {
    if (p.row === center.row && Math.abs(p.col - center.col) <= range) return true;
    if (p.col === center.col && Math.abs(p.row - center.row) <= range) return true;
    return false;
  });
}

function getHorizontalTargets(positions: Position[], center: Position): Position[] {
  return positions.filter((p) => p.row === center.row);
}

function getVerticalTargets(positions: Position[], center: Position): Position[] {
  return positions.filter((p) => p.col === center.col);
}

export function getSkillTargets(
  battleHeroes: BattleHero[],
  caster: BattleHero,
  skill: SkillTemplate,
  selectedPos?: Position
): BattleHero[] {
  const aliveHeroes = battleHeroes.filter((h) => !h.isDead);
  const rangeType = skill.range.type;
  const rangeDist = skill.range.distance;

  const targetCampHeroes = aliveHeroes.filter((h) => {
    switch (skill.effects[0]?.target) {
      case '敌方':
        return h.isAlly !== caster.isAlly;
      case '友方':
        return h.isAlly === caster.isAlly;
      case '自身':
        return h.instanceId === caster.instanceId;
      default:
        return h.isAlly !== caster.isAlly;
    }
  });

  if (rangeType === '自身') {
    return [caster];
  }

  if (rangeType === '全体') {
    return targetCampHeroes;
  }

  const anchorPos = selectedPos || targetCampHeroes[0]?.position;
  if (!anchorPos) return [];

  const targetPositions = targetCampHeroes.map((h) => h.position);
  let matchedPositions: Position[] = [];

  switch (rangeType) {
    case '单体':
      matchedPositions = [anchorPos];
      break;
    case '横排':
      matchedPositions = getHorizontalTargets(targetPositions, anchorPos);
      break;
    case '纵列':
      matchedPositions = getVerticalTargets(targetPositions, anchorPos);
      break;
    case '十字':
      matchedPositions = getCrossTargets(targetPositions, anchorPos, rangeDist);
      break;
    case '区域':
      matchedPositions = targetPositions.filter((p) => calculateRange(anchorPos, p, rangeDist));
      break;
  }

  return targetCampHeroes.filter((h) =>
    matchedPositions.some((mp) => mp.row === h.position.row && mp.col === h.position.col)
  );
}

export function applyBuffEffects(hero: BattleHero, buffs: Buff[]): Stats {
  const baseStats = { ...hero.stats };
  const resultStats: Stats = { ...baseStats };

  for (const buff of buffs) {
    const stacks = buff.stacks || 1;
    for (const [statKey, value] of Object.entries(buff.effects)) {
      if (value !== undefined && value !== null) {
        const key = statKey as keyof Stats;
        const currentValue = (resultStats[key] as number) || 0;
        resultStats[key] = (currentValue + (value as number) * stacks) as Stats[typeof key];
      }
    }
  }

  resultStats.hp = Math.max(1, resultStats.hp);
  resultStats.atk = Math.max(0, resultStats.atk);
  resultStats.def = Math.max(0, resultStats.def);
  resultStats.speed = Math.max(0, resultStats.speed);
  resultStats.critRate = Math.max(0, Math.min(1, resultStats.critRate));
  resultStats.critDmg = Math.max(1, resultStats.critDmg);

  return resultStats;
}

function mergeStats(base: Partial<Stats>, bonus: Partial<Stats>): Partial<Stats> {
  const result: Partial<Stats> = { ...base };
  for (const [key, value] of Object.entries(bonus)) {
    if (value !== undefined && value !== null) {
      const k = key as keyof Stats;
      result[k] = ((result[k] as number) || 0) + (value as number);
    }
  }
  return result;
}

export function calculateHeroStats(
  heroInstance: HeroInstance,
  template: HeroTemplate,
  equipments: Equipment[],
  inscriptions: Inscription[]
): Stats {
  const levelFactor = heroInstance.level - 1;
  const starFactor = 1 + (heroInstance.star - 1) * 0.1;
  const awakenFactor = 1 + (heroInstance.awaken || 0) * 0.1;

  let finalStats: Stats = {
    hp: Math.floor((template.baseStats.hp + template.growthStats.hp * levelFactor) * starFactor * awakenFactor),
    atk: Math.floor((template.baseStats.atk + template.growthStats.atk * levelFactor) * starFactor * awakenFactor),
    def: Math.floor((template.baseStats.def + template.growthStats.def * levelFactor) * starFactor * awakenFactor),
    speed: Math.floor((template.baseStats.speed + template.growthStats.speed * levelFactor) * starFactor * awakenFactor),
    critRate: template.baseStats.critRate,
    critDmg: template.baseStats.critDmg || DEFAULT_CRIT_DMG,
    effectHit: template.baseStats.effectHit || 0,
    effectResist: template.baseStats.effectResist || 0,
    hpRegen: template.baseStats.hpRegen || 0,
  };

  let equipBonus: Partial<Stats> = {};
  for (const equip of equipments) {
    equipBonus = mergeStats(equipBonus, equip.mainStats);
    if (equip.subStats) {
      equipBonus = mergeStats(equipBonus, equip.subStats);
    }
  }

  const setCounts: Record<string, number> = {};
  let inscriptionBonus: Partial<Stats> = {};
  for (const insc of inscriptions) {
    inscriptionBonus = mergeStats(inscriptionBonus, insc.mainStat);
    if (insc.subStats) {
      inscriptionBonus = mergeStats(inscriptionBonus, insc.subStats);
    }
    setCounts[insc.setName] = (setCounts[insc.setName] || 0) + 1;
  }

  const processedSets = new Set<string>();
  for (const insc of inscriptions) {
    if (processedSets.has(insc.setName)) continue;
    processedSets.add(insc.setName);
    const count = setCounts[insc.setName] || 0;
    for (const bonus of insc.setBonus) {
      if (count >= bonus.count && bonus.stats) {
        inscriptionBonus = mergeStats(inscriptionBonus, bonus.stats);
      }
    }
  }

  const allBonus = mergeStats(equipBonus, inscriptionBonus);
  for (const [key, value] of Object.entries(allBonus)) {
    if (value !== undefined && value !== null) {
      const k = key as keyof Stats;
      finalStats[k] = ((finalStats[k] as number) + (value as number)) as Stats[typeof k];
    }
  }

  finalStats.hp = Math.max(1, Math.floor(finalStats.hp));
  finalStats.atk = Math.max(0, Math.floor(finalStats.atk));
  finalStats.def = Math.max(0, Math.floor(finalStats.def));
  finalStats.speed = Math.max(0, Math.floor(finalStats.speed));
  finalStats.critRate = Math.max(0, Math.min(1, finalStats.critRate));
  finalStats.critDmg = Math.max(1, finalStats.critDmg);

  return finalStats;
}

export function estimatePower(heroStats: Stats): number {
  const hpWeight = 1;
  const atkWeight = 4;
  const defWeight = 3;
  const speedWeight = 2;
  const critRateWeight = 300;
  const critDmgWeight = 100;
  const effectHitWeight = 150;
  const effectResistWeight = 150;
  const hpRegenWeight = 2;

  let power = 0;
  power += heroStats.hp * hpWeight;
  power += heroStats.atk * atkWeight;
  power += heroStats.def * defWeight;
  power += heroStats.speed * speedWeight;
  power += heroStats.critRate * critRateWeight;
  power += heroStats.critDmg * critDmgWeight;
  power += (heroStats.effectHit || 0) * effectHitWeight;
  power += (heroStats.effectResist || 0) * effectResistWeight;
  power += (heroStats.hpRegen || 0) * hpRegenWeight;

  return Math.floor(power);
}

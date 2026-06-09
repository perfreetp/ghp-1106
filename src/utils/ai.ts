import type { BattleHero, SkillTemplate } from '../types';
import { getSkillTargets } from './battle';

export interface AiDecision {
  action: '普通攻击' | '释放技能' | '待机';
  skillId?: string;
  targetIds: string[];
}

const LOW_HP_THRESHOLD = 0.4;
const BACK_ROW_PENALTY = 0.15;
const HEAL_TRIGGER_HP = 0.6;

export function selectBestTarget(
  enemy: BattleHero,
  enemies: BattleHero[],
  allies: BattleHero[],
  skill?: SkillTemplate
): BattleHero | null {
  const aliveAllies = allies.filter((a) => !a.isDead);
  if (aliveAllies.length === 0) return null;

  const isHealSkill = skill?.effects.some((e) => e.type === '治疗');
  if (isHealSkill) {
    const woundedAllies = enemies
      .filter((e) => !e.isDead)
      .filter((e) => e.currentHP / e.maxHP < HEAL_TRIGGER_HP);

    if (woundedAllies.length > 0) {
      woundedAllies.sort((a, b) => a.currentHP / a.maxHP - b.currentHP / b.maxHP);
      return woundedAllies[0];
    }
  }

  const scoredTargets = aliveAllies.map((ally) => {
    const hpRatio = ally.currentHP / ally.maxHP;
    let score = 0;

    score += (1 - hpRatio) * 50;

    if (hpRatio < LOW_HP_THRESHOLD) {
      score += 30;
    }

    if (ally.position.row === 2) {
      score += 20;
    } else if (ally.position.row === 0) {
      score -= (enemies.filter((e) => !e.isDead).length > 1 ? BACK_ROW_PENALTY * 100 : 0);
    }

    const defScore = 100 - Math.min(ally.stats.def * 0.5, 50);
    score += defScore;

    score += Math.random() * 10;

    return { target: ally, score };
  });

  scoredTargets.sort((a, b) => b.score - a.score);
  return scoredTargets[0].target;
}

export function selectBestSkill(
  enemy: BattleHero,
  energy: number
): SkillTemplate | null {
  return null;
}

export function enemyAiTurn(
  enemy: BattleHero,
  allHeroes: BattleHero[],
  allies: BattleHero[]
): AiDecision {
  if (enemy.isDead || enemy.isControlled) {
    return { action: '待机', targetIds: [] };
  }

  const enemies = allHeroes.filter((h) => !h.isAlly);
  const playerAllies = allHeroes.filter((h) => h.isAlly);

  const availableSkills: SkillTemplate[] = [];

  let selectedSkill: SkillTemplate | null = null;
  let actionType: '普通攻击' | '释放技能' = '普通攻击';

  for (const skill of availableSkills) {
    const cooldown = enemy.skillCooldowns[skill.id] || 0;
    if (cooldown > 0) continue;

    if (enemy.currentEnergy >= skill.energyCost) {
      selectedSkill = skill;
      actionType = '释放技能';
      break;
    }
  }

  const target = selectBestTarget(enemy, enemies, playerAllies, selectedSkill || undefined);
  if (!target) {
    return { action: '待机', targetIds: [] };
  }

  let targetIds: string[] = [target.instanceId];

  if (selectedSkill) {
    const skillTargets = getSkillTargets(allHeroes, enemy, selectedSkill, target.position);
    targetIds = skillTargets.map((t) => t.instanceId);
  }

  return {
    action: actionType,
    skillId: selectedSkill?.id,
    targetIds,
  };
}

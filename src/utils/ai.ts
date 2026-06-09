import type { BattleHero, SkillTemplate } from '../types';
import { getSkillTargets } from './battle';
import { heroes as heroTemplates } from '../data/heroes';
import { skills } from '../data/skills';

export interface AiDecision {
  action: '普通攻击' | '释放技能' | '待机';
  skillId?: string;
  targetIds: string[];
}

const LOW_HP_THRESHOLD = 0.4;
const BACK_ROW_PENALTY = 0.15;
const HEAL_TRIGGER_HP = 0.6;

function buildSkillFromId(skillId: string): SkillTemplate | null {
  const raw = skills.find((s: any) => s.id === skillId);
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
  if (raw.buffEffect) {
    effects.push({
      type: '增益' as const,
      value: raw.buffEffect.value,
      duration: raw.buffEffect.duration,
      target: '友方' as const,
    });
  }
  if (raw.debuffEffect) {
    effects.push({
      type: '减益' as const,
      value: raw.debuffEffect.value,
      duration: raw.debuffEffect.duration,
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
    range: { type: rangeTypeMap[raw.type] || '单体', distance: 1 },
    effects,
  };
}

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
  const template = heroTemplates.find((h: any) => h.id === enemy.templateId);
  if (!template) return null;
  for (const sid of template.skillIds) {
    const sk = buildSkillFromId(sid);
    if (sk) {
      const cooldown = enemy.skillCooldowns[sk.id] || 0;
      if (cooldown <= 0 && energy >= sk.energyCost) {
        return sk;
      }
    }
  }
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

  const template = heroTemplates.find((h: any) => h.id === enemy.templateId);
  const availableSkills: SkillTemplate[] = [];
  if (template) {
    for (const sid of template.skillIds) {
      const sk = buildSkillFromId(sid);
      if (sk) availableSkills.push(sk);
    }
  }

  const readySkills: SkillTemplate[] = [];
  for (const skill of availableSkills) {
    const cooldown = enemy.skillCooldowns[skill.id] || 0;
    if (cooldown > 0) continue;
    if (enemy.currentEnergy >= skill.energyCost) {
      readySkills.push(skill);
    }
  }

  let selectedSkill: SkillTemplate | null = null;
  let actionType: '普通攻击' | '释放技能' = '普通攻击';

  if (readySkills.length > 0) {
    const isWounded = enemies.some((e) => !e.isDead && e.currentHP / e.maxHP < 0.6);
    const healSkills = readySkills.filter((s) => s.effects.some((e) => e.type === '治疗'));

    if (healSkills.length > 0 && isWounded) {
      selectedSkill = healSkills[0];
      actionType = '释放技能';
    } else if (enemy.currentEnergy >= 80) {
      readySkills.sort((a, b) => b.energyCost - a.energyCost);
      selectedSkill = readySkills[0];
      actionType = '释放技能';
    } else if (enemy.currentEnergy > 50 && Math.random() < 0.5) {
      selectedSkill = readySkills[Math.floor(Math.random() * readySkills.length)];
      actionType = '释放技能';
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

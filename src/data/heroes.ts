export type HeroClass = 'warrior' | 'mage' | 'tank' | 'assassin' | 'marksman' | 'support';

export interface HeroStats {
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface HeroGrowth {
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Hero {
  id: string;
  name: string;
  avatar: string;
  heroClass: HeroClass;
  className: string;
  description: string;
  baseStats: HeroStats;
  growthStats: HeroGrowth;
  skillIds: string[];
}

export const heroes: Hero[] = [
  {
    id: 'hero_001',
    name: '李信',
    avatar: '🗡️',
    heroClass: 'warrior',
    className: '战士',
    description: '统御战场的狂暴战士，攻守兼备，能在战斗中切换形态',
    baseStats: { maxHp: 3500, maxMana: 400, attack: 180, defense: 120, speed: 380 },
    growthStats: { maxHp: 320, maxMana: 35, attack: 22, defense: 15, speed: 5 },
    skillIds: ['skill_001', 'skill_004', 'skill_015'],
  },
  {
    id: 'hero_002',
    name: '阿轲',
    avatar: '🥷',
    heroClass: 'assassin',
    className: '刺客',
    description: '神秘的刺客大师，擅长从背后发起致命一击',
    baseStats: { maxHp: 2800, maxMana: 350, attack: 220, defense: 80, speed: 420 },
    growthStats: { maxHp: 200, maxMana: 25, attack: 30, defense: 8, speed: 8 },
    skillIds: ['skill_006', 'skill_018', 'skill_015'],
  },
  {
    id: 'hero_003',
    name: '后羿',
    avatar: '🏹',
    heroClass: 'marksman',
    className: '射手',
    description: '射日的神箭手，拥有强大的远程输出能力',
    baseStats: { maxHp: 2900, maxMana: 380, attack: 200, defense: 90, speed: 390 },
    growthStats: { maxHp: 220, maxMana: 30, attack: 28, defense: 9, speed: 6 },
    skillIds: ['skill_009', 'skill_018', 'skill_005'],
  },
  {
    id: 'hero_004',
    name: '安琪拉',
    avatar: '🔮',
    heroClass: 'mage',
    className: '法师',
    description: '魔法少女，操纵火焰的强大法师，爆发伤害极高',
    baseStats: { maxHp: 2600, maxMana: 600, attack: 160, defense: 70, speed: 360 },
    growthStats: { maxHp: 180, maxMana: 55, attack: 18, defense: 7, speed: 4 },
    skillIds: ['skill_007', 'skill_014', 'skill_002'],
  },
  {
    id: 'hero_005',
    name: '亚瑟',
    avatar: '🛡️',
    heroClass: 'tank',
    className: '坦克',
    description: '正义的骑士，拥有强大的防御能力和续航能力',
    baseStats: { maxHp: 4200, maxMana: 350, attack: 150, defense: 180, speed: 370 },
    growthStats: { maxHp: 400, maxMana: 25, attack: 15, defense: 22, speed: 4 },
    skillIds: ['skill_008', 'skill_010', 'skill_001'],
  },
  {
    id: 'hero_006',
    name: '蔡文姬',
    avatar: '🎵',
    heroClass: 'support',
    className: '辅助',
    description: '天籁之音的琴师，能为队友提供强大的治疗和增益效果',
    baseStats: { maxHp: 3000, maxMana: 550, attack: 120, defense: 100, speed: 380 },
    growthStats: { maxHp: 240, maxMana: 50, attack: 10, defense: 12, speed: 6 },
    skillIds: ['skill_003', 'skill_011', 'skill_017'],
  },
  {
    id: 'hero_007',
    name: '铠',
    avatar: '⚔️',
    heroClass: 'warrior',
    className: '战士',
    description: '魔铠附身的剑客，单挑能力极强，伤害爆炸',
    baseStats: { maxHp: 3600, maxMana: 420, attack: 190, defense: 130, speed: 390 },
    growthStats: { maxHp: 330, maxMana: 38, attack: 24, defense: 16, speed: 5 },
    skillIds: ['skill_004', 'skill_001', 'skill_005'],
  },
  {
    id: 'hero_008',
    name: '妲己',
    avatar: '🦊',
    heroClass: 'mage',
    className: '法师',
    description: '魅惑狐妖，拥有强大的单体爆发和控制能力',
    baseStats: { maxHp: 2500, maxMana: 580, attack: 150, defense: 65, speed: 355 },
    growthStats: { maxHp: 170, maxMana: 52, attack: 16, defense: 6, speed: 3 },
    skillIds: ['skill_016', 'skill_018', 'skill_002'],
  },
  {
    id: 'hero_009',
    name: '花木兰',
    avatar: '⚔️',
    heroClass: 'warrior',
    className: '战士',
    description: '巾帼英雄，双形态切换，攻防一体的全能战士',
    baseStats: { maxHp: 3400, maxMana: 400, attack: 185, defense: 115, speed: 400 },
    growthStats: { maxHp: 300, maxMana: 32, attack: 23, defense: 14, speed: 6 },
    skillIds: ['skill_001', 'skill_012', 'skill_015'],
  },
  {
    id: 'hero_010',
    name: '孙悟空',
    avatar: '🐵',
    heroClass: 'assassin',
    className: '刺客',
    description: '齐天大圣，暴击伤害惊人，来去如风的斗战胜佛',
    baseStats: { maxHp: 3000, maxMana: 380, attack: 210, defense: 85, speed: 430 },
    growthStats: { maxHp: 220, maxMana: 28, attack: 32, defense: 9, speed: 9 },
    skillIds: ['skill_006', 'skill_018', 'skill_013'],
  },
  {
    id: 'hero_011',
    name: '诸葛亮',
    avatar: '📜',
    heroClass: 'mage',
    className: '法师',
    description: '卧龙军师，谋略过人，法术精准而致命',
    baseStats: { maxHp: 2700, maxMana: 620, attack: 155, defense: 72, speed: 365 },
    growthStats: { maxHp: 190, maxMana: 58, attack: 17, defense: 8, speed: 5 },
    skillIds: ['skill_002', 'skill_014', 'skill_007'],
  },
  {
    id: 'hero_012',
    name: '牛魔',
    avatar: '🐂',
    heroClass: 'tank',
    className: '坦克',
    description: '大力牛魔王，皮糙肉厚，能为队友提供强力护盾',
    baseStats: { maxHp: 4500, maxMana: 380, attack: 140, defense: 200, speed: 360 },
    growthStats: { maxHp: 420, maxMana: 28, attack: 13, defense: 25, speed: 3 },
    skillIds: ['skill_017', 'skill_008', 'skill_010'],
  },
  {
    id: 'hero_013',
    name: '孙尚香',
    avatar: '💃',
    heroClass: 'marksman',
    className: '射手',
    description: '大小姐驾到，灵活机动，远程输出能力出众',
    baseStats: { maxHp: 2800, maxMana: 360, attack: 205, defense: 85, speed: 400 },
    growthStats: { maxHp: 210, maxMana: 28, attack: 29, defense: 8, speed: 7 },
    skillIds: ['skill_009', 'skill_013', 'skill_004'],
  },
  {
    id: 'hero_014',
    name: '貂蝉',
    avatar: '🌸',
    heroClass: 'support',
    className: '辅助',
    description: '绝世舞姬，能在起舞中治疗队友并削弱敌人',
    baseStats: { maxHp: 2850, maxMana: 560, attack: 130, defense: 95, speed: 375 },
    growthStats: { maxHp: 220, maxMana: 48, attack: 12, defense: 11, speed: 5 },
    skillIds: ['skill_011', 'skill_016', 'skill_017'],
  },
  {
    id: 'hero_015',
    name: '韩信',
    avatar: '🎖️',
    heroClass: 'assassin',
    className: '刺客',
    description: '国士无双，机动性极强，能快速穿梭战场收割人头',
    baseStats: { maxHp: 2900, maxMana: 370, attack: 215, defense: 78, speed: 440 },
    growthStats: { maxHp: 210, maxMana: 26, attack: 31, defense: 8, speed: 10 },
    skillIds: ['skill_013', 'skill_006', 'skill_018'],
  },
];

export const heroClassMap: Record<HeroClass, string> = {
  warrior: '战士',
  mage: '法师',
  tank: '坦克',
  assassin: '刺客',
  marksman: '射手',
  support: '辅助',
};

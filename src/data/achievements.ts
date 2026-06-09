export interface AchievementReward {
  gold?: number;
  exp?: number;
  diamond?: number;
}

export interface Achievement {
  id: string;
  name: string;
  category: 'battle' | 'collection' | 'level' | 'special';
  categoryName: string;
  description: string;
  condition: string;
  targetValue: number;
  reward: AchievementReward;
  icon: string;
}

export const achievements: Achievement[] = [
  {
    id: 'ach_battle_001',
    name: '初出茅庐',
    category: 'battle',
    categoryName: '战斗',
    description: '完成第一场战斗，踏上王者之路',
    condition: '累计赢得1场战斗',
    targetValue: 1,
    reward: { gold: 100, exp: 50 },
    icon: 'sword'
  },
  {
    id: 'ach_battle_002',
    name: '首杀',
    category: 'battle',
    categoryName: '战斗',
    description: '在战斗中拿下第一个击杀',
    condition: '累计获得1次首杀',
    targetValue: 1,
    reward: { gold: 200, exp: 100 },
    icon: 'skull'
  },
  {
    id: 'ach_battle_003',
    name: '十连杀',
    category: 'battle',
    categoryName: '战斗',
    description: '在一场战斗中连续击杀10名敌人',
    condition: '单场战斗连续击杀10人',
    targetValue: 10,
    reward: { gold: 500, exp: 300, diamond: 10 },
    icon: 'fire'
  },
  {
    id: 'ach_battle_004',
    name: '百战百胜',
    category: 'battle',
    categoryName: '战斗',
    description: '累计赢得100场战斗胜利',
    condition: '累计赢得100场战斗',
    targetValue: 100,
    reward: { gold: 2000, exp: 1500, diamond: 50 },
    icon: 'trophy'
  },
  {
    id: 'ach_battle_005',
    name: '以一敌百',
    category: 'battle',
    categoryName: '战斗',
    description: '累计击杀1000名敌人',
    condition: '累计击杀1000名敌人',
    targetValue: 1000,
    reward: { gold: 3000, exp: 2000, diamond: 80 },
    icon: 'axe'
  },
  {
    id: 'ach_collection_001',
    name: '英雄收藏家',
    category: 'collection',
    categoryName: '收集',
    description: '收集5位不同的英雄',
    condition: '收集5位英雄',
    targetValue: 5,
    reward: { gold: 500, exp: 200 },
    icon: 'users'
  },
  {
    id: 'ach_collection_002',
    name: '装备大师',
    category: 'collection',
    categoryName: '收集',
    description: '收集10件不同的装备',
    condition: '收集10件装备',
    targetValue: 10,
    reward: { gold: 800, exp: 400 },
    icon: 'shield'
  },
  {
    id: 'ach_collection_003',
    name: '铭文达人',
    category: 'collection',
    categoryName: '收集',
    description: '收集15种不同的铭文',
    condition: '收集15种铭文',
    targetValue: 15,
    reward: { gold: 1000, exp: 500, diamond: 20 },
    icon: 'gem'
  },
  {
    id: 'ach_collection_004',
    name: '富甲一方',
    category: 'collection',
    categoryName: '收集',
    description: '累计获得金币达到100000',
    condition: '累计获得100000金币',
    targetValue: 100000,
    reward: { gold: 5000, exp: 2000, diamond: 100 },
    icon: 'coins'
  },
  {
    id: 'ach_level_001',
    name: '初入峡谷',
    category: 'level',
    categoryName: '关卡',
    description: '通关第一章第1关',
    condition: '通关第1章第1关',
    targetValue: 1,
    reward: { gold: 150, exp: 100 },
    icon: 'flag'
  },
  {
    id: 'ach_level_002',
    name: '通关第一章',
    category: 'level',
    categoryName: '关卡',
    description: '通关第一章所有关卡',
    condition: '通关第一章全部5关',
    targetValue: 5,
    reward: { gold: 1000, exp: 800, diamond: 30 },
    icon: 'map'
  },
  {
    id: 'ach_level_003',
    name: '长城守卫',
    category: 'level',
    categoryName: '关卡',
    description: '通关第二章所有关卡',
    condition: '通关第二章全部5关',
    targetValue: 5,
    reward: { gold: 2500, exp: 1800, diamond: 60 },
    icon: 'castle'
  },
  {
    id: 'ach_level_004',
    name: '挑战王者',
    category: 'level',
    categoryName: '关卡',
    description: '通关第三章最终关卡',
    condition: '通关第三章第5关',
    targetValue: 1,
    reward: { gold: 5000, exp: 4000, diamond: 200 },
    icon: 'crown'
  },
  {
    id: 'ach_special_001',
    name: '三星通关',
    category: 'special',
    categoryName: '特殊',
    description: '以3星评价通过任意关卡',
    condition: '任意关卡获得3星评价',
    targetValue: 1,
    reward: { gold: 500, exp: 300, diamond: 10 },
    icon: 'star'
  },
  {
    id: 'ach_special_002',
    name: '完美无瑕',
    category: 'special',
    categoryName: '特殊',
    description: '无伤通过任意一个关卡',
    condition: '无伤通过任意关卡',
    targetValue: 1,
    reward: { gold: 1500, exp: 1000, diamond: 50 },
    icon: 'heart'
  }
];

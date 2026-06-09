export interface EquipmentAttribute {
  name: string;
  value: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'weapon' | 'armor' | 'boots' | 'accessory';
  categoryName: string;
  price: number;
  attributes: EquipmentAttribute[];
  description: string;
}

export const equipmentList: Equipment[] = [
  {
    id: 'eq_weapon_001',
    name: '无尽战刃',
    category: 'weapon',
    categoryName: '武器',
    price: 2140,
    attributes: [
      { name: '物理攻击', value: 110 },
      { name: '暴击率', value: 25 },
      { name: '暴击效果', value: 40 }
    ],
    description: '大幅提升暴击伤害的核心装备'
  },
  {
    id: 'eq_weapon_002',
    name: '宗师之力',
    category: 'weapon',
    categoryName: '武器',
    price: 2100,
    attributes: [
      { name: '物理攻击', value: 60 },
      { name: '暴击率', value: 20 },
      { name: '最大法力', value: 400 },
      { name: '最大生命', value: 400 }
    ],
    description: '使用技能后强化下一次普攻'
  },
  {
    id: 'eq_weapon_003',
    name: '泣血之刃',
    category: 'weapon',
    categoryName: '武器',
    price: 1740,
    attributes: [
      { name: '物理攻击', value: 100 },
      { name: '物理吸血', value: 25 }
    ],
    description: '提供大量物理吸血，续航能力极强'
  },
  {
    id: 'eq_weapon_004',
    name: '破军',
    category: 'weapon',
    categoryName: '武器',
    price: 2950,
    attributes: [
      { name: '物理攻击', value: 180 }
    ],
    description: '对生命值低于50%的敌人造成额外伤害'
  },
  {
    id: 'eq_weapon_005',
    name: '破晓',
    category: 'weapon',
    categoryName: '武器',
    price: 3400,
    attributes: [
      { name: '物理攻击', value: 50 },
      { name: '攻击速度', value: 35 },
      { name: '暴击率', value: 15 },
      { name: '物理穿透', value: 40 }
    ],
    description: '射手核心装备，提供大量攻速和穿透'
  },
  {
    id: 'eq_armor_001',
    name: '反伤刺甲',
    category: 'armor',
    categoryName: '护甲',
    price: 1910,
    attributes: [
      { name: '物理防御', value: 400 },
      { name: '物理攻击', value: 40 }
    ],
    description: '受到物理伤害时反弹部分伤害'
  },
  {
    id: 'eq_armor_002',
    name: '不祥征兆',
    category: 'armor',
    categoryName: '护甲',
    price: 2180,
    attributes: [
      { name: '物理防御', value: 270 },
      { name: '最大生命', value: 1200 }
    ],
    description: '受到攻击时降低攻击者攻速和移速'
  },
  {
    id: 'eq_armor_003',
    name: '魔女斗篷',
    category: 'armor',
    categoryName: '护甲',
    price: 2080,
    attributes: [
      { name: '法术防御', value: 360 },
      { name: '最大生命', value: 1000 }
    ],
    description: '获得可吸收法术伤害的护盾'
  },
  {
    id: 'eq_armor_004',
    name: '极寒风暴',
    category: 'armor',
    categoryName: '护甲',
    price: 2100,
    attributes: [
      { name: '物理防御', value: 360 },
      { name: '冷却缩减', value: 20 },
      { name: '最大法力', value: 500 }
    ],
    description: '受到伤害时触发寒冰冲击，减速周围敌人'
  },
  {
    id: 'eq_armor_005',
    name: '霸者重装',
    category: 'armor',
    categoryName: '护甲',
    price: 2370,
    attributes: [
      { name: '物理防御', value: 200 },
      { name: '最大生命', value: 2000 }
    ],
    description: '脱离战斗后快速恢复生命值'
  },
  {
    id: 'eq_boots_001',
    name: '抵抗之靴',
    category: 'boots',
    categoryName: '鞋子',
    price: 690,
    attributes: [
      { name: '法术防御', value: 110 },
      { name: '移速', value: 60 },
      { name: '韧性', value: 35 }
    ],
    description: '减少控制时间，适合应对多控制阵容'
  },
  {
    id: 'eq_boots_002',
    name: '布甲鞋',
    category: 'boots',
    categoryName: '鞋子',
    price: 690,
    attributes: [
      { name: '物理防御', value: 110 },
      { name: '移速', value: 60 }
    ],
    description: '减少受到的普攻伤害，对抗物理输出英雄'
  },
  {
    id: 'eq_boots_003',
    name: '攻速鞋',
    category: 'boots',
    categoryName: '鞋子',
    price: 710,
    attributes: [
      { name: '攻击速度', value: 30 },
      { name: '移速', value: 60 }
    ],
    description: '提升攻速和移速，射手和攻速型战士首选'
  },
  {
    id: 'eq_boots_004',
    name: '冷却鞋',
    category: 'boots',
    categoryName: '鞋子',
    price: 710,
    attributes: [
      { name: '冷却缩减', value: 15 },
      { name: '移速', value: 60 }
    ],
    description: '减少技能冷却，适合技能型英雄'
  },
  {
    id: 'eq_boots_005',
    name: '疾步之靴',
    category: 'boots',
    categoryName: '鞋子',
    price: 530,
    attributes: [
      { name: '移速', value: 60 }
    ],
    description: '脱离战斗后获得额外移速加成，游走支援必备'
  },
  {
    id: 'eq_accessory_001',
    name: '贤者之书',
    category: 'accessory',
    categoryName: '饰品',
    price: 2990,
    attributes: [
      { name: '法术攻击', value: 400 },
      { name: '最大生命', value: 1400 }
    ],
    description: '法术攻击加成最高的装备，法师终极武器'
  },
  {
    id: 'eq_accessory_002',
    name: '博学者之怒',
    category: 'accessory',
    categoryName: '饰品',
    price: 2300,
    attributes: [
      { name: '法术攻击', value: 240 }
    ],
    description: '提升额外35%法术攻击，法师核心装备'
  },
  {
    id: 'eq_accessory_003',
    name: '虚无法杖',
    category: 'accessory',
    categoryName: '饰品',
    price: 2110,
    attributes: [
      { name: '法术攻击', value: 160 },
      { name: '最大生命', value: 500 },
      { name: '法术穿透', value: 45 }
    ],
    description: '提供法术穿透，对抗高法术防御敌人'
  },
  {
    id: 'eq_accessory_004',
    name: '辉月',
    category: 'accessory',
    categoryName: '饰品',
    price: 1990,
    attributes: [
      { name: '法术攻击', value: 160 },
      { name: '冷却缩减', value: 10 }
    ],
    description: '主动技能：1.5秒内免疫所有效果，无法移动攻击'
  },
  {
    id: 'eq_accessory_005',
    name: '复活甲',
    category: 'accessory',
    categoryName: '饰品',
    price: 2080,
    attributes: [
      { name: '物理防御', value: 140 },
      { name: '法术防御', value: 140 }
    ],
    description: '死亡后原地复活并回复生命值，每局最多触发2次'
  }
];

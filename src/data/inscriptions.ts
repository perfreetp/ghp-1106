export interface InscriptionAttribute {
  name: string;
  value: number;
}

export interface Inscription {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green';
  colorName: string;
  level: number;
  attributes: InscriptionAttribute[];
  description: string;
}

export interface InscriptionSetEffect {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green';
  requiredCount: number;
  effectDescription: string;
  attributes: InscriptionAttribute[];
}

export const inscriptions: Inscription[] = [
  {
    id: 'ins_red_001',
    name: '异变',
    color: 'red',
    colorName: '红色',
    level: 5,
    attributes: [
      { name: '物理攻击', value: 2 },
      { name: '物理穿透', value: 3.6 }
    ],
    description: '提供物理攻击和物理穿透，战士刺客首选'
  },
  {
    id: 'ins_red_002',
    name: '祸源',
    color: 'red',
    colorName: '红色',
    level: 5,
    attributes: [
      { name: '暴击率', value: 1.6 }
    ],
    description: '提供暴击率，射手和暴击流英雄必备'
  },
  {
    id: 'ins_red_003',
    name: '无双',
    color: 'red',
    colorName: '红色',
    level: 5,
    attributes: [
      { name: '暴击率', value: 0.7 },
      { name: '暴击效果', value: 3.6 }
    ],
    description: '提升暴击伤害，与祸源搭配效果最佳'
  },
  {
    id: 'ins_red_004',
    name: '霸者',
    color: 'red',
    colorName: '红色',
    level: 5,
    attributes: [
      { name: '最大生命', value: 17.5 }
    ],
    description: '提升最大生命值，坦克和战士通用'
  },
  {
    id: 'ins_red_005',
    name: '宿命',
    color: 'red',
    colorName: '红色',
    level: 5,
    attributes: [
      { name: '最大生命', value: 33.7 },
      { name: '物理防御', value: 2.3 },
      { name: '攻击速度', value: 1 }
    ],
    description: '综合防御与攻速，坦克辅助铭文'
  },
  {
    id: 'ins_blue_001',
    name: '夺萃',
    color: 'blue',
    colorName: '蓝色',
    level: 5,
    attributes: [
      { name: '物理吸血', value: 1.6 }
    ],
    description: '提供物理吸血，增强续航能力'
  },
  {
    id: 'ins_blue_002',
    name: '狩猎',
    color: 'blue',
    colorName: '蓝色',
    level: 5,
    attributes: [
      { name: '移速', value: 1 },
      { name: '攻击速度', value: 1 }
    ],
    description: '移速攻速双加成，大部分英雄通用'
  },
  {
    id: 'ins_blue_003',
    name: '贪婪',
    color: 'blue',
    colorName: '蓝色',
    level: 5,
    attributes: [
      { name: '法术吸血', value: 1.6 }
    ],
    description: '提供法术吸血，法师续航核心铭文'
  },
  {
    id: 'ins_blue_004',
    name: '调和',
    color: 'blue',
    colorName: '蓝色',
    level: 5,
    attributes: [
      { name: '最大生命', value: 45 },
      { name: '移速', value: 0.4 },
      { name: '生命回复', value: 5.2 }
    ],
    description: '生命移速回复三合一，坦克辅助优选'
  },
  {
    id: 'ins_blue_005',
    name: '长生',
    color: 'blue',
    colorName: '蓝色',
    level: 5,
    attributes: [
      { name: '最大生命', value: 75 }
    ],
    description: '大量生命值加成，纯坦克肉盾铭文'
  },
  {
    id: 'ins_green_001',
    name: '鹰眼',
    color: 'green',
    colorName: '绿色',
    level: 5,
    attributes: [
      { name: '物理攻击', value: 0.9 },
      { name: '物理穿透', value: 6.4 }
    ],
    description: '物理穿透核心铭文，几乎所有物理英雄必带'
  },
  {
    id: 'ins_green_002',
    name: '心眼',
    color: 'green',
    colorName: '绿色',
    level: 5,
    attributes: [
      { name: '法术穿透', value: 6.4 },
      { name: '攻击速度', value: 0.6 }
    ],
    description: '法术穿透加成，法师输出核心铭文'
  },
  {
    id: 'ins_green_003',
    name: '敬畏',
    color: 'green',
    colorName: '绿色',
    level: 5,
    attributes: [
      { name: '法术吸血', value: 0.7 },
      { name: '物理防御', value: 5.9 }
    ],
    description: '法术吸血与物理防御双修，法坦适用'
  },
  {
    id: 'ins_green_004',
    name: '虚空',
    color: 'green',
    colorName: '绿色',
    level: 5,
    attributes: [
      { name: '最大生命', value: 37.5 },
      { name: '冷却缩减', value: 0.6 }
    ],
    description: '生命值与冷却缩减，坦克控制型英雄适用'
  },
  {
    id: 'ins_green_005',
    name: '怜悯',
    color: 'green',
    colorName: '绿色',
    level: 5,
    attributes: [
      { name: '冷却缩减', value: 1 }
    ],
    description: '冷却缩减最高的铭文，技能型英雄必备'
  }
];

export const inscriptionSetEffects: InscriptionSetEffect[] = [
  {
    id: 'set_red_3',
    name: '红色铭文·初级',
    color: 'red',
    requiredCount: 3,
    effectDescription: '装备3个红色铭文激活',
    attributes: [
      { name: '物理攻击', value: 5 }
    ]
  },
  {
    id: 'set_red_6',
    name: '红色铭文·中级',
    color: 'red',
    requiredCount: 6,
    effectDescription: '装备6个红色铭文激活',
    attributes: [
      { name: '物理攻击', value: 8 },
      { name: '物理穿透', value: 5 }
    ]
  },
  {
    id: 'set_red_10',
    name: '红色铭文·高级',
    color: 'red',
    requiredCount: 10,
    effectDescription: '装备10个红色铭文激活',
    attributes: [
      { name: '物理攻击', value: 15 },
      { name: '物理穿透', value: 10 },
      { name: '暴击率', value: 5 }
    ]
  },
  {
    id: 'set_blue_3',
    name: '蓝色铭文·初级',
    color: 'blue',
    requiredCount: 3,
    effectDescription: '装备3个蓝色铭文激活',
    attributes: [
      { name: '最大生命', value: 50 }
    ]
  },
  {
    id: 'set_blue_6',
    name: '蓝色铭文·中级',
    color: 'blue',
    requiredCount: 6,
    effectDescription: '装备6个蓝色铭文激活',
    attributes: [
      { name: '最大生命', value: 100 },
      { name: '移速', value: 3 }
    ]
  },
  {
    id: 'set_blue_10',
    name: '蓝色铭文·高级',
    color: 'blue',
    requiredCount: 10,
    effectDescription: '装备10个蓝色铭文激活',
    attributes: [
      { name: '最大生命', value: 200 },
      { name: '移速', value: 5 },
      { name: '生命回复', value: 10 }
    ]
  },
  {
    id: 'set_green_3',
    name: '绿色铭文·初级',
    color: 'green',
    requiredCount: 3,
    effectDescription: '装备3个绿色铭文激活',
    attributes: [
      { name: '物理防御', value: 5 },
      { name: '法术防御', value: 5 }
    ]
  },
  {
    id: 'set_green_6',
    name: '绿色铭文·中级',
    color: 'green',
    requiredCount: 6,
    effectDescription: '装备6个绿色铭文激活',
    attributes: [
      { name: '物理防御', value: 10 },
      { name: '法术防御', value: 10 },
      { name: '冷却缩减', value: 3 }
    ]
  },
  {
    id: 'set_green_10',
    name: '绿色铭文·高级',
    color: 'green',
    requiredCount: 10,
    effectDescription: '装备10个绿色铭文激活',
    attributes: [
      { name: '物理防御', value: 20 },
      { name: '法术防御', value: 20 },
      { name: '冷却缩减', value: 6 },
      { name: '最大生命', value: 100 }
    ]
  }
];

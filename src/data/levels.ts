export interface Enemy {
  id: string;
  name: string;
  type: 'warrior' | 'mage' | 'archer' | 'tank' | 'assassin' | 'support';
  typeName: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
}

export interface LevelReward {
  gold: number;
  exp: number;
}

export interface Level {
  id: string;
  chapter: number;
  chapterName: string;
  stage: number;
  stageName: string;
  fullName: string;
  difficulty: 1 | 2 | 3;
  description: string;
  enemies: Enemy[];
  reward: LevelReward;
  recommendedLevel: number;
}

export const levels: Level[] = [
  {
    id: 'lv_1_1',
    chapter: 1,
    chapterName: '第一章·新手试炼',
    stage: 1,
    stageName: '第1关·稷下学院',
    fullName: '第一章·新手试炼 第1关·稷下学院',
    difficulty: 1,
    description: '稷下学院门口的新兵训练，初次体验战斗',
    recommendedLevel: 1,
    enemies: [
      { id: 'en_1_1_1', name: '训练木偶·甲', type: 'warrior', typeName: '战士', level: 1, hp: 800, attack: 60, defense: 20 },
      { id: 'en_1_1_2', name: '训练木偶·乙', type: 'warrior', typeName: '战士', level: 1, hp: 800, attack: 60, defense: 20 },
      { id: 'en_1_1_3', name: '训练木偶·丙', type: 'archer', typeName: '射手', level: 1, hp: 600, attack: 80, defense: 10 }
    ],
    reward: { gold: 100, exp: 50 }
  },
  {
    id: 'lv_1_2',
    chapter: 1,
    chapterName: '第一章·新手试炼',
    stage: 2,
    stageName: '第2关·王者峡谷',
    fullName: '第一章·新手试炼 第2关·王者峡谷',
    difficulty: 1,
    description: '王者峡谷的野区巡逻，对抗初级小兵',
    recommendedLevel: 2,
    enemies: [
      { id: 'en_1_2_1', name: '近战小兵', type: 'warrior', typeName: '战士', level: 2, hp: 1000, attack: 80, defense: 30 },
      { id: 'en_1_2_2', name: '远程小兵', type: 'archer', typeName: '射手', level: 2, hp: 750, attack: 100, defense: 15 },
      { id: 'en_1_2_3', name: '近战小兵', type: 'warrior', typeName: '战士', level: 2, hp: 1000, attack: 80, defense: 30 },
      { id: 'en_1_2_4', name: '炮车小兵', type: 'tank', typeName: '坦克', level: 2, hp: 1500, attack: 70, defense: 50 }
    ],
    reward: { gold: 150, exp: 80 }
  },
  {
    id: 'lv_1_3',
    chapter: 1,
    chapterName: '第一章·新手试炼',
    stage: 3,
    stageName: '第3关·红方野区',
    fullName: '第一章·新手试炼 第3关·红方野区',
    difficulty: 1,
    description: '红方野区遭遇野怪，小心红BUFF',
    recommendedLevel: 3,
    enemies: [
      { id: 'en_1_3_1', name: '小野猪', type: 'warrior', typeName: '战士', level: 3, hp: 1200, attack: 90, defense: 35 },
      { id: 'en_1_3_2', name: '大野猪', type: 'tank', typeName: '坦克', level: 3, hp: 2000, attack: 100, defense: 60 },
      { id: 'en_1_3_3', name: '红BUFF', type: 'warrior', typeName: '战士', level: 3, hp: 2500, attack: 120, defense: 50 },
      { id: 'en_1_3_4', name: '小野猪', type: 'warrior', typeName: '战士', level: 3, hp: 1200, attack: 90, defense: 35 }
    ],
    reward: { gold: 200, exp: 120 }
  },
  {
    id: 'lv_1_4',
    chapter: 1,
    chapterName: '第一章·新手试炼',
    stage: 4,
    stageName: '第4关·蓝方野区',
    fullName: '第一章·新手试炼 第4关·蓝方野区',
    difficulty: 2,
    description: '蓝方野区的挑战，蓝BUFF的法力很强',
    recommendedLevel: 4,
    enemies: [
      { id: 'en_1_4_1', name: '小狼', type: 'assassin', typeName: '刺客', level: 4, hp: 1300, attack: 130, defense: 30 },
      { id: 'en_1_4_2', name: '魔种狼王', type: 'assassin', typeName: '刺客', level: 4, hp: 2200, attack: 160, defense: 45 },
      { id: 'en_1_4_3', name: '蓝BUFF', type: 'mage', typeName: '法师', level: 4, hp: 2800, attack: 150, defense: 40 },
      { id: 'en_1_4_4', name: '小狼', type: 'assassin', typeName: '刺客', level: 4, hp: 1300, attack: 130, defense: 30 },
      { id: 'en_1_4_5', name: '河道蜥蜴', type: 'warrior', typeName: '战士', level: 4, hp: 1800, attack: 110, defense: 55 }
    ],
    reward: { gold: 280, exp: 180 }
  },
  {
    id: 'lv_1_5',
    chapter: 1,
    chapterName: '第一章·新手试炼',
    stage: 5,
    stageName: '第5关·暴君巢穴',
    fullName: '第一章·新手试炼 第5关·暴君巢穴',
    difficulty: 2,
    description: '第一章终极挑战，对抗强大的暴君',
    recommendedLevel: 5,
    enemies: [
      { id: 'en_1_5_1', name: '暴君守卫', type: 'tank', typeName: '坦克', level: 5, hp: 2500, attack: 130, defense: 80 },
      { id: 'en_1_5_2', name: '暴君守卫', type: 'tank', typeName: '坦克', level: 5, hp: 2500, attack: 130, defense: 80 },
      { id: 'en_1_5_3', name: '暴君法师', type: 'mage', typeName: '法师', level: 5, hp: 2000, attack: 180, defense: 50 },
      { id: 'en_1_5_4', name: '暗影暴君', type: 'tank', typeName: '坦克', level: 6, hp: 5000, attack: 220, defense: 120 }
    ],
    reward: { gold: 500, exp: 300 }
  },
  {
    id: 'lv_2_1',
    chapter: 2,
    chapterName: '第二章·长城守卫',
    stage: 1,
    stageName: '第1关·边境关隘',
    fullName: '第二章·长城守卫 第1关·边境关隘',
    difficulty: 1,
    description: '长城边境的小型战斗，抵御小规模入侵',
    recommendedLevel: 6,
    enemies: [
      { id: 'en_2_1_1', name: '魔种斥候', type: 'assassin', typeName: '刺客', level: 6, hp: 1800, attack: 170, defense: 45 },
      { id: 'en_2_1_2', name: '魔种战士', type: 'warrior', typeName: '战士', level: 6, hp: 2200, attack: 150, defense: 65 },
      { id: 'en_2_1_3', name: '魔种斥候', type: 'assassin', typeName: '刺客', level: 6, hp: 1800, attack: 170, defense: 45 }
    ],
    reward: { gold: 350, exp: 250 }
  },
  {
    id: 'lv_2_2',
    chapter: 2,
    chapterName: '第二章·长城守卫',
    stage: 2,
    stageName: '第2关·玉门关',
    fullName: '第二章·长城守卫 第2关·玉门关',
    difficulty: 2,
    description: '玉门关遭遇敌军主力，守住关隘',
    recommendedLevel: 7,
    enemies: [
      { id: 'en_2_2_1', name: '魔种战士', type: 'warrior', typeName: '战士', level: 7, hp: 2500, attack: 170, defense: 75 },
      { id: 'en_2_2_2', name: '魔种法师', type: 'mage', typeName: '法师', level: 7, hp: 2200, attack: 220, defense: 55 },
      { id: 'en_2_2_3', name: '魔种弓手', type: 'archer', typeName: '射手', level: 7, hp: 2000, attack: 200, defense: 40 },
      { id: 'en_2_2_4', name: '魔种战士', type: 'warrior', typeName: '战士', level: 7, hp: 2500, attack: 170, defense: 75 },
      { id: 'en_2_2_5', name: '魔种萨满', type: 'support', typeName: '辅助', level: 7, hp: 2400, attack: 140, defense: 60 }
    ],
    reward: { gold: 450, exp: 350 }
  },
  {
    id: 'lv_2_3',
    chapter: 2,
    chapterName: '第二章·长城守卫',
    stage: 3,
    stageName: '第3关·云中漠地',
    fullName: '第二章·长城守卫 第3关·云中漠地',
    difficulty: 2,
    description: '深入云中漠地，追击魔种残余',
    recommendedLevel: 8,
    enemies: [
      { id: 'en_2_3_1', name: '沙漠刺客', type: 'assassin', typeName: '刺客', level: 8, hp: 2400, attack: 240, defense: 50 },
      { id: 'en_2_3_2', name: '沙漠刺客', type: 'assassin', typeName: '刺客', level: 8, hp: 2400, attack: 240, defense: 50 },
      { id: 'en_2_3_3', name: '沙漠巨蝎', type: 'tank', typeName: '坦克', level: 8, hp: 4000, attack: 200, defense: 130 },
      { id: 'en_2_3_4', name: '沙漠法师', type: 'mage', typeName: '法师', level: 8, hp: 2600, attack: 260, defense: 60 }
    ],
    reward: { gold: 550, exp: 450 }
  },
  {
    id: 'lv_2_4',
    chapter: 2,
    chapterName: '第二章·长城守卫',
    stage: 4,
    stageName: '第4关·长城之巅',
    fullName: '第二章·长城守卫 第4关·长城之巅',
    difficulty: 3,
    description: '长城最高处，遭遇魔种精锐部队',
    recommendedLevel: 9,
    enemies: [
      { id: 'en_2_4_1', name: '魔种百夫长', type: 'warrior', typeName: '战士', level: 9, hp: 3200, attack: 230, defense: 100 },
      { id: 'en_2_4_2', name: '魔种精锐弓手', type: 'archer', typeName: '射手', level: 9, hp: 2500, attack: 270, defense: 55 },
      { id: 'en_2_4_3', name: '魔种咒术师', type: 'mage', typeName: '法师', level: 9, hp: 2800, attack: 290, defense: 65 },
      { id: 'en_2_4_4', name: '魔种重甲兵', type: 'tank', typeName: '坦克', level: 9, hp: 4500, attack: 210, defense: 150 },
      { id: 'en_2_4_5', name: '魔种百夫长', type: 'warrior', typeName: '战士', level: 9, hp: 3200, attack: 230, defense: 100 }
    ],
    reward: { gold: 700, exp: 600 }
  },
  {
    id: 'lv_2_5',
    chapter: 2,
    chapterName: '第二章·长城守卫',
    stage: 5,
    stageName: '第5关·魔种元帅',
    fullName: '第二章·长城守卫 第5关·魔种元帅',
    difficulty: 3,
    description: '第二章BOSS战，对抗魔种元帅及其亲卫',
    recommendedLevel: 10,
    enemies: [
      { id: 'en_2_5_1', name: '魔种亲卫', type: 'warrior', typeName: '战士', level: 10, hp: 3500, attack: 260, defense: 110 },
      { id: 'en_2_5_2', name: '魔种亲卫', type: 'warrior', typeName: '战士', level: 10, hp: 3500, attack: 260, defense: 110 },
      { id: 'en_2_5_3', name: '魔种大法师', type: 'mage', typeName: '法师', level: 10, hp: 3200, attack: 320, defense: 75 },
      { id: 'en_2_5_4', name: '魔种大祭司', type: 'support', typeName: '辅助', level: 10, hp: 3800, attack: 220, defense: 90 },
      { id: 'en_2_5_5', name: '魔种元帅', type: 'tank', typeName: '坦克', level: 11, hp: 8000, attack: 350, defense: 180 }
    ],
    reward: { gold: 1200, exp: 1000 }
  },
  {
    id: 'lv_3_1',
    chapter: 3,
    chapterName: '第三章·王者之路',
    stage: 1,
    stageName: '第1关·峡谷先锋',
    fullName: '第三章·王者之路 第1关·峡谷先锋',
    difficulty: 2,
    description: '王者峡谷的精英试炼，峡谷先锋登场',
    recommendedLevel: 11,
    enemies: [
      { id: 'en_3_1_1', name: '精英战士', type: 'warrior', typeName: '战士', level: 11, hp: 3800, attack: 280, defense: 120 },
      { id: 'en_3_1_2', name: '精英法师', type: 'mage', typeName: '法师', level: 11, hp: 3400, attack: 340, defense: 80 },
      { id: 'en_3_1_3', name: '峡谷先锋', type: 'tank', typeName: '坦克', level: 11, hp: 6000, attack: 300, defense: 160 },
      { id: 'en_3_1_4', name: '精英射手', type: 'archer', typeName: '射手', level: 11, hp: 3000, attack: 310, defense: 65 }
    ],
    reward: { gold: 800, exp: 700 }
  },
  {
    id: 'lv_3_2',
    chapter: 3,
    chapterName: '第三章·王者之路',
    stage: 2,
    stageName: '第2关·先知主宰',
    fullName: '第三章·王者之路 第2关·先知主宰',
    difficulty: 3,
    description: '对抗先知主宰，获取强大增益',
    recommendedLevel: 12,
    enemies: [
      { id: 'en_3_2_1', name: '主宰守卫', type: 'tank', typeName: '坦克', level: 12, hp: 5000, attack: 290, defense: 170 },
      { id: 'en_3_2_2', name: '主宰法师', type: 'mage', typeName: '法师', level: 12, hp: 3800, attack: 370, defense: 90 },
      { id: 'en_3_2_3', name: '主宰刺客', type: 'assassin', typeName: '刺客', level: 12, hp: 3500, attack: 390, defense: 70 },
      { id: 'en_3_2_4', name: '先知主宰', type: 'tank', typeName: '坦克', level: 13, hp: 10000, attack: 400, defense: 200 }
    ],
    reward: { gold: 1000, exp: 900 }
  },
  {
    id: 'lv_3_3',
    chapter: 3,
    chapterName: '第三章·王者之路',
    stage: 3,
    stageName: '第3关·暗影主宰',
    fullName: '第三章·王者之路 第3关·暗影主宰',
    difficulty: 3,
    description: '暗影主宰觉醒，比先知主宰更加强大',
    recommendedLevel: 13,
    enemies: [
      { id: 'en_3_3_1', name: '暗影守卫', type: 'tank', typeName: '坦克', level: 13, hp: 5500, attack: 330, defense: 190 },
      { id: 'en_3_3_2', name: '暗影法师', type: 'mage', typeName: '法师', level: 13, hp: 4200, attack: 410, defense: 100 },
      { id: 'en_3_3_3', name: '暗影射手', type: 'archer', typeName: '射手', level: 13, hp: 3800, attack: 380, defense: 80 },
      { id: 'en_3_3_4', name: '暗影刺客', type: 'assassin', typeName: '刺客', level: 13, hp: 4000, attack: 430, defense: 85 },
      { id: 'en_3_3_5', name: '暗影主宰', type: 'tank', typeName: '坦克', level: 14, hp: 13000, attack: 480, defense: 240 }
    ],
    reward: { gold: 1300, exp: 1200 }
  },
  {
    id: 'lv_3_4',
    chapter: 3,
    chapterName: '第三章·王者之路',
    stage: 4,
    stageName: '第4关·风暴龙王',
    fullName: '第三章·王者之路 第4关·风暴龙王',
    difficulty: 3,
    description: '风暴龙王降临，最强大的中立生物',
    recommendedLevel: 14,
    enemies: [
      { id: 'en_3_4_1', name: '风暴先锋', type: 'tank', typeName: '坦克', level: 14, hp: 6000, attack: 370, defense: 210 },
      { id: 'en_3_4_2', name: '风暴法师', type: 'mage', typeName: '法师', level: 14, hp: 4800, attack: 460, defense: 115 },
      { id: 'en_3_4_3', name: '风暴战士', type: 'warrior', typeName: '战士', level: 14, hp: 5500, attack: 420, defense: 160 },
      { id: 'en_3_4_4', name: '风暴刺客', type: 'assassin', typeName: '刺客', level: 14, hp: 4500, attack: 490, defense: 95 },
      { id: 'en_3_4_5', name: '风暴龙王', type: 'tank', typeName: '坦克', level: 15, hp: 16000, attack: 550, defense: 280 }
    ],
    reward: { gold: 1600, exp: 1500 }
  },
  {
    id: 'lv_3_5',
    chapter: 3,
    chapterName: '第三章·王者之路',
    stage: 5,
    stageName: '第5关·王者之巅',
    fullName: '第三章·王者之路 第5关·王者之巅',
    difficulty: 3,
    description: '最终决战！登上王者之巅，成为最强王者',
    recommendedLevel: 15,
    enemies: [
      { id: 'en_3_5_1', name: '王者近卫', type: 'tank', typeName: '坦克', level: 15, hp: 7000, attack: 420, defense: 250 },
      { id: 'en_3_5_2', name: '王者近卫', type: 'tank', typeName: '坦克', level: 15, hp: 7000, attack: 420, defense: 250 },
      { id: 'en_3_5_3', name: '王者法师', type: 'mage', typeName: '法师', level: 15, hp: 5500, attack: 520, defense: 130 },
      { id: 'en_3_5_4', name: '王者刺客', type: 'assassin', typeName: '刺客', level: 15, hp: 5200, attack: 560, defense: 110 },
      { id: 'en_3_5_5', name: '最强王者', type: 'warrior', typeName: '战士', level: 16, hp: 25000, attack: 650, defense: 350 }
    ],
    reward: { gold: 3000, exp: 3000 }
  }
];

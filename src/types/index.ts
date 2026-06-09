/**
 * 游戏核心类型定义
 * 所有联合类型均使用中文，便于业务逻辑理解
 */

// ==================== 全局配置常量 ====================

/** 三星判定：快通关回合数阈值（回合数 ≤ 此值算快速通关） */
export const STAR_FAST_CLEAR_TURNS = 12;

/** 失败分析：回合过多阈值（超过此值提示回合过多） */
export const FAIL_TOO_MANY_TURNS = 20;

/** 首通奖励：金币加成倍数 */
export const REWARD_FIRST_CLEAR_GOLD_MULT = 0.8;
/** 首通奖励：固定钻石 */
export const REWARD_FIRST_CLEAR_DIAMOND = 20;

/** 三星奖励：金币加成倍数 */
export const REWARD_THREE_STAR_GOLD_MULT = 1.2;
/** 三星奖励：固定钻石 */
export const REWARD_THREE_STAR_DIAMOND = 50;

// ==================== 属性相关 ====================

/**
 * 角色属性面板
 * 包含所有战斗中会用到的基础数值
 */
export interface Stats {
  /** 最大生命值 */
  hp: number;
  /** 攻击力 */
  atk: number;
  /** 防御力 */
  def: number;
  /** 速度（决定行动顺序） */
  speed: number;
  /** 暴击率（0~1） */
  critRate: number;
  /** 暴击伤害倍率（默认1.5） */
  critDmg: number;
  /** 效果命中（0~1） */
  effectHit?: number;
  /** 效果抵抗（0~1） */
  effectResist?: number;
  /** 生命值回复量 */
  hpRegen?: number;
}

// ==================== 技能相关 ====================

/**
 * 技能范围类型
 */
export type 技能范围类型 =
  | '单体'
  | '横排'
  | '纵列'
  | '十字'
  | '全体'
  | '自身'
  | '区域';

/**
 * 技能范围
 * 定义技能作用的目标选择规则
 */
export interface SkillRange {
  /** 范围类型 */
  type: 技能范围类型;
  /** 作用距离（格数） */
  distance: number;
}

/**
 * 技能效果类型
 */
export type 技能效果类型 =
  | '伤害'
  | '治疗'
  | '增益'
  | '减益'
  | '护盾'
  | '召唤'
  | '击退'
  | '嘲讽';

/**
 * 技能目标阵营
 */
export type 目标阵营 = '敌方' | '友方' | '自身';

/**
 * 技能效果
 * 每个技能可包含多个效果
 */
export interface SkillEffect {
  /** 效果类型 */
  type: 技能效果类型;
  /** 效果数值（固定值或百分比，如'30%'） */
  value: number | string;
  /** 持续回合数（增益/减益时有效） */
  duration?: number;
  /** 目标阵营 */
  target: 目标阵营;
  /** 效果命中概率（0~1，默认1） */
  hitChance?: number;
  /** 叠加层数（可叠加的buff） */
  stacks?: number;
  /** 关联属性（伤害基于攻击、治疗基于生命等） */
  basedOn?: keyof Stats;
  /** 影响的属性键（增益/减益，如 atk/def/speed） */
  stat?: keyof Stats;
  /** 是否为控制类效果（眩晕等） */
  isControl?: boolean;
}

/**
 * 技能类型
 */
export type 技能类型 = '主动' | '被动' | '奥义';

/**
 * 技能模板
 * 定义技能的静态配置
 */
export interface SkillTemplate {
  /** 技能唯一ID */
  id: string;
  /** 技能名称 */
  name: string;
  /** 技能类型 */
  type: 技能类型;
  /** 技能描述 */
  description: string;
  /** 技能图标路径 */
  icon: string;
  /** 冷却回合数 */
  cooldown: number;
  /** 能量消耗 */
  energyCost: number;
  /** 技能解锁等级 */
  unlockLevel?: number;
  /** 技能范围 */
  range: SkillRange;
  /** 技能效果列表 */
  effects: SkillEffect[];
  /** 升级每级增加的效果数值（百分比） */
  upgradeBonus?: number;
}

// ==================== 英雄相关 ====================

/**
 * 英雄职业
 */
export type 英雄职业 = '战士' | '法师' | '坦克' | '刺客' | '射手' | '辅助';

/**
 * 英雄推荐站位
 */
export type 英雄站位推荐 = '前排' | '中排' | '后排';

/**
 * 稀有度
 */
export type 稀有度 = '普通' | '稀有' | '史诗' | '传说' | '神话';

/**
 * 属性成长系数
 */
export interface GrowthStats {
  /** 生命成长 */
  hp: number;
  /** 攻击成长 */
  atk: number;
  /** 防御成长 */
  def: number;
  /** 速度成长 */
  speed: number;
}

/**
 * 英雄模板
 * 定义英雄的静态配置（图鉴数据）
 */
export interface HeroTemplate {
  /** 英雄唯一ID */
  id: string;
  /** 英雄名称 */
  name: string;
  /** 英雄职业 */
  role: 英雄职业;
  /** 推荐站位 */
  position: 英雄站位推荐;
  /** 稀有度 */
  rarity: 稀有度;
  /** 英雄头像路径 */
  avatar: string;
  /** 英雄立绘路径 */
  portrait?: string;
  /** 英雄背景故事 */
  description: string;
  /** 1级基础属性 */
  baseStats: Stats;
  /** 每级属性成长系数 */
  growthStats: GrowthStats;
  /** 拥有的技能列表 */
  skills: SkillTemplate[];
  /** 推荐装备ID列表 */
  recommendedEquipments: string[];
  /** 推荐铭文ID列表 */
  recommendedInscriptions: string[];
  /** 觉醒解锁条件（星级） */
  awakenStar?: number;
}

/**
 * 玩家拥有的英雄实例
 * 包含等级、星级、装备等养成数据
 */
export interface HeroInstance {
  /** 实例唯一ID */
  id: string;
  /** 关联的英雄模板ID */
  templateId: string;
  /** 当前等级 */
  level: number;
  /** 当前经验值 */
  exp: number;
  /** 当前星级（1~6） */
  star: number;
  /** 觉醒等级（0~3） */
  awaken?: number;
  /** 已装备的装备ID列表（最多6件） */
  equipments: string[];
  /** 已装配的铭文ID列表（最多9个） */
  inscriptions: string[];
  /** 获取时间 */
  obtainTime: string;
  /** 是否锁定（防止误操作） */
  locked?: boolean;
}

// ==================== 装备铭文 ====================

/**
 * 装备部位
 */
export type 装备部位 = '武器' | '护甲' | '头盔' | '鞋子' | '饰品' | '圣器';

/**
 * 装备品质
 */
export type 装备品质 = '白' | '绿' | '蓝' | '紫' | '橙' | '红';

/**
 * 装备数据
 */
export interface Equipment {
  /** 装备唯一ID */
  id: string;
  /** 装备名称 */
  name: string;
  /** 装备部位 */
  type: 装备部位;
  /** 装备品质 */
  quality: 装备品质;
  /** 装备等级 */
  level: number;
  /** 售价（金币） */
  price: number;
  /** 装备图标路径 */
  icon: string;
  /** 主属性加成 */
  mainStats: Partial<Stats>;
  /** 副属性加成（随机词条） */
  subStats?: Partial<Stats>;
  /** 装备描述 */
  description: string;
  /** 被动效果描述 */
  passive?: string;
  /** 套装ID（集齐触发套装效果） */
  setId?: string;
}

/**
 * 铭文颜色
 */
export type 铭文颜色 = '红' | '蓝' | '绿';

/**
 * 铭文套装加成
 */
export interface SetBonus {
  /** 激活所需件数 */
  count: number;
  /** 套装效果描述 */
  effect: string;
  /** 套装数值加成 */
  stats?: Partial<Stats>;
}

/**
 * 铭文数据
 */
export interface Inscription {
  /** 铭文唯一ID */
  id: string;
  /** 铭文名称 */
  name: string;
  /** 所属套装名称 */
  setName: string;
  /** 铭文颜色 */
  color: 铭文颜色;
  /** 铭文等级 */
  level: number;
  /** 主属性 */
  mainStat: Partial<Stats>;
  /** 副属性 */
  subStats?: Partial<Stats>;
  /** 套装加成列表 */
  setBonus: SetBonus[];
  /** 图标路径 */
  icon: string;
}

// ==================== 阵容站位 ====================

/**
 * 站位坐标
 * 棋盘格位置，行+列
 */
export interface Position {
  /** 行号（0=前排，1=中排，2=后排） */
  row: number;
  /** 列号（0~2） */
  col: number;
}

/**
 * 阵容中的英雄槽位
 */
export interface LineupSlot {
  /** 英雄实例ID */
  heroInstanceId: string;
  /** 在棋盘中的站位 */
  position: Position;
}

/**
 * 阵容配置
 */
export interface Lineup {
  /** 阵容唯一ID */
  id: string;
  /** 阵容名称 */
  name: string;
  /** 阵容中的英雄槽位列表（最多5个） */
  slots: LineupSlot[];
  /** 是否为默认阵容 */
  isDefault?: boolean;
  /** 创建时间 */
  createTime: string;
}

// ==================== 战斗状态 ====================

/**
 * Buff/Debuff类型
 */
export type 状态类型 = '增益' | '减益' | '控制';

/**
 * 增益减益状态
 */
export interface Buff {
  /** Buff唯一ID */
  id: string;
  /** Buff名称 */
  name: string;
  /** 状态类型 */
  type: 状态类型;
  /** 剩余持续回合数 */
  duration: number;
  /** 最大持续回合数 */
  maxDuration: number;
  /** 属性影响 */
  effects: Partial<Stats>;
  /** 当前叠加层数 */
  stacks?: number;
  /** 最大叠加层数 */
  maxStacks?: number;
  /** 是否可驱散 */
  dispellable?: boolean;
  /** 来源技能ID */
  sourceSkillId?: string;
  /** 来源英雄实例ID */
  sourceHeroId?: string;
  /** 图标路径 */
  icon?: string;
}

/**
 * 战斗中英雄状态
 * 每个战斗单位的实时数据
 */
export interface BattleHero {
  /** 英雄实例ID */
  instanceId: string;
  /** 英雄模板ID */
  templateId: string;
  /** 是否为我方单位 */
  isAlly: boolean;
  /** 当前生命值 */
  currentHP: number;
  /** 最大生命值 */
  maxHP: number;
  /** 当前能量值 */
  currentEnergy: number;
  /** 最大能量值 */
  maxEnergy: number;
  /** 当前站位 */
  position: Position;
  /** 当前属性（已计算装备、buff等） */
  stats: Stats;
  /** 身上的buff/debuff列表 */
  buffs: Buff[];
  /** 技能冷却状态 <技能ID, 剩余回合> */
  skillCooldowns: Record<string, number>;
  /** 是否已阵亡 */
  isDead: boolean;
  /** 是否被控制（无法行动） */
  isControlled?: boolean;
  /** 护盾值 */
  shield?: number;
  /** 本回合是否已行动 */
  actedThisTurn?: boolean;
}

// ==================== 战斗记录 ====================

/**
 * 战斗行动类型
 */
export type 行动类型 = '普通攻击' | '释放技能' | '防御' | '待机' | '被击' | '死亡' | '复活';

/**
 * 单个单位的战斗结果
 */
export interface BattleResult {
  /** 目标英雄ID */
  targetId: string;
  /** 造成的伤害（正数） */
  damage?: number;
  /** 是否暴击 */
  isCrit?: boolean;
  /** 是否被闪避 */
  isDodge?: boolean;
  /** 是否被格挡 */
  isBlocked?: boolean;
  /** 治疗量 */
  heal?: number;
  /** 吸收的护盾量 */
  shieldAbsorbed?: number;
  /** 新增护盾值 */
  shieldGained?: number;
  /** 添加的Buff列表 */
  buffsAdded?: Buff[];
  /** 移除的Buff ID列表 */
  buffsRemoved?: string[];
  /** 能量变化 */
  energyChange?: number;
  /** 位置变化（击退/位移） */
  positionChange?: Position;
}

/**
 * 战斗步骤记录
 * 记录每个回合中每个单位的行动
 */
export interface BattleStep {
  /** 回合数（从1开始） */
  turn: number;
  /** 行动者英雄ID */
  actorId: string;
  /** 行动类型 */
  action: 行动类型;
  /** 使用的技能ID（技能时有效） */
  skillId?: string;
  /** 目标英雄ID列表 */
  targets: string[];
  /** 每个目标的结果 */
  results: BattleResult[];
  /** 行动前的快照（用于回放） */
  snapshotBefore?: {
    actorHP: number;
    actorEnergy: number;
  };
  /** 时间戳 */
  timestamp: number;
}

/**
 * 战斗胜负
 */
export type 战斗结果 = '胜利' | '失败' | '平局';

/**
 * 完整战斗记录
 */
export interface BattleLog {
  /** 战斗记录ID */
  id: string;
  /** 关卡ID（PVE时） */
  levelId?: string;
  /** 对手ID/名称（PVP时） */
  opponent?: string;
  /** 战斗开始时间 */
  startTime: string;
  /** 战斗结束时间 */
  endTime: string;
  /** 战斗总回合数 */
  totalTurns: number;
  /** 战斗结果 */
  result: 战斗结果;
  /** 获得的星级（1~3星，PVE关卡） */
  stars?: number;
  /** 我方出战英雄ID列表 */
  allyHeroIds: string[];
  /** 敌方出战英雄ID/模板ID列表 */
  enemyHeroIds: string[];
  /** 战斗步骤列表（用于回放） */
  steps: BattleStep[];
  /** 战斗摘要信息 */
  summary: {
    /** 总伤害 */
    totalDamage: number;
    /** 总治疗 */
    totalHeal: number;
    /** 每个英雄的伤害贡献 */
    damageByHero: Record<string, number>;
    /** 每个英雄的承伤 */
    damageTakenByHero: Record<string, number>;
  };
}

// ==================== 关卡系统 ====================

/**
 * 敌人配置
 */
export interface EnemyConfig {
  /** 英雄模板ID（敌人也是基于英雄模板） */
  templateId: string;
  /** 敌人等级 */
  level: number;
  /** 敌人星级 */
  star: number;
  /** 站位 */
  position: Position;
  /** 自定义属性覆盖（可选，用于boss） */
  customStats?: Partial<Stats>;
  /** 是否为Boss */
  isBoss?: boolean;
  /** Boss名称（与模板不同时使用） */
  bossName?: string;
}

/**
 * 奖励项
 */
export interface RewardItem {
  /** 奖励类型 */
  type: '金币' | '钻石' | '经验' | '装备' | '铭文' | '英雄碎片' | '道具';
  /** 数量 */
  count: number;
  /** 关联ID（装备/铭文/英雄等） */
  itemId?: string;
}

/**
 * 关卡奖励
 */
export interface Rewards {
  /** 基础奖励列表 */
  base: RewardItem[];
  /** 首通额外奖励 */
  firstClear?: RewardItem[];
  /** 三星奖励 */
  threeStar?: RewardItem[];
}

/**
 * 关卡难度
 */
export type 关卡难度 = '简单' | '普通' | '困难' | '噩梦' | '地狱';

/**
 * 关卡配置
 */
export interface Level {
  /** 关卡唯一ID */
  id: string;
  /** 所属章节 */
  chapter: number;
  /** 章节内序号 */
  index: number;
  /** 关卡名称 */
  name: string;
  /** 关卡描述/剧情 */
  description: string;
  /** 难度等级 */
  difficulty: 关卡难度;
  /** 敌人配置列表 */
  enemies: EnemyConfig[];
  /** 关卡奖励 */
  rewards: Rewards;
  /** 推荐战力 */
  recommendPower: number;
  /** 是否为挑战关（Boss关） */
  isChallenge?: boolean;
  /** 前置关卡ID（解锁条件） */
  prerequisite?: string;
  /** 背景图路径 */
  background?: string;
  /** 每日挑战关卡 */
  isDaily?: boolean;
  /** 消耗体力 */
  costStamina?: number;
}

// ==================== 成就系统 ====================

/**
 * 成就条件类型
 */
export type 条件类型 =
  | '累计登录'
  | '通关关卡'
  | '收集英雄'
  | '英雄升星'
  | '英雄升级'
  | '累计伤害'
  | '累计击杀'
  | '竞技场排名'
  | '消耗金币'
  | '消耗钻石'
  | '装备强化'
  | '完成剧情'
  | '自定义';

/**
 * 成就条件
 */
export interface AchievementCondition {
  /** 条件类型 */
  type: 条件类型;
  /** 目标值 */
  target: number;
  /** 关联参数（如关卡ID、英雄ID等） */
  params?: Record<string, string | number>;
}

/**
 * 成就数据
 */
export interface Achievement {
  /** 成就唯一ID */
  id: string;
  /** 成就名称 */
  name: string;
  /** 成就描述 */
  description: string;
  /** 成就图标路径 */
  icon: string;
  /** 成就分类 */
  category: '成长' | '战斗' | '收集' | '社交' | '活动';
  /** 达成条件 */
  condition: AchievementCondition;
  /** 成就奖励 */
  rewards: RewardItem[];
  /** 是否已解锁 */
  unlocked: boolean;
  /** 当前进度 */
  progress: number;
  /** 解锁时间 */
  unlockTime?: string;
  /** 是否为隐藏成就 */
  isHidden?: boolean;
}

// ==================== 存档与设置 ====================

/**
 * 画质设置
 */
export type 画质等级 = '低' | '中' | '高' | '极致';

/**
 * 语言设置
 */
export type 语言 = '简体中文' | '繁體中文' | 'English' | '日本語';

/**
 * 游戏设置
 */
export interface GameSettings {
  /** 背景音乐音量（0~100） */
  bgmVolume: number;
  /** 音效音量（0~100） */
  sfxVolume: number;
  /** 语音音量（0~100） */
  voiceVolume: number;
  /** 画质等级 */
  quality: 画质等级;
  /** 是否全屏 */
  fullscreen: boolean;
  /** 是否显示伤害数字 */
  showDamage: boolean;
  /** 是否自动存档 */
  autoSave: boolean;
  /** 自动存档间隔（分钟） */
  autoSaveInterval: number;
  /** 游戏语言 */
  language: 语言;
  /** 战斗倍速（1, 1.5, 2, 3） */
  battleSpeed: number;
  /** 是否开启战斗自动模式 */
  autoBattle: boolean;
  /** 是否推送通知 */
  pushNotification: boolean;
}

/**
 * 关卡进度
 */
export interface LevelProgress {
  /** 是否通关 */
  cleared: boolean;
  /** 获得星数（0~3） */
  stars: number;
  /** 首次通关时间 */
  firstClearTime?: string;
  /** 累计通关次数 */
  clearedCount: number;
  /** 最高回合数（越少越好） */
  bestTurns?: number;
  /** 首通奖励是否已领取 */
  firstClearClaimed?: boolean;
  /** 三星奖励是否已领取 */
  threeStarClaimed?: boolean;
}

/**
 * 玩家货币数据
 */
export interface Currency {
  /** 金币 */
  gold: number;
  /** 钻石 */
  diamond: number;
  /** 体力 */
  stamina: number;
  /** 竞技场点数 */
  arenaPoint?: number;
  /** 公会贡献 */
  guildContribution?: number;
}

/**
 * 完整存档文件
 */
export interface SaveFile {
  /** 存档唯一ID */
  id: string;
  /** 存档名称 */
  name: string;
  /** 存档槽位（1~5） */
  slot: number;
  /** 创建时间 */
  createdAt: string;
  /** 最后保存时间 */
  lastSavedAt: string;
  /** 玩家等级 */
  playerLevel: number;
  /** 玩家经验 */
  playerExp: number;
  /** 玩家昵称 */
  playerName: string;
  /** 货币数据 */
  currency: Currency;
  /** 拥有的英雄实例列表 */
  heroInstances: HeroInstance[];
  /** 拥有的装备列表 */
  equipments: Equipment[];
  /** 拥有的铭文列表 */
  inscriptions: Inscription[];
  /** 阵容配置列表 */
  lineups: Lineup[];
  /** 当前使用的阵容ID */
  currentLineupId: string;
  /** 关卡进度记录 <关卡ID, 进度> */
  levelProgress: Record<string, LevelProgress>;
  /** 成就进度 <成就ID, 是否解锁> */
  achievements: Record<string, boolean>;
  /** 战斗录像列表 */
  battleLogs: BattleLog[];
  /** 游戏设置 */
  settings: GameSettings;
  /** 新手引导进度 */
  tutorialStep: number;
  /** 每日签到记录 */
  dailySignIn?: {
    /** 上次签到日期 YYYY-MM-DD */
    lastSignDate: string;
    /** 连续签到天数 */
    continuousDays: number;
  };
  /** 存档版本号（用于迁移） */
  version: number;
}

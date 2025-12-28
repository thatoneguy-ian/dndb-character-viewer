export interface DDBCharacter {
  id: number;
  name: string;
  decorations?: {
    avatarUrl?: string;
  };
  readonlyUrl?: string;
  viewUrl?: string;
  classes: DDBClass[];
  stats: DDBStat[];
  modifiers: DDBModifiers;
  baseHitPoints: number;
  bonusHitPoints: number;
  overrideHitPoints: number | null;
  removedHitPoints: number;
  temporaryHitPoints: number;
  inventory: DDBItem[];
  classSpells: DDBClassSpell[];
  spells: {
    race: DDBSpell[];
    class: DDBSpell[];
    background: DDBSpell[];
    item: DDBSpell[];
    feat: DDBSpell[];
  };
  actions: {
    race: DDBAction[];
    class: DDBAction[];
    feat: DDBAction[];
    item: DDBAction[];
  };
  customActions: DDBAction[];
  spellSlots: DDBSpellSlot[];
  pactMagic: DDBSpellSlot[];
  spellRules?: {
    levelSpellSlots: number[][];
  };
  conditions: any[];
  appliedConditions: any[];
  statusEffects: any[];
}

export interface DDBClass {
  level: number;
  definition: {
    name: string;
    spellRules?: {
      levelSpellSlots: number[][];
    };
  };
}

export interface DDBStat {
  id: number;
  name: string;
  value: number;
}

export interface DDBModifier {
  type: string;
  subType: string;
  entityId: number | null;
  value: number;
}

export interface DDBModifiers {
  race: DDBModifier[];
  class: DDBModifier[];
  feat: DDBModifier[];
  item: DDBModifier[];
  background: DDBModifier[];
}

export interface DDBItem {
  id: string;
  equipped: boolean;
  quantity: number;
  definition: {
    name: string;
    description: string;
    filterType: string;
    armorClass?: number;
    armorTypeId?: number;
    isWeapon?: boolean;
    attackBonus?: number | string;
    enhancement?: number;
    enhancementBonus?: number;
    damage?: {
      diceString: string;
    };
    damageType?: string;
    range?: number | { rangeValue: number };
    attackType?: number;
    isMonkWeapon?: boolean;
    categoryId?: number;
    properties?: { name: string }[];
    grantedModifiers?: DDBModifier[];
    isConsumable?: boolean;
    subType?: string;
  };
}

export interface DDBAction {
  id: string;
  name: string;
  snippet?: string;
  description?: string;
  activation?: {
    activationType: number;
    activationTime: number;
  };
  limitedUse?: {
    maxUses: number;
    numberUsed: number;
  };
  range?: {
    rangeValue: number;
  };
  isProficient?: boolean;
  attackBonusModifierTotal?: number;
  dice?: {
    diceString: string;
    diceCount: number;
    diceValue: number;
    fixedValue: number;
  };
  displayAsAttack?: boolean;
  isAttack?: boolean;
  abilityModifierStatId?: number;
}

export interface DDBSpell {
  prepared: boolean;
  alwaysPrepared?: boolean;
  definition: {
    name: string;
    level: number;
    school: string;
    activation?: {
      activationType: number;
      activationTime: number;
    };
    range?: {
      rangeValue?: number;
      origin?: string;
    };
    components?: string[];
    description: string;
    tags?: string[];
    attackType?: number;
    saveDcAbilityId?: number;
  };
}

export interface DDBClassSpell {
  characterClassId?: number;
  name?: string;
  definition?: {
    name: string;
  };
  spells: DDBSpell[];
}

export interface DDBSpellSlot {
  level: number;
  used: number;
  max: number | null;
  available: number | null;
}

export interface DDBCharacterListItem {
  id: number;
  name: string;
  avatarUrl: string | null;
  latestFullCharacterUrl: string;
  gender: string | null;
  race: string | null;
  classesString: string | null;
  level: number;
}

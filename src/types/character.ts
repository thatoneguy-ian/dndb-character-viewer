export interface PinnedChar {
    id: string;
    name: string;
    avatar: string;
    classes: string[];
}

export interface FilterState {
    attackOnly: boolean;
    levels: number[];
    tags: string[];
}

export interface QuickFilters {
    castingTime: Set<string>;
    concentration: boolean | null;
}

export interface SummonStats {
    name: string;
    ac: string;
    hp: string;
    speed: string;
    str: string;
    dex: string;
    con: string;
    int: string;
    wis: string;
    cha: string;
}

export interface Skill {
    name: string;
    bonus: string;
    bonusValue: number;
}

export interface SpellSlot {
    level: number;
    used: number;
    max: number;
    available?: number;
    name?: string;
}

export interface Action {
    id: string;
    name: string;
    description: string;
    type: "Action" | "Bonus" | "Reaction" | "Other";
    source: string;
    hitOrDc: string;
    damage: string;
    range: string;
    attackType: string;
}

export interface Spell {
    name: string;
    level: number;
    school: string;
    castingTime: string;
    castingType?: 'Action' | 'Bonus' | 'Reaction' | 'Other';
    range: string;
    components: string;
    description: string;
    source: string;
    hitOrDc: string;
    damage: string;
    attackType: string;
    tags?: string[];
    summonStats?: SummonStats | null;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    description: string;
    type: "Consumable" | "Gear";
    tags: string[];
}

export interface CharacterHP {
    current: number;
    max: number;
    temp: number;
}

export type DiceType = 2 | 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface DiceRoll {
    sides: DiceType;
    value: number;
}

export interface RollResult {
    id: string;
    notation: string;
    label?: string;
    rolls: DiceRoll[];
    modifier: number;
    total: number;
    timestamp: number;
}

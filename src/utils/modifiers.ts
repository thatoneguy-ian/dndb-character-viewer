import type { DDBCharacter, DDBModifier } from '../types/dnd-beyond';

export const ABILITY_MAP: Record<number, string> = {
    1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA"
};

export function getStatValue(character: DDBCharacter, statId: number): number {
    const base = character.stats.find(s => s.id === statId)?.value || 0;
    const bonus = character.bonusStats.find(s => s.id === statId)?.value || 0;
    const override = character.overrideStats.find(s => s.id === statId)?.value || null;

    if (override !== null) return override;

    const FULL_NAMES: Record<string, string> = {
        "STR": "strength", "DEX": "dexterity", "CON": "constitution",
        "INT": "intelligence", "WIS": "wisdom", "CHA": "charisma"
    };
    const abbrev = ABILITY_MAP[statId];
    const fullName = FULL_NAMES[abbrev];

    const mods = getAllModifiers(character);

    const isStatMod = (m: DDBModifier) => m.subType === `${fullName}-score` || m.subType === fullName;

    const scoreAdd = mods
        .filter(m => {
            if (!isStatMod(m) || m.type !== "bonus") return false;
            // Character-defining sources (race, class, feat, background) are included even if isGranted is false
            // to support Tasha's Origins and certain ASIs.
            // Items and Conditions MUST be granted.
            if (m.sourceCategory === 'item' || m.sourceCategory === 'condition') {
                return m.isGranted;
            }
            return true;
        })
        .reduce((sum, m) => sum + (m.value ?? m.fixedValue ?? 0), 0);

    const setMod = mods
        .filter(m => {
            if (!isStatMod(m) || m.type !== "set") return false;
            if (m.sourceCategory === 'item' || m.sourceCategory === 'condition') {
                return m.isGranted;
            }
            return true;
        })
        .reduce((max, m) => Math.max(max, m.value ?? m.fixedValue ?? 0), 0);

    const total = base + bonus + scoreAdd;
    return setMod > total ? setMod : total;
}

export function getAllModifiers(character: DDBCharacter): (DDBModifier & { sourceCategory: string })[] {
    const all: (DDBModifier & { sourceCategory: string })[] = [];
    const categories = ['race', 'class', 'background', 'item', 'feat', 'condition'] as const;
    for (const cat of categories) {
        if (character.modifiers[cat]) {
            all.push(...character.modifiers[cat].map(m => ({ ...m, sourceCategory: cat })));
        }
    }
    return all;
}

export function getAbilityScore(character: DDBCharacter, statId: number): number {
    return getStatValue(character, statId);
}

export function getModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

export function getModString(score: number): string {
    const m = getModifier(score);
    return m >= 0 ? `+${m}` : `${m}`;
}

export function getProficiencyBonus(character: DDBCharacter): number {
    const level = character.classes.reduce((sum, c) => sum + c.level, 0);
    return Math.ceil(level / 4) + 1;
}

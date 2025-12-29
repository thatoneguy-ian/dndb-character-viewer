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

    // Filter for bonuses to the score
    const scoreAdd = mods
        .filter(m => m.type === "bonus" && (m.subType === `${fullName}-score` || m.subType === fullName))
        .reduce((sum, m) => sum + (m.value || 0), 0);

    // Check for "set" modifiers (like Gauntlets of Ogre Power)
    const setMod = mods
        .filter(m => m.type === "set" && (m.subType === `${fullName}-score` || m.subType === fullName))
        .reduce((max, m) => Math.max(max, m.value || 0), 0);

    const total = base + bonus + scoreAdd;
    return setMod > total ? setMod : total;
}

export function getAllModifiers(character: DDBCharacter): DDBModifier[] {
    const mods: DDBModifier[] = [];
    if (character.modifiers.race) mods.push(...character.modifiers.race);
    if (character.modifiers.class) mods.push(...character.modifiers.class);
    if (character.modifiers.background) mods.push(...character.modifiers.background);
    if (character.modifiers.item) mods.push(...character.modifiers.item);
    if (character.modifiers.feat) mods.push(...character.modifiers.feat);
    if (character.modifiers.condition) mods.push(...character.modifiers.condition);
    return mods;
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

import type { DDBCharacter, DDBModifier, DDBItem } from '../types/dnd-beyond';
import type { Skill, CharacterHP, SpellSlot } from '../types/character';
import { ABILITY_MAP, getAllModifiers, getStatValue, getModifier, getProficiencyBonus } from './modifiers';

export function getSkills(character: DDBCharacter): Skill[] {
    const totalLevel = character.classes.reduce((acc: number, c: any) => acc + c.level, 0);
    const profBonus = Math.ceil(1 + (totalLevel / 4));
    const mods = getAllModifiers(character);

    const SKILL_MAP: Record<string, number> = {
        "Acrobatics": 2, "Animal Handling": 5, "Arcana": 4, "Athletics": 1,
        "Deception": 6, "History": 4, "Insight": 5, "Intimidation": 6,
        "Investigation": 4, "Medicine": 5, "Nature": 4, "Perception": 5,
        "Performance": 6, "Persuasion": 6, "Religion": 4, "Sleight of Hand": 2,
        "Stealth": 2, "Survival": 5
    };

    return Object.entries(SKILL_MAP).map(([name, statId]) => {
        let bonus = getModifier(getStatValue(character, statId));
        const subType = name.toLowerCase().replace(/ /g, "-");

        const proficient = mods.find((m: DDBModifier) => m.type === "proficiency" && m.subType === subType);
        const expertise = mods.find((m: DDBModifier) => m.type === "expertise" && m.subType === subType);

        if (expertise) bonus += (profBonus * 2);
        else if (proficient) bonus += profBonus;

        mods.filter((m: DDBModifier) => m.type === "bonus" && m.subType === subType)
            .forEach((m: DDBModifier) => bonus += m.value);

        return {
            name,
            bonus: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            bonusValue: bonus,
            isProficient: !!(proficient || expertise)
        };
    });
}

export function getSavingThrows(character: DDBCharacter): Skill[] {
    const profBonus = getProficiencyBonus(character);
    const mods = getAllModifiers(character).filter(m => m.isGranted);

    const FULL_NAMES: Record<string, string> = {
        "STR": "strength", "DEX": "dexterity", "CON": "constitution",
        "INT": "intelligence", "WIS": "wisdom", "CHA": "charisma"
    };

    // Identify starting class and its proficiency feature
    const startingClass = character.classes.find(c =>
        c.isStartingClass || c.definition.id === character.startingClassId
    ) || character.classes[0];

    const startingProfFeatureIds = new Set(
        startingClass?.classFeatures
            ?.filter(f => {
                const name = f.definition.name.toLowerCase();
                return name === "proficiencies" || name === "starting proficiencies";
            })
            .map(f => f.definition.id) || []
    );

    return [1, 2, 3, 4, 5, 6].map((statId) => {
        const abbrev = ABILITY_MAP[statId];
        const fullName = FULL_NAMES[abbrev];
        const statValue = getStatValue(character, statId);
        let bonus = getModifier(statValue);
        const subType = `${fullName}-saving-throws`;

        // Check proficiency
        // Rules: 
        // 1. Keep if it's NOT a class feature (race, feat, item)
        // 2. If it IS a class feature:
        //    a. Keep if it belongs to the starting class's "Proficiencies" feature
        //    b. Keep if it belongs to ANY class but NOT to a "Proficiencies" feature (e.g. Diamond Soul, Slippery Mind)
        const isProficient = mods.some(m => {
            if (m.type !== "proficiency" || m.subType !== subType) return false;

            if (m.componentTypeId === 12168134) { // Class Feature
                const isStartingProf = startingProfFeatureIds.has(m.componentId || -1);

                // If it's a "Proficiencies" feature, it must be the starting class
                const isGenericStartProf = character.classes.some(c =>
                    c.classFeatures.some(f =>
                        f.definition.id === m.componentId &&
                        (f.definition.name.toLowerCase() === "proficiencies" || f.definition.name.toLowerCase() === "starting proficiencies")
                    )
                );

                if (isGenericStartProf) {
                    return isStartingProf;
                }
                // Otherwise it's a specific class feature like Diamond Soul, keep it
                return true;
            }
            // Race, Feat, Item - keep it
            return true;
        });

        if (isProficient) bonus += profBonus;

        // Apply specific bonuses for this stat
        mods.filter(m => m.type === "bonus" && m.subType === subType)
            .forEach(m => {
                if (m.value !== null && m.value !== undefined) bonus += m.value;
                if (m.statId) bonus += getModifier(getStatValue(character, m.statId));
            });

        // Apply global bonuses
        mods.filter(m => m.type === "bonus" && (m.subType === "saving-throws" || m.subType === "saving-throws-bonus"))
            .forEach(m => {
                if (m.value !== null && m.value !== undefined) bonus += m.value;
                if (m.statId) bonus += getModifier(getStatValue(character, m.statId));
            });

        return {
            name: abbrev,
            bonus: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            bonusValue: bonus,
            isProficient
        };
    });
}

export function getInitiative(character: DDBCharacter): string {
    let bonus = getModifier(getStatValue(character, 2)); // DEX
    const mods = getAllModifiers(character);

    mods.filter((m: DDBModifier) => m.type === "bonus" && m.subType === "initiative")
        .forEach((m: DDBModifier) => bonus += m.value);

    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

export function getPassiveStats(character: DDBCharacter) {
    const skills = getSkills(character);
    const getSkillBonus = (name: string) => skills.find(s => s.name === name)?.bonusValue || 0;

    return {
        perception: 10 + getSkillBonus("Perception"),
        insight: 10 + getSkillBonus("Insight"),
        investigation: 10 + getSkillBonus("Investigation")
    };
}

export function calculateHP(character: DDBCharacter): CharacterHP {
    const conMod = getModifier(getStatValue(character, 3));
    const level = character.classes.reduce((sum: number, cls: any) => sum + cls.level, 0);

    let max = (character.baseHitPoints || 0) + (conMod * level) + (character.bonusHitPoints || 0);
    if (character.overrideHitPoints) max = character.overrideHitPoints;

    const current = max - (character.removedHitPoints || 0);
    const temp = character.temporaryHitPoints || 0;

    return { current, max, temp };
}

export function calculateAC(character: DDBCharacter): number {
    const dexMod = getModifier(getStatValue(character, 2));
    let ac = 10 + dexMod;

    let hasArmor = false;
    let hasShield = false;
    let armorAC = 0;

    if (character.inventory) {
        character.inventory.forEach((item: DDBItem) => {
            if (!item.equipped) return;
            const def = item.definition;

            if (def.filterType === "Armor") {
                if (def.armorTypeId === 4) { // Shield
                    hasShield = true;
                    ac += def.armorClass || 0;
                } else {
                    hasArmor = true;
                    armorAC = def.armorClass || 0;
                    if (def.armorTypeId === 1) armorAC += dexMod;
                    if (def.armorTypeId === 2) armorAC += Math.min(2, dexMod);
                    ac = armorAC;
                }
            }
        });
    }

    if (!hasArmor) {
        const isMonk = character.classes.some((c: any) => c.definition.name === "Monk");
        const isBarb = character.classes.some((c: any) => c.definition.name === "Barbarian");

        if (isMonk && !hasShield) {
            ac += Math.max(0, getModifier(getStatValue(character, 5)));
        } else if (isBarb) {
            ac += Math.max(0, getModifier(getStatValue(character, 3)));
        }
    }

    const allMods = getAllModifiers(character);
    allMods.forEach((mod: DDBModifier) => {
        if (mod.type === "bonus" && mod.subType === "armor-class") {
            ac += mod.value;
        }
    });

    return ac;
}

export function getSpellSlots(character: DDBCharacter): SpellSlot[] {
    const map: Record<number, { used: number; maxSum: number; availableSum: number; sources: Set<string> }> = {};

    const addSlot = (lvl: number, used: number, maxProvided: number | null, availableProvided: number | null, source?: string): void => {
        if (typeof lvl === 'undefined' || lvl === null) return;
        const level = Number(lvl);
        if (!map[level]) map[level] = { used: 0, maxSum: 0, availableSum: 0, sources: new Set() };
        map[level].used += (used ?? 0);
        if (typeof maxProvided === 'number') map[level].maxSum += maxProvided;
        if (typeof availableProvided === 'number') map[level].availableSum += availableProvided;
        if (source) map[level].sources.add(source);
    };

    if (character.spellSlots && Array.isArray(character.spellSlots)) {
        character.spellSlots.forEach((slot: any) => {
            const used = slot.used ?? 0;
            const maxProvided = typeof slot.max === 'number' ? slot.max : null;
            const availableProvided = typeof slot.available === 'number' ? slot.available : null;
            addSlot(slot.level, used, maxProvided, availableProvided, 'Standard');
        });
    }

    if (character.pactMagic && Array.isArray(character.pactMagic)) {
        character.pactMagic.forEach((slot: any) => {
            const used = slot.used ?? 0;
            const maxProvided = typeof slot.max === 'number' ? slot.max : null;
            const availableProvided = typeof slot.available === 'number' ? slot.available : null;
            addSlot(slot.level, used, maxProvided, availableProvided, 'Pact');
        });
    }

    const totalLevel = (character && Array.isArray(character.classes)) ? character.classes.reduce((s: number, c: any) => s + (c.level || 0), 0) : 0;

    let ruleRow: number[] | null = null;
    if (character && Array.isArray(character.classes)) {
        const casterClass = character.classes.find((c) => c.definition && c.definition.spellRules && Array.isArray(c.definition.spellRules.levelSpellSlots));
        if (casterClass && casterClass.definition.spellRules) {
            const table = casterClass.definition.spellRules.levelSpellSlots;
            const idx = Math.min(Math.max(0, casterClass.level || 0), table.length - 1);
            ruleRow = table[idx];
        }
    }

    if (!ruleRow) {
        const levelSpellSlotsTable = character?.spellRules?.levelSpellSlots;
        if (Array.isArray(levelSpellSlotsTable) && levelSpellSlotsTable.length > 0) {
            const idx = Math.min(Math.max(0, totalLevel), levelSpellSlotsTable.length - 1);
            ruleRow = levelSpellSlotsTable[idx];
        }
    }

    if (ruleRow && Array.isArray(ruleRow)) {
        const maxSpellLevel = ruleRow.length;
        for (let lvl = 1; lvl <= maxSpellLevel; lvl++) {
            if (!map[lvl]) map[lvl] = { used: 0, maxSum: 0, availableSum: 0, sources: new Set() };
        }
    }

    const slots: SpellSlot[] = Object.keys(map).map(k => {
        const lvl = Number(k);
        const entry = map[lvl];
        const ruleMaxForLevel = (ruleRow && lvl >= 1 && Array.isArray(ruleRow)) ? Number(ruleRow[lvl - 1] ?? 0) : 0;

        let finalMax = 0;
        if (entry.maxSum > 0) finalMax = entry.maxSum;
        else if (ruleMaxForLevel > 0) finalMax = ruleMaxForLevel;
        else if (entry.availableSum > 0) finalMax = entry.availableSum + entry.used;
        else finalMax = entry.used;

        let finalAvailable = 0;
        if (entry.availableSum > 0) finalAvailable = entry.availableSum;
        else finalAvailable = Math.max(0, finalMax - entry.used);

        const name = entry.sources.has('Pact') && !entry.sources.has('Standard') ? 'Pact' : undefined;
        return { level: lvl, used: entry.used, max: finalMax, available: finalAvailable, name };
    }).sort((a, b) => a.level - b.level);

    return slots;
}

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

    return [1, 2, 3, 4, 5, 6].map((statId) => {
        const abbrev = ABILITY_MAP[statId];
        const fullName = FULL_NAMES[abbrev];
        const statValue = getStatValue(character, statId);
        let bonus = getModifier(statValue);
        const subType = `${fullName}-saving-throws`;

        // Check proficiency
        const isProficient = mods.some(m => {
            if (m.type !== "proficiency" || m.subType !== subType) return false;

            if (m.sourceCategory === 'class') {
                // Find the feature to check its required level and class ownership
                const feature = character.classes
                    .flatMap(c => c.classFeatures.map(f => ({ ...f, parentClass: c })))
                    .find(f => f.definition.id === m.componentId);

                if (!feature) return true; // Fallback for unknown features

                // Generic level 1 proficiency blocks only count if they are from the starting class.
                // These include the standard "Proficiencies" block or "Core Monk Traits", etc.
                const isGenericLevel1Prof = feature.definition.requiredLevel === 1 &&
                    (feature.definition.name.toLowerCase().includes("proficien") ||
                        feature.definition.name.toLowerCase().includes("traits"));

                if (isGenericLevel1Prof) {
                    return feature.parentClass.isStartingClass ||
                        feature.parentClass.definition.id === character.startingClassId;
                }

                // Specific class features give proficiency regardless of starting class (e.g. Diamond Soul, Slippery Mind)
                return true;
            }
            // Non-class sources (Race, Feat, Item) always count if granted
            return true;
        });

        if (isProficient) bonus += profBonus;

        // Sum up all valid bonuses
        // 1. Global saving throw bonuses (e.g. Ring of Protection, Cloak of Protection)
        // 2. Specific saving throw bonuses (e.g. [Stat]-saving-throws)
        const bonusMods = mods.filter(m => {
            if (m.type !== "bonus") return false;
            const s = m.subType;
            return s === "saving-throws" ||
                s === "saving-throws-bonus" ||
                s === "saving-throw-bonus" ||
                s === subType;
        });

        bonusMods.forEach(m => {
            bonus += (m.value ?? m.fixedValue ?? 0);
            if (m.statId) {
                // If the bonus depends on another stat (e.g. Paladin's Aura adds CHA mod)
                bonus += getModifier(getStatValue(character, m.statId));
            }
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
        .forEach((m: DDBModifier) => bonus += (m.value ?? m.fixedValue ?? 0));

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

    const allMods = getAllModifiers(character).filter(m => m.isGranted);
    allMods.forEach((mod: DDBModifier) => {
        if (mod.type === "bonus" && mod.subType === "armor-class") {
            ac += (mod.value ?? mod.fixedValue ?? 0);
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

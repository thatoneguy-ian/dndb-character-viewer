import type { DDBCharacter, DDBAction, DDBItem, DDBSpell, DDBModifier } from '../types/dnd-beyond';
import type { Action, Spell, InventoryItem } from '../types/character';
import { getModifier, getStatValue } from './modifiers';
import { parseSummonStats } from './parsing';

const DAMAGE_TYPES = [
    'slashing', 'piercing', 'bludgeoning',
    'fire', 'cold', 'lightning', 'thunder', 'acid', 'poison',
    'psychic', 'radiant', 'necrotic', 'force'
];

const damageTypeRegex = new RegExp(`(${DAMAGE_TYPES.join('|')})`, 'i');

export function getClasses(character: DDBCharacter): string[] {
    if (!character || !character.classes) return [];
    return character.classes.map((c) => {
        const name = c.definition?.name || "Class";
        const sub = c.subclassDefinition?.name ? ` (${c.subclassDefinition.name})` : "";
        return `${name}${sub} ${c.level}`;
    });
}

export function getActions(character: DDBCharacter): Action[] {
    const allActions: Action[] = [];
    const totalLevel = character.classes.reduce((acc: number, c) => acc + (c.level || 0), 0);
    const profBonus = Math.ceil(1 + (totalLevel / 4));

    const strMod = getModifier(getStatValue(character, 1));
    const dexMod = getModifier(getStatValue(character, 2));
    const isMonk = character.classes.some((c) => c.definition?.name === "Monk");

    const processList = (list: DDBAction[], sourceName: string, className?: string): void => {
        if (!list) return;
        list.forEach((item) => {
            let type: Action["type"] = "Other";
            const actType = item.activation?.activationType;

            if (actType === 1) type = "Action";
            else if (actType === 3) type = "Bonus";
            else if (actType === 4) type = "Reaction";

            let hitBonus: string | undefined = undefined;
            const saveDC: string | undefined = undefined;
            let damage = "";

            if (item.isAttack || item.attackBonusModifierTotal != null || item.dice?.diceString) {
                if (item.isAttack || item.attackBonusModifierTotal != null) {
                    let bonus = (item.attackBonusModifierTotal || 0) + (item.isProficient ? profBonus : 0);

                    if (item.abilityModifierStatId) {
                        bonus += getModifier(getStatValue(character, item.abilityModifierStatId));
                    } else if (item.isAttack) {
                        bonus += (isMonk ? Math.max(strMod, dexMod) : strMod);
                    }

                    hitBonus = bonus >= 0 ? `+${bonus}` : `${bonus}`;
                }

                if (item.dice?.diceString) {
                    damage = item.dice.diceString;
                    damage = damage.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
                }
            }

            const desc = item.snippet || item.description || "";
            const durationMatch = desc.match(/Duration:\s*([^.<]+)/i);
            const targetMatch = desc.match(/Target:\s*([^.<]+)/i);
            const dmgTypeMatch = desc.match(damageTypeRegex);

            allActions.push({
                id: item.id || item.name,
                name: item.name,
                description: desc,
                type,
                source: sourceName,
                hitBonus,
                saveDC,
                damage,
                damageType: dmgTypeMatch ? dmgTypeMatch[1].toLowerCase() : undefined,
                range: item.range && item.range.rangeValue ? `${item.range.rangeValue}ft` : "",
                duration: durationMatch ? durationMatch[1].trim() : undefined,
                target: targetMatch ? targetMatch[1].trim() : undefined,
                attackType: sourceName,
                className,
                resource: item.limitedUse ? {
                    current: item.limitedUse.maxUses - item.limitedUse.numberUsed,
                    max: item.limitedUse.maxUses
                } : undefined
            });
        });
    };

    if (character.actions) {
        processList(character.actions.race, "Race Feature");
        processList(character.actions.feat, "Feat");
        processList(character.actions.item, "Item");
        processList(character.actions.class, "Class Feature");
    }
    if (character.customActions) processList(character.customActions, "Custom");

    if (character.inventory) {
        character.inventory.forEach((item: DDBItem) => {
            if (!item.equipped) return;
            const def = item.definition;
            if (!def) return;

            const isStaff = def.filterType === "Staff";
            const isWeapon = def.filterType === "Weapon" || def.isWeapon;
            const isWondrousAttack = def.filterType === "Wondrous item" && (def.damage && def.damage.diceString);

            if (isWeapon || isStaff || isWondrousAttack) {
                let modToUse = strMod;
                const props = def.properties ? def.properties.map((p) => p.name) : [];
                const isFinesse = props.includes("Finesse");
                const isRanged = def.attackType === 2 || (typeof def.range === 'number' ? def.range > 5 : (def.range?.rangeValue ?? 0) > 5);
                const isMonkWeapon = isMonk && (def.isMonkWeapon || isStaff || def.categoryId === 1);

                if (isRanged || (isFinesse && dexMod > strMod) || (isMonkWeapon && dexMod > strMod)) {
                    modToUse = dexMod;
                }

                let itemBonus = 0;
                if (def.attackBonus != null && def.attackBonus !== '') {
                    const n = Number(def.attackBonus);
                    if (!Number.isNaN(n)) itemBonus = n;
                } else if (typeof def.enhancement === 'number' && !Number.isNaN(def.enhancement)) {
                    itemBonus = Number(def.enhancement);
                } else if (typeof def.enhancementBonus === 'number' && !Number.isNaN(def.enhancementBonus)) {
                    itemBonus = Number(def.enhancementBonus);
                }

                if (Array.isArray(def.grantedModifiers)) {
                    def.grantedModifiers.forEach((m: DDBModifier) => {
                        if (m && m.type === 'bonus' && typeof m.value === 'number' && !Number.isNaN(m.value)) {
                            const sub = (m.subType || '').toLowerCase();
                            if (sub.includes('attack') || sub.includes('to-hit') || sub.includes('attack-roll') || sub === '') {
                                itemBonus += Number(m.value);
                            }
                        }
                    });
                }

                const toHit = profBonus + modToUse + itemBonus;
                const hitString = `+${toHit}`;

                const dmgType = def.damageType || "";
                let damageString = "";

                if (def.damage && def.damage.diceString) {
                    const modStr = modToUse === 0 ? "" : (modToUse > 0 ? `+${modToUse}` : `${modToUse}`);
                    damageString = `${def.damage.diceString}${modStr} ${dmgType}`;
                } else if (isStaff) {
                    const modStr = modToUse === 0 ? "" : (modToUse > 0 ? `+${modToUse}` : `${modToUse}`);
                    damageString = `1d6${modStr} Bludgeoning`;
                }

                const rangeValue = typeof def.range === 'number' ? def.range : (def.range?.rangeValue ?? 5);

                let attackLabel = "Weapon Attack";
                if (def.attackType === 1) attackLabel = "Melee Weapon";
                if (def.attackType === 2) attackLabel = "Ranged Weapon";
                if (def.filterType === "Staff") attackLabel = "Melee Weapon";

                let damageType = def.damageType?.toLowerCase();
                if (!damageType) {
                    const typeMatch = (def.description || "").match(damageTypeRegex);
                    if (typeMatch) damageType = typeMatch[1].toLowerCase();
                }

                allActions.push({
                    id: item.id,
                    name: def.name,
                    type: "Action",
                    source: "Weapon",
                    hitBonus: hitString,
                    damage: damageString,
                    damageType,
                    range: `${rangeValue}ft`,
                    description: def.description || "",
                    attackType: attackLabel
                });
            }
        });
    }

    return allActions.sort((a, b) => a.name.localeCompare(b.name));
}

const PREPARED_CASTERS = ["Cleric", "Druid", "Wizard", "Paladin", "Artificer"];

export function getSpells(character: DDBCharacter): Spell[] {
    const spells: Spell[] = [];
    const profBonus = Math.ceil(1 + (character.classes.reduce((acc, c) => acc + (c.level || 0), 0) / 4));
    const diceRegex = /(\b\d*d\d+(?:\s*[+-]\s*\d+)?\b)/gi;

    const CLASS_ABILITY_MAP: Record<string, number> = {
        "Wizard": 4, "Artificer": 4,
        "Cleric": 5, "Druid": 5, "Ranger": 5,
        "Paladin": 6, "Bard": 6, "Sorcerer": 6, "Warlock": 6
    };

    const processSpells = (list: DDBSpell[], source: string, className?: string): void => {
        if (!list) return;
        const safeSource = source || "Unknown";
        const isPreparedClass = PREPARED_CASTERS.some(c => safeSource.includes(c));
        const abilityId = className ? CLASS_ABILITY_MAP[className] : undefined;
        const abilityMod = abilityId ? getModifier(getStatValue(character, abilityId)) : 0;

        list.forEach((entry) => {
            if (isPreparedClass && entry.prepared === false && !entry.alwaysPrepared) return;
            const def = entry.definition;
            if (!def) return;

            let dmg = "";
            const tags = def.tags || [];
            if (tags.includes("Damage")) dmg = "Dmg";

            const desc = def.description || "";
            const durationMatch = desc.match(/Duration:\s*([^.<]+)/i);
            const targetMatch = desc.match(/Target:\s*([^.<]+)/i);
            const dmgTypeMatch = desc.match(damageTypeRegex);

            // Try to parse damage dice from description if not found
            if (!dmg || dmg === "Dmg") {
                const match = desc.match(diceRegex);
                if (match) dmg = match[0];
            }

            const range = def.range?.rangeValue ? `${def.range.rangeValue}ft` : (def.range?.origin || "Self");

            let attackType = "Spell";
            if (def.attackType === 1) attackType = "Melee Spell";
            if (def.attackType === 2) attackType = "Ranged Spell";
            if (def.saveDcAbilityId) attackType = "Save";

            // Calculate Hit/DC
            let hitBonus: string | undefined = undefined;
            let saveDC: string | undefined = undefined;

            if (def.saveDcAbilityId || def.attackType) {
                if (def.saveDcAbilityId) {
                    const saveMod = getModifier(getStatValue(character, def.saveDcAbilityId));
                    saveDC = (8 + profBonus + saveMod).toString();
                } else if (abilityId) {
                    const bonus = profBonus + abilityMod;
                    hitBonus = bonus >= 0 ? `+${bonus}` : bonus.toString();
                }
            }

            let castingType: 'Action' | 'Bonus' | 'Reaction' | 'Other' = 'Other';
            const actType = def.activation?.activationType;
            if (actType === 1) castingType = 'Action';
            else if (actType === 3) castingType = 'Bonus';
            else if (actType === 4) castingType = 'Reaction';

            const activationTime = def.activation?.activationTime || def.activation?.activationTime === 0 ? def.activation.activationTime : undefined;
            const activationLabel = castingType === 'Bonus' ? 'Bonus Action' : (castingType === 'Reaction' ? 'Reaction' : (castingType === 'Action' ? 'Action' : 'Other'));
            const castingTimeStr = activationTime ? `${activationTime} ${activationLabel}` : activationLabel;

            const summonData = parseSummonStats(def.description || "");

            spells.push({
                name: def.name,
                level: def.level,
                school: def.school || "Magic",
                castingTime: castingTimeStr,
                castingType: castingType,
                range: range,
                components: def.components?.join(", ") || "",
                description: desc,
                source: safeSource,
                hitBonus,
                saveDC,
                damage: dmg,
                damageType: dmgTypeMatch ? dmgTypeMatch[1].toLowerCase() : undefined,
                duration: durationMatch ? durationMatch[1].trim() : undefined,
                target: targetMatch ? targetMatch[1].trim() : undefined,
                attackType: attackType,
                tags: tags,
                summonStats: summonData,
                className
            });
        });
    };

    if (character.classSpells) {
        character.classSpells.forEach((cls) => {
            const className = cls.name || cls.definition?.name || "Class";
            processSpells(cls.spells, className, className);
        });
    }
    if (character.spells) {
        processSpells(character.spells.race, "Race");
        processSpells(character.spells.feat, "Feat");
        processSpells(character.spells.item, "Item");
    }

    return spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

export function getInventory(character: DDBCharacter): InventoryItem[] {
    if (!character.inventory) return [];
    return character.inventory.map((item) => {
        const def = item.definition;
        const type: "Consumable" | "Gear" = (def.filterType === "Potion" || def.filterType === "Scroll" || def.isConsumable)
            ? "Consumable"
            : "Gear";
        const isCombat = def.filterType === "Weapon" || def.filterType === "Armor" || def.filterType === "Ammunition" || def.filterType === "Shield";
        const tags = [def.filterType, def.subType].filter((t): t is string => !!t);
        if (isCombat) tags.push("Combat");

        return {
            id: item.id,
            name: def.name,
            quantity: item.quantity,
            description: def.description,
            type: type,
            tags: tags
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
}

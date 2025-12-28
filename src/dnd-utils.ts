import type { DDBCharacter, DDBModifier, DDBItem, DDBAction, DDBSpell } from './types/dnd-beyond';
import type {
  SummonStats,
  Skill,
  SpellSlot,
  Action,
  Spell,
  InventoryItem,
  CharacterHP
} from './types/character';

export const ABILITY_MAP: Record<number, string> = {
  1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA"
};

export function getClasses(character: DDBCharacter): string[] {
  if (!character.classes) return [];
  return character.classes.map((cls) =>
    `${cls.definition?.name || "Class"} ${cls.level}`
  );
}

function getStatValue(character: DDBCharacter, statId: number): number {
  if (!character.stats) return 10;
  // Loose equality (==) handles string/number mismatches
  let score = character.stats.find((s) => s.id == statId)?.value || 10;

  const allModifiers = getAllModifiers(character);
  allModifiers.forEach((mod) => {
    if (mod.type === "bonus" && mod.entityId == statId) score += mod.value;
  });
  return score;
}

function getAllModifiers(character: DDBCharacter): DDBModifier[] {
  return [
    ...(character.modifiers.race || []),
    ...(character.modifiers.class || []),
    ...(character.modifiers.feat || []),
    ...(character.modifiers.item || []),
    ...(character.modifiers.background || [])
  ];
}

export function getAbilityScore(character: DDBCharacter, statId: number): number {
  return getStatValue(character, statId);
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getModString(score: number): string {
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(character: DDBCharacter): number {
  const totalLevel = character.classes.reduce((acc, c) => acc + (c.level || 0), 0);
  return Math.ceil(1 + (totalLevel / 4));
}

// --- TAG RESOLUTION ---

export function resolveDDBTags(text: string, character: DDBCharacter, contextName?: string, className?: string): string {
  if (!text || !character) return text || "";

  const totalLevel = character.classes.reduce((acc, c) => acc + (c.level || 0), 0);
  const profBonus = getProficiencyBonus(character);

  return text.replace(/{{(.*?)}}/g, (match, expression) => {
    // Remove formatting flags like #unsigned, #signed, calc, etc.
    let cleanExpr = expression.split('#')[0].trim().toLowerCase();

    // Replace proficiency
    cleanExpr = cleanExpr.replace(/\bproficiency\b/g, profBonus.toString());

    // Replace level variables
    cleanExpr = cleanExpr.replace(/\blevel\b/g, totalLevel.toString());
    cleanExpr = cleanExpr.replace(/\bcharacterlevel\b/g, totalLevel.toString());
    cleanExpr = cleanExpr.replace(/\bclasslevel\b/g, () => {
      if (className) {
        const cl = character.classes.find(c => (c.definition?.name || "").toLowerCase() === className.toLowerCase())?.level;
        if (cl) return cl.toString();
      }
      // Common fallback: Sneak Attack (always Rogue)
      if (contextName?.toLowerCase().includes('sneak attack')) {
        const rl = character.classes.find(c => c.definition?.name === 'Rogue')?.level;
        if (rl) return rl.toString();
      }
      return totalLevel.toString();
    });

    // Replace ability mods: e.g. {{abilitymod:str}}
    cleanExpr = cleanExpr.replace(/\babilitymod:(\w+)\b/g, (_m: string, ab: string) => {
      const statId = Object.keys(ABILITY_MAP).find(k => ABILITY_MAP[Number(k)].toLowerCase() === ab.toLowerCase());
      if (statId) {
        const score = getStatValue(character, Number(statId));
        return getModifier(score).toString();
      }
      return "0";
    });

    // Special logic for scalevalue
    if (cleanExpr === 'scalevalue') {
      const lowerText = (text + " " + (contextName || "")).toLowerCase();
      // Common case: Sneak Attack
      if (lowerText.includes('sneak attack')) {
        const rogueLevel = character.classes.find(c => c.definition?.name === 'Rogue')?.level || 0;
        if (rogueLevel > 0) {
          const diceCount = Math.ceil(rogueLevel / 2);
          return `${diceCount}d6`;
        }
      }
      // Common case: Monk Martial Arts
      if (lowerText.includes('martial arts')) {
        const monkLevel = character.classes.find(c => c.definition?.name === 'Monk')?.level || 0;
        if (monkLevel >= 17) return "1d10";
        if (monkLevel >= 11) return "1d8";
        if (monkLevel >= 5) return "1d6";
        if (monkLevel >= 1) return "1d4";
      }
      return "0";
    }

    // Evaluate simple math: e.g. "14+4"
    try {
      // If the expression is just a number now, return it
      if (!isNaN(Number(cleanExpr))) return cleanExpr;

      // Only allow basic math characters
      if (/^[0-9+\-*/().\s]+$/.test(cleanExpr)) {
        // Safe evaluation of simple math
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${cleanExpr}`)();
        return result.toString();
      }
    } catch (e) {
      return match;
    }

    return match;
  });
}

// --- SUMMON PARSING ---

// Helper function (used internally by getSpells)
function parseSummonStats(description: string): SummonStats | null {
  if (!description) return null;
  const text = description.replace(/<[^>]*>/g, ' ');

  if (!text.includes("Armor Class") && !text.includes("Hit Points")) return null;

  const grab = (label: string): string => {
    const regex = new RegExp(`${label}\\s*([\\d\\w\\s\\(\\)+]+?)(?:Speed|STR|DEX|CON|INT|WIS|CHA|Senses|Languages|Challenge|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "?";
  };

  const grabStat = (label: string): string => {
    const regex = new RegExp(`${label}\\s*(\\d+)`, 'i');
    const match = text.match(regex);
    return match ? match[1] : "10";
  };

  return {
    name: "Summoned Creature",
    ac: grab("Armor Class"),
    hp: grab("Hit Points"),
    speed: grab("Speed"),
    str: grabStat("STR"),
    dex: grabStat("DEX"),
    con: grabStat("CON"),
    int: grabStat("INT"),
    wis: grabStat("WIS"),
    cha: grabStat("CHA")
  };
}

// --- SKILLS ---

export function getSkills(character: DDBCharacter): Skill[] {
  const totalLevel = character.classes.reduce((acc: number, c: any) => acc + c.level, 0);
  const profBonus = Math.ceil(1 + (totalLevel / 4));
  const mods = getAllModifiers(character);

  // Assuming SKILL_MAP is defined elsewhere or implicitly available
  // For now, let's assume it's a Record<string, number>
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
      bonusValue: bonus
    };
  });
}

// --- SAVING THROWS ---
export function getSavingThrows(character: DDBCharacter): Skill[] {
  const totalLevel = character.classes.reduce((acc: number, c: any) => acc + c.level, 0);
  const profBonus = Math.ceil(1 + (totalLevel / 4));
  const mods = getAllModifiers(character);

  return [1, 2, 3, 4, 5, 6].map((statId) => {
    const name = ABILITY_MAP[statId];
    let bonus = getModifier(getStatValue(character, statId));
    const subType = `${name.toLowerCase()}-saving-throws`;

    const proficient = mods.find((m: DDBModifier) => m.type === "proficiency" && m.subType === subType);
    if (proficient) bonus += profBonus;

    // Specific bonuses for this ability's save
    mods.filter((m: DDBModifier) => m.type === "bonus" && m.subType === subType)
      .forEach((m: DDBModifier) => bonus += m.value);

    // Global bonuses to all saving throws
    mods.filter((m: DDBModifier) => m.type === "bonus" && (m.subType === "saving-throws" || m.subType === "saving-throws-bonus"))
      .forEach((m: DDBModifier) => bonus += m.value);

    return {
      name,
      bonus: bonus >= 0 ? `+${bonus}` : `${bonus}`,
      bonusValue: bonus
    };
  });
}

// --- INITIATIVE ---
export function getInitiative(character: DDBCharacter): string {
  let bonus = getModifier(getStatValue(character, 2)); // DEX
  const mods = getAllModifiers(character);

  mods.filter((m: DDBModifier) => m.type === "bonus" && m.subType === "initiative")
    .forEach((m: DDBModifier) => bonus += m.value);

  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

// --- PASSIVE STATS ---
export function getPassiveStats(character: DDBCharacter) {
  const skills = getSkills(character);
  const getSkillBonus = (name: string) => skills.find(s => s.name === name)?.bonusValue || 0;

  return {
    perception: 10 + getSkillBonus("Perception"),
    insight: 10 + getSkillBonus("Insight"),
    investigation: 10 + getSkillBonus("Investigation")
  };
}

// --- HP & AC ---
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

// --- SPELL SLOTS ---

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

  // Precompute total level for multiclass fallback
  const totalLevel = (character && Array.isArray(character.classes)) ? character.classes.reduce((s: number, c: any) => s + (c.level || 0), 0) : 0;

  // Prefer class-level spellRules if available (use that class' level to index the table).
  // Fallback to character.spellRules (multiclass combined) indexed by totalLevel.
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

  // If a ruleRow exists but the payload didn't include entries for some levels,
  // seed empty entries so we still report those levels (with 0 used/available)
  if (ruleRow && Array.isArray(ruleRow)) {
    const maxSpellLevel = ruleRow.length; // typically 9
    for (let lvl = 1; lvl <= maxSpellLevel; lvl++) {
      if (!map[lvl]) map[lvl] = { used: 0, maxSum: 0, availableSum: 0, sources: new Set() };
    }
  }

  const slots: SpellSlot[] = Object.keys(map).map(k => {
    const lvl = Number(k);
    const entry = map[lvl];
    // Use rule table only for spell levels >= 1 (cantrips are level 0 and not in rule arrays)
    const ruleMaxForLevel = (ruleRow && lvl >= 1 && Array.isArray(ruleRow)) ? Number(ruleRow[lvl - 1] ?? 0) : 0;

    // Final max: prefer explicit maxSum, else rule table value, else availableSum + used, else used
    let finalMax = 0;
    if (entry.maxSum > 0) finalMax = entry.maxSum;
    else if (ruleMaxForLevel > 0) finalMax = ruleMaxForLevel;
    else if (entry.availableSum > 0) finalMax = entry.availableSum + entry.used;
    else finalMax = entry.used;

    // Final available: prefer availableSum, else compute from finalMax - used
    let finalAvailable = 0;
    if (entry.availableSum > 0) finalAvailable = entry.availableSum;
    else finalAvailable = Math.max(0, finalMax - entry.used);

    const name = entry.sources.has('Pact') && !entry.sources.has('Standard') ? 'Pact' : undefined;
    return { level: lvl, used: entry.used, max: finalMax, available: finalAvailable, name };
  }).sort((a, b) => a.level - b.level);

  return slots;
}

// --- ACTIONS ---

export function getActions(character: DDBCharacter): Action[] {
  const allActions: Action[] = [];
  const totalLevel = character.classes.reduce((acc: number, c: any) => acc + c.level, 0);
  const profBonus = Math.ceil(1 + (totalLevel / 4));

  const strMod = getModifier(getStatValue(character, 1));
  const dexMod = getModifier(getStatValue(character, 2));
  const isMonk = character.classes.some((c: any) => c.definition.name === "Monk");

  const processList = (list: DDBAction[], sourceName: string, className?: string): void => {
    if (!list) return;
    list.forEach((item) => {
      let type: Action["type"] = "Other";
      const actType = item.activation?.activationType;

      if (actType === 1) type = "Action";
      else if (actType === 3) type = "Bonus";
      else if (actType === 4) type = "Reaction";

      let limit = "";
      if (item.limitedUse) {
        const max = item.limitedUse.maxUses;
        const used = item.limitedUse.numberUsed || 0;
        const remaining = max - used;
        if (max) limit = `(${remaining}/${max})`;
      }

      let hitOrDc = limit;
      let damage = "";

      if (item.isAttack || item.attackBonusModifierTotal != null || item.dice?.diceString) {
        if (item.isAttack || item.attackBonusModifierTotal != null) {
          let bonus = (item.attackBonusModifierTotal || 0) + (item.isProficient ? profBonus : 0);

          if (item.abilityModifierStatId) {
            bonus += getModifier(getStatValue(character, item.abilityModifierStatId));
          } else if (item.isAttack) {
            // Fallback for attacks missing ability ID - use monk-friendly or general default
            bonus += (isMonk ? Math.max(strMod, dexMod) : strMod);
          }

          hitOrDc = bonus >= 0 ? `+${bonus}` : `${bonus}`;
        }

        if (item.dice?.diceString) {
          damage = item.dice.diceString;
          // Clean common DDB artifacts
          damage = damage.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }

      allActions.push({
        id: item.id || item.name,
        name: item.name,
        description: item.snippet || item.description || "",
        type,
        source: sourceName,
        hitOrDc,
        damage,
        range: item.range && item.range.rangeValue ? `${item.range.rangeValue}ft` : "",
        attackType: sourceName,
        className
      });
    });
  };

  if (character.actions) {
    processList(character.actions.race, "Race Feature");
    processList(character.actions.feat, "Feat");
    processList(character.actions.item, "Item");

    // For class actions, if we can match them to classes...
    // For now, let's look for actions and try to infer.
    // DDB's flat list character.actions.class is tricky.
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
        const props = def.properties ? def.properties.map((p: any) => p.name) : [];
        const isFinesse = props.includes("Finesse");
        const isRanged = def.attackType === 2 || (typeof def.range === 'number' ? def.range > 5 : (def.range?.rangeValue ?? 0) > 5);
        const isMonkWeapon = isMonk && (def.isMonkWeapon || isStaff || def.categoryId === 1);

        if (isRanged || (isFinesse && dexMod > strMod) || (isMonkWeapon && dexMod > strMod)) {
          modToUse = dexMod;
        }

        // Compute item bonus defensively: prefer explicit numeric fields.
        let itemBonus = 0;
        if (def.attackBonus != null && def.attackBonus !== '') {
          const n = Number(def.attackBonus);
          if (!Number.isNaN(n)) itemBonus = n;
        } else if (typeof def.enhancement === 'number' && !Number.isNaN(def.enhancement)) {
          itemBonus = Number(def.enhancement);
        } else if (typeof def.enhancementBonus === 'number' && !Number.isNaN(def.enhancementBonus)) {
          itemBonus = Number(def.enhancementBonus);
        } else {
          itemBonus = 0; // `def.magic === true` is a metadata flag, not a numeric +1
        }

        // Add any explicit grantedModifiers that provide numeric attack bonuses
        if (Array.isArray(def.grantedModifiers)) {
          def.grantedModifiers.forEach((m: DDBModifier) => {
            if (m && m.type === 'bonus' && typeof m.value === 'number' && !Number.isNaN(m.value)) {
              // Only include if the modifier is likely an attack bonus (subType may vary across payloads)
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
        const range = `${rangeValue}ft`;

        let attackLabel = "Weapon Attack";
        if (def.attackType === 1) attackLabel = "Melee Weapon";
        if (def.attackType === 2) attackLabel = "Ranged Weapon";
        if (def.filterType === "Staff") attackLabel = "Melee Weapon";

        allActions.push({
          id: item.id,
          name: def.name,
          type: "Action",
          source: "Weapon",
          hitOrDc: hitString,
          damage: damageString,
          range: range,
          description: def.description || "",
          attackType: attackLabel
        });
      }
    });
  }

  return allActions.sort((a, b) => a.name.localeCompare(b.name));
}

// --- SPELLS ---
const PREPARED_CASTERS = ["Cleric", "Druid", "Wizard", "Paladin", "Artificer"];

export function getSpells(character: DDBCharacter): Spell[] {
  const spells: Spell[] = [];

  const processSpells = (list: DDBSpell[], source: string, className?: string): void => {
    if (!list) return;
    const safeSource = source || "Unknown";
    const isPreparedClass = PREPARED_CASTERS.some(c => safeSource.includes(c));

    list.forEach((entry) => {
      if (isPreparedClass && entry.prepared === false && !entry.alwaysPrepared) return;
      const def = entry.definition;
      if (!def) return;

      const hit = "";
      let dmg = "";
      const tags = def.tags || [];
      if (tags.includes("Damage")) dmg = "Dmg";

      const range = def.range?.rangeValue ? `${def.range.rangeValue}ft` : (def.range?.origin || "Self");

      let attackType = "Spell";
      if (def.attackType === 1) attackType = "Melee Spell";
      if (def.attackType === 2) attackType = "Ranged Spell";
      if (def.saveDcAbilityId) attackType = "Save";

      // Determine canonical casting type for robust filtering
      let castingType: 'Action' | 'Bonus' | 'Reaction' | 'Other' = 'Other';
      const actType = def.activation?.activationType;
      if (actType === 1) castingType = 'Action';
      else if (actType === 3) castingType = 'Bonus';
      else if (actType === 4) castingType = 'Reaction';

      // Human-friendly casting time string
      const activationTime = def.activation?.activationTime || def.activation?.activationTime === 0 ? def.activation.activationTime : undefined;
      const activationLabel = castingType === 'Bonus' ? 'Bonus Action' : (castingType === 'Reaction' ? 'Reaction' : (castingType === 'Action' ? 'Action' : 'Other'));
      const castingTimeStr = activationTime ? `${activationTime} ${activationLabel}` : activationLabel;

      // OPTIMIZATION: Parse Summons ONCE here
      const summonData = parseSummonStats(def.description || "");

      spells.push({
        name: def.name,
        level: def.level,
        school: def.school || "Magic",
        castingTime: castingTimeStr,
        castingType: castingType,
        range: range,
        components: def.components?.join(", ") || "",
        description: def.description || "",
        source: safeSource,
        hitOrDc: hit,
        damage: dmg,
        attackType: attackType,
        tags: tags,
        summonStats: summonData,
        className
      });
    });
  };

  if (character.classSpells) {
    character.classSpells.forEach((cls: any) => {
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

// --- INVENTORY ---

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
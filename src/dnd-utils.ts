/* eslint-disable @typescript-eslint/no-explicit-any */
export const ABILITY_MAP: Record<number, string> = {
  1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA"
};

export function getClasses(character: any): string[] {
  if (!character.classes) return [];
  return character.classes.map((cls: any) => 
    `${cls.definition?.name || "Class"} ${cls.level}`
  );
}

function getStatValue(character: any, statId: number): number {
  if (!character.stats) return 10;
  // Loose equality (==) handles string/number mismatches
  let score = character.stats.find((s: any) => s.id == statId)?.value || 10;
  
  const allModifiers = getAllModifiers(character);
  allModifiers.forEach((mod: any) => {
    if (mod.type === "bonus" && mod.entityId == statId) score += mod.value;
  });
  return score;
}

function getAllModifiers(character: any) {
  return [
    ...(character.modifiers.race || []),
    ...(character.modifiers.class || []),
    ...(character.modifiers.feat || []),
    ...(character.modifiers.item || []),
    ...(character.modifiers.background || [])
  ];
}

export function getAbilityScore(character: any, statId: number): number {
  return getStatValue(character, statId);
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getModString(score: number): string {
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// --- SUMMON PARSING ---
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

// Helper function (used internally by getSpells)
function parseSummonStats(description: string): SummonStats | null {
  if (!description) return null;
  const text = description.replace(/<[^>]*>/g, ' ');
  
  if (!text.includes("Armor Class") && !text.includes("Hit Points")) return null;

  const grab = (label: string) => {
    const regex = new RegExp(`${label}\\s*([\\d\\w\\s\\(\\)+]+?)(?:Speed|STR|DEX|CON|INT|WIS|CHA|Senses|Languages|Challenge|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "?";
  };

  const grabStat = (label: string) => {
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
const SKILL_MAP: Record<string, number> = {
  "Acrobatics": 2, "Animal Handling": 5, "Arcana": 4, "Athletics": 1,
  "Deception": 6, "History": 4, "Insight": 5, "Intimidation": 6,
  "Investigation": 4, "Medicine": 5, "Nature": 4, "Perception": 5,
  "Performance": 6, "Persuasion": 6, "Religion": 4, "Sleight of Hand": 2,
  "Stealth": 2, "Survival": 5
};

export interface Skill {
  name: string;
  bonus: string;
  bonusValue: number;
}

export function getSkills(character: any): Skill[] {
  const totalLevel = character.classes.reduce((acc: number, c: any) => acc + c.level, 0);
  const profBonus = Math.ceil(1 + (totalLevel / 4));
  const mods = getAllModifiers(character);

  return Object.entries(SKILL_MAP).map(([name, statId]) => {
    let bonus = getModifier(getStatValue(character, statId));
    const subType = name.toLowerCase().replace(/ /g, "-");
    
    const proficient = mods.find((m: any) => m.type === "proficiency" && m.subType === subType);
    const expertise = mods.find((m: any) => m.type === "expertise" && m.subType === subType);

    if (expertise) bonus += (profBonus * 2);
    else if (proficient) bonus += profBonus;

    mods.filter((m: any) => m.type === "bonus" && m.subType === subType)
        .forEach((m: any) => bonus += m.value);

    return {
      name,
      bonus: bonus >= 0 ? `+${bonus}` : `${bonus}`,
      bonusValue: bonus
    };
  });
}

// --- HP & AC ---
export function calculateHP(character: any): { current: number, max: number, temp: number } {
  const conMod = getModifier(getStatValue(character, 3)); 
  const level = character.classes.reduce((sum: number, cls: any) => sum + cls.level, 0);
  
  let max = (character.baseHitPoints || 0) + (conMod * level) + (character.bonusHitPoints || 0);
  if (character.overrideHitPoints) max = character.overrideHitPoints;

  const current = max - (character.removedHitPoints || 0);
  const temp = character.temporaryHitPoints || 0;

  return { current, max, temp };
}

export function calculateAC(character: any): number {
  const dexMod = getModifier(getStatValue(character, 2)); 
  let ac = 10 + dexMod; 

  let hasArmor = false;
  let hasShield = false;
  let armorAC = 0;

  if (character.inventory) {
    character.inventory.forEach((item: any) => {
      if (!item.equipped) return;
      const def = item.definition;
      
      if (def.filterType === "Armor") {
        if (def.armorTypeId === 4) { // Shield
           hasShield = true;
           ac += def.armorClass; 
        } else {
           hasArmor = true;
           armorAC = def.armorClass; 
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
  allMods.forEach((mod: any) => {
    if (mod.type === "bonus" && mod.subType === "armor-class") {
      ac += mod.value;
    }
  });

  return ac;
}

// --- SPELL SLOTS ---
export interface SpellSlot {
  level: number;
  used: number;
  max: number;
  name?: string; // For "Pact"
}

export function getSpellSlots(character: any): SpellSlot[] {
  const slots: SpellSlot[] = [];

  // 1. Standard Slots
  // FIX: DDB sometimes uses 'available' instead of 'max'
  if (character.spellSlots) {
    character.spellSlots.forEach((slot: any) => {
      const max = slot.max ?? slot.available ?? 0; 
      const used = slot.used ?? 0;
      // Always include slot entries even when max is zero so UI can show 0/0
      if (typeof slot.level !== 'undefined') {
        slots.push({ level: slot.level, used, max });
      }
    });
  }

  // 2. Pact Magic (Warlock)
  // FIX: Ensure we check available here too
  if (character.pactMagic) {
    character.pactMagic.forEach((slot: any) => {
       const max = slot.max ?? slot.available ?? 0; 
       const used = slot.used ?? 0;
       if (typeof slot.level !== 'undefined') {
         slots.push({ level: slot.level, used, max, name: "Pact" });
       }
    });
  }

  return slots.sort((a, b) => a.level - b.level);
}

// --- ACTIONS ---
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

export function getActions(character: any): Action[] {
  const allActions: Action[] = [];
  const totalLevel = character.classes.reduce((acc: number, c: any) => acc + c.level, 0);
  const profBonus = Math.ceil(1 + (totalLevel / 4));

  const strMod = getModifier(getStatValue(character, 1));
  const dexMod = getModifier(getStatValue(character, 2));
  const isMonk = character.classes.some((c: any) => c.definition.name === "Monk");

  const processList = (list: any[], sourceName: string) => {
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

      allActions.push({
        id: item.id || item.name,
        name: item.name,
        description: item.snippet || item.description || "",
        type,
        source: sourceName,
        hitOrDc: limit,
        damage: "",
        range: item.range && item.range.rangeValue ? `${item.range.rangeValue}ft` : "",
        attackType: sourceName 
      });
    });
  };

  if (character.actions) {
    processList(character.actions.race, "Race Feature");
    processList(character.actions.class, "Class Feature");
    processList(character.actions.feat, "Feat");
    processList(character.actions.item, "Item"); 
  }
  if (character.customActions) processList(character.customActions, "Custom");

  if (character.inventory) {
    character.inventory.forEach((item: any) => {
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
        const isRanged = def.attackType === 2 || (def.range && def.range > 5);
        const isMonkWeapon = isMonk && (def.isMonkWeapon || isStaff || def.categoryId === 1); 

        if (isRanged || (isFinesse && dexMod > strMod) || (isMonkWeapon && dexMod > strMod)) {
          modToUse = dexMod;
        }

        // FIX: Use Override OR Magic
        const itemBonus = Number(def.attackBonus) || Number(def.magic) || 0;
        
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

        const range = def.range ? `${def.range}ft` : (def.range?.rangeValue ? `${def.range.rangeValue}ft` : "5ft");
        
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
export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  description: string;
  source: string;
  hitOrDc: string;
  damage: string;
  attackType: string;
  // NEW: Pre-calculated summon stats
  summonStats?: SummonStats | null; 
}

const PREPARED_CASTERS = ["Cleric", "Druid", "Wizard", "Paladin", "Artificer"];

export function getSpells(character: any): Spell[] {
  const spells: Spell[] = [];

  const processSpells = (list: any[], source: string) => {
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

      // OPTIMIZATION: Parse Summons ONCE here
      const summonData = parseSummonStats(def.description || "");

      spells.push({
        name: def.name,
        level: def.level,
        school: def.school || "Magic",
        castingTime: `${def.activation?.activationTime || 1} ${def.activation?.activationType === 1 ? 'Act' : 'Bns'}`,
        range: range,
        components: def.components?.join(", ") || "",
        description: def.description || "",
        source: safeSource,
        hitOrDc: hit,
        damage: dmg,
        attackType: attackType,
        summonStats: summonData
      });
    });
  };

  if (character.classSpells) {
    character.classSpells.forEach((cls: any) => {
      const className = cls.name || cls.definition?.name || "Class";
      processSpells(cls.spells, className);
    });
  }
  if (character.spells) {
    processSpells(character.spells.race, "Race");
    processSpells(character.spells.feat, "Feat");
    processSpells(character.spells.item, "Item");
  }

  return spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  type: "Consumable" | "Gear";
  tags: string[];
}

export function getInventory(character: any): InventoryItem[] {
  if (!character.inventory) return [];
  return character.inventory.map((item: any) => {
    const def = item.definition;
    const type = (def.filterType === "Potion" || def.filterType === "Scroll" || def.isConsumable) 
      ? "Consumable" 
      : "Gear";
    return {
      id: item.id,
      name: def.name,
      quantity: item.quantity,
      description: def.description,
      type: type,
      tags: [def.filterType, def.subType].filter(Boolean)
    };
  }).sort((a: any, b: any) => a.name.localeCompare(b.name));
}
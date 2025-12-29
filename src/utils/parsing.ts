import type { DDBCharacter } from '../types/dnd-beyond';
import type { SummonStats } from '../types/character';
import { ABILITY_MAP, getProficiencyBonus, getStatValue, getModifier } from './modifiers';

export function resolveDDBTags(text: string, character: DDBCharacter, contextName?: string, className?: string): string {
    if (!text || !character) return text || "";

    const totalLevel = character.classes.reduce((acc, c) => acc + (c.level || 0), 0);
    const profBonus = getProficiencyBonus(character);

    return text.replace(/{{(.*?)}}/g, (match, expression) => {
        const isSigned = expression.includes('#signed');
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

        // Replace ability mods: e.g. {{abilitymod:str}} or {{modifier:str}}
        const modMatch = cleanExpr.match(/\b(?:abilitymod|modifier):(\w+)\b/);
        if (modMatch) {
            const ab = modMatch[1];
            const statId = Object.keys(ABILITY_MAP).find(k => ABILITY_MAP[Number(k)].toLowerCase() === ab.toLowerCase());
            if (statId) {
                const score = getStatValue(character, Number(statId));
                const val = getModifier(score);
                return isSigned && val >= 0 ? `+${val}` : val.toString();
            }
        }

        // Replace savedc: e.g. {{savedc:wis}}
        const dcMatch = cleanExpr.match(/\bsavedc:(\w+)\b/);
        if (dcMatch) {
            const ab = dcMatch[1];
            const statId = Object.keys(ABILITY_MAP).find(k => ABILITY_MAP[Number(k)].toLowerCase() === ab.toLowerCase());
            if (statId) {
                const score = getStatValue(character, Number(statId));
                const val = 8 + profBonus + getModifier(score);
                return val.toString();
            }
        }

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
            if (!isNaN(Number(cleanExpr))) {
                const num = Number(cleanExpr);
                return isSigned && num >= 0 ? `+${num}` : num.toString();
            }

            // Only allow basic math characters
            if (/^[0-9+\-*/().\s]+$/.test(cleanExpr)) {
                // Safe evaluation of simple math
                // eslint-disable-next-line no-new-func
                const result = new Function(`return ${cleanExpr}`)();
                const numResult = Number(result);
                return isSigned && numResult >= 0 ? `+${numResult}` : numResult.toString();
            }
        } catch (e) {
            return match;
        }

        return match;
    });
}

export function parseSummonStats(description: string): SummonStats | null {
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

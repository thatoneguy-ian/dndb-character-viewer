import { useState } from 'react';
import type { DDBCharacter } from '../../types/dnd-beyond';
import ConditionIcon from '../conditions';

interface ConditionDef {
    key: string;
    emoji: string;
    label: string;
    description: string;
}

const CONDITIONS: ConditionDef[] = [
    { key: 'Blinded', emoji: '👁️', label: 'Blinded', description: `Blinded: While you have the Blinded condition, you experience the following effects.\n* Can't See. You can't see and automatically fail any ability check that requires sight.\n* Attacks Affected. Attack rolls against you have Advantage, and your attack rolls have Disadvantage.` },
    { key: 'Charmed', emoji: '💘', label: 'Charmed', description: 'Charmed: You can\'t attack the charmer and the charmer has advantage on social checks.' },
    { key: 'Deafened', emoji: '🦻', label: 'Deafened', description: 'Deafened: You can\'t hear and automatically fail any ability check that requires hearing.' },
    { key: 'Frightened', emoji: '😱', label: 'Frightened', description: 'Frightened: You have disadvantage on ability checks and attack rolls while the source of your fear is within line of sight.' },
    { key: 'Grappled', emoji: '🤼', label: 'Grappled', description: 'Grappled: Your speed is 0 and you can\'t benefit from any bonus to your speed.' },
    { key: 'Incapacitated', emoji: '🚫', label: 'Incapacitated', description: 'Incapacitated: You can\'t take actions or reactions.' },
    { key: 'Invisible', emoji: '🫥', label: 'Invisible', description: 'Invisible: You are unseen. Attack rolls against you have disadvantage; your attack rolls have advantage when you attack from invisibility.' },
    { key: 'Paralyzed', emoji: '🧍‍♂️', label: 'Paralyzed', description: 'Paralyzed: You are incapacitated and can\'t move or speak. Attack rolls against you have advantage and any hit that deals bludgeoning damage is a critical hit.' },
    { key: 'Petrified', emoji: '🪨', label: 'Petrified', description: 'Petrified: You are transformed into a solid inanimate substance and are incapacitated.' },
    { key: 'Poisoned', emoji: '☠️', label: 'Poisoned', description: 'Poisoned: You have disadvantage on attack rolls and ability checks.' },
    { key: 'Prone', emoji: '🧎', label: 'Prone', description: 'Prone: You are on the ground. You have disadvantage on attack rolls, and attackers within 5 ft have advantage.' },
    { key: 'Restrained', emoji: '🔗', label: 'Restrained', description: 'Restrained: Your speed is 0 and you have disadvantage on Dexterity saving throws.' },
    { key: 'Stunned', emoji: '💫', label: 'Stunned', description: 'Stunned: You are incapacitated, can\'t move, and can\'t speak.' },
    { key: 'Unconscious', emoji: '🛌', label: 'Unconscious', description: 'Unconscious: You are incapacitated, can\'t move or speak, and are unaware of your surroundings.' }
];

const CONDITION_ID_MAP: Record<number, string> = {
    1: 'Blinded', 2: 'Charmed', 3: 'Deafened', 5: 'Frightened', 6: 'Grappled',
    7: 'Incapacitated', 8: 'Invisible', 9: 'Paralyzed', 10: 'Petrified', 11: 'Poisoned',
    12: 'Prone', 13: 'Restrained', 14: 'Stunned', 15: 'Unconscious'
};

export function ConditionsRow({ character }: { character: DDBCharacter | null }) {
    const [open, setOpen] = useState<ConditionDef | null>(null);

    const getActiveConditions = () => {
        if (!character) return [] as string[];
        const candidates: string[] = [];

        const pushFromEntry = (c: any) => {
            if (c == null) return;
            if (typeof c === 'string') { candidates.push(c); return; }
            if (typeof c === 'number') { const mapped = CONDITION_ID_MAP[c]; if (mapped) candidates.push(mapped); return; }
            if (c?.name) { candidates.push(c.name); return; }
            if (c?.id != null) {
                const idNum = Number(c.id);
                if (!Number.isNaN(idNum) && CONDITION_ID_MAP[idNum]) candidates.push(CONDITION_ID_MAP[idNum]);
            }
        };

        if (Array.isArray(character.conditions)) character.conditions.forEach(pushFromEntry);
        if (Array.isArray(character.appliedConditions)) character.appliedConditions.forEach(pushFromEntry);
        if (Array.isArray(character.statusEffects)) character.statusEffects.forEach(pushFromEntry);

        return Array.from(new Set(candidates.map(s => String(s).trim()).filter(Boolean)));
    };

    const active = getActiveConditions();
    const activeDefs = CONDITIONS.filter(cd => active.some(a => a.toLowerCase() === cd.key.toLowerCase()));

    if (activeDefs.length === 0) return null;

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Conditions</div>
                <span className="bg-red-600 text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-lg shadow-red-900/20">
                    {activeDefs.length}
                </span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                {activeDefs.map((c) => (
                    <button
                        key={c.key}
                        onClick={(e) => { e.stopPropagation(); setOpen(c); }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 transform hover:scale-110 shadow-md"
                        title={c.label}
                    >
                        <ConditionIcon name={c.key} className="w-6 h-6 text-white" />
                    </button>
                ))}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(null)} />
                    <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm text-sm text-gray-200 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700">
                                    <ConditionIcon name={open.key} className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="font-black text-white text-xl uppercase tracking-tight">{open.label}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Condition</div>
                                </div>
                            </div>
                            <button onClick={() => setOpen(null)} className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="whitespace-pre-line text-xs text-gray-300 leading-relaxed bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 mb-4">
                            {open.description}
                        </div>
                        <div className="text-[10px] text-gray-500 italic flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-800"></div>
                            <span>Rules Summary</span>
                            <div className="h-px flex-1 bg-gray-800"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

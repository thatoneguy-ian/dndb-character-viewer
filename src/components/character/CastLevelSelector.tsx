import React from 'react';
import type { SpellSlot } from '../../types/character';

interface CastLevelSelectorProps {
    minLevel: number;
    availableSlots: SpellSlot[];
    selectedLevel: number;
    onSelect: (level: number) => void;
}

export const CastLevelSelector: React.FC<CastLevelSelectorProps> = ({
    minLevel,
    availableSlots,
    selectedLevel,
    onSelect
}) => {
    // Filter slots that are equal to or higher than the spell's base level
    // and only show up to 9th level.
    const validSlots = availableSlots.filter(s => s.level >= minLevel && s.level <= 9);

    if (validSlots.length <= 1) return null; // No upcasting options

    return (
        <div className="flex flex-col gap-2 mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                Cast at Level:
            </span>
            <div className="flex flex-wrap gap-2">
                {validSlots.map((slot) => {
                    const isSelected = selectedLevel === slot.level;
                    const isAvailable = (slot.available ?? 0) > 0;

                    return (
                        <button
                            key={slot.level}
                            disabled={!isAvailable && !isSelected}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(slot.level);
                            }}
                            className={`
                                flex flex-col items-center justify-center rounded-lg border px-2 py-1 min-w-[3.5rem] transition-all
                                ${isSelected
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105'
                                    : (isAvailable
                                        ? 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-blue-500/50'
                                        : 'bg-gray-800/30 border-gray-800 text-gray-600 cursor-not-allowed opacity-50')}
                            `}
                        >
                            <span className="text-xs font-black">{slot.level}</span>
                            <span className="text-[7px] uppercase font-bold opacity-60">
                                {isAvailable ? `${slot.available} Left` : 'Empty'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

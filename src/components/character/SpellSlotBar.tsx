import React from 'react';
import { getSpellSlots } from '../../dnd-utils';
import { useAppContext } from '../../context/AppContext';

export const SpellSlotBar: React.FC = () => {
    const { character } = useAppContext();
    if (!character) return null;
    const spellSlots = getSpellSlots(character);
    const visible = spellSlots.filter(s => !(s.max === 0 && (s.used ?? 0) === 0));

    if (visible.length === 0) {
        return (
            <div className="mb-4 px-3 py-2 text-[10px] text-gray-500 italic text-center bg-gray-800/30 rounded-lg border border-gray-800">
                No spell slots available.
            </div>
        );
    }

    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return `${n}th`;
        switch (n % 10) {
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}th`;
        }
    };

    return (
        <div className="mb-4 p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center gap-3 overflow-x-auto no-scrollbar">
            {visible.map((slot, idx) => {
                const remaining = (slot.available ?? ((slot.max ?? 0) - (slot.used ?? 0)));
                const percentage = slot.max > 0 ? (remaining / slot.max) * 100 : 0;

                return (
                    <div key={idx} className="flex flex-col gap-1 min-w-[50px]">
                        <div className="flex justify-between items-center px-1">
                            <span className="font-black text-blue-400 text-[9px] uppercase tracking-tighter">
                                {slot.name || getOrdinal(slot.level)}
                            </span>
                            <span className="text-white font-mono text-[9px] font-bold">
                                {remaining}/{slot.max}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700/50">
                            <div
                                className={`h-full transition-all duration-500 ${percentage > 50 ? 'bg-blue-500' : (percentage > 20 ? 'bg-yellow-500' : 'bg-red-500')}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

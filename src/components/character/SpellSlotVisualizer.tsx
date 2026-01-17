import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const SpellSlotVisualizer: React.FC = () => {
    const { spellSlots } = useAppContext();

    if (!spellSlots || spellSlots.length === 0) return null;

    // Filter for levels that actually have slots (exclude level 0 cantrips if they exist in this list)
    const activeLevels = spellSlots.filter(s => s.level > 0 && s.max > 0);

    if (activeLevels.length === 0) return null;

    return (
        <div className="space-y-3 px-1 mb-6 border-b border-[var(--border-color)] pb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-70 mb-1">
                Spell Slot Fuel Gauges
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
                {activeLevels.map((slot) => {
                    const available = slot.available ?? (slot.max - slot.used);
                    return (
                        <div key={slot.level} className="flex items-center gap-3">
                            <div className="w-8 text-[9px] font-black text-[var(--text-secondary)] shrink-0">
                                LVL {slot.level}
                            </div>
                            <div className="flex-1 flex gap-1">
                                {Array.from({ length: slot.max }).map((_, i) => {
                                    const isAvailable = i < available;
                                    return (
                                        <div
                                            key={i}
                                            className={`h-2.5 flex-1 rounded-sm border transition-all duration-300 ${isAvailable
                                                    ? 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                                                    : 'bg-gray-800/20 border-gray-700/30'
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="w-8 text-[9px] font-bold text-right text-[var(--text-muted)] shrink-0 opacity-60">
                                {available}/{slot.max}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

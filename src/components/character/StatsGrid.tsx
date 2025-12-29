import React from 'react';
import { ABILITY_MAP, getAbilityScore, getModString } from '../../dnd-utils';
import { useAppContext } from '../../context/AppContext';

export const StatsGrid: React.FC = () => {
    const { character } = useAppContext();
    if (!character) return null;
    return (
        <div className="grid grid-cols-6 gap-1.5 text-center mb-4">
            {[1, 2, 3, 4, 5, 6].map((id) => (
                <div
                    key={id}
                    className="bg-[var(--bg-input)] backdrop-blur-sm border border-[var(--border-color)] p-1.5 rounded-lg shadow-sm transition-all duration-300"
                >
                    <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter">
                        {ABILITY_MAP[id]}
                    </div>
                    <div className="text-sm font-black text-[var(--text-primary)]">
                        {getModString(getAbilityScore(character, id))}
                    </div>
                </div>
            ))}
        </div>
    );
};

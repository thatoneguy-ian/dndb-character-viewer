import React from 'react';
import type { DDBCharacter } from '../../types/dnd-beyond';
import { ABILITY_MAP, getAbilityScore, getModString } from '../../dnd-utils';

interface StatsGridProps {
    character: DDBCharacter;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ character }) => {
    return (
        <div className="grid grid-cols-6 gap-1.5 text-center mb-4">
            {[1, 2, 3, 4, 5, 6].map((id) => (
                <div
                    key={id}
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1.5 rounded-lg shadow-inner"
                >
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                        {ABILITY_MAP[id]}
                    </div>
                    <div className="text-sm font-black text-white">
                        {getModString(getAbilityScore(character, id))}
                    </div>
                </div>
            ))}
        </div>
    );
};

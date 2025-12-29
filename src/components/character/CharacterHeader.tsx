import React from 'react';
import { calculateHP, calculateAC, getInitiative, getPassiveStats } from '../../dnd-utils';
import { Badge } from '../common';

import { useAppContext } from '../../context/AppContext';

export const CharacterHeader: React.FC = () => {
    const { character } = useAppContext();
    if (!character) return null;

    const hp = calculateHP(character);
    const ac = calculateAC(character);
    const initiative = getInitiative(character);
    const passive = getPassiveStats(character);
    const avatarUrl = character.decorations?.avatarUrl || "https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.png";

    return (
        <div className="flex flex-col gap-4 p-4 rounded-xl mb-4 border transition-all duration-300 shadow-xl
            bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 
            border-gray-700/30">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img
                        src={avatarUrl}
                        className="w-16 h-16 rounded-full border-2 border-red-500/50 bg-gray-800 p-0.5 object-cover shadow-lg shadow-red-900/20"
                        alt={character.name}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gray-900 px-1.5 py-0.5 rounded-full border border-gray-700 text-[10px] font-black text-white shadow-md">
                        Lvl {character.classes.reduce((sum, cls) => sum + cls.level, 0)}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-white leading-tight truncate mb-1">
                        {character.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-green-400">
                                {hp.current} <span className="text-gray-500 font-normal">/</span> {hp.max}
                                {hp.temp > 0 && <span className="ml-1 text-blue-400"> (+{hp.temp})</span>}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">HP</span>
                        </div>

                        <div className="h-4 w-px bg-gray-700"></div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-white">AC {ac}</span>
                            <Badge color="blue" className="text-[8px] uppercase tracking-tighter py-0">Armor</Badge>
                        </div>

                        <div className="h-4 w-px bg-gray-700"></div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-red-500">{initiative}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Init</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-700/50 pt-3">
                <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black text-white">{passive.perception}</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Passive Perc</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black text-white">{passive.insight}</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Passive Ins</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black text-white">{passive.investigation}</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Passive Inv</span>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import type { Spell } from '../../types/character';
import { Card, Badge } from '../common';
import { SCHOOL_ICON_MAP, ConcentrationIcon } from '../spell-icons';

interface SpellItemProps {
    spell: Spell;
    isOpen: boolean;
    onClick: () => void;
}

export const SpellItem: React.FC<SpellItemProps> = ({ spell, isOpen, onClick }) => {
    const IconComp = SCHOOL_ICON_MAP[spell.school] as any;
    const isConcentration = spell.components.toLowerCase().includes('concentration');

    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-blue-500/50 bg-gray-800/80' : 'bg-gray-800/40 hover:bg-gray-800/60'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {IconComp && <IconComp className="w-4 h-4 text-blue-400 shrink-0" />}
                        <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">
                            {spell.name}
                        </h4>
                        {isConcentration && <ConcentrationIcon className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {spell.castingTime}
                        </span>
                        <span className="text-gray-700">•</span>
                        <span className="text-[10px] text-gray-400 font-medium">{spell.range}</span>
                    </div>
                </div>

                <div className="text-right">
                    {spell.damage && <Badge color="red" className="px-1.5">{spell.damage}</Badge>}
                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-1">{spell.school}</div>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-gray-700/50 text-xs text-gray-300 leading-relaxed bg-black/20 p-3 rounded-xl">
                    {spell.summonStats ? (
                        <div className="mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 shadow-inner">
                            <div className="font-black text-white text-[10px] uppercase tracking-widest mb-2 flex justify-between">
                                <span>{spell.summonStats.name}</span>
                                <span className="text-gray-500">Summoned Entity</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-gray-800/80 p-1.5 rounded text-center">
                                    <div className="text-[8px] text-gray-500 font-bold uppercase">AC</div>
                                    <div className="text-xs font-black text-white">{spell.summonStats.ac}</div>
                                </div>
                                <div className="bg-gray-800/80 p-1.5 rounded text-center">
                                    <div className="text-[8px] text-gray-500 font-bold uppercase">HP</div>
                                    <div className="text-xs font-black text-white">{spell.summonStats.hp}</div>
                                </div>
                                <div className="bg-gray-800/80 p-1.5 rounded text-center">
                                    <div className="text-[8px] text-gray-500 font-bold uppercase">Spd</div>
                                    <div className="text-xs font-black text-white">{spell.summonStats.speed}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 gap-1 text-[8px] text-center uppercase font-bold text-gray-500">
                                <div>STR<br /><span className="text-white">{spell.summonStats.str}</span></div>
                                <div>DEX<br /><span className="text-white">{spell.summonStats.dex}</span></div>
                                <div>CON<br /><span className="text-white">{spell.summonStats.con}</span></div>
                                <div>INT<br /><span className="text-white">{spell.summonStats.int}</span></div>
                                <div>WIS<br /><span className="text-white">{spell.summonStats.wis}</span></div>
                                <div>CHA<br /><span className="text-white">{spell.summonStats.cha}</span></div>
                            </div>
                        </div>
                    ) : null}

                    <div className="font-black text-white text-[10px] uppercase tracking-widest mb-1 italic opacity-50">Combined Description</div>
                    <div className="space-y-2" dangerouslySetInnerHTML={{ __html: spell.description }} />

                    {spell.tags && spell.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                            {spell.tags.map((t, i) => (
                                <Badge key={i} className="bg-gray-800/50 border-gray-700/50 text-gray-500">{t}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

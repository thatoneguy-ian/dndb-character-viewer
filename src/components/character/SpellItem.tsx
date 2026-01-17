import React, { useState } from 'react';
import { MarkdownDescription } from './MarkdownDescription';
import type { Spell } from '../../types/character';
import { Card, Badge } from '../common';
import { SCHOOL_ICON_MAP } from '../spell-icons';

import { useAppContext } from '../../context/AppContext';
import { CastLevelSelector } from './CastLevelSelector';
import { Activity, AlertTriangle } from 'lucide-react';

interface SpellItemProps {
    spell: Spell;
    isOpen: boolean;
    onClick: () => void;
}

export const SpellItem: React.FC<SpellItemProps> = ({ spell, isOpen, onClick }) => {
    const { rollDice: onRoll, spellSlots, concentratingOn, setConcentratingOn, consumeSpellSlot, usedIds, toggleUsed, hasAttackDisadvantage } = useAppContext();
    const [castLevel, setCastLevel] = useState(spell.level);

    const IconComp = SCHOOL_ICON_MAP[spell.school as keyof typeof SCHOOL_ICON_MAP];
    const isConcentration = spell.components.toLowerCase().includes('concentration');
    const isActiveConcentration = concentratingOn === spell.name;

    const levelSlots = spellSlots.find(s => s.level === spell.level);
    const isLowResource = spell.level > 0 && levelSlots && levelSlots.available === 0;

    const spellId = `spell-${spell.name}`;
    const isUsed = usedIds.has(spellId);

    const handleConcentrate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActiveConcentration) {
            setConcentratingOn(null);
        } else {
            setConcentratingOn(spell.name);
        }
    };

    const handleRollDamage = (e: React.MouseEvent) => {
        e.stopPropagation();
        let notation = spell.damage;

        // Simple upcasting math: if casting at higher level, try to scale
        if (castLevel > spell.level && notation.match(/^\d+d\d+/)) {
            const parts = notation.match(/^(\d+)d(\d+)(.*)/);
            if (parts) {
                const baseCount = parseInt(parts[1]);
                const dieSize = parts[2];
                const rest = parts[3];
                const newCount = baseCount + (castLevel - spell.level);
                notation = `${newCount}d${dieSize}${rest}`;
            }
        }

        if (!isUsed) toggleUsed(spellId);
    };

    // US-801: Scent Color Calculation
    const getScentColor = () => {
        if (spell.damage || spell.damageType) return '#EF4444'; // Red (Damage)
        const desc = spell.description.toLowerCase();
        if (desc.includes('heal') || desc.includes('restore') || desc.includes('hit points')) return '#10B981'; // Green (Healing)
        return '#3B82F6'; // Blue (Spell/Control)
    };
    const scentColor = getScentColor();

    return (
        <Card
            className={`mb-2 p-3 transition-all border-l-4 ${isOpen ? 'ring-2 ring-[var(--color-action)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'} ${isLowResource || isUsed ? 'opacity-40 grayscale-[0.5]' : ''}`}
            style={{ borderLeftColor: scentColor }}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {IconComp && <IconComp className="w-4 h-4 text-[#2F80ED] dark:text-blue-400 shrink-0" />}
                        <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isActiveConcentration ? 'text-blue-400' : 'text-[var(--text-primary)]'}`}>
                            {spell.name} {isUsed && (
                                <span
                                    className="text-[9px] text-green-500 font-black ml-1 uppercase cursor-pointer hover:underline"
                                    onClick={(e) => { e.stopPropagation(); toggleUsed(spellId); }}
                                >
                                    Spent
                                </span>
                            )}
                            {spell.hitBonus && hasAttackDisadvantage && (
                                <span className="text-[9px] font-black bg-orange-500/20 text-orange-500 px-1 rounded border border-orange-500/30 animate-pulse ml-1">DISADV</span>
                            )}
                        </h4>
                        {spell.components.toLowerCase().includes('ritual') && (
                            <Badge className="bg-[var(--color-ritual)]/10 text-[var(--color-ritual)] border-[var(--color-ritual)]/30 text-[9px] font-black py-0 px-1">RITUAL</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActiveConcentration ? 'text-blue-400/80' : 'text-[var(--text-secondary)]'}`}>
                            {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                        </span>
                        <span className="text-[var(--text-muted)] opacity-50">•</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                            {spell.castingType === 'Action' && <span className="text-red-500 mr-1">🔴</span>}
                            {spell.castingType === 'Bonus' && <span className="text-green-500 mr-1">🟢</span>}
                            {spell.castingType === 'Reaction' && <span className="text-yellow-500 mr-1">🟡</span>}
                            {spell.castingTime}
                        </span>
                        <span className="text-[var(--text-secondary)] opacity-50">•</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                            {spell.range}
                            {spell.duration && <span className="mx-1 opacity-40">|</span>}
                            {spell.duration}
                            {spell.target && <span className="mx-1 opacity-40">|</span>}
                            {spell.target}
                        </span>
                        {spell.level > 0 && levelSlots && typeof levelSlots.available === 'number' && (
                            <Badge
                                className={`ml-1 py-0 px-1 text-[9px] font-black border-none cursor-pointer hover:scale-110 active:scale-95 transition-all ${levelSlots.available > 0 ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (levelSlots && levelSlots.available && levelSlots.available > 0) {
                                        consumeSpellSlot(spell.level);
                                    }
                                }}
                            >
                                {levelSlots.available} Left
                            </Badge>
                        )}
                    </div>
                    {!isOpen && spell.description && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-1 italic">
                            {spell.description.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '').slice(0, 100)}...
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isConcentration && (
                        <div
                            onClick={handleConcentrate}
                            className={`flex flex-col items-center justify-center rounded-md px-2 h-9 min-w-[3rem] cursor-pointer transition-all border
                                ${isActiveConcentration
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                    : 'bg-blue-900/10 border-blue-500/20 text-blue-400/60 hover:border-blue-500/50'}`}
                        >
                            <Activity className={`w-3 h-3 ${isActiveConcentration ? 'animate-pulse' : ''}`} />
                            <span className="text-[6px] font-black uppercase mt-0.5">Conc</span>
                        </div>
                    )}

                    {spell.hitBonus && (
                        <div
                            className="bg-blue-900/10 border-blue-500/30 text-blue-400 rounded-md px-2 h-9 min-w-[3.5rem] flex flex-col items-center justify-center leading-none transition-all cursor-pointer hover:bg-blue-900/20 active:scale-95"
                            onClick={(e) => {
                                e.stopPropagation();
                                const bonus = spell.hitBonus?.replace(/[^0-9+-]/g, '');
                                if (bonus) onRoll(`1d20${bonus.startsWith('+') || bonus.startsWith('-') ? bonus : `+${bonus}`}`, `${spell.name} (To Hit)`, 'attack');
                            }}
                        >
                            <span className="text-[6px] uppercase font-black opacity-60">To Hit</span>
                            <span className="text-[11px] font-black">{spell.hitBonus}</span>
                        </div>
                    )}
                    {spell.saveDC && (
                        <div className="bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-md px-2 h-9 min-w-[3.5rem] flex flex-col items-center justify-center leading-none opacity-80">
                            <span className="text-[6px] uppercase font-black opacity-60">Save DC</span>
                            <span className="text-[11px] font-black">{spell.saveDC}</span>
                        </div>
                    )}
                    <div
                        className="bg-red-900/10 border border-red-500/30 text-red-500 rounded-md px-2 h-9 min-w-[4rem] flex flex-col items-center justify-center leading-none cursor-pointer hover:bg-red-900/20 active:scale-95 transition-all shadow-sm shadow-red-500/5"
                        onClick={handleRollDamage}
                    >
                        <span className="text-[6px] uppercase font-black opacity-80 decoration-transparent">
                            {spell.damageType || 'Damage'}
                        </span>
                        <span className="text-[10px] font-black">
                            {spell.damage.includes('d') && castLevel > spell.level
                                ? `${parseInt(spell.damage) + (castLevel - spell.level)}d${spell.damage.split('d')[1].split(' ')[0]}`
                                : spell.damage.split(' ')[0]}
                        </span>
                    </div>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-[var(--border-color)]">
                    {isConcentration && concentratingOn && !isActiveConcentration && (
                        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-amber-500 leading-none">Concentration Alert</span>
                                <p className="text-[10px] text-amber-200/80 mt-1 leading-tight">
                                    Casting this will break concentration on <span className="font-bold text-amber-500">{concentratingOn}</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                        {spell.summonStats ? (
                            <div className="mb-4 bg-[var(--bg-card)] dark:bg-gray-900/50 p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                                <div className="font-black text-[10px] uppercase tracking-widest mb-2 flex justify-between text-[var(--text-primary)] dark:text-white">
                                    <span>{spell.summonStats.name}</span>
                                    <span className="text-[var(--text-secondary)]">Summoned Entity</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="bg-[var(--bg-input)] dark:bg-gray-800/80 p-1.5 rounded text-center">
                                        <div className="text-[8px] text-[var(--text-secondary)] dark:text-gray-500 font-bold uppercase">AC</div>
                                        <div className="text-xs font-black text-[var(--text-primary)] dark:text-white">{spell.summonStats.ac}</div>
                                    </div>
                                    <div className="bg-[var(--bg-input)] dark:bg-gray-800/80 p-1.5 rounded text-center">
                                        <div className="text-[8px] text-[var(--text-secondary)] dark:text-gray-500 font-bold uppercase">HP</div>
                                        <div className="text-xs font-black text-[var(--text-primary)] dark:text-white">{spell.summonStats.hp}</div>
                                    </div>
                                    <div className="bg-[var(--bg-input)] dark:bg-gray-800/80 p-1.5 rounded text-center">
                                        <div className="text-[8px] text-[var(--text-secondary)] dark:text-gray-500 font-bold uppercase">Spd</div>
                                        <div className="text-xs font-black text-[var(--text-primary)] dark:text-white">{spell.summonStats.speed}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 gap-1 text-[8px] text-center uppercase font-bold text-[var(--text-secondary)] dark:text-gray-500">
                                    <div>STR<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.str}</span></div>
                                    <div>DEX<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.dex}</span></div>
                                    <div>CON<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.con}</span></div>
                                    <div>INT<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.int}</span></div>
                                    <div>WIS<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.wis}</span></div>
                                    <div>CHA<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.cha}</span></div>
                                </div>
                            </div>
                        ) : null}

                        <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic opacity-50 text-[var(--text-primary)] dark:text-white">Combined Description</div>
                        <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                            <MarkdownDescription content={spell.description} name={spell.name} className={spell.className} />
                        </div>

                        {spell.level > 0 && (
                            <CastLevelSelector
                                minLevel={spell.level}
                                availableSlots={spellSlots}
                                selectedLevel={castLevel}
                                onSelect={setCastLevel}
                            />
                        )}

                        {spell.tags && spell.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-4">
                                {spell.tags.map((t, i) => (
                                    <Badge key={i} className="bg-[var(--bg-input)] dark:bg-gray-800/50 border-[var(--border-color)]/50 text-[var(--text-secondary)]">{t}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

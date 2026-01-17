import React, { useState } from 'react';
import { Badge, Button, Card } from '../common';
import { MarkdownDescription } from './MarkdownDescription';
import { useAppContext } from '../../context/AppContext';
import { CastLevelSelector } from './CastLevelSelector';
import { Activity, AlertTriangle } from 'lucide-react';
import type { CombatCapability } from '../../types/character';

interface CombatActionItemProps {
    action: CombatCapability;
    isOpen: boolean;
    onClick: () => void;
    isUsed?: boolean;
    onToggleUsed?: (id: string) => void;
}

export const CombatActionItem: React.FC<CombatActionItemProps> = ({ action, isOpen, onClick, isUsed, onToggleUsed }) => {
    const { rollDice: onRoll, spellSlots, concentratingOn, setConcentratingOn, consumeSpellSlot, hasAttackDisadvantage } = useAppContext();

    const isSpell = action.type === 'Spell';
    const sourceData = action.originalData as any;
    const spellLevel = isSpell ? (sourceData?.definition?.level ?? 0) : 0;
    const isConcentration = isSpell && sourceData?.definition?.components?.includes(3); // 3 = Concentration in some DDB contexts, but let's check snippet or tags
    const actualIsConcentration = isConcentration || action.description.toLowerCase().includes('concentration');
    const isActiveConcentration = concentratingOn === action.name;

    // Initial cast level state
    const [castLevel, setCastLevel] = useState(spellLevel);

    const levelSlots = spellSlots.find(s => s.level === spellLevel);
    const isLowResource = isSpell && spellLevel > 0 && levelSlots && levelSlots.available === 0;

    // US-801: Scent Color Calculation
    const getScentColor = () => {
        if (action.rollData?.damage || action.rollData?.damageType) return '#EF4444'; // Red (Damage)
        const desc = action.description.toLowerCase();
        if (desc.includes('heal') || desc.includes('restore') || desc.includes('hit points')) return '#10B981'; // Green (Healing)
        if (action.type === 'Spell') return '#3B82F6'; // Blue (Spell/Control)
        return 'transparent';
    };
    const scentColor = getScentColor();

    const handleConcentrate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActiveConcentration) {
            setConcentratingOn(null);
        } else {
            setConcentratingOn(action.name);
        }
    };

    const handleRollHit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const hitBonus = action.rollData?.hitBonus;
        if (hitBonus) {
            const bonus = hitBonus.replace(/[^0-9+-]/g, '');
            onRoll(`1d20${bonus.startsWith('+') || bonus.startsWith('-') ? bonus : `+${bonus}`}`, `${action.name} Attack`, 'attack');
        }
    };

    const handleRollDamage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (action.rollData?.damage) {
            let notation = action.rollData.damage;

            // Upcasting scaling logic
            if (isSpell && castLevel > spellLevel && notation.match(/^\d+d\d+/)) {
                const parts = notation.match(/^(\d+)d(\d+)(.*)/);
                if (parts) {
                    const baseCount = parseInt(parts[1]);
                    const dieSize = parts[2];
                    const rest = parts[3];
                    const newCount = baseCount + (castLevel - spellLevel);
                    notation = `${newCount}d${dieSize}${rest}`;
                }
            }

            const rollNotation = notation.split(' ')[0];
            onRoll(rollNotation, `${action.name} (Lvl ${castLevel}) Damage`, 'damage');
            if (onToggleUsed && !isUsed) onToggleUsed(action.id);
            if (isSpell && spellLevel > 0) consumeSpellSlot(castLevel);
        }
    };


    return (
        <Card
            className={`mb-2 p-3 pb-2 transition-all border-l-4 ${isOpen ? 'ring-2 ring-[var(--color-action)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'} ${isLowResource || isUsed ? 'opacity-40 grayscale-[0.5]' : ''}`}
            style={{ borderLeftColor: scentColor }}
            onClick={onClick}
        >
            {isUsed && (
                <div className="absolute top-2 right-2 text-green-500 text-xs font-black">SPENT</div>
            )}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {onToggleUsed && (
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${isUsed ? 'bg-green-600 border-green-500' : 'border-gray-600 hover:border-gray-400'}`}
                                onClick={(e) => { e.stopPropagation(); onToggleUsed(action.id); }}
                            >
                                {isUsed && <span className="text-[10px] text-white">✓</span>}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isActiveConcentration ? 'text-blue-400' : 'text-[var(--text-primary)]'}`}>
                                    {action.name} {isUsed && (
                                        <span
                                            className="text-[9px] text-green-500 font-black ml-1 uppercase cursor-pointer hover:underline"
                                            onClick={(e) => { e.stopPropagation(); if (onToggleUsed) onToggleUsed(action.id); }}
                                        >
                                            Spent
                                        </span>
                                    )}
                                    {action.rollData?.hitBonus && hasAttackDisadvantage && (
                                        <span className="text-[9px] font-black bg-orange-500/20 text-orange-500 px-1 rounded border border-orange-500/30 animate-pulse ml-1">DISADV</span>
                                    )}
                                </h4>
                                {isSpell && sourceData?.definition?.components?.includes(1) && action.description.toLowerCase().includes('ritual') && (
                                    <Badge className="bg-[var(--color-ritual)]/10 text-[var(--color-ritual)] border-[var(--color-ritual)]/30 text-[9px] font-black py-0 px-1">RITUAL</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isActiveConcentration ? 'text-blue-400/80' : (action.cost === 'Action' ? 'text-red-500' : action.cost === 'Bonus' ? 'text-green-500' : action.cost === 'Reaction' ? 'text-yellow-500' : 'text-[var(--text-secondary)]')}`}>
                                    {action.cost === "Action" ? "🔴 Action" : action.cost === "Bonus" ? "🟢 Bonus" : action.cost === "Reaction" ? "🟡 Reaction" : action.cost}
                                </span>
                                <span className="text-[var(--text-muted)] opacity-50">•</span>
                                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                                    {action.range}
                                    {action.duration && <span className="mx-1 opacity-40">|</span>}
                                    {action.duration}
                                    {action.target && <span className="mx-1 opacity-40">|</span>}
                                    {action.target}
                                </span>
                            </div>
                            {!isOpen && action.description && (
                                <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-1 italic">
                                    {action.description.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '').slice(0, 100)}...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {actualIsConcentration && (
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

                    {action.rollData?.hitBonus && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-blue-900/10 border-blue-500/30 text-blue-400 hover:bg-blue-900/20 active:scale-95 px-2 h-9 min-w-[3.5rem] transition-all"
                            onClick={handleRollHit}
                        >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[9px] uppercase font-black opacity-60">To Hit</span>
                                <span className="text-[12px] font-black">{action.rollData.hitBonus}</span>
                            </div>
                        </Button>
                    )}
                    {action.rollData?.saveDC && (
                        <div className="bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-md px-2 h-9 min-w-[3.5rem] flex flex-col items-center justify-center leading-none opacity-80">
                            <span className="text-[9px] uppercase font-black opacity-60">Save DC</span>
                            <span className="text-[12px] font-black">{action.rollData.saveDC}</span>
                        </div>
                    )}
                    {action.rollData?.damage && (
                        <Button
                            variant="primary"
                            size="sm"
                            className="px-2 h-9 min-w-[4rem] active:scale-95 transition-all shadow-md shadow-red-500/5 hover:shadow-red-500/10"
                            onClick={handleRollDamage}
                        >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[9px] uppercase font-black opacity-80 decoration-transparent">
                                    {action.rollData.damageType || 'Damage'}
                                </span>
                                <span className="text-[11px] font-black">{action.rollData.damage.split(' ')[0]}</span>
                            </div>
                        </Button>
                    )}
                    {action.resource && (
                        <div className="flex flex-col items-center justify-center min-w-[2.5rem]">
                            <span className="text-[8px] uppercase font-black opacity-60 mb-0.5">Uses</span>
                            <div className="flex flex-wrap gap-0.5 justify-center max-w-[40px]">
                                {action.resource.max <= 10 ? (
                                    Array.from({ length: action.resource.max }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full border border-[var(--border-color)]/30 ${i < (action.resource?.current ?? 0) ? 'bg-[var(--color-resource)] shadow-[0_0_3px_var(--color-resource)]' : 'bg-gray-800/50'}`}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-1.5 bg-gray-800/50 rounded-full border border-[var(--border-color)]/30 overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-resource)] transition-all duration-300"
                                                style={{ width: `${((action.resource?.current ?? 0) / (action.resource?.max ?? 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black mt-0.5">{action.resource.current}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`} >
                <div className="pt-3 border-t border-[var(--border-color)] space-y-4">
                    {actualIsConcentration && concentratingOn && !isActiveConcentration && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-amber-500 leading-none">Concentration Alert</span>
                                <p className="text-[10px] text-amber-200/80 mt-1 leading-tight">
                                    Activating this will break concentration on <span className="font-bold text-amber-500">{concentratingOn}</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-[var(--bg-app)]/40 p-3 rounded-lg space-y-2">
                        <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic text-[var(--text-secondary)]">Description</div>
                        <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner overflow-hidden">
                            <MarkdownDescription content={action.description} name={action.name} />
                        </div>

                        {isSpell && spellLevel > 0 && (
                            <CastLevelSelector
                                minLevel={spellLevel}
                                availableSlots={spellSlots}
                                selectedLevel={castLevel}
                                onSelect={setCastLevel}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

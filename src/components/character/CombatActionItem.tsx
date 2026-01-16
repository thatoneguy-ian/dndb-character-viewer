import React from 'react';
import { Card, Badge, Button } from '../common';
import { MarkdownDescription } from './MarkdownDescription';
import { useAppContext } from '../../context/AppContext';
import type { CombatCapability } from '../../types/character';

interface CombatActionItemProps {
    action: CombatCapability;
    isOpen: boolean;
    onClick: () => void;
}

export const CombatActionItem: React.FC<CombatActionItemProps> = ({ action, isOpen, onClick }) => {
    const { rollDice: onRoll } = useAppContext();

    const handleRollHit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const hitOrDc = action.rollData?.hitOrDc;
        if (hitOrDc) {
            const bonus = hitOrDc.replace(/[^0-9+-]/g, '');
            onRoll(`1d20${bonus.startsWith('+') || bonus.startsWith('-') ? bonus : `+${bonus}`}`, `${action.name} Attack`);
        }
    };

    const handleRollDamage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (action.rollData?.damage) {
            const notation = action.rollData.damage.split(' ')[0];
            onRoll(notation, `${action.name} Damage`);
        }
    };

    const costColors = {
        Action: 'text-red-500',
        Bonus: 'text-green-500',
        Reaction: 'text-blue-500',
        Other: 'text-gray-500'
    };

    const typeIcons = {
        Spell: '✨',
        Action: '⚔️',
        Item: '🎒',
        Consumable: '🧪'
    };

    return (
        <Card
            className={`mb-2 p-3 pb-2 transition-all ${isOpen ? 'ring-2 ring-[var(--color-action)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs">{typeIcons[action.type]}</span>
                        <h4 className="text-sm font-black uppercase tracking-tight truncate text-[var(--text-primary)]">
                            {action.name}
                        </h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${costColors[action.cost]}`}>
                            {action.cost}
                        </span>
                        <span className="text-[var(--text-secondary)] opacity-30">•</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest truncate max-w-[120px]">
                            {action.source}
                        </span>
                        {action.range && <Badge className="py-0 text-[8px] bg-transparent border-gray-700/50">{action.range}</Badge>}
                    </div>
                </div>

                <div className="flex gap-1">
                    {action.rollData?.hitOrDc && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-blue-900/10 border-blue-500/30 text-blue-400 hover:bg-blue-900/20 px-2 h-9 min-w-[3.5rem]"
                            onClick={handleRollHit}
                        >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[7px] uppercase font-black opacity-60">To Hit</span>
                                <span className="text-xs font-black">{action.rollData.hitOrDc}</span>
                            </div>
                        </Button>
                    )}
                    {action.rollData?.damage && (
                        <Button
                            variant="primary"
                            size="sm"
                            className="px-2 h-9 min-w-[4rem]"
                            onClick={handleRollDamage}
                        >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[7px] uppercase font-black opacity-80">Damage</span>
                                <span className="text-[10px] font-black">{action.rollData.damage.split(' ')[0]}</span>
                            </div>
                        </Button>
                    )}
                    {action.resource && (
                        <div className="h-9 min-w-[2.5rem] flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700/50 rounded-lg">
                            <span className="text-[7px] uppercase font-black opacity-60">Uses</span>
                            <span className="text-xs font-black text-gray-300">{action.resource.current}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-[var(--border-color)] space-y-2 bg-[var(--bg-app)]/40 p-3 rounded-b-lg">
                    <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic text-[var(--text-secondary)]">Description</div>
                    <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner overflow-hidden">
                        <MarkdownDescription content={action.description} name={action.name} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

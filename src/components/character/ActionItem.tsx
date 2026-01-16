import React from 'react';
import { MarkdownDescription } from './MarkdownDescription';
import type { Action } from '../../types/character';
import { Card } from '../common';
import { useAppContext } from '../../context/AppContext';

interface ActionItemProps {
    action: Action;
    isOpen: boolean;
    onClick: () => void;
}

export const ActionItem: React.FC<ActionItemProps> = ({ action, isOpen, onClick }) => {
    const { rollDice: onRoll, toggleUsed, usedIds } = useAppContext();
    const actionId = `action-${action.id}`;
    const isUsed = usedIds.has(actionId);
    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-[var(--color-action)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'} ${isUsed ? 'opacity-40 grayscale-[0.5]' : ''}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight truncate">
                        {action.name} {isUsed && (
                            <span
                                className="text-[9px] text-green-500 font-black ml-1 uppercase cursor-pointer hover:underline"
                                onClick={(e) => { e.stopPropagation(); toggleUsed(actionId); }}
                            >
                                Spent
                            </span>
                        )}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${action.type === 'Action' ? 'text-[var(--color-danger)]' : action.type === 'Bonus' ? 'text-[var(--color-success)]' : action.type === 'Reaction' ? 'text-[var(--color-warning)]' : 'text-[var(--text-secondary)]'}`}>
                            {action.type === 'Action' && <span className="mr-1">🔴</span>}
                            {action.type === 'Bonus' && <span className="mr-1">🟢</span>}
                            {action.type === 'Reaction' && <span className="mr-1">🟡</span>}
                            {action.type}
                        </span>
                        <span className="text-[var(--text-muted)] opacity-30">•</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest truncate max-w-[120px]">
                            {action.source}
                        </span>
                    </div>
                    {!isOpen && action.description && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-1 italic">
                            {action.description.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '').slice(0, 100)}...
                        </p>
                    )}
                </div>

                <div className="flex gap-1 self-center">
                    {action.hitOrDc && (
                        <div
                            className="bg-blue-900/10 border border-blue-500/30 text-blue-400 rounded-md px-2 h-9 min-w-[3.5rem] flex flex-col items-center justify-center leading-none cursor-pointer hover:bg-blue-900/20 active:scale-95 transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                const bonus = action.hitOrDc?.replace(/[^0-9+-]/g, '');
                                if (bonus) onRoll(`1d20${bonus.startsWith('+') || bonus.startsWith('-') ? bonus : `+${bonus}`}`, `${action.name} Attack`);
                            }}
                        >
                            <span className="text-[6px] uppercase font-black opacity-60">To Hit</span>
                            <span className="text-[11px] font-black">{action.hitOrDc}</span>
                        </div>
                    )}
                    {action.damage && (
                        <div
                            className="bg-red-900/10 border border-red-500/30 text-red-500 rounded-md px-2 h-9 min-w-[4rem] flex flex-col items-center justify-center leading-none cursor-pointer hover:bg-red-900/20 active:scale-95 transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                const notation = action.damage?.split(' ')[0];
                                if (notation) onRoll(notation, `${action.name} Damage`);
                                if (!isUsed) toggleUsed(actionId);
                            }}
                        >
                            <span className="text-[6px] uppercase font-black opacity-80">Damage</span>
                            <span className="text-[10px] font-black">{action.damage.split(' ')[0]}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-[var(--border-color)] space-y-2 bg-[var(--bg-app)]/40 p-3 rounded-b-lg">
                    <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic text-[var(--text-primary)]">Description</div>
                    <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                        <MarkdownDescription content={action.description} name={action.name} className={action.className} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

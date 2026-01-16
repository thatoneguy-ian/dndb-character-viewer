import React, { useState, useEffect } from 'react';
import { useCombatActions } from '../../hooks/useCombatActions';
import { CombatActionItem } from './CombatActionItem';
import { useAppContext } from '../../context/AppContext';
import { Zap } from 'lucide-react';

export const CombatDashboard: React.FC = () => {
    const { actionsByCost } = useCombatActions();
    const { isHasted, usedIds, toggleUsed, resetTurn } = useAppContext();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        // Auto-expand the first available action on mount
        const allItems = [...actionsByCost.Action, ...actionsByCost.Bonus, ...actionsByCost.Reaction, ...actionsByCost.Other];
        if (allItems.length > 0 && !expandedId) {
            setExpandedId(allItems[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionsByCost]);


    const sections = [
        { label: 'Actions', key: 'Action', icon: '🔴', color: 'text-red-500' },
        { label: 'Bonus Actions', key: 'Bonus', icon: '🟢', color: 'text-green-500' },
        { label: 'Reactions', key: 'Reaction', icon: '🔵', color: 'text-blue-500' },
        { label: 'Other / Free', key: 'Other', icon: '⚪', color: 'text-gray-500' },
    ] as const;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-60">Action Economy Tracking</div>
                    {isHasted && (
                        <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-500 px-2 py-0.5 rounded-full animate-pulse shadow-sm shadow-amber-500/10">
                            <Zap className="w-3 h-3 fill-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Hasted</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={resetTurn}
                    className="text-[10px] font-black uppercase tracking-widest text-[#FF4D4D] hover:bg-red-500/10 transition-colors border border-red-500/30 px-3 py-1.5 rounded-lg bg-red-500/5 shadow-sm"
                >
                    Reset Turn
                </button>
            </div>
            {sections.map((section) => {
                const items = actionsByCost[section.key as keyof typeof actionsByCost];
                if (items.length === 0) return null;

                // Intelligent Sorting: Available > Spent
                const sortedItems = [...items].sort((a, b) => {
                    const aUsed = usedIds.has(a.id);
                    const bUsed = usedIds.has(b.id);
                    if (aUsed && !bUsed) return 1;
                    if (!aUsed && bUsed) return -1;
                    return 0;
                });

                return (
                    <div key={section.key} className="space-y-3">
                        <div className="flex items-center gap-3 sticky top-[48px] z-10 bg-[var(--bg-app)] py-2 backdrop-blur-md">
                            <span className="text-sm">{section.icon}</span>
                            <div className="flex flex-col">
                                <h3 className={`text-[10px] font-black uppercase tracking-widest ${section.color}`}>
                                    {section.label}
                                </h3>
                                {section.key === 'Action' && isHasted && (
                                    <span className="text-[7px] font-bold text-amber-500 uppercase tracking-widest">+1 Extra Haste Action</span>
                                )}
                            </div>
                            <div className={`h-px flex-1 bg-current opacity-20 ${section.color}`}></div>
                            <span className="text-[9px] font-bold opacity-40 uppercase">{items.length} Options</span>
                        </div>

                        <div className="grid gap-2">
                            {sortedItems.map((action) => (
                                <CombatActionItem
                                    key={action.id}
                                    action={action}
                                    isOpen={expandedId === action.id}
                                    onClick={() => setExpandedId(expandedId === action.id ? null : action.id)}
                                    isUsed={usedIds.has(action.id)}
                                    onToggleUsed={toggleUsed}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {Object.values(actionsByCost).every(arr => arr.length === 0) && (
                <div className="text-center text-gray-600 py-12 flex flex-col items-center gap-3">
                    <div className="text-4xl">🌑</div>
                    <div className="text-xs font-bold uppercase tracking-widest italic">No combat actions found.</div>
                </div>
            )}
        </div>
    );
};

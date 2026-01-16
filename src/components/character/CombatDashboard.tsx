import React, { useState } from 'react';
import { useCombatActions } from '../../hooks/useCombatActions';
import { CombatActionItem } from './CombatActionItem';

export const CombatDashboard: React.FC = () => {
    const { actionsByCost } = useCombatActions();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const sections = [
        { label: 'Actions', key: 'Action', icon: '🔴', color: 'text-red-500' },
        { label: 'Bonus Actions', key: 'Bonus', icon: '🟢', color: 'text-green-500' },
        { label: 'Reactions', key: 'Reaction', icon: '🔵', color: 'text-blue-500' },
        { label: 'Other / Free', key: 'Other', icon: '⚪', color: 'text-gray-500' },
    ] as const;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {sections.map((section) => {
                const items = actionsByCost[section.key as keyof typeof actionsByCost];
                if (items.length === 0) return null;

                return (
                    <div key={section.key} className="space-y-3">
                        <div className="flex items-center gap-3 sticky top-[48px] z-10 bg-[var(--bg-app)] py-2 backdrop-blur-md">
                            <span className="text-sm">{section.icon}</span>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${section.color}`}>
                                {section.label}
                            </h3>
                            <div className={`h-px flex-1 bg-current opacity-20 ${section.color}`}></div>
                            <span className="text-[9px] font-bold opacity-40 uppercase">{items.length} Options</span>
                        </div>

                        <div className="grid gap-2">
                            {items.map((action) => (
                                <CombatActionItem
                                    key={action.id}
                                    action={action}
                                    isOpen={expandedId === action.id}
                                    onClick={() => setExpandedId(expandedId === action.id ? null : action.id)}
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

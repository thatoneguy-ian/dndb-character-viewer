import React, { useState, useMemo } from 'react';
import { useCombatActions } from '../../hooks/useCombatActions';
import { CombatActionItem } from './CombatActionItem';
import { useAppContext } from '../../context/AppContext';
import { Zap } from 'lucide-react';
import type { CombatCapability } from '../../types/character';

export const CombatDashboard: React.FC = () => {
    const { actionsByCost, combatActions } = useCombatActions();
    const { isHasted, usedIds, toggleUsed, resetTurn } = useAppContext();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        Action: true,
        Bonus: true,
        Reaction: true,
        Other: true
    });

    const toggleSection = (key: string) => {
        setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const spentCosts = useMemo(() => {
        const spent = new Map<string, number>();
        usedIds.forEach(id => {
            const action = combatActions.find(a => a.id === id);
            if (action) {
                spent.set(action.cost, (spent.get(action.cost) || 0) + 1);
            }
        });
        return spent;
    }, [usedIds, combatActions]);

    const sections = [
        { label: 'Actions', key: 'Action', icon: '🔴', color: 'text-red-500' },
        { label: 'Bonus Actions', key: 'Bonus', icon: '🟢', color: 'text-green-500' },
        { label: 'Reactions', key: 'Reaction', icon: '🔵', color: 'text-blue-500' },
        { label: 'Other / Free', key: 'Other', icon: '⚪', color: 'text-gray-500' },
    ] as const;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Quick Navigation Bridge */}
            <div className="sticky top-0 z-30 bg-[var(--bg-app)]/80 backdrop-blur-lg border-b border-[var(--border-color)]/20 py-2 -mx-4 px-4 flex justify-between items-center shadow-sm">
                <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                    {sections.map(s => {
                        const items = actionsByCost[s.key as keyof typeof actionsByCost];
                        if (items.length === 0) return null;
                        const countUsed = spentCosts.get(s.key) || 0;
                        const maxAllowed = (s.key === 'Action' && isHasted) ? 2 : 1;
                        const isEconomySpent = s.key !== 'Other' && countUsed >= maxAllowed;

                        return (
                            <button
                                key={s.key}
                                onClick={() => {
                                    // Ensure section is expanded
                                    if (collapsedSections[s.key]) toggleSection(s.key);
                                    // Jump to it
                                    document.getElementById(`section-${s.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className={`flex flex-col items-center gap-0.5 min-w-[32px] transition-all relative ${isEconomySpent ? 'grayscale opacity-50' : 'hover:scale-110 active:scale-95'}`}
                            >
                                <span className="text-base">{s.icon}</span>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: maxAllowed }).map((_, i) => (
                                        <div key={i} className={`w-1 h-1 rounded-full ${i < countUsed ? 'bg-red-500' : 'bg-gray-500/30'}`} />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={resetTurn}
                    className="flex-shrink-0 text-[9px] font-black uppercase tracking-tighter text-[#FF4D4D] border border-red-500/30 px-2 py-1 rounded bg-red-500/5"
                >
                    Reset
                </button>
            </div>

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
            </div>
            {sections.map((section) => {
                const items = actionsByCost[section.key as keyof typeof actionsByCost];
                if (items.length === 0) return null;
                const isCollapsed = collapsedSections[section.key];
                const countUsed = spentCosts.get(section.key) || 0;
                const maxAllowed = (section.key === 'Action' && isHasted) ? 2 : 1;
                const isEconomySpent = section.key !== 'Other' && countUsed >= maxAllowed;

                // Intelligent Sorting: Available > Spent
                const sortedItems = [...items].sort((a, b) => {
                    const aUsed = usedIds.has(a.id);
                    const bUsed = usedIds.has(b.id);
                    if (aUsed && !bUsed) return 1;
                    if (!aUsed && bUsed) return -1;
                    return 0;
                });

                return (
                    <div key={section.key} id={`section-${section.key}`} className={`space-y-3 scroll-mt-20 transition-opacity duration-300 ${isEconomySpent ? 'opacity-60' : 'opacity-100'}`}>
                        <div
                            onClick={() => toggleSection(section.key)}
                            className="flex items-center gap-3 sticky top-[44px] z-10 bg-[var(--bg-app)]/95 py-3 backdrop-blur-md cursor-pointer group hover:bg-[var(--bg-app)] transition-colors border-b border-transparent hover:border-[var(--border-color)]/30 rounded-t-lg px-1"
                        >
                            <span className={`text-sm transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                                {isCollapsed ? '▸' : '▾'}
                            </span>
                            <span className="text-sm">{section.icon}</span>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${section.color}`}>
                                        {section.label}
                                    </h3>
                                    {isEconomySpent && (
                                        <span className="text-[7px] font-black bg-red-500/20 text-red-500 px-1 rounded border border-red-500/30">SPENT</span>
                                    )}
                                </div>
                                {section.key === 'Action' && isHasted && !isCollapsed && (
                                    <span className="text-[7px] font-bold text-amber-500 uppercase tracking-widest">+1 Extra Haste Action</span>
                                )}
                            </div>
                            <div className={`h-px flex-1 bg-current opacity-20 ${section.color} transition-all group-hover:opacity-40`}></div>
                            <span className="text-[9px] font-bold opacity-40 group-hover:opacity-100 uppercase transition-opacity">
                                {countUsed}/{maxAllowed} {items.length} Options
                            </span>
                        </div>

                        {!isCollapsed && (
                            <div className="grid gap-2 animate-in slide-in-from-top-2 duration-300">
                                {sortedItems.map((action) => (
                                    <div key={action.id} className={!usedIds.has(action.id) && isEconomySpent ? 'grayscale-[0.5] opacity-50 contrast-[0.8]' : ''}>
                                        <CombatActionItem
                                            action={action}
                                            isOpen={expandedId === action.id}
                                            onClick={() => setExpandedId(expandedId === action.id ? null : action.id)}
                                            isUsed={usedIds.has(action.id)}
                                            onToggleUsed={toggleUsed}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {Object.values(actionsByCost).every(arr => (arr as CombatCapability[]).length === 0) && (
                <div className="text-center text-gray-600 py-12 flex flex-col items-center gap-3">
                    <div className="text-4xl">🌑</div>
                    <div className="text-xs font-bold uppercase tracking-widest italic">No combat actions found.</div>
                </div>
            )}
        </div>
    );
};

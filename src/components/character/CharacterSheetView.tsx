import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SheetHeader } from './SheetHeader';
import { ActionTabs } from './ActionTabs';
import { SpellSlotBar } from './SpellSlotBar';
import { FilterControls } from './FilterControls';
import { SpellItem } from './SpellItem';
import { ActionItem } from './ActionItem';
import { CombatDashboard } from './CombatDashboard';
import { ConsumableItem } from './ConsumableItem';
import { ConcentrationBanner } from './ConcentrationBanner';
import { StickyStatusBanner } from './StickyStatusBanner';
import { Badge } from '../common';
import type { Spell } from '../../types/character';

export const CharacterSheetView: React.FC = () => {
    const {
        sheetMode,
        character,
        allSpells,
        allActions,
        allInventory,
        activeTab,
        expandedId,
        setExpandedId,
        filters,
        quickFilters
    } = useAppContext();

    // --- Filtered Data ---
    const filteredSpells = useMemo(() => allSpells.filter(spell => {
        if (filters.attackOnly && !spell.damage && spell.hitOrDc === "") return false;
        if (filters.levels.length > 0 && !filters.levels.includes(spell.level)) return false;
        if (filters.tags.length > 0) {
            if (!spell.tags || !spell.tags.some((t: string) => filters.tags.includes(t))) return false;
        }
        if (quickFilters.concentration === true) {
            if (!spell.components || !spell.components.toLowerCase().includes('concentration')) return false;
        }
        if (quickFilters.castingTime.size > 0) {
            const st = (spell.castingType || 'Other');
            if (!Array.from(quickFilters.castingTime).some(k => st.toLowerCase() === k.toLowerCase())) return false;
        }
        return true;
    }), [allSpells, filters, quickFilters]);

    const spellsByLevel = useMemo(() => {
        const map: Record<number, Spell[]> = {};
        filteredSpells.forEach(s => {
            if (!map[s.level]) map[s.level] = [];
            map[s.level].push(s);
        });
        return map;
    }, [filteredSpells]);

    if (!character) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {sheetMode === 'main' ? (
                <>
                    <StickyStatusBanner />
                    <SheetHeader />
                    <ConcentrationBanner />
                    <ActionTabs />
                    {activeTab === 'Spell' && (
                        <>
                            <SpellSlotBar />
                            <FilterControls />
                        </>
                    )}

                    <div className="pb-20 space-y-2 animate-in fade-in duration-300">
                        {activeTab === 'Combat' ? (
                            <CombatDashboard />
                        ) : activeTab === 'Spell' ? (
                            Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).map(levelKey => {
                                const lvl = Number(levelKey);
                                return (
                                    <div key={lvl}>
                                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] border-b border-[var(--border-color)]/50 mb-3 mt-4 pb-1 flex items-center gap-2">
                                            <span>{lvl === 0 ? "Cantrips" : `Level ${lvl} Spells`}</span>
                                            <div className="h-px flex-1 bg-[var(--border-color)]/30"></div>
                                        </div>
                                        {spellsByLevel[lvl].map((spell, idx) => (
                                            <SpellItem
                                                key={`${lvl}-${idx}`}
                                                spell={spell}
                                                isOpen={expandedId === `spell-${lvl}-${idx}`}
                                                onClick={() => setExpandedId(expandedId === `spell-${lvl}-${idx}` ? null : `spell-${lvl}-${idx}`)}
                                            />
                                        ))}
                                    </div>
                                );
                            })
                        ) : (
                            allActions.filter(act => act.type === activeTab).map((action, idx) => (
                                <ActionItem
                                    key={idx}
                                    action={action}
                                    isOpen={expandedId === `action-${idx}`}
                                    onClick={() => setExpandedId(expandedId === `action-${idx}` ? null : `action-${idx}`)}
                                />
                            ))
                        )}

                        {((activeTab === 'Combat' ? false : (activeTab === "Spell" ? filteredSpells.length : allActions.filter(act => act.type === activeTab).length)) === 0) && activeTab !== 'Combat' && (
                            <div className="text-center text-[var(--text-muted)] py-12 flex flex-col items-center gap-3">
                                <div className="text-4xl">🌑</div>
                                <div className="text-xs font-bold uppercase tracking-widest italic">No {activeTab}s found.</div>
                            </div>
                        )}
                    </div>
                </>
            ) : sheetMode === 'inventory' ? (
                <div className="space-y-6 pb-20">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Combat Items</h3>
                            <div className="h-px flex-1 bg-red-500/20"></div>
                        </div>
                        {allInventory.filter(i => i.type === 'Gear' && i.tags.includes('Combat')).map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200 dark:border-gray-700/30 flex justify-between items-center shadow-sm">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                                <Badge>x{item.quantity}</Badge>
                            </div>
                        ))}
                        {allInventory.filter(i => i.type === 'Gear' && i.tags.includes('Combat')).length === 0 && (
                            <div className="text-[10px] text-gray-500 italic px-2">No combat items equipped</div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Non-Combat Gear</h3>
                            <div className="h-px flex-1 bg-blue-500/20"></div>
                        </div>
                        {allInventory.filter(i => i.type === 'Gear' && !i.tags.includes('Combat')).map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200 dark:border-gray-700/30 flex justify-between items-center shadow-sm">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                                <Badge>x{item.quantity}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-2 pb-20">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Potions & Consumables</h3>
                        <div className="h-px flex-1 bg-gray-800"></div>
                    </div>
                    {allInventory.filter(i => i.type === 'Consumable').map((item, idx) => (
                        <ConsumableItem
                            key={idx}
                            item={item}
                            isOpen={expandedId === `consumable-${idx}`}
                            onClick={() => setExpandedId(expandedId === `consumable-${idx}` ? null : `consumable-${idx}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

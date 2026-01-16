import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FilterState, QuickFilters, PinnedChar, RollResult, Action, Spell, InventoryItem, SpellSlot } from '../types/character';
import type { DDBCharacter } from '../types/dnd-beyond';
import { useCharacter } from '../hooks/useCharacter';
import { usePinnedCharacters } from '../hooks/usePinnedCharacters';
import { useDice } from '../hooks/useDice';
import { getActions, getSpells, getInventory, getSpellSlots } from '../dnd-utils';

interface AppContextType {
    // Navigation & View State
    view: 'list' | 'sheet';
    sheetMode: 'main' | 'inventory' | 'consumables';
    activeTab: "Combat" | "Action" | "Bonus" | "Reaction" | "Other" | "Spell";
    expandedId: string | null;
    theme: 'dark' | 'light';
    showAdvanced: boolean;
    charId: string;

    // Setters
    setView: (view: 'list' | 'sheet') => void;
    setSheetMode: React.Dispatch<React.SetStateAction<'main' | 'inventory' | 'consumables'>>;
    setActiveTab: React.Dispatch<React.SetStateAction<"Combat" | "Action" | "Bonus" | "Reaction" | "Other" | "Spell">>;
    setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
    setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
    setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
    setCharId: React.Dispatch<React.SetStateAction<string>>;

    // Character Data & Logic
    character: DDBCharacter | null;
    loading: boolean;
    error: string;
    handleFetch: (id: string, autoSwitch?: boolean) => Promise<void>;
    goHome: () => void;
    openDndBeyond: () => void;

    // Pinned Characters
    pinned: PinnedChar[];
    togglePin: (character: DDBCharacter | null, charId: string) => void;
    removePin: (id: string) => void;

    // Dice History
    history: RollResult[];
    rollDice: (notation: string, label?: string) => RollResult | null;
    clearHistory: () => void;

    // Filters
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    quickFilters: QuickFilters;
    setQuickFilters: React.Dispatch<React.SetStateAction<QuickFilters>>;

    // Computed Data
    allSpells: Spell[];
    allActions: Action[];
    allInventory: InventoryItem[];
    allTags: string[];
    spellSlots: SpellSlot[];

    // Tactical Awareness (Milestone 2)
    concentratingOn: string | null;
    setConcentratingOn: (spellName: string | null) => void;

    // Intelligent Automation (Milestone 3)
    isHasted: boolean;
    consumeSpellSlot: (level: number) => void;
    usedIds: Set<string>;
    toggleUsed: (id: string) => void;
    resetTurn: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [view, setViewState] = useState<'list' | 'sheet'>('list');
    const [sheetMode, setSheetMode] = useState<'main' | 'inventory' | 'consumables'>('main');
    const [charId, setCharId] = useState('');
    const [activeTab, setActiveTab] = useState<"Combat" | "Action" | "Bonus" | "Reaction" | "Other" | "Spell">("Combat");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [concentratingOn, setConcentratingOn] = useState<string | null>(null);
    const [slotOverrides, setSlotOverrides] = useState<Record<number, number>>({});
    const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

    const { character, loading, error, fetchCharacter } = useCharacter();
    const { pinned, togglePin, removePin, updatePinnedData } = usePinnedCharacters();
    const { history, rollDice, clearHistory } = useDice();

    const [filters, setFilters] = useState<FilterState>({
        attackOnly: false,
        levels: [],
        tags: []
    });

    const [quickFilters, setQuickFilters] = useState<QuickFilters>({
        castingTime: new Set(),
        concentration: null
    });

    // --- Persistence Wrappers ---
    const setView = useCallback((v: 'list' | 'sheet') => {
        setViewState(v);
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ lastView: v });
        }
    }, []);

    const handleFetch = useCallback(async (id: string, autoSwitch = true) => {
        const data = await fetchCharacter(id);
        if (data) {
            updatePinnedData(data, id);
            setSlotOverrides({}); // Reset overrides on successful fetch
            setUsedIds(new Set()); // Reset spent actions on character switch
            if (autoSwitch) {
                setView('sheet');
                setSheetMode('main');
            }
        } else {
            setView('list');
        }
    }, [fetchCharacter, updatePinnedData, setView]);

    // --- Initial Load ---
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['lastCharId', 'lastView'], (result) => {
                if (result.lastView) setViewState(result.lastView as 'list' | 'sheet');
                if (result.lastCharId) {
                    const id = result.lastCharId as string;
                    setCharId(id);
                    // We only want to auto-fetch once on mount. 
                    // Subsequent changes to handleFetch should NOT trigger this.
                    handleFetch(id, false);
                } else {
                    setViewState('list');
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goHome = () => {
        setView('list');
    };

    const openDndBeyond = () => {
        if (character) window.open(character.readonlyUrl || character.viewUrl, '_blank');
    };

    // --- Computed ---
    const allSpells = useMemo(() => character ? getSpells(character) : [], [character]);
    const allActions = useMemo(() => character ? getActions(character) : [], [character]);
    const allInventory = useMemo(() => character ? getInventory(character) : [], [character]);

    const allTags = useMemo(() =>
        Array.from(new Set(allSpells.flatMap(s => s.tags || []))).filter((t): t is string => !!t).sort(),
        [allSpells]);

    const spellSlots = useMemo(() => {
        const baseSlots = character ? getSpellSlots(character) : [];
        if (Object.keys(slotOverrides).length === 0) return baseSlots;

        return baseSlots.map(slot => ({
            ...slot,
            available: Math.max(0, (slot.available ?? (slot.max - slot.used)) - (slotOverrides[slot.level] || 0)),
            used: slot.used + (slotOverrides[slot.level] || 0)
        }));
    }, [character, slotOverrides]);

    const consumeSpellSlot = useCallback((level: number) => {
        setSlotOverrides(prev => ({
            ...prev,
            [level]: (prev[level] || 0) + 1
        }));
    }, []);

    const toggleUsed = useCallback((id: string) => {
        setUsedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const resetTurn = useCallback(() => setUsedIds(new Set()), []);

    const isHasted = useMemo(() => {
        if (!character) return false;
        const hasteLower = 'haste';
        return (
            (character.appliedConditions || []).some(c => c?.definition?.name?.toLowerCase() === hasteLower) ||
            (character.statusEffects || []).some(s => s?.name?.toLowerCase() === hasteLower)
        );
    }, [character]);

    const value: AppContextType = {
        view,
        sheetMode,
        activeTab,
        expandedId,
        theme,
        showAdvanced,
        charId,
        setView,
        setSheetMode,
        setActiveTab,
        setExpandedId,
        setTheme,
        setShowAdvanced,
        setCharId,
        character,
        loading,
        error,
        handleFetch,
        goHome,
        openDndBeyond,
        pinned,
        togglePin,
        removePin,
        history,
        rollDice,
        clearHistory,
        filters,
        setFilters,
        quickFilters,
        setQuickFilters,
        allSpells,
        allActions,
        allInventory,
        allTags,
        spellSlots,
        concentratingOn,
        setConcentratingOn,
        isHasted,
        consumeSpellSlot,
        usedIds,
        toggleUsed,
        resetTurn
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

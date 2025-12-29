import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FilterState, QuickFilters, PinnedChar, RollResult, Action, Spell, InventoryItem } from '../types/character';
import type { DDBCharacter } from '../types/dnd-beyond';
import { useCharacter } from '../hooks/useCharacter';
import { usePinnedCharacters } from '../hooks/usePinnedCharacters';
import { useDice } from '../hooks/useDice';
import { getActions, getSpells, getInventory } from '../dnd-utils';

interface AppContextType {
    // Navigation & View State
    view: 'list' | 'sheet';
    sheetMode: 'main' | 'inventory' | 'consumables';
    activeTab: "Action" | "Bonus" | "Reaction" | "Other" | "Spell";
    expandedId: string | null;
    theme: 'dark' | 'light';
    showAdvanced: boolean;
    charId: string;

    // Setters
    setView: (view: 'list' | 'sheet') => void;
    setSheetMode: React.Dispatch<React.SetStateAction<'main' | 'inventory' | 'consumables'>>;
    setActiveTab: React.Dispatch<React.SetStateAction<"Action" | "Bonus" | "Reaction" | "Other" | "Spell">>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [view, setViewState] = useState<'list' | 'sheet'>('list');
    const [sheetMode, setSheetMode] = useState<'main' | 'inventory' | 'consumables'>('main');
    const [charId, setCharId] = useState('');
    const [activeTab, setActiveTab] = useState<"Action" | "Bonus" | "Reaction" | "Other" | "Spell">("Action");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [showAdvanced, setShowAdvanced] = useState(false);

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

    // --- Initial Load ---
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['lastCharId', 'lastView'], (result) => {
                if (result.lastView) setViewState(result.lastView as 'list' | 'sheet');
                if (result.lastCharId) {
                    const id = result.lastCharId as string;
                    setCharId(id);
                    handleFetch(id, false);
                } else {
                    setViewState('list');
                }
            });
        }
    }, []);

    const handleFetch = async (id: string, autoSwitch = true) => {
        const data = await fetchCharacter(id);
        if (data) {
            updatePinnedData(data, id);
            if (autoSwitch) {
                setView('sheet');
                setSheetMode('main');
            }
        } else {
            setView('list');
        }
    };

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
        allTags
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

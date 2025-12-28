import { useState, useEffect, useMemo } from 'react';
import type { FilterState, QuickFilters, Spell } from './types/character';
import {
  getActions,
  getSpells,
  getInventory,
  getSpellSlots,
} from './dnd-utils';

import { useCharacter } from './hooks/useCharacter';
import { usePinnedCharacters } from './hooks/usePinnedCharacters';
import { useDice } from './hooks/useDice';

// Components
import { DiceLog } from './components/character/DiceLog';
import { DiceQuickBar } from './components/character/DiceQuickBar';
import { CharacterListView } from './components/character/CharacterListView';
import { CharacterHeader } from './components/character/CharacterHeader';
import { StatsGrid } from './components/character/StatsGrid';
import { SkillsPanel } from './components/character/SkillsPanel';
import { ConditionsRow } from './components/character/ConditionsRow';
import { SpellSlotBar } from './components/character/SpellSlotBar';
import { FilterControls } from './components/character/FilterControls';
import { ActionItem } from './components/character/ActionItem';
import { SpellItem } from './components/character/SpellItem';
import { ConsumableItem } from './components/character/ConsumableItem';
import { IconButton, Badge } from './components/common';
import {
  IconHome,
  IconRefresh,
  IconBackpack,
  IconPotion,
  IconParchment,
  IconStar
} from './components/icons';

function App() {
  const [view, setView] = useState<'list' | 'sheet'>('list');
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

  // --- Initial Load ---
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['lastCharId', 'lastView'], (result) => {
        if (result.lastView) setView(result.lastView as 'list' | 'sheet');
        if (result.lastCharId) {
          const id = result.lastCharId as string;
          setCharId(id);
          handleFetch(id, false);
        } else {
          setView('list');
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
        if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ lastView: 'sheet' });
      }
    } else {
      setView('list');
    }
  };

  const goHome = () => {
    setView('list');
    if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ lastView: 'list' });
  };

  const openDndBeyond = () => {
    if (character) window.open(character.readonlyUrl || character.viewUrl, '_blank');
  };

  // --- Filtered Data ---
  const allSpells = useMemo(() => character ? getSpells(character) : [], [character]);
  const allActions = useMemo(() => character ? getActions(character) : [], [character]);
  const allInventory = useMemo(() => character ? getInventory(character) : [], [character]);

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

  const allTags = useMemo(() =>
    Array.from(new Set(allSpells.flatMap(s => s.tags || []))).filter((t): t is string => !!t).sort(),
    [allSpells]);

  if (view === 'list') {
    return (
      <CharacterListView
        charId={charId}
        setCharId={setCharId}
        loading={loading}
        error={error}
        pinned={pinned}
        onFetch={(id) => handleFetch(id)}
        onRemovePin={removePin}
      />
    );
  }

  const isPinned = pinned.some(p => p.id === charId);

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden relative transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--bg-app)] text-white dark' : 'bg-[var(--bg-app)] text-[var(--text-primary)] light-theme'}`}>
      <div className={`px-4 py-3 backdrop-blur-md border-b shrink-0 z-30 flex justify-between items-center shadow-lg transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--bg-app)]/80 border-gray-800 text-white' : 'bg-[var(--bg-card)]/80 border-[var(--border-color)] text-[var(--text-primary)]'}`}>
        <div className="flex gap-2 items-center">
          <IconButton onClick={goHome} title="Search"><IconHome /></IconButton>
          <IconButton onClick={() => handleFetch(charId, false)} title="Sync Data" className="hover:text-blue-400"><IconRefresh /></IconButton>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-1.5 rounded-lg transition-all duration-300 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'}`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="flex gap-2 items-center bg-[var(--bg-input)]/50 dark:bg-gray-800/50 p-1 rounded-xl border border-[var(--border-color)] dark:border-gray-700/30 transition-colors duration-300">
          <IconButton
            onClick={() => setSheetMode('main')}
            title="Main Sheet"
            className={sheetMode === 'main' ? 'text-[#D32F2F] bg-red-500/10 dark:bg-red-900/20' : ''}
          >
            <IconParchment />
          </IconButton>
          <IconButton
            onClick={() => setSheetMode('inventory')}
            title="Inventory"
            className={sheetMode === 'inventory' ? 'text-[#D32F2F] bg-red-500/10 dark:bg-red-900/20' : ''}
          >
            <IconBackpack />
          </IconButton>
          <IconButton
            onClick={() => setSheetMode('consumables')}
            title="Consumables"
            className={sheetMode === 'consumables' ? 'text-[#D32F2F] bg-red-500/10 dark:bg-red-900/20' : ''}
          >
            <IconPotion />
          </IconButton>
        </div>

        <div className="flex gap-2 items-center">
          <IconButton onClick={openDndBeyond} title="Open D&D Beyond" className="hover:text-blue-400"><IconParchment /></IconButton>
          <IconButton onClick={() => togglePin(character, charId)} title="Pin Character">
            <IconStar filled={isPinned} />
          </IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 focus:outline-none">
        {character && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {sheetMode === 'main' ? (
              <>
                <CharacterHeader character={character} />
                <StatsGrid character={character} />
                <SkillsPanel character={character} onRoll={rollDice} />
                <ConditionsRow character={character} />

                <div className="flex bg-[var(--bg-input)] dark:bg-gray-800/30 p-1 rounded-xl border border-[var(--border-color)] dark:border-gray-800/50 mb-4 sticky top-0 z-20 backdrop-blur-sm transition-colors duration-300">
                  {(["Action", "Bonus", "Reaction", "Other", "Spell"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${activeTab === tab ? "text-white bg-[var(--color-action)] shadow-lg shadow-red-900/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-gray-500 dark:hover:text-gray-300"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'Spell' && (
                  <>
                    <SpellSlotBar spellSlots={getSpellSlots(character)} />
                    <FilterControls
                      filters={filters}
                      setFilters={setFilters}
                      quickFilters={quickFilters}
                      setQuickFilters={setQuickFilters}
                      allTags={allTags}
                      showAdvanced={showAdvanced}
                      setShowAdvanced={setShowAdvanced}
                    />
                  </>
                )}

                <div className="pb-20 space-y-2 animate-in fade-in duration-300">
                  {activeTab === 'Spell' ? (
                    Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).map(levelKey => {
                      const lvl = Number(levelKey);
                      return (
                        <div key={lvl}>
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50 mb-3 mt-4 pb-1 flex items-center gap-2">
                            <span>{lvl === 0 ? "Cantrips" : `Level ${lvl} Spells`}</span>
                            <div className="h-px flex-1 bg-gray-800/30"></div>
                          </div>
                          {spellsByLevel[lvl].map((spell, idx) => (
                            <SpellItem
                              key={`${lvl}-${idx}`}
                              spell={spell}
                              isOpen={expandedId === `spell-${lvl}-${idx}`}
                              onClick={() => setExpandedId(expandedId === `spell-${lvl}-${idx}` ? null : `spell-${lvl}-${idx}`)}
                              onRoll={rollDice}
                              character={character}
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
                        onRoll={rollDice}
                        character={character}
                      />
                    ))
                  )}

                  {((activeTab === "Spell" ? filteredSpells.length : allActions.filter(act => act.type === activeTab).length) === 0) && (
                    <div className="text-center text-gray-600 py-12 flex flex-col items-center gap-3">
                      <div className="text-4xl">🌑</div>
                      <div className="text-xs font-bold uppercase tracking-widest italic">No {activeTab}s found.</div>
                    </div>
                  )}
                </div>
              </>
            ) : sheetMode === 'inventory' ? (
              <div className="space-y-6 pb-20">
                {/* Combat Items */}
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

                {/* Non-Combat Gear */}
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
                    onRoll={rollDice}
                    character={character}
                  />
                ))}
                {allInventory.filter(i => i.type === 'Consumable').length === 0 && (
                  <div className="text-center text-gray-600 py-12">
                    <div className="text-xs font-bold uppercase tracking-widest italic">Inventory Empty</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 z-30 shadow-2xl overflow-hidden rounded-t-3xl border-t border-gray-300 dark:border-gray-800 transition-colors duration-300">
        <DiceLog history={history} onClear={clearHistory} />
        <DiceQuickBar onRoll={rollDice} />

        {view === 'sheet' && pinned.length > 0 && (
          <div className="bg-[var(--bg-app)]/95 dark:bg-gray-900/90 backdrop-blur-md p-3">
            <div className="flex gap-4 items-center overflow-x-auto px-4 py-1 no-scrollbar">
              {pinned.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setCharId(p.id); handleFetch(p.id); }}
                  className={`relative flex flex-col items-center shrink-0 transition-all duration-300 ${p.id === charId ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                >
                  <img src={p.avatar} className={`w-10 h-10 rounded-full border-2 object-cover ${p.id === charId ? 'border-[#D32F2F] shadow-lg shadow-red-900/40' : 'border-gray-300 dark:border-gray-700'}`} alt={p.name} title={p.name} />
                  {p.id === charId && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#D32F2F] rounded-full shadow-lg shadow-red-500/50"></div>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
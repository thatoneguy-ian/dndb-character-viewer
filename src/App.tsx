/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  getAbilityScore, 
  getModString, 
  ABILITY_MAP, 
  getActions, 
  getSpells, 
  getClasses, 
  getInventory,
  calculateHP,
  calculateAC,
  getSkills,
  getSpellSlots, // Ensure this is imported
  type Skill
} from './dnd-utils';

interface PinnedChar {
  id: string;
  name: string;
  avatar: string;
  classes: string[];
}

// Filter Interface
interface FilterState {
  attackOnly: boolean;
  levels: number[];
}

function App() {
  const [view, setView] = useState<'list' | 'sheet'>('list'); 
  const [sheetMode, setSheetMode] = useState<'main' | 'inventory' | 'consumables'>('main');

  const [pinned, setPinned] = useState<PinnedChar[]>([]);
  const [charId, setCharId] = useState('');
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<"Action" | "Bonus" | "Reaction" | "Other" | "Spell">("Action");
  
  const [showSkills, setShowSkills] = useState(false);
  const [skillSort, setSkillSort] = useState<'name'|'bonus'>('name');
  
  // Filter State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    attackOnly: false,
    levels: []
  });

  const [expandedId, setExpandedId] = useState<string | null>(null); 

  const handleClickCard = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const goHome = () => {
    setView('list');
    if(chrome.storage) chrome.storage.local.set({ lastView: 'list' });
  };

  const updatePinnedData = (charData: any, id: string) => {
    setPinned(prev => {
      const exists = prev.find(p => p.id === id);
      if (!exists) return prev;
      const newPins = prev.map(p => {
        if (p.id !== id) return p;
        return {
          id: id,
          name: charData.name,
          avatar: charData.decorations?.avatarUrl || "https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.png",
          classes: getClasses(charData)
        };
      });
      if(chrome.storage) chrome.storage.local.set({ pinned: newPins });
      return newPins;
    });
  };

  const fetchCharacter = (idToFetch: string, autoSwitch = true) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');
    if(chrome.storage) chrome.storage.local.set({ lastCharId: idToFetch });

    chrome.runtime.sendMessage(
      { action: "FETCH_CHARACTER", characterId: idToFetch },
      (response: any) => { 
        setLoading(false);
        if (response?.success) {
          const newData = response.data.data;
          setCharacter(newData);
          updatePinnedData(newData, idToFetch);

          if (autoSwitch) {
            setView('sheet');
            setSheetMode('main');
            if(chrome.storage) chrome.storage.local.set({ lastView: 'sheet' });
          }
        } else {
          setError(response?.error || "Unknown error");
        }
      }
    );
  };

  const togglePin = () => {
    if (!character) return;
    const newPin: PinnedChar = {
      id: charId,
      name: character.name,
      avatar: character.decorations?.avatarUrl || "https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.png",
      classes: getClasses(character)
    };

    let newPinnedList = [...pinned];
    if (newPinnedList.find(p => p.id === newPin.id)) {
      newPinnedList = newPinnedList.filter(p => p.id !== newPin.id);
    } else {
      if (newPinnedList.length >= 7) return alert("Max 7 Pins allowed.");
      newPinnedList.push(newPin);
    }
    setPinned(newPinnedList);
    if(chrome.storage) chrome.storage.local.set({ pinned: newPinnedList });
  };

  const removePin = (e: any, idToRemove: string) => {
    e.stopPropagation();
    const newList = pinned.filter(p => p.id !== idToRemove);
    setPinned(newList);
    if(chrome.storage) chrome.storage.local.set({ pinned: newList });
  };

  const openDndBeyond = () => {
    if(character) window.open(character.readonlyUrl || character.viewUrl, '_blank');
  };

  const handleSync = () => {
    if (charId) fetchCharacter(charId, false);
  };

  const toggleLevelFilter = (lvl: number) => {
    setFilters(prev => ({
      ...prev,
      levels: prev.levels.includes(lvl) ? prev.levels.filter(l => l !== lvl) : [...prev.levels, lvl]
    }));
  };

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(['pinned', 'lastCharId', 'lastView'], (result: any) => {
        const loadedPins = result.pinned && Array.isArray(result.pinned) ? result.pinned.map((p: any) => ({
            ...p,
            classes: Array.isArray(p.classes) ? p.classes : ["Lvl " + (p.level || "?")] 
          })) : [];
        
        setPinned(loadedPins);

        if (result.lastCharId) {
          setCharId(result.lastCharId);
          fetchCharacter(result.lastCharId, true);
        } else if (loadedPins.length > 0) {
          setCharId(loadedPins[0].id);
          fetchCharacter(loadedPins[0].id, true);
        } else {
          setView('list');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
  const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;
  const IconBackpack = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/><path d="M8 10h8"/><path d="M9 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/></svg>;
  const IconPotion = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 2h2"/><path d="M7 2h10"/><path d="M12 2v6"/><path d="M8.5 10a3 3 0 0 1-.5-1V5h8v4a3 3 0 0 1-.5 1l-2.5 3.5v7h-4v-7Z"/></svg>;
  const IconParchment = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
  const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>;
  const IconChevronUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>;

  // --- RENDER: LIST VIEW (SEARCH) ---
  if (view === 'list') {
    return (
      <div className="p-3 bg-gray-900 h-full w-full flex flex-col justify-center items-center text-white">
         <h1 className="text-xl font-bold text-red-500 mb-6">Character Lookup</h1>
         
         <div className="w-full max-w-xs space-y-3">
            <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-500 outline-none"
              placeholder="D&D Beyond ID"
              value={charId}
              onChange={(e) => setCharId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCharacter(charId)}
            />
            <button onClick={() => fetchCharacter(charId)} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-5 rounded font-bold disabled:opacity-50">{loading ? '...' : 'Go'}</button>
            </div>
            {error && <div className="text-xs text-red-400 text-center">{error}</div>}
         </div>

         {character && (
           <button onClick={() => setView('sheet')} className="mt-8 text-gray-500 hover:text-white underline text-sm">
             Back to {character.name}
           </button>
         )}

         {pinned.length > 0 && (
           <div className="mt-8 w-full max-w-xs">
             <h2 className="text-xs text-gray-500 mb-2 text-center">Pinned Characters</h2>
             <div className="grid grid-cols-4 gap-2">
               {pinned.map(p => (
                 <div key={p.id} className="relative group cursor-pointer" onClick={() => { setCharId(p.id); fetchCharacter(p.id); }}>
                    <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover" />
                    <button 
                      onClick={(e) => removePin(e, p.id)}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center opacity-90"
                    >✕</button>
                 </div>
               ))}
             </div>
           </div>
         )}
      </div>
    );
  }

  const isPinned = pinned.some(p => p.id === charId);
  const hp = character ? calculateHP(character) : { current: 0, max: 0, temp: 0 };
  const ac = character ? calculateAC(character) : 10;
  const skills = character ? getSkills(character).sort((a: Skill, b: Skill) => skillSort === 'name' ? a.name.localeCompare(b.name) : b.bonusValue - a.bonusValue) : [];
  const spellSlots = character ? getSpellSlots(character) : [];

  // FILTER LOGIC
  const allSpells = character ? getSpells(character) : [];
  const filteredSpells = allSpells.filter(spell => {
    if (filters.attackOnly && !spell.damage && spell.hitOrDc === "") return false;
    if (filters.levels.length > 0 && !filters.levels.includes(spell.level)) return false;
    return true;
  });

  const spellsByLevel: Record<number, typeof filteredSpells> = {};
  filteredSpells.forEach(s => {
    if (!spellsByLevel[s.level]) spellsByLevel[s.level] = [];
    spellsByLevel[s.level].push(s);
  });

  return (
    <div className="bg-gray-900 h-full w-full text-white relative flex flex-col overflow-hidden">
      
      <div className="p-3 bg-gray-900 border-b border-gray-800 shrink-0 z-20">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-3 items-center">
             <button onClick={goHome} title="Search" className="text-gray-400 hover:text-white"><IconHome /></button>
             <button onClick={handleSync} title="Sync Data" className="text-gray-400 hover:text-blue-400"><IconRefresh /></button>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setSheetMode('inventory')} title="Inventory" className={sheetMode === 'inventory' ? 'text-red-500' : 'text-gray-400 hover:text-white'}><IconBackpack /></button>
             <button onClick={() => setSheetMode('consumables')} title="Consumables" className={sheetMode === 'consumables' ? 'text-red-500' : 'text-gray-400 hover:text-white'}><IconPotion /></button>
             <div className="w-px h-4 bg-gray-700 mx-1"></div>
             <button onClick={openDndBeyond} title="Open D&D Beyond" className="text-gray-400 hover:text-blue-400"><IconParchment /></button>
             <button onClick={togglePin} title="Pin Character" className={isPinned ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'}>★</button>
          </div>
        </div>
        {character && (
          <div className="flex items-center gap-3">
             <img src={character.decorations?.avatarUrl} className="w-12 h-12 rounded-full border border-red-500 bg-gray-800" />
             <div className="min-w-0">
               <h2 className="text-lg font-bold leading-none truncate">{character.name}</h2>
               <div className="flex gap-2 text-xs text-gray-400 mt-1">
                 <span className="text-green-400 font-bold">{hp.current} / {hp.max} HP {hp.temp > 0 && <span className="text-blue-300">(+{hp.temp})</span>}</span>
                 <span className="text-gray-500">|</span>
                 <span className="font-bold text-white">AC {ac}</span>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 pt-0">
        {sheetMode === 'main' && character && (
          <div key="main" className="animate-in fade-in duration-300">
            <div className="grid grid-cols-6 gap-1 text-center mb-2 mt-2">
               {[1, 2, 3, 4, 5, 6].map((id) => (
                  <div key={id} className="bg-gray-800 p-1 rounded">
                    <div className="text-[8px] text-gray-500 font-bold">{ABILITY_MAP[id]}</div>
                    <div className="text-sm font-bold">{getModString(getAbilityScore(character, id))}</div>
                  </div>
               ))}
            </div>

            <div className="mb-3 border border-gray-800 rounded bg-gray-850">
              <button onClick={() => setShowSkills(!showSkills)} className="w-full flex justify-between items-center p-2 text-xs font-bold text-gray-400">
                <span>SKILLS</span>{showSkills ? <IconChevronUp /> : <IconChevronDown />}
              </button>
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showSkills ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-2 border-t border-gray-800 bg-gray-900">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => setSkillSort(skillSort === 'name' ? 'bonus' : 'name')} className="text-[9px] text-blue-400 uppercase font-bold">Sort by: {skillSort}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {skills.map((skill: Skill) => (
                      <div key={skill.name} className="flex justify-between text-xs">
                        <span className="text-gray-400 truncate pr-2">{skill.name}</span>
                        <span className={`font-mono ${skill.bonusValue > 0 ? 'text-white' : 'text-gray-600'}`}>{skill.bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex border-b border-gray-700 mb-3 sticky top-0 bg-gray-900 z-10 pt-2">
              {(["Action", "Bonus", "Reaction", "Other", "Spell"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? "text-red-500 border-b-2 border-red-500" : "text-gray-500"}`}>{tab}</button>
              ))}
            </div>

            {/* NEW: Spell Slot Bar */}
            {activeTab === 'Spell' && (
              <div className="mb-3 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded-md flex items-center gap-3 overflow-x-auto whitespace-nowrap">
                {spellSlots.length > 0 ? (
                  spellSlots.map((slot, idx) => {
                  const getOrdinal = (n: number) => {
                    if (n > 3 && n < 21) return `${n}th`;
                    switch (n % 10) {
                      case 1:  return `${n}st`;
                      case 2:  return `${n}nd`;
                      case 3:  return `${n}rd`;
                      default: return `${n}th`;
                    }
                  };
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-bold text-blue-300">{slot.name || getOrdinal(slot.level)}:</span>
                        <span className="text-white font-mono">{( (slot.max ?? 0) - (slot.used ?? 0) )}/{slot.max ?? 0}</span>
                        {idx < spellSlots.length - 1 && <span className="text-gray-600">|</span>}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-400">No spell slots found for this character.</div>
                )}
              </div>
            )}

            {/* SPELL SLOTS & FILTERS (Only on Spell Tab) */}
            {activeTab === "Spell" && (
              <div className="mb-4">
                 <div className="flex justify-between items-center mb-2">
                    <button onClick={() => setFilters(f => ({ ...f, attackOnly: !f.attackOnly }))} className={`text-[10px] px-2 py-1 rounded border ${filters.attackOnly ? 'bg-red-900/50 border-red-500 text-red-200' : 'border-gray-600 text-gray-400 hover:text-white'}`}>⚔️ Attacks Only</button>
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className={`text-[10px] px-2 py-1 rounded border ${showAdvanced ? 'bg-gray-700 border-gray-500 text-white' : 'border-gray-600 text-gray-400 hover:text-white'}`}>Filters {showAdvanced ? '▲' : '▼'}</button>
                 </div>

                 <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showAdvanced ? 'max-h-[600px]' : 'max-h-0'}`}>
                   <div className="bg-gray-800 p-2 rounded mb-3 border border-gray-700">
                     <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Spell Levels</div>
                     <div className="flex flex-wrap gap-1">
                       {[0,1,2,3,4,5,6,7,8,9].map(lvl => (
                         <button key={lvl} onClick={() => toggleLevelFilter(lvl)} className={`w-6 h-6 text-[10px] rounded border flex items-center justify-center ${filters.levels.includes(lvl) ? 'bg-blue-600 border-blue-400 text-white' : 'border-gray-600 text-gray-400 hover:bg-gray-700'}`}>{lvl}</button>
                       ))}
                     </div>
                   </div>
                 </div>
              </div>
            )}

            <div key={`tab-${activeTab}-${filters.attackOnly}-${filters.levels.join(',')}`} className="space-y-2 pb-4 animate-in fade-in duration-300">
               {activeTab === "Spell" ? (
                 Object.keys(spellsByLevel).sort((a,b) => Number(a)-Number(b)).map(levelKey => {
                   const lvl = Number(levelKey);
                   return (
                     <div key={lvl}>
                       <div className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-800 mb-2 mt-4 pb-1">
                         {lvl === 0 ? "Cantrips" : `Level ${lvl}`}
                       </div>
                       <div className="space-y-2">
                         {spellsByLevel[lvl].map((spell: any, sidx: number) => {
                           const uniqueId = `spell-${lvl}-${sidx}`;
                           const isOpen = expandedId === uniqueId;
                           const summonStats = spell.summonStats;

                           return (
                             <div
                               key={uniqueId}
                               role="button"
                               tabIndex={0}
                               aria-expanded={isOpen}
                               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClickCard(uniqueId); } }}
                               className={`bg-gray-800 p-2 rounded border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${isOpen ? 'border-blue-500 bg-gray-900' : 'border-gray-700'}`}
                               onClick={() => handleClickCard(uniqueId)}
                             >
                               <div className="flex justify-between items-center mb-1">
                                 <h3 className="font-bold text-sm text-blue-300 truncate">{spell.name}</h3>
                                 <div className="text-[10px] text-gray-400 whitespace-nowrap">{spell.castingTime}</div>
                               </div>
                               <div className="flex justify-between text-xs text-gray-400">
                                  <span>{spell.range}</span>
                                  {spell.damage && <span className="text-gray-300">{spell.damage}</span>}
                               </div>
                               {isOpen && (
                                 <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-300 cursor-auto">
                                   {summonStats ? (
                                     <div className="bg-gray-850 p-2 rounded border border-gray-600">
                                       <div className="font-bold text-white mb-2 uppercase">{summonStats.name}</div>
                                       <div className="flex justify-between mb-2 text-[10px] text-gray-300">
                                         <span>AC {summonStats.ac}</span><span>HP {summonStats.hp}</span><span>Spd {summonStats.speed}</span>
                                       </div>
                                       <div className="grid grid-cols-6 gap-1 text-center text-[9px] text-gray-400 mb-2">
                                         <div>STR<br/><span className="text-white">{summonStats.str}</span></div>
                                         <div>DEX<br/><span className="text-white">{summonStats.dex}</span></div>
                                         <div>CON<br/><span className="text-white">{summonStats.con}</span></div>
                                         <div>INT<br/><span className="text-white">{summonStats.int}</span></div>
                                         <div>WIS<br/><span className="text-white">{summonStats.wis}</span></div>
                                         <div>CHA<br/><span className="text-white">{summonStats.cha}</span></div>
                                       </div>
                                       <div className="mt-2 pt-2 border-t border-gray-700" dangerouslySetInnerHTML={{ __html: spell.description }} />
                                     </div>
                                   ) : (<div dangerouslySetInnerHTML={{ __html: spell.description }} />)}
                                 </div>
                               )}
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   );
                 })
               ) : (
                 getActions(character).filter(act => act.type === activeTab).map((action, idx) => {
                   const uniqueId = `action-${idx}`;
                   const isOpen = expandedId === uniqueId;
                   return (
                     <div
                       key={uniqueId}
                       role="button"
                       tabIndex={0}
                       aria-expanded={isOpen}
                       onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClickCard(uniqueId); } }}
                       className={`bg-gray-800 p-2 rounded border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${isOpen ? 'border-red-500 bg-gray-900' : 'border-gray-700'}`}
                       onClick={() => handleClickCard(uniqueId)}
                     >
                       <div className="flex justify-between items-start">
                          <div className="font-bold text-sm text-white truncate pr-2">{action.name}</div>
                          {action.hitOrDc && <div className="text-xs text-red-300 font-mono whitespace-nowrap">{action.hitOrDc}</div>}
                       </div>
                       <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-gray-500 truncate w-2/3 italic">{action.attackType || action.source}</div>
                          {action.damage && <div className="text-xs text-gray-300">{action.damage}</div>}
                       </div>
                       {isOpen && (
                         <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-300 cursor-auto">
                            <div className="font-bold mb-1">{action.name}</div>
                            <div dangerouslySetInnerHTML={{ __html: action.description }} />
                         </div>
                       )}
                     </div>
                   );
                 })
               )}
               {(activeTab === "Spell" 
                  ? filteredSpells.length === 0 
                  : getActions(character).filter(act => act.type === activeTab).length === 0
               ) && <div className="text-center text-gray-500 py-6 text-xs italic">No {activeTab}s found.</div>}
            </div>
          </div>
        )}
        {sheetMode === 'inventory' && character && (
          <div key="inventory" className="space-y-2 mt-2 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Equipment</h3>
            {getInventory(character).filter(i => i.type === 'Gear').map((item, idx) => (
              <div key={idx} className="bg-gray-800 p-2 rounded border border-gray-700 flex justify-between">
                <span className="text-sm font-bold">{item.name}</span>
                <span className="text-xs text-gray-400">x{item.quantity}</span>
              </div>
            ))}
          </div>
        )}
        {sheetMode === 'consumables' && character && (
          <div key="consumables" className="space-y-2 mt-2 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Potions & Scrolls</h3>
            {getInventory(character).filter(i => i.type === 'Consumable').map((item, idx) => {
               const uniqueId = `item-${idx}`;
               const isOpen = expandedId === uniqueId;
               return (
                <div
                  key={uniqueId}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClickCard(uniqueId); } }}
                  className="bg-gray-800 p-2 rounded border border-gray-700 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={() => handleClickCard(uniqueId)}
                >
                   <div className="flex justify-between">
                      <span className="text-sm font-bold text-green-300">{item.name}</span>
                      <span className="text-xs text-white bg-gray-700 px-1.5 rounded">x{item.quantity}</span>
                   </div>
                   {isOpen && (
                     <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-300 cursor-auto"><div dangerouslySetInnerHTML={{ __html: item.description }} /></div>
                   )}
                </div>
               );
            })}
             {getInventory(character).filter(i => i.type === 'Consumable').length === 0 && <div className="text-center text-gray-500 text-xs italic py-4">No consumables found.</div>}
          </div>
        )}
      </div>
      <div className="bg-gray-900 border-t border-gray-800 p-2 shrink-0 z-30">
         <div className="flex gap-3 items-center overflow-x-auto px-1">
           <div onClick={() => setView('list')} className="cursor-pointer flex flex-col items-center min-w-10">
             <div className="w-10 h-10 rounded-full border-2 border-gray-600 border-dashed flex items-center justify-center text-gray-400 transition-all"><IconSearch /></div>
           </div>
           {pinned.map((p) => (
             <div key={p.id} onClick={() => { setCharId(p.id); fetchCharacter(p.id); }} className="cursor-pointer relative flex flex-col items-center min-w-10">
               <img src={p.avatar} className={`w-10 h-10 rounded-full border-2 object-cover transition-all ${p.id === charId ? 'border-red-500 scale-110' : 'border-gray-600 opacity-90'}`} title={p.name} />
               {p.id === charId && <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>}
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import { ActionIcon, BonusActionIcon, ReactionIcon, ConcentrationIcon } from '../spell-icons';
import { IconButton } from '../common';
import { useAppContext } from '../../context/AppContext';

export const FilterControls: React.FC = () => {
    const {
        filters,
        setFilters,
        quickFilters,
        setQuickFilters,
        allTags,
        showAdvanced,
        setShowAdvanced
    } = useAppContext();
    const toggleLevelFilter = (lvl: number) => {
        setFilters(prev => ({
            ...prev,
            levels: prev.levels.includes(lvl) ? prev.levels.filter(l => l !== lvl) : [...prev.levels, lvl]
        }));
    };

    const toggleCastingFilter = (ct: string) => {
        setQuickFilters(prev => {
            const next = new Set(prev.castingTime);
            if (next.has(ct)) next.delete(ct); else next.add(ct);
            return { ...prev, castingTime: next };
        });
    };

    const toggleTagFilter = (tag: string) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
        }));
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2 gap-2">
                <button
                    onClick={() => setFilters(f => ({ ...f, attackOnly: !f.attackOnly }))}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all uppercase tracking-tight flex items-center gap-1.5 ${filters.attackOnly ? 'bg-red-900/40 border-red-500/50 text-red-400 shadow-lg shadow-red-900/20' : 'bg-gray-800/50 border-gray-700/50 text-gray-500 hover:text-gray-300'}`}
                >
                    <span>⚔️</span> Attacks Only
                </button>

                <div className="flex items-center gap-1 bg-gray-800/30 p-1 rounded-xl border border-gray-700/30">
                    <IconButton
                        onClick={() => toggleCastingFilter('Action')}
                        className={`w-8 h-8 ${quickFilters.castingTime.has('Action') ? 'text-blue-400 bg-blue-900/20' : ''}`}
                        title="Action spells"
                    >
                        <ActionIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                        onClick={() => toggleCastingFilter('Bonus')}
                        className={`w-8 h-8 ${quickFilters.castingTime.has('Bonus') ? 'text-blue-400 bg-blue-900/20' : ''}`}
                        title="Bonus Action spells"
                    >
                        <BonusActionIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                        onClick={() => toggleCastingFilter('Reaction')}
                        className={`w-8 h-8 ${quickFilters.castingTime.has('Reaction') ? 'text-blue-400 bg-blue-900/20' : ''}`}
                        title="Reaction spells"
                    >
                        <ReactionIcon className="w-4 h-4" />
                    </IconButton>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <IconButton
                        onClick={() => setQuickFilters(prev => ({ ...prev, concentration: prev.concentration === true ? null : true }))}
                        className={`w-8 h-8 ${quickFilters.concentration ? 'text-yellow-500 bg-yellow-900/20' : ''}`}
                        title="Concentration only"
                    >
                        <ConcentrationIcon className="w-4 h-4" />
                    </IconButton>
                </div>

                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all uppercase tracking-tight ${showAdvanced ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-800/50 border-gray-700/50 text-gray-500'}`}
                >
                    Filters {showAdvanced ? '▲' : '▼'}
                </button>
            </div>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden shadow-inner ${showAdvanced ? 'max-h-[600px] bg-gray-900/40 p-3 rounded-2xl border border-gray-800/50 mt-2' : 'max-h-0'}`}>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Spell Levels</div>
                        {filters.levels.length > 0 && (
                            <button onClick={() => setFilters(f => ({ ...f, levels: [] }))} className="text-[8px] text-red-500 font-bold uppercase hover:underline">Clear</button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => toggleLevelFilter(lvl)}
                                className={`w-8 h-8 text-xs font-black rounded-lg border transition-all ${filters.levels.includes(lvl) ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'}`}
                            >
                                {lvl === 0 ? 'C' : lvl}
                            </button>
                        ))}
                    </div>
                </div>

                {allTags.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Tags</div>
                            {filters.tags.length > 0 && (
                                <button onClick={() => setFilters(f => ({ ...f, tags: [] }))} className="text-[8px] text-red-500 font-bold uppercase hover:underline">Clear</button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTagFilter(tag)}
                                    className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all uppercase ${filters.tags.includes(tag) ? 'bg-green-600/80 border-green-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

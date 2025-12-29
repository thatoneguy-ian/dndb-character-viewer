import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { IconButton } from '../common';
import {
    IconHome,
    IconRefresh,
    IconBackpack,
    IconPotion,
    IconParchment,
    IconStar
} from '../icons';

export const Navbar: React.FC = () => {
    const {
        goHome,
        handleFetch,
        charId,
        theme,
        setTheme,
        sheetMode,
        setSheetMode,
        openDndBeyond,
        togglePin,
        character,
        pinned
    } = useAppContext();

    const isPinned = pinned.some(p => p.id === charId);

    return (
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
    );
};

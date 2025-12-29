import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { DiceLog } from '../character/DiceLog';
import { DiceQuickBar } from '../character/DiceQuickBar';

export const Footer: React.FC = () => {
    const {
        history,
        clearHistory,
        rollDice,
        view,
        pinned,
        charId,
        setCharId,
        handleFetch
    } = useAppContext();

    return (
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
                                <img
                                    src={p.avatar}
                                    className={`w-10 h-10 rounded-full border-2 object-cover ${p.id === charId ? 'border-[#D32F2F] shadow-lg shadow-red-900/40' : 'border-gray-300 dark:border-gray-700'}`}
                                    alt={p.name}
                                    title={p.name}
                                />
                                {p.id === charId && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#D32F2F] rounded-full shadow-lg shadow-red-500/50"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

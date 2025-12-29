import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const ActionTabs: React.FC = () => {
    const { activeTab, setActiveTab, setExpandedId } = useAppContext();

    const tabs = ["Action", "Bonus", "Reaction", "Other", "Spell"] as const;

    return (
        <div className="flex bg-[var(--bg-input)] dark:bg-gray-800/30 p-1 rounded-xl border border-[var(--border-color)] dark:border-gray-800/50 mb-4 sticky top-0 z-20 backdrop-blur-sm transition-colors duration-300">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${activeTab === tab ? "text-white bg-[var(--color-action)] shadow-lg shadow-red-900/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-gray-500 dark:hover:text-gray-300"}`}
                    role="tab"
                    aria-selected={activeTab === tab}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

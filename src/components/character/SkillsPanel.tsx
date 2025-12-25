import React, { useState } from 'react';
import type { DDBCharacter } from '../../types/dnd-beyond';
import type { Skill } from '../../types/character';
import { getSkills } from '../../dnd-utils';
import { IconChevronDown, IconChevronUp } from '../icons';

interface SkillsPanelProps {
    character: DDBCharacter;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ character }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sortMode, setSortMode] = useState<'name' | 'bonus'>('name');

    const skills = getSkills(character).sort((a, b) =>
        sortMode === 'name' ? a.name.localeCompare(b.name) : b.bonusValue - a.bonusValue
    );

    return (
        <div className="mb-2 border border-gray-800 rounded-lg bg-gray-850/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-2.5 text-xs font-black text-gray-400 hover:bg-gray-800/50 transition-colors"
            >
                <span className="tracking-widest">SKILLS</span>
                {isOpen ? <IconChevronUp /> : <IconChevronDown />}
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-3 border-t border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={() => setSortMode(sortMode === 'name' ? 'bonus' : 'name')}
                            className="text-[9px] text-blue-400 hover:text-blue-300 uppercase font-black tracking-tighter"
                        >
                            Sort by: {sortMode}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {skills.map((skill: Skill) => (
                            <div key={skill.name} className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-400 truncate pr-2 font-medium">{skill.name}</span>
                                <span className={`font-mono font-bold ${skill.bonusValue > 0 ? 'text-green-400' : (skill.bonusValue < 0 ? 'text-red-400' : 'text-gray-600')}`}>
                                    {skill.bonus}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

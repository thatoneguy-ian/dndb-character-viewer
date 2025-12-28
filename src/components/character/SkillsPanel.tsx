import React, { useState } from 'react';
import type { DDBCharacter } from '../../types/dnd-beyond';
import type { Skill } from '../../types/character';
import { getSkills } from '../../dnd-utils';
import { IconChevronDown, IconChevronUp } from '../icons';

interface SkillsPanelProps {
    character: DDBCharacter;
    onRoll: (notation: string, label?: string) => void;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onRoll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sortMode, setSortMode] = useState<'name' | 'bonus'>('name');

    const skills = getSkills(character).sort((a, b) =>
        sortMode === 'name' ? a.name.localeCompare(b.name) : b.bonusValue - a.bonusValue
    );

    return (
        <div className="mb-2 border rounded-lg backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-300
            bg-[var(--bg-card)] border-[var(--border-color)]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-2.5 text-xs font-black transition-colors
                    text-[var(--text-secondary)] hover:bg-[var(--bg-app)]/50"
            >
                <span className="tracking-widest">SKILLS</span>
                {isOpen ? <IconChevronUp /> : <IconChevronDown />}
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-app)]/30">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={() => setSortMode(sortMode === 'name' ? 'bonus' : 'name')}
                            className="text-[9px] text-[#2F80ED] hover:text-[#2D9CDB] uppercase font-black tracking-tighter"
                        >
                            Sort by: {sortMode}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {skills.map((skill: Skill) => (
                            <div key={skill.name} className="flex justify-between items-center text-[11px]">
                                <span className="text-[var(--text-primary)] truncate pr-2 font-medium">{skill.name}</span>
                                <div className="group/roll relative flex items-center justify-end min-w-[32px]">
                                    <span className={`font-mono font-bold group-hover/roll:scale-0 transition-transform duration-200 
                                        ${skill.bonusValue > 0 ? 'text-[var(--text-success)]' : (skill.bonusValue < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--text-secondary)]')}`}>
                                        {skill.bonus}
                                    </span>
                                    <button
                                        className="absolute inset-0 bg-blue-600 rounded opacity-0 group-hover/roll:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg shadow-blue-900/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRoll(`1d20${skill.bonus}`, `${skill.name} Roll`);
                                        }}
                                    >
                                        <span className="text-[7px] font-black text-white uppercase tracking-tighter">Roll</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

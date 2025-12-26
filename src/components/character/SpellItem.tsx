import { MarkdownDescription } from './MarkdownDescription';
import type { Spell } from '../../types/character';
import { Card, Badge } from '../common';
import { SCHOOL_ICON_MAP, ConcentrationIcon } from '../spell-icons';

interface SpellItemProps {
    spell: Spell;
    isOpen: boolean;
    onClick: () => void;
    onRoll: (notation: string, label?: string) => void;
}

export const SpellItem: React.FC<SpellItemProps> = ({ spell, isOpen, onClick, onRoll }) => {
    const IconComp = SCHOOL_ICON_MAP[spell.school] as any;
    const isConcentration = spell.components.toLowerCase().includes('concentration');

    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-[var(--color-action)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {IconComp && <IconComp className="w-4 h-4 text-[#2F80ED] dark:text-blue-400 shrink-0" />}
                        <h4 className="text-sm font-black uppercase tracking-tight truncate text-[var(--text-primary)]">
                            {spell.name}
                        </h4>
                        {isConcentration && <ConcentrationIcon className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                            {spell.castingTime}
                        </span>
                        <span className="text-gray-400 dark:text-gray-700">•</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium">{spell.range}</span>
                    </div>
                </div>

                <div className="text-right">
                    {spell.damage && (
                        <div className="group/roll relative flex items-center justify-end">
                            <Badge
                                color="red"
                                className="px-1.5 transition-all duration-200 group-hover/roll:scale-0 cursor-default"
                            >
                                {spell.damage}
                            </Badge>
                            <button
                                className="absolute inset-0 bg-[var(--color-action)] rounded opacity-0 group-hover/roll:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRoll(spell.damage, `${spell.name} Damage`);
                                }}
                            >
                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Roll</span>
                            </button>
                        </div>
                    )}
                    <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">{spell.school}</div>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-[var(--border-color)] text-xs leading-relaxed bg-[var(--bg-app)]/60 dark:bg-black/20 p-3 rounded-xl text-[var(--text-primary)]">
                    {spell.summonStats ? (
                        <div className="mb-4 bg-[var(--bg-card)] dark:bg-gray-900/50 p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                            <div className="font-black text-[10px] uppercase tracking-widest mb-2 flex justify-between text-[var(--text-primary)] dark:text-white">
                                <span>{spell.summonStats.name}</span>
                                <span className="text-[#5E6C84] dark:text-gray-500">Summoned Entity</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-[var(--bg-input)] dark:bg-gray-800/80 p-1.5 rounded text-center">
                                    <div className="text-[8px] text-[var(--text-secondary)] dark:text-gray-500 font-bold uppercase">AC</div>
                                    <div className="text-xs font-black text-[var(--text-primary)] dark:text-white">{spell.summonStats.ac}</div>
                                </div>
                                <div className="bg-[var(--bg-input)] dark:bg-gray-800/80 p-1.5 rounded text-center">
                                    <div className="text-[8px] text-[var(--text-secondary)] dark:text-gray-500 font-bold uppercase">HP</div>
                                    <div className="text-xs font-black text-[var(--text-primary)] dark:text-white">{spell.summonStats.hp}</div>
                                </div>
                                <div className="bg-[var(--bg-input)] dark:bg-gray-800/80 p-1.5 rounded text-center">
                                    <div className="text-[8px] text-[var(--text-secondary)] dark:text-gray-500 font-bold uppercase">Spd</div>
                                    <div className="text-xs font-black text-[var(--text-primary)] dark:text-white">{spell.summonStats.speed}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 gap-1 text-[8px] text-center uppercase font-bold text-[var(--text-secondary)] dark:text-gray-500">
                                <div>STR<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.str}</span></div>
                                <div>DEX<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.dex}</span></div>
                                <div>CON<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.con}</span></div>
                                <div>INT<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.int}</span></div>
                                <div>WIS<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.wis}</span></div>
                                <div>CHA<br /><span className="text-[var(--text-primary)] dark:text-white">{spell.summonStats.cha}</span></div>
                            </div>
                        </div>
                    ) : null}

                    <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic opacity-50 text-[var(--text-primary)] dark:text-white">Combined Description</div>
                    <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                        <MarkdownDescription content={spell.description} onRoll={onRoll} />
                    </div>

                    {spell.tags && spell.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                            {spell.tags.map((t, i) => (
                                <Badge key={i} className="bg-[var(--bg-input)] dark:bg-gray-800/50 border-[var(--border-color)]/50 text-[var(--text-secondary)]">{t}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

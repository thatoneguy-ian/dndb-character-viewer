import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../common';
import { Shield, RotateCcw, Zap, Activity } from 'lucide-react';
import { calculateHP, calculateAC } from '../../utils/calculators';

export const StickyStatusBanner: React.FC = () => {
    const { character, resetTurn, concentratingOn, isHasted } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 150);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!character || !isVisible) return null;

    const hp = calculateHP(character);
    const ac = calculateAC(character);

    const hpPercent = Math.min(100, (hp.current / hp.max) * 100);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-color)] shadow-xl p-2 flex items-center gap-4">
                    <img
                        src={character.decorations?.avatarUrl}
                        className="w-8 h-8 rounded-full border border-[var(--color-danger)]/50 bg-[var(--bg-input)] object-cover"
                        alt="Avatar"
                    />

                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-center px-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-tighter">HP {hp.current}/{hp.max}</span>
                                <span className="text-[var(--text-muted)] opacity-30">•</span>
                                <span className="text-[9px] font-black text-[var(--text-primary)] flex items-center gap-1">
                                    <Shield className="w-2.5 h-2.5 text-[var(--color-resource)]" /> {ac}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isHasted && (
                                    <div className="bg-amber-500/20 text-amber-500 rounded p-0.5 animate-pulse" title="Hasted">
                                        <Zap className="w-2.5 h-2.5 fill-amber-500" />
                                    </div>
                                )}
                                {concentratingOn && (
                                    <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 border border-blue-500/30">
                                        <Activity className="w-2.5 h-2.5 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter truncate max-w-[60px]">{concentratingOn}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-input)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                            <div
                                className={`h-full transition-all duration-500 ${hpPercent > 50 ? 'bg-[var(--color-hp-full)]' : (hpPercent > 20 ? 'bg-[var(--color-hp-mid)]' : 'bg-[var(--color-hp-low)]')}`}
                                style={{ width: `${hpPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1 pr-1">
                        <Button
                            variant="secondary"
                            className="h-8 px-2 bg-[var(--bg-app)]/50 border-[var(--border-color)]/50 text-[10px] font-black uppercase tracking-tight text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                            onClick={resetTurn}
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Turn
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

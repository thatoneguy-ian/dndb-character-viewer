import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Activity, XCircle } from 'lucide-react';

export const ConcentrationBanner: React.FC = () => {
    const { concentratingOn, setConcentratingOn } = useAppContext();

    if (!concentratingOn) return null;

    return (
        <div className="mb-4 animate-in slide-in-from-top duration-300">
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-3 flex justify-between items-center shadow-lg shadow-blue-500/5">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <Activity className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/70">Concentrating On</span>
                        <h4 className="text-sm font-black text-[var(--text-primary)] leading-none mt-1">
                            {concentratingOn}
                        </h4>
                    </div>
                </div>

                <button
                    onClick={() => setConcentratingOn(null)}
                    className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-500 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest group"
                >
                    <XCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Break</span>
                </button>
            </div>
        </div>
    );
};

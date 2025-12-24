import React from 'react';
import type { PinnedChar } from '../../types/character';
import { Button, Card } from '../common';
import { IconSearch, IconTrash } from '../icons';

interface CharacterListViewProps {
    charId: string;
    setCharId: (id: string) => void;
    loading: boolean;
    error: string;
    pinned: PinnedChar[];
    onFetch: (id: string) => void;
    onRemovePin: (id: string) => void;
}

export const CharacterListView: React.FC<CharacterListViewProps> = ({
    charId,
    setCharId,
    loading,
    error,
    pinned,
    onFetch,
    onRemovePin
}) => {
    return (
        <div className="p-6 bg-gray-900 h-full w-full flex flex-col justify-center items-center text-white overflow-y-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 tracking-tighter uppercase mb-2">
                    D&D Quick View
                </h1>
                <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Character Lookup</p>
            </div>

            <div className="w-full max-w-xs space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            className="w-full p-4 pl-11 rounded-xl bg-gray-800 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all shadow-lg"
                            placeholder="D&D Beyond ID..."
                            value={charId}
                            onChange={(e) => setCharId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onFetch(charId)}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <IconSearch />
                        </div>
                    </div>
                    <Button
                        onClick={() => onFetch(charId)}
                        disabled={loading}
                        className="rounded-xl px-6"
                    >
                        {loading ? '...' : 'Go'}
                    </Button>
                </div>
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-[10px] font-bold p-3 rounded-lg text-center animate-shake">
                        {error}
                    </div>
                )}
            </div>

            {pinned.length > 0 && (
                <div className="mt-12 w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gray-800"></div>
                        <h2 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] whitespace-nowrap">Pinned Characters</h2>
                        <div className="h-px flex-1 bg-gray-800"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {pinned.map(p => (
                            <Card
                                key={p.id}
                                className="group relative p-3 border-gray-800 hover:border-red-500/50"
                                onClick={() => onFetch(p.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={p.avatar}
                                            className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover group-hover:border-red-500 transition-colors"
                                            alt={p.name}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-black text-white truncate uppercase tracking-tight">{p.name}</div>
                                        <div className="text-[10px] text-gray-500 font-bold truncate">
                                            {p.classes.join(', ')}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemovePin(p.id); }}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-900/80 rounded-lg text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-gray-700"
                                >
                                    <IconTrash />
                                </button>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

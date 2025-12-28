import { useState, useEffect, useCallback } from 'react';
import type { DDBCharacterListItem } from '../types/dnd-beyond';

interface UseCharacterListReturn {
    characters: DDBCharacterListItem[];
    loading: boolean;
    error: string;
    refresh: () => void;
}

export function useCharacterList(): UseCharacterListReturn {
    const [characters, setCharacters] = useState<DDBCharacterListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError('');

        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage(
                { action: "FETCH_CHARACTER_LIST" },
                (response: any) => {
                    setLoading(false);
                    if (response?.success) {
                        const rawChars = response.data.data.characters || [];
                        const mappedChars: DDBCharacterListItem[] = rawChars.map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            avatarUrl: c.avatarUrl,
                            latestFullCharacterUrl: c.readonlyUrl || `https://www.dndbeyond.com/characters/${c.id}`,
                            gender: c.gender,
                            race: c.race,
                            classesString: c.classes ? c.classes.map((cls: any) => `${cls.name} ${cls.level}`).join(' / ') : null,
                            level: c.level || (c.classes ? c.classes.reduce((acc: number, cls: any) => acc + (cls.level || 0), 0) : 0)
                        }));
                        setCharacters(mappedChars);
                    } else {
                        const err = response?.error || "Unknown error";
                        setError(err);
                    }
                }
            );
        } else {
            setError("Chrome runtime not available");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    return { characters, loading, error, refresh: fetchList };
}

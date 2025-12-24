import { useState, useCallback } from 'react';
import type { DDBCharacter } from '../types/dnd-beyond';

interface UseCharacterReturn {
    character: DDBCharacter | null;
    loading: boolean;
    error: string;
    fetchCharacter: (idToFetch: string) => Promise<DDBCharacter | null>;
    setCharacter: (char: DDBCharacter | null) => void;
}

export function useCharacter(): UseCharacterReturn {
    const [character, setCharacter] = useState<DDBCharacter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCharacter = useCallback(async (idToFetch: string): Promise<DDBCharacter | null> => {
        if (!idToFetch) return null;

        setLoading(true);
        setError('');

        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ lastCharId: idToFetch });
        }

        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(
                    { action: "FETCH_CHARACTER", characterId: idToFetch },
                    (response: any) => {
                        setLoading(false);
                        if (response?.success) {
                            const newData = response.data.data as DDBCharacter;
                            setCharacter(newData);
                            resolve(newData);
                        } else {
                            const err = response?.error || "Unknown error";
                            setError(err);
                            resolve(null);
                        }
                    }
                );
            } else {
                setError("Chrome runtime not available");
                setLoading(false);
                resolve(null);
            }
        });
    }, []);

    return { character, loading, error, fetchCharacter, setCharacter };
}

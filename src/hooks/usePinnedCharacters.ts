import { useState, useEffect, useCallback } from 'react';
import type { PinnedChar } from '../types/character';
import type { DDBCharacter } from '../types/dnd-beyond';
import { getClasses } from '../dnd-utils';

export function usePinnedCharacters() {
    const [pinned, setPinned] = useState<PinnedChar[]>([]);

    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['pinned'], (result) => {
                const loadedPins: PinnedChar[] = result.pinned && Array.isArray(result.pinned) ? result.pinned.map((p: any) => ({
                    ...p,
                    classes: Array.isArray(p.classes) ? p.classes : ["Lvl " + (p.level || "?")]
                })) : [];
                setPinned(loadedPins);
            });
        }
    }, []);


    const togglePin = useCallback((character: DDBCharacter | null, charId: string) => {
        if (!character) return;

        const newPin: PinnedChar = {
            id: charId,
            name: character.name,
            avatar: character.decorations?.avatarUrl || "https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.png",
            classes: getClasses(character)
        };

        setPinned(prev => {
            const newPinnedList = [...prev];
            const existingIndex = newPinnedList.findIndex(p => p.id === newPin.id);

            if (existingIndex !== -1) {
                newPinnedList.splice(existingIndex, 1);
            } else {
                if (newPinnedList.length >= 7) {
                    alert("Max 7 Pins allowed.");
                    return prev;
                }
                newPinnedList.push(newPin);
            }
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ pinned: newPinnedList });
            }
            return newPinnedList;
        });
    }, []);

    const removePin = useCallback((idToRemove: string) => {
        setPinned(prev => {
            const newList = prev.filter(p => p.id !== idToRemove);
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ pinned: newList });
            }
            return newList;
        });
    }, []);

    const updatePinnedData = useCallback((charData: DDBCharacter, id: string) => {
        setPinned(prev => {
            const exists = prev.find(p => p.id === id);
            if (!exists) return prev;
            const newPins = prev.map(p => {
                if (p.id !== id) return p;
                return {
                    id: id,
                    name: charData.name,
                    avatar: charData.decorations?.avatarUrl || "https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.png",
                    classes: getClasses(charData)
                };
            });
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ pinned: newPins });
            }
            return newPins;
        });
    }, []);

    return { pinned, togglePin, removePin, updatePinnedData };
}

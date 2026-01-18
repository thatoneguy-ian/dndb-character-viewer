import React, { useState, useMemo } from 'react';
import type { DDBCharacter } from '../../types/dnd-beyond';

interface PromptBuilderModalProps {
    character: DDBCharacter;
    open: boolean;
    onClose: () => void;
}

interface PromptSettings {
    includeRace: boolean;
    includeClass: boolean;
    includeGender: boolean;
    includeAppearance: boolean;
    includeArmor: boolean;
    includeWeapons: boolean;
    includeTraits: boolean;
    includeBackground: boolean;
    artStyle: string;
    lighting: string;
    customDetails: string;
}

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({ character, open, onClose }) => {
    const [settings, setSettings] = useState<PromptSettings>({
        includeRace: true,
        includeClass: true,
        includeGender: true,
        includeAppearance: true,
        includeArmor: true,
        includeWeapons: true,
        includeTraits: false,
        includeBackground: false,
        artStyle: "D&D 5e realistic character portrait, fantasy art, high quality",
        lighting: "Cinematic lighting",
        customDetails: ""
    });

    const [copied, setCopied] = useState(false);

    const generatedPrompt = useMemo(() => {
        if (!character) return "";
        return generatePrompt(character, settings);
    }, [character, settings]);

    if (!open) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-app)]">
                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wide">
                        Character Portrait Prompt Builder
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Prompt Preview Area */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                            Generated Prompt
                        </label>
                        <div className="relative">
                            <textarea
                                readOnly
                                value={generatedPrompt}
                                className="w-full h-32 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-mono"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-bold transition-all ${copied
                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                    : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/80"
                                    }`}
                            >
                                {copied ? "COPIED!" : "COPY"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subject Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 mb-2">
                                Subject
                            </h4>
                            <div className="space-y-2">
                                <Checkbox
                                    label={`Race: ${character.race?.fullName || "race unknown"}`}
                                    checked={settings.includeRace}
                                    onChange={(c) => setSettings(s => ({ ...s, includeRace: c }))}
                                />
                                <Checkbox
                                    label={`Class: ${character.classes?.[0]?.definition?.name || "class unknown"}`}
                                    checked={settings.includeClass}
                                    onChange={(c) => setSettings(s => ({ ...s, includeClass: c }))}
                                />
                                <Checkbox
                                    label={`Gender: ${character.gender || "unknown"}`}
                                    checked={settings.includeGender}
                                    onChange={(c) => setSettings(s => ({ ...s, includeGender: c }))}
                                />
                                <Checkbox
                                    label="Physical Traits (Eyes, Hair, Skin)"
                                    checked={settings.includeAppearance}
                                    onChange={(c) => setSettings(s => ({ ...s, includeAppearance: c }))}
                                />
                            </div>
                        </div>

                        {/* Equipment & Vibe */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 mb-2">
                                Gear & Details
                            </h4>
                            <div className="space-y-2">
                                <Checkbox
                                    label="Equipped Armor"
                                    checked={settings.includeArmor}
                                    onChange={(c) => setSettings(s => ({ ...s, includeArmor: c }))}
                                />
                                <Checkbox
                                    label="Equipped Weapons"
                                    checked={settings.includeWeapons}
                                    onChange={(c) => setSettings(s => ({ ...s, includeWeapons: c }))}
                                />
                                <Checkbox
                                    label="Personality Traits"
                                    checked={settings.includeTraits}
                                    onChange={(c) => setSettings(s => ({ ...s, includeTraits: c }))}
                                />
                                <Checkbox
                                    label="Background"
                                    checked={settings.includeBackground}
                                    onChange={(c) => setSettings(s => ({ ...s, includeBackground: c }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customization */}
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                    Art Style
                                </label>
                                <input
                                    type="text"
                                    value={settings.artStyle}
                                    onChange={(e) => setSettings(s => ({ ...s, artStyle: e.target.value }))}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded p-2 text-sm text-[var(--text-primary)]"
                                    placeholder="e.g. Oil painting, cyberpunk..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                    Lighting
                                </label>
                                <input
                                    type="text"
                                    value={settings.lighting}
                                    onChange={(e) => setSettings(s => ({ ...s, lighting: e.target.value }))}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded p-2 text-sm text-[var(--text-primary)]"
                                    placeholder="e.g. Cinematic, dark, sunny..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                Additional Details
                            </label>
                            <input
                                type="text"
                                value={settings.customDetails}
                                onChange={(e) => setSettings(s => ({ ...s, customDetails: e.target.value }))}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded p-2 text-sm text-[var(--text-primary)]"
                                placeholder="e.g. Scar on left cheek, glowing blue rune sword..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-app)] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="ml-3 px-6 py-2 rounded bg-[var(--color-primary)] text-white text-sm font-bold shadow-lg hover:shadow-[var(--color-primary)]/40 transition-all hover:scale-105"
                    >
                        Copy Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <div onClick={() => onChange(!checked)} className="flex items-center gap-3 cursor-pointer group">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked
            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
            : "border-[var(--text-muted)] bg-transparent group-hover:border-[var(--text-primary)]"
            }`}>
            {checked && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`text-sm ${checked ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)]"}`}>
            {label}
        </span>
    </div>
);

function generatePrompt(character: DDBCharacter, s: PromptSettings): string {
    const parts: string[] = [];

    // 1. Subject Core
    const race = character.race?.fullName || "Humanoid";
    const cls = character.classes?.[0]?.definition?.name || "Warrior";
    const gender = character.gender || "";

    const subjectParts = [];
    if (s.includeGender && gender) subjectParts.push(gender);
    if (s.includeRace) subjectParts.push(race);
    if (s.includeClass) subjectParts.push(cls);

    if (subjectParts.length > 0) {
        parts.push(subjectParts.join(" "));
    } else {
        parts.push("Fantasy character");
    }

    // 2. Physical Details
    if (s.includeAppearance) {
        const appearance = [];
        if (character.eyes) appearance.push(`${character.eyes} eyes`);
        if (character.hair) appearance.push(`${character.hair} hair`);
        if (character.skin) appearance.push(`${character.skin} skin`);

        // Try to parse basic height to avoid "6'2"" breaking JSON or simple string flows often
        // but for a prompt builder, raw string is usually fine.

        if (appearance.length > 0) parts.push(appearance.join(", "));
    }

    // 3. Gear
    if (s.includeArmor || s.includeWeapons) {
        const gear = [];
        if (s.includeArmor) {
            const armor = character.inventory?.find(i => i.equipped && i.definition.filterType === "Armor");
            if (armor) gear.push(`wearing ${armor.definition.name}`);
            else gear.push("wearing adventurer's clothes"); // fallback
        }
        if (s.includeWeapons) {
            const weapons = character.inventory?.filter(i => i.equipped && i.definition.filterType === "Weapon").slice(0, 2);
            if (weapons && weapons.length > 0) {
                const wNames = weapons.map(w => w.definition.name).join(" and ");
                gear.push(`wielding ${wNames}`);
            }
        }
        if (gear.length > 0) parts.push(gear.join(", "));
    }

    // 4. Traits / Inner Self
    if (s.includeTraits && character.traits) {
        const t = character.traits;
        // Just grab the first sentence or so to avoid huge blobs
        if (t.personalityTraits) parts.push(`Expression showing ${t.personalityTraits.split('.')[0]}`);
    }

    // 5. Background
    if (s.includeBackground && character.background?.definition?.name) {
        parts.push(`Background element: ${character.background.definition.name}`);
    }

    // 6. Custom Details
    if (s.customDetails) parts.push(s.customDetails);

    // 7. Style & Lighting
    if (s.lighting) parts.push(s.lighting);
    if (s.artStyle) parts.push(s.artStyle);

    return parts.join(". ");
}

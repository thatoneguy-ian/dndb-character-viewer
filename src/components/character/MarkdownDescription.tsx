import { InlineRoll } from './InlineRoll';
import { resolveDDBTags } from '../../dnd-utils';
import type { DDBCharacter } from '../../types/dnd-beyond';

interface MarkdownDescriptionProps {
    content: string;
    onRoll: (notation: string) => void;
    character?: DDBCharacter | null;
    name?: string;
}

export const MarkdownDescription = ({ content, onRoll, character, name }: MarkdownDescriptionProps) => {
    if (!content) return null;

    // Resolve DDB placeholder tags first
    const resolvedContent = character ? resolveDDBTags(content, character, name) : content;

    // Regex for dice notation (e.g. 1d20, 2d6+4, d8 + 1)
    const diceRegex = /(\b\d*d\d+(?:\s*[+-]\s*\d+)?\b)/gi;

    // Split by the regex but keep the matches
    const parts = resolvedContent.split(diceRegex);

    return (
        <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
            {parts.map((part, index) => {
                if (part.match(diceRegex)) {
                    return <InlineRoll key={index} notation={part} onRoll={onRoll} />;
                }
                // Handle simple HTML tags (like <p>, <br>, <strong>) or just return text
                // Since this is used for snippets/descriptions which might have basic HTML
                return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
            })}
        </div>
    );
};

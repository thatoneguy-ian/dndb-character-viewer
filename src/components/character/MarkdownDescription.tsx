import { InlineRoll } from './InlineRoll';

interface MarkdownDescriptionProps {
    content: string;
    onRoll: (notation: string) => void;
}

export const MarkdownDescription = ({ content, onRoll }: MarkdownDescriptionProps) => {
    if (!content) return null;

    // Regex for dice notation (e.g. 1d20, 2d6+4, d8 + 1)
    const diceRegex = /(\b\d*d\d+(?:\s*[+-]\s*\d+)?\b)/gi;

    // Split by the regex but keep the matches
    const parts = content.split(diceRegex);

    return (
        <div className="text-gray-400 text-xs leading-relaxed">
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

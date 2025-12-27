// HighlightText utility component
// Highlights search terms within text content

function HighlightText({ text, highlight }) {
    if (!highlight || !text) return text;

    // Escape special regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
        const escapedHighlight = escapeRegex(highlight.trim());
        const regex = new RegExp(`(${escapedHighlight})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (part.toLowerCase() === highlight.toLowerCase()) {
                return (
                    <mark key={index} className="search-highlight">
                        {part}
                    </mark>
                );
            }
            return part;
        });
    } catch (error) {
        console.error('Error highlighting text:', error);
        return text;
    }
}

export default HighlightText;

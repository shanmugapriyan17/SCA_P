import { SEARCHABLE_CONTENT } from '../data/searchIndex';

// Search content across the entire website
export function searchContent(query) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    const queryWords = lowerQuery.split(/\s+/);

    // Filter and score results
    const results = SEARCHABLE_CONTENT
        .map(item => {
            const relevance = calculateRelevance(item, lowerQuery, queryWords);
            if (relevance === 0) return null;

            return {
                ...item,
                snippet: getSnippet(item.content, lowerQuery),
                relevance
            };
        })
        .filter(item => item !== null)
        .sort((a, b) => b.relevance - a.relevance);

    return results;
}

// Calculate relevance score for a search result
function calculateRelevance(item, query, queryWords) {
    let score = 0;

    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();
    const sectionLower = item.section.toLowerCase();
    const keywordsLower = item.keywords.map(k => k.toLowerCase());
    const routeLower = item.route.toLowerCase();

    // Exact phrase match in title (highest priority)
    if (titleLower.includes(query)) {
        score += 100;
    }

    // Exact phrase match in keywords
    if (keywordsLower.some(keyword => keyword === query)) {
        score += 80;
    }

    // Exact phrase match in content
    if (contentLower.includes(query)) {
        score += 50;
    }

    // Individual word matches
    queryWords.forEach(word => {
        if (titleLower.includes(word)) score += 10;
        if (keywordsLower.some(keyword => keyword.includes(word))) score += 8;
        if (contentLower.includes(word)) score += 5;
        if (sectionLower.includes(word)) score += 3;
    });

    // PRIORITY BOOST: Main pages (simpler routes) rank higher
    // Routes without query params or with fewer path segments rank higher
    if (!routeLower.includes('?') && !routeLower.includes('#')) {
        score += 50; // Main page boost
    } else if (routeLower.includes('?tab=')) {
        score += 20; // Tab pages get moderate boost
    }

    // Shorter routes = main pages = higher priority
    const routeComplexity = (routeLower.match(/[?&#]/g) || []).length;
    score -= routeComplexity * 10;

    return score;
}

// Extract a snippet around the search term
export function getSnippet(content, query, maxLength = 150) {
    const lowerContent = content.toLowerCase();
    const queryIndex = lowerContent.indexOf(query.toLowerCase());

    if (queryIndex === -1) {
        // If exact query not found, return start of content
        return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Calculate start and end positions
    const halfLength = Math.floor(maxLength / 2);
    let start = Math.max(0, queryIndex - halfLength);
    let end = Math.min(content.length, queryIndex + query.length + halfLength);

    // Adjust to word boundaries
    if (start > 0) {
        const spaceIndex = content.lastIndexOf(' ', start);
        if (spaceIndex !== -1 && queryIndex - spaceIndex < maxLength) {
            start = spaceIndex + 1;
        }
    }

    if (end < content.length) {
        const spaceIndex = content.indexOf(' ', end);
        if (spaceIndex !== -1 && spaceIndex - queryIndex < maxLength) {
            end = spaceIndex;
        }
    }

    let snippet = content.substring(start, end);

    // Add ellipsis
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
}

// Get search suggestions based on partial query
export function getSearchSuggestions(partialQuery, maxSuggestions = 5) {
    if (!partialQuery || partialQuery.trim().length < 2) {
        return [];
    }

    const lowerQuery = partialQuery.toLowerCase().trim();
    const suggestions = new Set();

    // Collect matching keywords
    SEARCHABLE_CONTENT.forEach(item => {
        item.keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(lowerQuery)) {
                suggestions.add(keyword);
            }
        });
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
}

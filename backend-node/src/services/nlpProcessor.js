/**
 * NLP Processor — Module 1: Resume Skill Extraction using NLP
 * 
 * Provides:
 * - Tokenization
 * - Stopword Removal
 * - Lemmatization / Stemming
 * - N-gram detection (multi-word skills)
 * - TF-IDF weight computation
 */

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;

// Default English stopwords + custom resume stopwords
const STOPWORDS = new Set([
    ...natural.stopwords,
    // Resume-specific stopwords
    'experience', 'years', 'year', 'work', 'worked', 'working',
    'company', 'team', 'project', 'projects', 'role', 'responsible',
    'including', 'using', 'various', 'multiple', 'skills', 'skill',
    'knowledge', 'proficiency', 'proficient', 'expertise', 'expert',
    'familiar', 'familiarity', 'understanding', 'ability', 'able',
    'strong', 'excellent', 'good', 'great', 'well', 'highly',
    'developed', 'created', 'built', 'designed', 'implemented',
    'managed', 'led', 'lead', 'oversaw', 'maintained', 'improved',
    'utilized', 'leveraged', 'employed', 'applied', 'used',
    'education', 'university', 'college', 'degree', 'bachelor',
    'master', 'gpa', 'graduation', 'graduated', 'certification',
    'certified', 'professional', 'resume', 'curriculum', 'vitae',
    'name', 'email', 'phone', 'address', 'city', 'state', 'zip',
    'also', 'etc', 'e.g', 'i.e', 'would', 'could', 'should',
    'may', 'might', 'must', 'shall', 'need', 'want', 'like'
]);

/**
 * Tokenize text into individual words
 * @param {string} text - Input text
 * @returns {string[]} Array of tokens
 */
function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return tokenizer.tokenize(text.toLowerCase());
}

/**
 * Remove stopwords from tokens
 * @param {string[]} tokens - Array of tokens
 * @returns {string[]} Filtered tokens
 */
function removeStopwords(tokens) {
    return tokens.filter(token => {
        return token.length > 1 && !STOPWORDS.has(token);
    });
}

/**
 * Stem tokens using Porter Stemmer
 * @param {string[]} tokens - Array of tokens
 * @returns {string[]} Stemmed tokens
 */
function stemTokens(tokens) {
    return tokens.map(token => stemmer.stem(token));
}

/**
 * Generate n-grams from tokens (for multi-word skill detection)
 * @param {string[]} tokens - Array of tokens
 * @param {number} n - N-gram size (2 or 3)
 * @returns {string[]} Array of n-grams
 */
function generateNgrams(tokens, n = 2) {
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
}

/**
 * Full NLP preprocessing pipeline
 * @param {string} text - Raw resume text
 * @returns {Object} Processed text data
 */
function preprocessText(text) {
    if (!text || typeof text !== 'string') {
        return { tokens: [], cleaned: '', bigrams: [], trigrams: [] };
    }

    // Step 1: Tokenize
    const rawTokens = tokenize(text);

    // Step 2: Remove stopwords
    const filteredTokens = removeStopwords(rawTokens);

    // Step 3: Generate n-grams (from filtered tokens for skill detection)
    const bigrams = generateNgrams(filteredTokens, 2);
    const trigrams = generateNgrams(filteredTokens, 3);

    // Step 4: Stem tokens (for search/matching, not for display)
    const stemmedTokens = stemTokens(filteredTokens);

    return {
        tokens: filteredTokens,
        stemmedTokens,
        cleaned: filteredTokens.join(' '),
        bigrams,
        trigrams,
        stats: {
            original_word_count: rawTokens.length,
            after_stopword_removal: filteredTokens.length,
            bigram_count: bigrams.length,
            trigram_count: trigrams.length
        }
    };
}

/**
 * Compute TF-IDF weights for skills found in text
 * @param {string} text - Input text  
 * @param {string[]} skills - Array of extracted skill names
 * @returns {Object[]} Skills with TF-IDF weights
 */
function computeTfIdfWeights(text, skills) {
    if (!text || !skills || skills.length === 0) return [];

    const tfidf = new TfIdf();
    tfidf.addDocument(text.toLowerCase());

    return skills.map(skill => {
        const terms = skill.toLowerCase().split(/\s+/);
        // Average TF-IDF across terms in a multi-word skill
        let totalWeight = 0;
        terms.forEach(term => {
            tfidf.tfidfs(term, (i, measure) => {
                totalWeight += measure;
            });
        });
        const avgWeight = totalWeight / terms.length;

        return {
            skill,
            tfidf_weight: Math.round(avgWeight * 1000) / 1000
        };
    }).sort((a, b) => b.tfidf_weight - a.tfidf_weight);
}

module.exports = {
    tokenize,
    removeStopwords,
    stemTokens,
    generateNgrams,
    preprocessText,
    computeTfIdfWeights,
    STOPWORDS
};

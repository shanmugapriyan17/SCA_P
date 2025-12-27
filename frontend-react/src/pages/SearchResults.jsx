import { useSearchParams } from 'react-router-dom';
import Header from '../components/Common/Header';
import SearchResultCard from '../components/Search/SearchResultCard';
import { searchContent } from '../utils/searchUtils';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const results = searchContent(query);

    return (
        <>
            <Header />
            <main className="main">
                <div className="search-results-page">
                    <div className="search-results-header">
                        <h1>Search Results</h1>
                        {query && (
                            <>
                                <p className="search-query">
                                    Results for: <strong>"{query}"</strong>
                                </p>
                                <p className="search-count">
                                    {results.length} {results.length === 1 ? 'result' : 'results'} found
                                </p>
                            </>
                        )}
                        {!query && (
                            <p className="search-empty">Please enter a search query.</p>
                        )}
                    </div>

                    <div className="search-results-container">
                        {results.length > 0 ? (
                            results.map((result) => (
                                <SearchResultCard
                                    key={result.id}
                                    result={result}
                                    query={query}
                                />
                            ))
                        ) : query && (
                            <div className="no-results">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <h3>No results found</h3>
                                <p>Try different keywords or check your spelling.</p>
                                <div className="search-tips">
                                    <h4>Search tips:</h4>
                                    <ul>
                                        <li>Try broader keywords like "about" or "resume"</li>
                                        <li>Check for typos in your search</li>
                                        <li>Use simpler search terms</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

export default SearchResults;

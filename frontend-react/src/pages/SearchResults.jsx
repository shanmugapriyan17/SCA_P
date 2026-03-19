import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Common/Header';
import SearchResultCard from '../components/Search/SearchResultCard';
import { searchContent } from '../utils/searchUtils';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const results = searchContent(query);

    return (
        <div className="min-h-screen bg-off-white font-body selection:bg-primary/20 selection:text-primary">
            <Header />

            <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Results</h1>
                    {query ? (
                        <p className="text-slate-600">
                            Found <span className="font-bold text-primary">{results.length}</span> results for <span className="font-bold text-slate-800">"{query}"</span>
                        </p>
                    ) : (
                        <p className="text-slate-500">Enter a search term to find content.</p>
                    )}
                </div>

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((result) => (
                            <Link key={result.id} to={result.url} className="group block h-full">
                                <div className="white-card p-6 h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                                            {result.type}
                                        </span>
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">arrow_outward</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{result.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3">{result.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No results found</h3>
                        <p className="text-text-muted mb-6">We couldn't find any matches for "{query}".</p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold w-full mb-1">Try searching for:</span>
                            {['Resume', 'Career', 'Analyse', 'Skills', 'Mentor'].map(tag => (
                                <Link key={tag} to={`/search?q=${tag}`} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white hover:border-primary hover:text-primary transition-all">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SearchResults;

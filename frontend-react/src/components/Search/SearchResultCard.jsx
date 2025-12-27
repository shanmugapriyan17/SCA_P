import { useNavigate } from 'react-router-dom';
import HighlightText from '../../utils/HighlightText';

function SearchResultCard({ result, query }) {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navigate to the page with query parameter for highlighting
        navigate(`${result.route}?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="search-result-card" onClick={handleClick}>
            <div className="result-section">{result.section}</div>
            <h3 className="result-title">
                <HighlightText text={result.title} highlight={query} />
            </h3>
            <p className="result-snippet">
                <HighlightText text={result.snippet} highlight={query} />
            </p>
            <div className="result-footer">
                <span className="result-route">{result.route}</span>
            </div>
        </div>
    );
}

export default SearchResultCard;

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Custom hook to handle search highlighting from URL parameters
function useSearchHighlight() {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q');

    useEffect(() => {
        if (searchTerm) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                // Find all highlighted elements
                const highlights = document.querySelectorAll('.search-highlight');

                if (highlights.length > 0) {
                    // Scroll to first highlight
                    highlights[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    // Add flash animation
                    highlights[0].classList.add('search-highlight-flash');
                    setTimeout(() => {
                        highlights[0].classList.remove('search-highlight-flash');
                    }, 2000);
                }
            }, 300);
        }
    }, [searchTerm]);

    return searchTerm;
}

export default useSearchHighlight;

import { useEffect, useRef } from 'react';

/**
 * CustomCursor — Small black dot that tracks the mouse exactly.
 * Native cursor is hidden; only the dot is shown.
 */
function CustomCursor() {
    const dotRef = useRef(null);

    useEffect(() => {
        const dot = dotRef.current;
        if (!dot) return;

        // Move dot instantly with mouse
        const onMouseMove = (e) => {
            if (dot.style.opacity === '0') dot.style.opacity = '1';
            dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        };

        // Hide dot when leaving window
        const onMouseOut = (e) => {
            if (!e.relatedTarget) {
                dot.style.opacity = '0';
            }
        };

        // Scale dot on hover
        const onMouseEnter = () => { dot.style.width = '12px'; dot.style.height = '12px'; };
        const onMouseLeave = () => { dot.style.width = '8px'; dot.style.height = '8px'; };

        const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, [tabindex]';
        const addListeners = (el) => {
            el.addEventListener('mouseenter', onMouseEnter);
            el.addEventListener('mouseleave', onMouseLeave);
        };
        const removeListeners = (el) => {
            el.removeEventListener('mouseenter', onMouseEnter);
            el.removeEventListener('mouseleave', onMouseLeave);
        };

        // Observe DOM changes so new elements also get listeners
        const attachAll = () => {
            document.querySelectorAll(interactiveSelector).forEach(addListeners);
        };
        attachAll();

        const observer = new MutationObserver(attachAll);
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseout', onMouseOut);

        // Hide native cursor
        document.documentElement.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseout', onMouseOut);
            observer.disconnect();
            document.querySelectorAll(interactiveSelector).forEach(removeListeners);
            document.documentElement.style.cursor = '';
        };
    }, []);

    return (
        <>
            {/* Dot — follows mouse instantly */}
            <div
                ref={dotRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#000',
                    pointerEvents: 'none',
                    zIndex: 100000,
                    opacity: 0, /* hidden until first move */
                    transition: 'width 0.15s ease, height 0.15s ease, opacity 0.2s ease',
                    willChange: 'transform, opacity',
                }}
            />
        </>
    );
}

export default CustomCursor;

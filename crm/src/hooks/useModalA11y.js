import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Shared modal accessibility behavior: Escape closes it, Tab is trapped inside
// it, and focus returns to whatever triggered it on close. onClose is read
// through a ref so a parent re-render with a new inline callback can't
// re-trigger the initial-focus step and steal focus from whatever the user
// is currently interacting with inside the modal.
//
// `enabled` defaults to true for modals that mount/unmount as a whole (their
// own component instance appears/disappears, so the effect's mount/unmount
// already lines up with open/close). Pass `enabled` explicitly for an overlay
// nested inside an always-mounted parent (e.g. a toggled drawer) so the effect
// re-runs when it opens/closes instead of only once at the parent's mount.
export function useModalA11y(containerRef, onClose, enabled = true) {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!enabled) return;
        const previouslyFocused = document.activeElement;
        const container = containerRef.current;
        const getFocusable = () => (container ? container.querySelectorAll(FOCUSABLE_SELECTOR) : []);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCloseRef.current();
                return;
            }
            if (e.key === 'Tab') {
                const focusable = getFocusable();
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const initial = getFocusable()[0];
        if (initial) initial.focus();
        else if (container) container.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                previouslyFocused.focus();
            }
        };
    }, [containerRef, enabled]);
}

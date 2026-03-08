'use client';

import { useCallback, useRef, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollAnimationOptions = {}
): { ref: RefObject<T | null>; isVisible: boolean } {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const ref = useRef<T | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Use a callback ref via ref setter to detect when the DOM element is attached/detached.
    // This ensures the IntersectionObserver is created when the element actually
    // appears in the DOM, even if it renders after an async data load.
    const setRef = useCallback(
        (node: T | null) => {
            // Clean up previous observer
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            // Update the ref
            ref.current = node;

            if (!node) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce) {
                            observer.unobserve(node);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                },
                { threshold, rootMargin }
            );

            observer.observe(node);
            observerRef.current = observer;
        },
        [threshold, rootMargin, triggerOnce]
    );

    // We return an object that looks like { ref, isVisible } but the "ref" is
    // actually the callback ref disguised as a RefObject for API compatibility.
    // React accepts both callback refs and RefObjects in the ref prop.
    return { ref: setRef as unknown as RefObject<T | null>, isVisible };
}

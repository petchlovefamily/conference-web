'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollAnimationOptions = {}
): { ref: (node: T | null) => void; isVisible: boolean } {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const ref = (node: T | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (node) {
            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce && observerRef.current) {
                            observerRef.current.disconnect();
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                },
                { threshold, rootMargin }
            );

            observerRef.current.observe(node);
        }
    };

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return { ref, isVisible };
}

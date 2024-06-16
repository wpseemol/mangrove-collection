'use client';

import { useEffect, useRef } from 'react';

export default function ForAnimate({
    tagName,
    children,
    className,
    animateClassName,
}) {
    const animatedElementRef = useRef(null);

    useEffect(() => {
        const elementRef = animatedElementRef.current;
        const sanitizeAnimateClassName = animateClassName?.trim();

        if (!elementRef || !sanitizeAnimateClassName) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Add animation class when element is in view if not already added
                        if (
                            !entry.target.classList.contains(
                                sanitizeAnimateClassName
                            )
                        ) {
                            entry.target.classList.add(
                                sanitizeAnimateClassName
                            );
                        }
                    } else {
                        setTimeout(() => {
                            entry.target.classList.remove(
                                sanitizeAnimateClassName
                            );
                        }, 1500);
                    }
                });
            },
            {
                threshold: 0.8, // Adjust as needed
            }
        );

        observer.observe(elementRef);

        return () => {
            observer.disconnect();
        };
    }, [animateClassName]);

    switch (tagName) {
        case 'h2':
            return (
                <h2 className={className} ref={animatedElementRef}>
                    {children}
                </h2>
            );
        case 'p':
            return (
                <p className={className} ref={animatedElementRef}>
                    {children}
                </p>
            );
        case 'section':
            return (
                <section className={className} ref={animatedElementRef}>
                    {children}
                </section>
            );
        case 'li':
            return (
                <section className={className} ref={animatedElementRef}>
                    {children}
                </section>
            );

        default:
            return (
                <div className={className} ref={animatedElementRef}>
                    {children}
                </div>
            );
    }
}

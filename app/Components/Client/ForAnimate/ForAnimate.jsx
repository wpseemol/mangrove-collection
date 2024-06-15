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

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Add animation class when element is in view

                        if (
                            entry.target.className.includes(
                                sanitizeAnimateClassName
                            )
                        ) {
                            setTimeout(() => {
                                entry.target.classList.toggle(
                                    sanitizeAnimateClassName
                                );
                            }, 5000);
                        } else {
                            entry.target.classList.add(
                                sanitizeAnimateClassName
                            );
                        }
                    } else {
                        // Remove animation class when element is out of view
                        entry.target.classList.remove(sanitizeAnimateClassName);
                    }
                });
            },
            {
                threshold: 0.3, // Adjust as needed
            }
        );

        if (elementRef) {
            observer.observe(elementRef);
        }

        return () => {
            if (elementRef) {
                observer.unobserve(elementRef);
            }
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

"use client";
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';

export default function FullScreenWraper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [showFixed, setShowFixed] = React.useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowFixed(scrollTop > 120);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        `${showFixed ? "shadow-2xs bg-black/90 animate-duration-700 animate-fade-down fixed top-0 left-0 w-full z-50" : "bg-black"}`,
        className
      )}
    >
      {children}
    </div>

  );
}

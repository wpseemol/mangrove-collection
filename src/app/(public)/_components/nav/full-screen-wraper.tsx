"use client";
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
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
    <AnimatePresence>
      <motion.div
        initial={false}
        animate={{
          position: showFixed ? "fixed" : "relative",
          top: showFixed ? 0 : undefined,
          left: showFixed ? 0 : undefined,
          width: showFixed ? "100%" : undefined,
          zIndex: showFixed ? 30 : undefined,
        }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
        className={cn(
          `transition-all duration-500 ${showFixed ? "shadow-2xs bg-black/85 animate-fade-down" : "bg-black"}`,
          className
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

'use client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FaBars, FaX } from 'react-icons/fa6';

export default function MenuBtn({ children }: { children: React.ReactNode }) {
    const [menuShow, setMenuShow] = useState(false);
    const drawerRef = useRef<HTMLLIElement>(null);

    function handleHiddenDrawer(event: MouseEvent) {
        if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
            setMenuShow(false);
        }
    }

    useEffect(() => {
        if (menuShow) {
            document.addEventListener('mousedown', handleHiddenDrawer);
        }
        return () => {
            document.removeEventListener('mousedown', handleHiddenDrawer);
        };
    }, [menuShow]);

    return (
        <li className="relative" ref={drawerRef}>
            <Button
               
                className="text-neutral-100 text-2xl bg-transparent p-0 py-0 relative z-50"
                onClick={() => {
                    setMenuShow((prev) => !prev);

                   
                }}
            >
                {menuShow ? <FaX /> : <FaBars />}
            </Button>

            <AnimatePresence>
                {menuShow && (
                    <motion.ul
                        
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            type: 'tween',
                            duration: 0.3,
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="absolute top-[3rem] z-40 -left-7 border rounded-sm text-xl font-normal text-secondary-foreground sm:min-w-[calc(100vw-8rem)] min-w-[calc(100vw-5rem)] min-h-[calc(100vh-4.8rem)] bg-gray-100 dark:bg-slate-900 overflow-y-auto"
                    >
                        {children}
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
}
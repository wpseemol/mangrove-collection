'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FaBars, FaX } from 'react-icons/fa6';

export default function MenuBtn({ children }: { children: React.ReactNode }) {
    const [menuShow, setMenuShow] = useState<MenuShowState>({
        animation: false,
        status: false,
    });

    const drawerRef = useRef<HTMLUListElement>(null);

    function handleHiddenDrawer(event: MouseEvent) {
        if (
            drawerRef.current &&
            !drawerRef.current.contains(event.target as Node)
        ) {
            setMenuShow({
                animation: false,
                status: true,
            });
        }
    }

    useEffect(() => {
        if (menuShow.animation) {
            document.addEventListener('mousedown', handleHiddenDrawer);
        }

        return () => {
            document.removeEventListener('mousedown', handleHiddenDrawer);
        };
    }, [menuShow.animation]);

    return (
        <li className={`relative`}>
            {/* open button  */}
            <Button
                className=" text-neutral-100 text-2xl bg-transparent p-0 py-0 relative z-50"
                onClick={() => {
                    if (buttonClickStatus) {
                        setMenuShow({
                            animation: true,
                            status: true,
                        });
                        buttonClickStatus = false;
                    } else {
                        setMenuShow({
                            animation: false,
                            status: true,
                        });
                        buttonClickStatus = true;
                    }
                }}>
                {menuShow.animation ? <FaX /> : <FaBars />}
            </Button>
            {menuShow.status && (
                <motion.ul
                    ref={drawerRef}
                    initial={{ x: '-100%' }}
                    animate={{ x: menuShow.animation ? 0 : '-100%' }}
                    transition={{
                        type: 'tween',
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1], // Custom ease curve for a smooth animation
                    }}
                    className={`absolute top-[3.5rem] z-40 -left-7 border rounded-sm text-xl font-normal text-secondary-foreground sm:min-w-[calc(100vw-8rem)] min-w-[calc(100vw-5rem)] min-h-[calc(100vh-4.8rem)] bg-gray-100 dark:bg-slate-900 `}
                    onAnimationComplete={() => {
                        if (!menuShow.animation) {
                            setMenuShow({
                                animation: false,
                                status: false,
                            });

                            buttonClickStatus = true;
                        }
                    }}>
                    {children}
                </motion.ul>
            )}
        </li>
    );
}

interface MenuShowState {
    animation: boolean;
    status: boolean;
}

/**
 * button click status
 */
let buttonClickStatus = true;

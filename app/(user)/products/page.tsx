'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function ProductPage() {
    const { scrollY } = useScroll();

    const x = useTransform(scrollY, [0, 1000], [0, -1000]);

    return (
        <span className="overflow-hidden w-full">
            <motion.h2
                style={{ x }}
                className="text-[30vw] text-nowrap hover:-translate-x-full duration-1000 block">
                {' '}
                Product pages{' '}
            </motion.h2>
        </span>
    );
}

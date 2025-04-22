"use client"
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CustoNotFoundPage() {
    return (
        <main className="flex items-center justify-center h-screen bg-gray-900">
            <div className="text-center">
                <motion.h1
                    className="text-9xl font-extrabold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    404
                </motion.h1>
                <motion.p
                    className="mt-4 text-xl text-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Oops! The page you&apos;re looking for doesn&apos;t exist.
                </motion.p>
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link
                        href="/"
                        className="px-6 py-3 text-lg font-medium text-white bg-primary-foreground  rounded-lg hover:bg-primary-foreground/80"
                    >
                        Go Back Home
                    </Link>
                </motion.div>
            </div>
        </main>
    );
};


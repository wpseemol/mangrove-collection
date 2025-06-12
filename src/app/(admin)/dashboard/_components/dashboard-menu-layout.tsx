'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { useState } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { IoCloseOutline } from 'react-icons/io5';
import { RiMenu2Line } from 'react-icons/ri';
import DashboardLogout from './dashboard-logout';
import DashboardMenu from './dashboard-menu';
import DashboardSiteLogo from './dashboard-site-logo';

export default function DashboardMenuLayout({
    children,
    userMenu = null,
}: Readonly<{
    children: React.ReactNode;
    userMenu?: React.ReactNode | null;
}>) {
    const [isDryerClose, setIsDryerClose] = useState<boolean>(false);

    return (
        <>
            <div>
                {/* site Dryer */}
                <nav
                    className={`${
                        isDryerClose
                            ? 'md:w-20 sm:w-64 w-screen origin-left'
                            : 'md:w-64 w-0 origin-left'
                    } fixed top-0 left-0  z-20 min-h-screen
            bg-[#111c43] dark:bg-neutral-800 dark:border-[#313335] 
            sm:border-r duration-300 overflow-x-hidden overflow-y-auto 
            text-neutral-300 `}>
                    <div
                        className="h-16 border-b dark:border-[#313335] border-[#2c3658]
                     items-center justify-center md:flex hidden">
                        {/* site logo here */}
                        <DashboardSiteLogo isDryerClose={isDryerClose} />
                    </div>

                    {/* Dryer menu section mobile screen */}

                    <div
                        className="md:hidden relative h-16 dark:border-[#313335] border-[#2c3658]
                     border-b flex items-center justify-center text-neutral-300 text-xl font-bold">
                        {/* site logo here mobile view*/}
                        <DashboardSiteLogo isDryerClose={isDryerClose} />
                        <div
                            onClick={() => setIsDryerClose((isTrue) => !isTrue)}
                            className="absolute text-3xl top-0 right-0 bg-primary p-4">
                            <IoCloseOutline />
                        </div>
                    </div>

                    <div className="px-2 py-4 flex flex-col md:items-center md:pl-0 pl-5 h-[calc(100vh-8rem)] overflow-x-hidden overflow-y-auto">
                        {/* dashboard menu here */}
                        <DashboardMenu isDryerClose={isDryerClose} />
                    </div>
                    {/* log out btn */}
                    <DashboardLogout isDryerClose={isDryerClose} />
                </nav>
                {/* top navbar Dashboard */}
                <header
                    className={`${
                        isDryerClose
                            ? 'md:w-[calc(100%-5rem)] w-full origin-right'
                            : 'md:w-[calc(100%-16rem)] w-full origin-left'
                    } fixed top-0 right-0 z-10  h-16 dark:bg-neutral-800 bg-white dark:border-[#313335] dark:border-b dark:border-l shadow-lg dark:shadow-none duration-300`}>
                    <nav className="flex items-center justify-between h-full dark:text-[#9c9d9e]">
                        <div className="text-2xl ml-2 dark:text-[#a3a4a5]">
                            <button
                                onClick={() => {
                                    setIsDryerClose((isTrue) => !isTrue);
                                }}>
                                {isDryerClose ? (
                                    <>
                                        <IoCloseOutline />

                                        <div
                                            onClick={() => {
                                                setIsDryerClose(false);
                                            }}
                                            className="md:hidden block fixed top-0 left-0 w-screen h-screen"></div>
                                    </>
                                ) : (
                                    <RiMenu2Line />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mr-2">
                            <div className=" ">
                                {' '}
                                <ModeToggle />{' '}
                            </div>

                            {/* user detels  */}

                            {userMenu ? (
                                userMenu
                            ) : (
                                <span className="px-10">
                                    <ImSpinner9 className="animate-spin text-2xl" />
                                </span>
                            )}
                        </div>
                    </nav>
                </header>
                <div
                    className={`${
                        isDryerClose
                            ? 'md:w-[calc(100%-5rem)] w-full origin-right'
                            : 'md:w-[calc(100%-16rem)] w-full origin-left'
                    } fixed top-0 right-0 ml-auto h-16 duration-300`}></div>

                <div
                    className={`${
                        isDryerClose
                            ? 'md:w-[calc(100%-5rem)] w-full origin-right'
                            : 'md:w-[calc(100%-16rem)] w-full origin-left'
                    } ml-auto h-16 duration-300`}></div>

                {/* main data section */}
                <main
                    className={`${
                        isDryerClose
                            ? 'md:w-[calc(100%-5rem)] w-full origin-right'
                            : 'md:w-[calc(100%-16rem)] w-full origin-left'
                    } duration-300
                 dark:text-neutral-300 text-neutral-700 ml-auto
                `}>
                    {children}
                </main>
            </div>
        </>
    );
}

'use client';

import logoutAction from '@/action/logout';
import ButtonLoading from '@/components/button-loading';
import { useState } from 'react';
import { FcSynchronize } from 'react-icons/fc';
import { IoIosLogOut } from 'react-icons/io';

export default function DashboardLogout({
    isDryerClose,
}: {
    isDryerClose: boolean;
}) {
    const [loading, setLoading] = useState<boolean>(false);

    async function handelLogout() {
        setLoading(true);
        try {
            await logoutAction();
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex justify-center">
            <button
                disabled={loading}
                onClick={handelLogout}
                className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800/80 p-3 rounded font-bold hover:text-primary-foreground disabled:cursor-not-allowed">
                {loading ? (
                    <span className={`${isDryerClose ? '' : 'hidden'} `}>
                        <FcSynchronize className="text-xl animate-spin text-white" />
                    </span>
                ) : (
                    <IoIosLogOut />
                )}

                <span className={isDryerClose ? 'md:hidden block' : 'flex'}>
                    Log out{loading && <ButtonLoading />}
                </span>
            </button>
        </div>
    );
}

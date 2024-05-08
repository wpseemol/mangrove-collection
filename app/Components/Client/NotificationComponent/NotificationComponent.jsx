'use client';

import { useNotification } from '@/app/hooks';
import { useEffect, useState } from 'react';
import { FcApproval } from 'react-icons/fc';

export default function NotificationComponent() {
    const [notification, setNotification] = useNotification();

    const [showPopup, setShowPopup] = useState(true);

    console.log('console from NotificationComponent');
    let conditionClass;
    if (notification.type === 'success') {
        conditionClass = 'bg-green-400 text-white';
    }

    useEffect(() => {
        if (notification.status) {
            setShowPopup(true);
            setTimeout(() => {
                setNotification((pre) => ({
                    ...pre,
                    status: false,
                    permission: true,
                }));
                setTimeout(() => {
                    setShowPopup(false);
                }, 100);
            }, 1500);
        }
    }, [notification, setNotification]);

    return (
        <>
            {showPopup && (
                <section
                    className={`fixed right-1 top-28 z-50 bg-green-400 text-white
                        p-5 rounded-l text-base duration-300
                        ${conditionClass} ${
                        notification.status ? 'right-[1px]' : '-right-[30rem]'
                    }`}>
                    {notification.status && (
                        <div className="flex items-center gap-2">
                            <span>
                                <FcApproval />
                            </span>

                            <p>{notification?.message}</p>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}

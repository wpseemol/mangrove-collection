'use client';

import { NotificationContext } from '@/contexts';
import { useState } from 'react';

export default function NotificationProvider({ children }) {
    const [notification, setNotification] = useState({
        massage: 'Notification massage Here',
        status: false,
        permission: false,
        type: 'success',
    });
    return (
        <>
            <NotificationContext.Provider
                value={[notification, setNotification]}>
                {children}
            </NotificationContext.Provider>
        </>
    );
}

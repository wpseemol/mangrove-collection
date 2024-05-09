import { AuthContext, NotificationContext } from '@/contexts';
import { useContext } from 'react';

const useNotification = function () {
    const [notification, setNotification] = useContext(NotificationContext);

    return [notification, setNotification];
};

const useAuth = function () {
    const [auth, setAuth] = useContext(AuthContext);

    return [auth, setAuth];
};

export { useAuth, useNotification };

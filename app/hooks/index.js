import { NotificationContext } from '@/contexts';
import { useContext } from 'react';

const useNotification = function () {
    const [notification, setNotification] = useContext(NotificationContext);

    return [notification, setNotification];
};

export { useNotification };

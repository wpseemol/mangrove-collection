import { NotificationContext, VariantUpdateContext } from '@/contexts';
import { useContext } from 'react';

const useNotification = function () {
    const [notification, setNotification] = useContext(NotificationContext);

    return [notification, setNotification];
};

const useVariantUpdate = function () {
    const { variantSelectId, setVariantSelectId } =
        useContext(VariantUpdateContext);

    return { variantSelectId, setVariantSelectId };
};

export { useNotification, useVariantUpdate };

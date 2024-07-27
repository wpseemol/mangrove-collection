import {
    AuthContext,
    NotificationContext,
    VariantUpdateContext,
} from '@/contexts';
import { useContext } from 'react';

const useNotification = function () {
    const [notification, setNotification] = useContext(NotificationContext);

    return [notification, setNotification];
};

const useAuth = function () {
    const [auth, setAuth, authLoading, setAuthLoading] =
        useContext(AuthContext);

    return [auth, setAuth, authLoading, setAuthLoading];
};

const useVariantUpdate = function () {
    const { variantSelectId, setVariantSelectId } =
        useContext(VariantUpdateContext);

    return { variantSelectId, setVariantSelectId };
};

export { useAuth, useNotification, useVariantUpdate };

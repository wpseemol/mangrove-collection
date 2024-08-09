const PUBLIC_ROUTE = ['/', '/product'];

const loginAuth = ['/login', '/register'];

const apiAuthPrefix = '/api/auth';

const DEFAULT_LOGIN_REDIRECT = '/';

const adminRoutes = [
    '/dashboard',
    '/dashboard/add-product',
    '/dashboard/users',
    '/dashboard/profile',
    '/dashboard/setting',
    '/dashboard/help',
];
const creatorRoutes = [
    '/dashboard',
    '/dashboard/add-product',
    '/dashboard/profile',
    '/dashboard/help',
];

export {
    DEFAULT_LOGIN_REDIRECT,
    PUBLIC_ROUTE,
    adminRoutes,
    apiAuthPrefix,
    creatorRoutes,
    loginAuth,
};

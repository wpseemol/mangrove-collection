const PUBLIC_ROUTE = ['/', '/product'];
// this router is public route

const loginAuth = ['/login', '/register'];
// this is login router

const apiAuthPrefix = '/api/auth';
//next auth api login prefixed

const DEFAULT_REDIRECT = '/';
// default route if login
const DEFAULT_LOGIN_REDIRECT = '/login';

const adminRoutes = [
    '/dashboard',
    '/dashboard/add-product',
    '/dashboard/users',
    '/dashboard/profile',
    '/dashboard/setting',
    '/dashboard/help',
];
// those are admin router

const creatorRoutes = [
    '/dashboard',
    '/dashboard/add-product',
    '/dashboard/profile',
    '/dashboard/help',
];
//those is creator routes;

export {
    DEFAULT_LOGIN_REDIRECT,
    DEFAULT_REDIRECT,
    PUBLIC_ROUTE,
    adminRoutes,
    apiAuthPrefix,
    creatorRoutes,
    loginAuth,
};

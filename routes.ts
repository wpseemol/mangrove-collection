/**
 * An Array of routes that are used for public route
 *
 * @type {string[]}
 */
const PUBLIC_ROUTE = ['/', '/product'];

/**
 * An array of routes that are used for authentication.
 * these routes will user to login.
 * @type {string[]}
 */
const loginAuth = ['/login', '/register', '/login/error'];

/**
 * this route is for next login routes.
 * these routes will user to login.
 * @type {string}
 */
const apiAuthPrefix = '/api/auth';

/**
 * if user is login then throw user this route.
 * this is redirect route.
 * @type {string}
 */
const DEFAULT_REDIRECT = '/';

/**
 * if you are not login throw route.
 * this is redirect route.
 * @type {string}
 */
const DEFAULT_LOGIN_REDIRECT = '/login';

/**
 * Admin routes all route for only admin route.
 * @type {string[]}
 */
const adminRoutes = [
    '/dashboard',
    '/dashboard/add-product',
    '/dashboard/users',
    '/dashboard/profile',
    '/dashboard/setting',
    '/dashboard/help',
];

/**
 * Creator routes all route for only creator user.
 * throw routes.
 * @type {string[]}
 */
const creatorRoutes = [
    '/dashboard',
    '/dashboard/add-product',
    '/dashboard/profile',
    '/dashboard/help',
];

/**
 * user routes all route for only user.
 * throw routes.
 * @type {string[]}
 */
const userRoute = ['/account'];

export {
    DEFAULT_LOGIN_REDIRECT,
    DEFAULT_REDIRECT,
    PUBLIC_ROUTE,
    adminRoutes,
    apiAuthPrefix,
    creatorRoutes,
    loginAuth,
    userRoute,
};

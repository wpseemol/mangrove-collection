import mongoose from 'mongoose';

/**
 * VisitorBase interface
 *
 * This interface defines the structure of a visitor's information in the application.
 *
 * Properties:
 * - `visitorId`: A unique identifier for the visitor, which can be either a string or a MongoDB ObjectId.
 *               This could represent an authenticated user (associated with a user account)
 *               or an anonymous visitor (tracked via a session or unique identifier).
 *
 * - `isLogin`: A boolean flag indicating whether the visitor is logged in or not.
 *              `true` if the visitor is an authenticated user, `false` for anonymous visitors.
 *
 * - `visitAt`: The timestamp of the visitor's first visit. This field is useful for tracking when the visitor
 *              first interacted with the application.
 *
 * - `lastVisitAt`: The timestamp of the visitor's most recent visit. This field allows for tracking the
 *                  visitor's activity over time and can be used for analyzing returning visitors or user engagement.
 *
 * Additional Considerations:
 * - If you need to track more granular visitor behavior, consider extending this interface with fields like:
 *   - `ipAddress`: To track the visitor's IP address for geolocation or security purposes.
 *   - `userAgent`: To log the visitor's browser or device details, useful for analytics or debugging.
 *   - `pageViews`: An array or counter to track the number of pages the visitor has viewed.
 *   - `referrer`: To capture the referrer URL or source that brought the visitor to the site.
 *   - `sessionId`: To associate the visitor with a particular session, especially for anonymous users.
 */

export interface VisitorBase {
    visitorId: mongoose.Schema.Types.ObjectId | string;
    expires: Date | null;
    isLogin: boolean;
    visitAt: Date;
    lastVisitAt: Date;
}

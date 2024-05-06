const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_CONNECT_URL;
const cached = {};

export default async function mongodbConnect() {
    if (!MONGO_URI) {
        throw new Error(
            'Please define the MONGO_URI environment variable inside .env.local'
        );
    }
    if (cached.connection) {
        return cached.connection;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGO_URI, opts);
    }
    try {
        cached.connection = await cached.promise;
    } catch (e) {
        cached.promise = undefined;
        throw e;
    }
    return cached.connection;
}

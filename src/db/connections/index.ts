import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI: string = process.env.NEXT_PUBLIC_MONGODB_CONNECT_URL!;

const cached: {
    connection?: Mongoose;
    promise?: Promise<Mongoose>;
} = {};

async function connectMongoDB(): Promise<Mongoose> {
    if (!MONGODB_URI) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local'
        );
    }

    if (cached.connection) {
        return cached.connection;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }
    try {
        cached.connection = await cached.promise;
    } catch (e) {
        cached.promise = undefined;
        throw e;
    }
    return cached.connection;
}

export { connectMongoDB };

import mongoose from 'mongoose';

let mongoServer;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`Local MongoDB connection failed: ${error.message}`);
        console.warn('Attempting to use mongodb-memory-server fallback...');
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`\n======================================================`);
            console.log(`🚀 In-Memory MongoDB Connected (Fallback): ${conn.connection.host}`);
            console.log(`🔌 Connection URI: ${uri}`);
            console.log(`💡 You can open this URI in MongoDB Compass to view your data!`);
            console.log(`======================================================\n`);
        } catch (fallbackError) {
            console.error(`Fallback In-Memory MongoDB also failed: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;

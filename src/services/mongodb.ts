import mongoose from 'mongoose';

/**
 * Initialise la connexion à MongoDB
 */
export async function initMongoDB(): Promise<void> {
    const mongoUri = process.env.mongo || process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
        console.warn('⚠️  MongoDB URI not found in .env file. Homework system will not work.');
        console.warn('   Add "mongo=your_mongodb_uri" to your .env file');
        return;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('✅  Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('   Homework system will not work without MongoDB connection');
    }

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('✅  MongoDB reconnected');
    });
}

/**
 * Ferme la connexion MongoDB proprement
 */
export async function closeMongoDB(): Promise<void> {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
}

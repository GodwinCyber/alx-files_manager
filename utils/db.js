import mongodb from 'mongodb';

/**
 * Create class DBClient: DBClient should have:
 * The constructor that create a client to MongoDB:
 *      host: from the environment variable DB_HOST or default: localhost
 *      port: from environment variable DB_PORT or default: 27017
 *      database: from environment variable DB_DATABASE or default: files_manager
 */
class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        const dbUrl = `mongodb://${host}:${port}/${database}`;

        this.client = new mongodb.MongoClient(dbUrl, { useUnifiedTopology: true });
        this.isConnected = false;

        this.client.connect()
            .then(() => {
                this.isConnected = true;
                console.log('MongoDB connection successful');
            })
            .catch((err) => {
                console.error('MongoDB connection error', err.message || err.toString());
                this.isConnected = false;
            });
    }

    /**
     * Check if the client connection to MongoDB server is active
     * @returns {boolean}
     */
    isAlive() {
        return this.isConnected;
    }
    /**
     * Retrieve number of users from database
     * @returns {Promise<Number>}
     */
    async nbUsers() {
        try {
            const db = this.client.db();
            const userCollection = db.collection('users');
            return await userCollection.countDocuments();
        } catch (err) {
            console.error('Error counting users: ', err.message || err.toString());
            return 0;
        }
    }

    /**
     * Retrieve number of files from database
     * @returns {Promise<Number>}
     */
    async nbFiles() {
        try {
            const db = this.client.db();
            const fileCollection = db.collection('files');
            return await fileCollection.countDocuments();
        } catch (err) {
            console.error('Error counting files: ', err.message || err.toString());
            return 0;
        }
    }
}

const dbClient = new DBClient();
export default dbClient;

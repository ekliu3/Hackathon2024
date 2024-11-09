const { MongoClient, ServerApiVersion } = require('mongodb');

class Database {
    constructor() {
        const uri = "mongodb+srv://mjfinnegan:qNXcGnLSGJuuAYlu@cluster0.92f8a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        this.dbName = "mjfinnegan"; // Replace with your database name
    }

    async connect() {
        try {
            // No need to check isConnected; just attempt to connect
            await this.client.connect();
            console.log("Connected to MongoDB");
            return this.client.db(this.dbName);
        } catch (error) {
            console.error("Database connection error:", error);
            throw error;
        }
    }

    async close() {
        try {
            await this.client.close();
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }

    // Method to insert a document into a collection
    async insert(collectionName, document) {
        const db = await this.connect();
        const result = await db.collection(collectionName).insertOne(document);
        console.log("Inserted document:", result.insertedId);
        return result;
    }

    // Method to find documents in a collection based on a query
    async find(collectionName, query = {}) {
        const db = await this.connect();
        const documents = await db.collection(collectionName).find(query).toArray();
        return documents;
    }
}

module.exports = new Database();
// Mock MongoDB for testing
const mockMongoClient = {
    connect: jest.fn(),
    close: jest.fn(),
    db: jest.fn(() => ({
        collection: jest.fn(() => ({
            findOne: jest.fn(),
            find: jest.fn(),
            insertOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            deleteMany: jest.fn()
        }))
    }))
};

module.exports = {
    MongoClient: jest.fn(() => mockMongoClient),
    ServerApiVersion: {
        v1: '1'
    }
};

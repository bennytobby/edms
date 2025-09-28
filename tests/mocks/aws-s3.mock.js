// Mock AWS S3 for testing
const mockS3 = {
    upload: jest.fn(),
    getObject: jest.fn(),
    deleteObject: jest.fn(),
    listObjects: jest.fn()
};

const mockAWS = {
    S3: jest.fn(() => mockS3),
    config: {
        update: jest.fn()
    }
};

module.exports = mockAWS;

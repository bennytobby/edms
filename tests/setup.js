// Test setup file
const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables (if test.env exists)
const testEnvPath = path.resolve(__dirname, 'config/test.env');
if (require('fs').existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

// Set test environment variables
process.env.NODE_ENV = 'test';

// Use test-specific values if not already set
process.env.MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/edms-test';
process.env.MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'edms-test';
process.env.MONGO_FILECOLLECTION = process.env.MONGO_FILECOLLECTION || 'testFiles';
process.env.MONGO_USERCOLLECTION = process.env.MONGO_USERCOLLECTION || 'testUsers';
process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test-secret-key';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'test-bucket';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'test@example.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'test-password';

// Global test timeout
jest.setTimeout(30000);

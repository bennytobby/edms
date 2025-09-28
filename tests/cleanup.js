const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');

// Load environment variables
require('dotenv').config();

const cleanup = async () => {
    let client;

    try {
        console.log('🧹 Starting cleanup...');

        // Clean up MongoDB test data
        if (process.env.MONGO_CONNECTION_STRING) {
            client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
            await client.connect();

            const db = client.db(process.env.MONGO_DB_NAME || 'edms-test');
            const filesCollection = db.collection(process.env.MONGO_FILECOLLECTION || 'testFiles');
            const usersCollection = db.collection(process.env.MONGO_USERCOLLECTION || 'testUsers');

            // Delete test files
            const testFilesResult = await filesCollection.deleteMany({
                $or: [
                    { filename: { $regex: /^test-/ } },
                    { userid: { $regex: /^test/ } },
                    { uploadDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Last 24 hours
                ]
            });
            console.log(`🗑️  Deleted ${testFilesResult.deletedCount} test files from MongoDB`);

            // Delete test users
            const testUsersResult = await usersCollection.deleteMany({
                $or: [
                    { userid: { $regex: /^test/ } },
                    { email: { $regex: /@example\.com$/ } }
                ]
            });
            console.log(`🗑️  Deleted ${testUsersResult.deletedCount} test users from MongoDB`);
        }

        // Clean up S3 test files
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            const s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION || 'us-east-1'
            });

            const bucketName = process.env.AWS_S3_BUCKET;
            if (bucketName) {
                try {
                    const listParams = {
                        Bucket: bucketName,
                        Prefix: 'test-' // Only test files
                    };

                    const listedObjects = await s3.listObjectsV2(listParams).promise();

                    if (listedObjects.Contents.length > 0) {
                        const deleteParams = {
                            Bucket: bucketName,
                            Delete: {
                                Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
                            }
                        };

                        await s3.deleteObjects(deleteParams).promise();
                        console.log(`🗑️  Deleted ${listedObjects.Contents.length} test files from S3`);
                    }
                } catch (error) {
                    console.log('⚠️  Could not clean S3 (this is normal if using test credentials)');
                }
            }
        }

        console.log('✅ Cleanup completed successfully!');

    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
};

// Run cleanup if this file is executed directly
if (require.main === module) {
    cleanup()
        .then(() => {
            console.log('🎉 Cleanup finished!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Cleanup failed:', error);
            process.exit(1);
        });
}

module.exports = cleanup;

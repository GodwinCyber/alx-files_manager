const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const sha1 = require('sha1');

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

const uri = `mongodb://${host}:${port}/${database}`;

async function initializeDB() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(database);

    // Create users collection and insert a test user
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({});
    await usersCollection.insertOne({
      email: 'bob@dylan.com',
      password: sha1('toto1234!'),
    });

    // Create files collection and insert a test file
    const filesCollection = db.collection('files');
    await filesCollection.deleteMany({});
    await filesCollection.insertMany([
      {
        userId: ObjectId('5f1e7cda04a394508232559d'),
        name: 'myText.txt',
        type: 'file',
        isPublic: false,
        parentId: '0',
        localPath: '/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9',
      },
      {
        userId: ObjectId('5f1e7cda04a394508232559d'),
        name: 'images',
        type: 'folder',
        isPublic: false,
        parentId: '0',
      },
      {
        userId: ObjectId('5f1e7cda04a394508232559d'),
        name: 'image.png',
        type: 'image',
        isPublic: true,
        parentId: ObjectId('5f1e881cc7ba06511e683b23'),
        localPath: '/tmp/files_manager/51997b88-5c42-42c2-901e-e7f4e71bdc47',
      },
    ]);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
  }
}

initializeDB();

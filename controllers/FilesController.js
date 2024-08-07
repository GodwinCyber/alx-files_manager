import { ObjectId } from 'mongodb';
import fs from 'fs';
import Queue from 'bull';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const queue = new Queue('fileQueue');
    const token = req.header('X-Token');
    const id = await redisClient.get(`auth_${token}`);

    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(id) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const {
      name, type, data, parentId, isPublic,
    } = req.body;
    const userId = user._id;
    const acceptedTypes = ['folder', 'file', 'image'];

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !acceptedTypes.includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    if (parentId) {
      const parentFile = await dbClient.db.collection('files').findOne({
        _id: ObjectId(parentId),
        userId,
      });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const fileData = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId ? ObjectId(parentId) : 0,
    };

    if (type === 'folder') {
      const newFolder = await dbClient.db.collection('files').insertOne(fileData);
      return res.status(201).json({ id: newFolder.insertedId, ...fileData });
    }

    const relativePath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(relativePath)) {
      fs.mkdirSync(relativePath);
    }

    const identity = uuidv4();
    const localPath = `${relativePath}/${identity}`;
    try {
      fs.writeFileSync(localPath, data, 'base64');
    } catch (err) {
      return res.status(500).json({ error: 'File write error' });
    }

    const newFile = await dbClient.db.collection('files').insertOne({
      ...fileData,
      localPath,
    });

    res.status(201).json({ id: newFile.insertedId, ...fileData });

    if (type === 'image') {
      queue.add({ userId, fileId: newFile.insertedId });
    }
  }
}

export default FilesController;

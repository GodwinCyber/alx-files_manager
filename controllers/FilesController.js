import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import Queue from 'bull';
import { v4 as uuidv4 } from 'uuid';


class FileController {
    static async postUpload(req, res) {
      // Gets the user based on the token
      const queue = new Queue('fileQueue');
      const token = req.header('X-Token');
      const id = await redisClient.get(`auth_${token}`);
      if (!id) res.status(401).json({ error: 'Unauthorized' })
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(id) });
      if (!user) res.status(401).json({ error: 'Unauthorized' });
  
      const { name, type, data, parentId, isPublic } = req.body
      const userId = user._id;
      const acceptedType = ['folder', 'file', 'image'];
  
      if (!name) res.status(400).json({ error: 'Missing name' });
      if (!type || !acceptedType.includes(type)) res.status(400).json({ error: 'Missing type' });
      if (!data && type != 'folder') res.status(400).json({ error: 'Missing data' });
      if (parentId) {
        const file = await dbClient.db.collection('files').findOne({
           _id: ObjectId(parentId), userId }
          );
        if (!file) return res.status(400).json({ error: 'Parent not found' });
        if (file && file.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
      }
      const fileData = {
        userId,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId ? ObjectId(parentId) : 0,
      };
      if (type === 'folder') {
        const newFile = await dbClient.db.collection('files').insertOne({ ...fileData });
        res.status(201).json({ id: newFile.insertedId, ...fileData });
        return;
      }
  
      const relativePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(relativePath)) {
        fs.mkdirSync((relativePath));
      }
      const identity = uuidv4()
      const localPath = `${relativePath}/${identity}`;
      fs.writeFile(localPath, data, 'base64', (err) => {
        if (err) console.log(err);
      });
      const newFile = await dbClient.db.collection('files').insertOne({
        ...fileData,
        localPath: localPath,
      });
      res.status(201).json({ id: newFile.insertedId, ...fileData });
      if (type === 'image') {
        queue.add({ userId, fileId: newFile.insertedId });
      }
    }
}

export default FileController;

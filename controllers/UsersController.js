import Queue from 'bull';
import sha1 from 'sha1';
import dbClient from '../utils/db';

class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const users = await dbClient.db.collection('users');
    users.findOne({ email }, async (err, result) => {
      if (result) return res.status(400).json({ error: 'Already exist' });

      const queue = new Queue('userQueue');
      const hashedPasswd = sha1(password);
      const { insertedId } = await users.insertOne({ email, password: hashedPasswd });
      const user = { id: insertedId };
      queue.add({ userId: insertedId });
      return res.status(201).json(user);
    });
  }
}

export default UserController;

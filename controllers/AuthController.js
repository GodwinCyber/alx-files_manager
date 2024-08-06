import { v4 as uuid4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
// import dbClient from '../utils/db';

// AuthController.js that contains new endpoints:
// GET /connect should sign-in the user by generating a new authentication token:
// By using the header Authorization and the technique of the Basic
// auth (Base64 of the <email>:<password>), find the user associate to this
//     email and with this password (reminder: we are storing the SHA1 of the password)
// If no user has been found, return an error Unauthorized with a status code 401
// Otherwise:
// Generate a random string (using uuidv4) as token
// Create a key: auth_<token>
// Use this key for storing in Redis (by using the redisClient create previously)
// the user ID for 24 hours
// Return this token: { "token": "155342df-2399-41da-9e8c-458b6ac52a0c" } with a status code 200
class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64'.toString('utf-8'));
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashedPassword = sha1(password);
    const user = await redisClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = uuid4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 'EX', 24 * 60 * 60); // token expire in 24hrs

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const auttokenhHeader = req.header('X-TOKEN');
    if (!auttokenhHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${auttokenhHeader}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;

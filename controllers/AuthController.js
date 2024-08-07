import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
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
      if (authHeader && authHeader.startsWith('Basic ')) {
          const token = authHeader.slice(6);
          const decodedCredentials = Buffer.from(token, 'base64').toString('utf-8');
          const userInfo = decodedCredentials.split(':');
          if (!userInfo || userInfo.length !== 2) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
  
          const [ email, password ] = userInfo;
          const user = await dbClient.db.collection('users').findOne({ email: email, password: sha1(password) });
          if (!user) return res.status(401).json({ error: 'Unauthorized' });
          else {
            const authToken = uuidv4();
            const authKey = `auth_${authToken}`;
            // set the key to expire in 24hrs
            await redisClient.set(authKey, user._id.toString(), 24 * 60 * 60);
            return res.status(200).json({ token: authToken });
          }
      }
    }
  
    static async getDisconnect(req, res) {
      const token = req.header('X-Token');
      const id = await redisClient.get(`auth_${token}`);
      if (id) {
        const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(id) });
        if (user) {
          await redisClient.del(`auth_${token}`);
          return res.status(204).send();
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
  }
  
  export default AuthController;

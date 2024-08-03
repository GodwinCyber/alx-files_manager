import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Create a file that contains the class RedisClient.
 * RedisClient should have:
 *      The constructor that creates a client to Redis:
 * Error:
 *      any error of the redis client must be displayed in
 *      the console (you should use on('error') of the redis client)
 */
class RedisClient {
  /** Create a new RedisClient instance */
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (err) => {
      console.error('Redis client fail to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /** a function isAlive that returns true when the connection to
     * Redis is a success otherwise, false
     */
  isAlive() {
    return this.isClientConnected;
  }

  /**
     * Retrieve the value of the giving key
     * @param {string} key the key of item to retrieve
     * @returns { string | object }
     */
  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (err) {
      console.error('Error getting key from Redis: ', err.message || err.toString());
      return null;
    }
  }

  /**
     * Store a key along and its value along with expiration time.
     * @param {String} key the key of the item to store.
     * @param {string | Number | Boolean} value The item to store.
     * @param {Number} duration the expiration time of the item in seconds.
     * @returns {Promise<void>}
     */
  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (err) {
      console.error('Error setting key in Redis: ', err.message || err.toString());
    }
  }

  /**
     * Removes the value of the given key
     * @param {String} key The key of the item to be removed.
     * @returns {Promise<void>}
     */
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.error('Error deleting key from Redis: ', err.message || err.toString());
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;

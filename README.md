<h1>0x04. Files manager</h1>

<strong>Back-end JavaScript ES6 NoSQL MongoDB Redis NodeJS ExpressJS Kue</strong><br>

<p>This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.</p>

<p>The objective is to build a simple platform to upload and view files:</p>

<ul>
<li>User authentication via a token </li>
<li>List all files</li>
<li>Upload a new file</li>
<li>Change permission of a file</li>
<li>View a file</li>
<li>Generate thumbnails for images</li>
</ul>

<p>You will be guided step by step for building it, but you have some freedoms of implementation, split in more files etc&hellip; (<code>utils</code> folder will be your friend)</p>

<p>Of course, this kind of service already exists in the real life - it&rsquo;s a learning purpose to assemble each piece and build a full product.</p>

<p>Enjoy!</p>

<h2>Resources</h2>

<p><strong>Read or watch</strong>:</p>

<ul>
<li><a href="https://nodejs.org/en/learn/getting-started/how-to-install-nodejs" title="Node JS getting started" target="_blank">Node JS getting started</a></li>
<li><a href="https://node.readthedocs.io/en/latest/api/process/" title="Process API doc" target="_blank">Process API doc</a></li>
<li><a href="https://expressjs.com/en/starter/installing.html" title="Express getting started" target="_blank">Express getting started</a></li>
<li><a href="Crackstation.net" title="Mocha documentation" target="_blank">Mocha documentation</a></li>
<li><a href="https://github.com/remy/nodemon#nodemon" title="Nodemon documentation" target="_blank">Nodemon documentation</a></li>
<li><a href="https://github.com/mongodb/node-mongodb-native" title="MongoDB" target="_blank">MongoDB</a></li>
<li><a href="https://github.com/OptimalBits/bull" title="Bull" target="_blank">Bull</a></li>
<li><a href="https://www.npmjs.com/package/image-thumbnail" title="Image thumbnail" target="_blank">Image thumbnail</a></li>
<li><a href="https://www.npmjs.com/package/mime-types" title="Mime-Types" target="_blank">Mime-Types</a></li>
<li><a href="https://github.com/redis/node-redis" title="Redis" target="_blank">Redis</a></li>
</ul>

<h2>Learning Objectives</h2>

<p>At the end of this project, you are expected to be able to <a href="https://fs.blog/feynman-learning-technique/w" title="explain to anyone" target="_blank">explain to anyone</a>, <strong>without the help of Google</strong>:</p>

<ul>
<li>how to create an API with Express</li>
<li>how to authenticate a user</li>
<li>how to store data in MongoDB</li>
<li>how to store temporary data in Redis</li>
<li>how to setup and use a background worker</li>
</ul>

<h2>Requirements</h2>

<ul>
<li>Allowed editors: <code>vi</code>, <code>vim</code>, <code>emacs</code>, <code>Visual Studio Code</code></li>
<li>All your files will be interpreted/compiled on Ubuntu 18.04 LTS using <code>node</code> (version 12.x.x)</li>
<li>All your files should end with a new line</li>
<li>A <code>README.md</code> file, at the root of the folder of the project, is mandatory</li>
<li>Your code should use the <code>js</code> extension</li>
<li>Your code will be verified against lint using ESLint</li>
</ul>

<h2>Provided files</h2>

<h3><code>package.json</code></h3>

<details>
<summary>Click to show/hide file contents</summary>
<pre>
<code>
{
  "name": "files_manager",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "lint": "./node_modules/.bin/eslint",
    "check-lint": "lint [0-9]*.js",
    "start-server": "nodemon --exec babel-node --presets @babel/preset-env ./server.js",
    "start-worker": "nodemon --exec babel-node --presets @babel/preset-env ./worker.js",
    "dev": "nodemon --exec babel-node --presets @babel/preset-env",
    "test": "./node_modules/.bin/mocha --require @babel/register --exit" 
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bull": "^3.16.0",
    "chai-http": "^4.3.0",
    "express": "^4.17.1",
    "image-thumbnail": "^1.0.10",
    "mime-types": "^2.1.27",
    "mongodb": "^3.5.9",
    "redis": "^2.8.0",
    "sha1": "^1.1.1",
    "uuid": "^8.2.0"
  },
  "devDependencies": {
    "@babel/cli": "^7.8.0",
    "@babel/core": "^7.8.0",
    "@babel/node": "^7.8.0",
    "@babel/preset-env": "^7.8.2",
    "@babel/register": "^7.8.0",
    "chai": "^4.2.0",
    "chai-http": "^4.3.0",
    "mocha": "^6.2.2",
    "nodemon": "^2.0.2",
    "eslint": "^6.4.0",
    "eslint-config-airbnb-base": "^14.0.0",
    "eslint-plugin-import": "^2.18.2",
    "eslint-plugin-jest": "^22.17.0",
    "request": "^2.88.0",
    "sinon": "^7.5.0"
  }
}
</code>
</pre>
</details>

<h3><code>.eslintrc.js</code></h3>

<details>
<summary>Click to show/hide file contents</summary>
<pre>
<code>
module.exports = {
    env: {
      browser: false,
      es6: true,
      jest: true,
    },
    extends: [
      'airbnb-base',
      'plugin:jest/all',
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: ['jest'],
    rules: {
      'max-classes-per-file': 'off',
      'no-underscore-dangle': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],
    },
    overrides:[
      {
        files: ['*.js'],
        excludedFiles: 'babel.config.js',
      }
    ]
};
</code>
</pre>
</details>

<h3><code>babel.config.js</code></h3>

<details>
<summary>Click to show/hide file contents</summary>
<pre>
<code>
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
};
</code>
</pre>
</details>

<h3>and&hellip;</h3>

<p>Don&rsquo;t forget to run <code>$ npm install</code> when you have the <code>package.json</code></p>

import express from 'express';
import routes from './routes/index';

const server = express();
const port = process.env.PORT || 5000;

server.use(express.json());
server.use('/', routes);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import express from 'express';
import {ENV} from '.lib/env.js';
import path from 'path';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';


dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json()); // To parse JSON payloads
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


if (ENV.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (_, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log('Server is running on port' + PORT);
  connectDB();
})


import express from 'express';
import {ENV} from './lib/env.js';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app , server} from './lib/socket.js';

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({limit:"10mb"})); // To parse JSON payloads
app.use(cors({origin: ENV.CLIENT_URL, credentials: true}));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


if (ENV.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (_, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log('Server is running on port' + PORT);
  connectDB();
})


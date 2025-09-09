import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';


import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interviews.js';
import userRoutes from './routes/users.js';
import { connectDB } from './database/mongoInit.js';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple .env files
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  console.log('💡 Please set your MongoDB Atlas connection string in .env file');
  process.exit(1);
}

console.log("✅ MONGODB_URI configured");
console.log("🌐 Environment:", process.env.NODE_ENV || 'development');

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize MongoDB database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);


// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-interview', (interviewId) => {
    socket.join(interviewId);
    socket.to(interviewId).emit('user-joined', socket.id);
  });

  socket.on('leave-interview', (interviewId) => {
    socket.leave(interviewId);
    socket.to(interviewId).emit('user-left', socket.id);
  });

  socket.on('interview-message', (data) => {
    socket.to(data.interviewId).emit('interview-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

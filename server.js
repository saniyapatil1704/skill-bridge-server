import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app); // wrap express with http
const allowedOrigins = [
  "http://localhost:5173",
  "https://skill-bridge-git-main-saniya-mahesh-patils-projects.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});


// Middleware
app.use(cors());
app.use(express.json());

// Default
app.get("/", (req, res) => {
  res.send("SkillBridge API is running");
});

// authRoute
app.use("/api/auth", authRoutes);

// Protect a route
app.use("/api/user", userRoutes);

// Match route
app.use("/api/match", matchRoutes);

// Session route
app.use("/api/session", sessionRoutes);

// get user route
app.use("/api/users", userRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error :", err));

// Socket.io setup
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Join room (for private messaging)
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Join room for user-specific notification (e.g., session alerts)
  socket.on("join", (userId) => {
    socket.join(userId); // Join personal room
    console.log(`User ${socket.id} joined user room: ${userId}`);
  });

  // Notify mentor of session request
  socket.on("notifySession", ({ mentorId, message }) => {
    io.to(mentorId).emit("sessionNotification", message);
    console.log(`Session notification sent to mentor ${mentorId}`);
  });

  // Receive and broadcast message with full object
  socket.on("sendMessage", (messageData) => {
    console.log("Message data:", messageData);
    io.to(messageData.roomId).emit("receiveMessage", messageData); // Send full object
  });

  socket.on("editMessage", ({ id, message, roomId }) => {
    io.to(roomId).emit("editMessage", {
      id,
      message,
      isEdited: true, // tell the client it's edited
    });
  });

  socket.on("deleteMessage", ({ id, roomId }) => {
    io.to(roomId).emit("deleteMessage", { id });
  });

   // Listen for the "joinedCall" event
  socket.on('joinedCall', ({ sessionId, roomName, from, to }) => {
    console.log(`${from} has joined the call in room ${roomName}`);
    
    // Emit the 'joinedCall' event to the other user
    // This assumes `to` is the other user's socket ID or identifier
    io.to(to).emit('joinedCall', { from, roomName });
  });


  socket.on("disconnect", () => {
    console.log("A user disconnected" + socket.id);
  });
});

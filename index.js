require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

// socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" }
});

// middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// routes
console.log('Loading auth routes...');
app.use("/api/auth", require("./routes/auth"));
console.log('Loading forgot-password routes...');
app.use("/api/forgot-password", require("./routes/forgotPassword"));
console.log('Loading incidents routes...');
app.use("/api/incidents", require("./routes/incidents"));
console.log('Loading volunteers routes...');
app.use("/api/volunteers", require("./routes/volunteers"));
console.log('Loading officers routes...');
app.use("/api/officers", require("./routes/officers"));
console.log('Loading donations routes...');
app.use("/api/donations", require("./routes/donations"));
console.log('Loading contacts routes...');
app.use("/api/contacts", require("./routes/contacts"));
console.log('All routes loaded');
//SINGLE INCIDENT VIEW

// db (fallback to local dev URI to avoid crashes when env is missing)
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/disaster-guardian";
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log("Mongo connected"))
  .catch(err => {
    console.error("Mongo connection error", err.message);
  });

// port
const PORT = process.env.PORT || 5000;

// start server
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

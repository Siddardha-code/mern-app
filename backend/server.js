const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet"); // Adds security headers
const rateLimit = require("express-rate-limit"); // Rate limiting
const mongoSanitize = require("express-mongo-sanitize"); // Sanitize data
require("dotenv").config();

// Import Routes
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ----------- Middleware Configuration ----------- //

// Enable CORS with specific origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Fallback URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Set security HTTP headers
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Data sanitization to prevent NoSQL injection
app.use(mongoSanitize());

// Parse JSON and URL-encoded data
app.use(express.json()); // Built-in JSON parser
app.use(express.urlencoded({ extended: true }));

// ----------- Routes Configuration ----------- //

// Routes for handling employee data
app.use("/api/employees", employeeRoutes);

// ----------- MongoDB Connection ----------- //

// Check environment variables
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in environment variables!");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");

    // Start server only if DB connection succeeds
    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Closing server.");
      server.close(() => {
        console.log("Server closed.");
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process if DB connection fails
  });

// ----------- Error Handling Middleware ----------- //

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

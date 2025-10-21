import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const httpServer = createServer(app);

import passport from "./utils/passport.js";
app.use(passport.initialize());

// Allow multiple origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
].filter(Boolean);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});

app.set("io", io);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/peerjs", peerServer);

import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import chatbotRoutes from "./routes/chat.routes.js";
import chatRouter from "./routes/chat.routes.js";
import githubRouter from "./routes/github.routes.js";
import repositoryRouter from "./routes/repository.routes.js";
import statsHistoryRouter from "./routes/statsHistory.routes.js";
import badgeRouter from "./routes/badge.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/github", githubRouter);
app.use("/api/v1/repository", repositoryRouter);
app.use("/api/v1/stats", statsHistoryRouter);
app.use("/api/v1/badges", badgeRouter);

io.on("connection", (socket) => {
  console.log(`Socket.IO client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket.IO client disconnected: ${socket.id}`);
  });
});

export { httpServer };

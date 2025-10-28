import { ReviewSession } from "../models/reviewSession.model.js";

export function setupReviewSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket.IO client connected: ${socket.id}`);

    // Join review session
    socket.on("session:join", async (data) => {
      const { sessionId, userId } = data;
      
      if (!sessionId || !userId) {
        socket.emit("error", { message: "Session ID and User ID are required" });
        return;
      }

      // Join the session room
      socket.join(sessionId);

      // Notify others in the session
      socket.to(sessionId).emit("presence:joined", {
        userId,
        socketId: socket.id,
      });

      console.log(`User ${userId} joined session ${sessionId}`);
    });

    // Leave review session
    socket.on("session:leave", async (data) => {
      const { sessionId, userId } = data;

      // Notify others in the session
      socket.to(sessionId).emit("presence:left", {
        userId,
        socketId: socket.id,
      });

      socket.leave(sessionId);
      console.log(`User ${userId} left session ${sessionId}`);
    });

    // Broadcast cursor position
    socket.on("cursor:update", (data) => {
      const { sessionId, position, userId } = data;
      
      if (!sessionId || !position) {
        return;
      }

      // Broadcast to other users in the session
      socket.to(sessionId).emit("cursor:update", {
        userId,
        position,
        socketId: socket.id,
      });
    });

    // Broadcast code selection
    socket.on("selection:update", (data) => {
      const { sessionId, selection, userId } = data;
      
      if (!sessionId || !selection) {
        return;
      }

      // Broadcast to other users in the session
      socket.to(sessionId).emit("selection:update", {
        userId,
        selection,
        socketId: socket.id,
      });
    });

    // Broadcast new annotation
    socket.on("annotation:create", (data) => {
      const { sessionId, annotation } = data;
      
      if (!sessionId || !annotation) {
        return;
      }

      // Broadcast to all users in the session (including sender)
      io.to(sessionId).emit("annotation:create", annotation);
    });

    // Broadcast annotation update
    socket.on("annotation:update", (data) => {
      const { sessionId, annotation } = data;
      
      if (!sessionId || !annotation) {
        return;
      }

      // Broadcast to all users in the session
      io.to(sessionId).emit("annotation:update", annotation);
    });

    // Broadcast annotation delete
    socket.on("annotation:delete", (data) => {
      const { sessionId, annotationId } = data;
      
      if (!sessionId || !annotationId) {
        return;
      }

      // Broadcast to all users in the session
      io.to(sessionId).emit("annotation:delete", { annotationId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket.IO client disconnected: ${socket.id}`);
    });
  });
}


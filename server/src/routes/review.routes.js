import { Router } from "express";
import {
  createReviewSession,
  getReviewSession,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  mirrorAnnotationToGitHub,
  joinReviewSession,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Session routes
router.post("/", createReviewSession);
router.get("/:id", getReviewSession);
router.post("/join/:sessionId", joinReviewSession);

// Annotation routes
router.post("/:id/annotations", createAnnotation);
router.put("/:id/annotations/:annotationId", updateAnnotation);
router.delete("/:id/annotations/:annotationId", deleteAnnotation);

// GitHub integration
router.post("/:id/mirror/:annotationId", mirrorAnnotationToGitHub);

export default router;


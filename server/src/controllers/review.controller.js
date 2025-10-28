import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ReviewSession } from "../models/reviewSession.model.js";
import { Annotation } from "../models/annotation.model.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// Helper function to parse GitHub PR URL
function parsePRUrl(prUrl) {
  const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
  if (!match) throw new ApiError(400, "Invalid GitHub PR URL");
  return {
    owner: match[1],
    repo: match[2],
    prNumber: parseInt(match[3]),
  };
}

// Create a new review session
export const createReviewSession = asyncHandler(async (req, res) => {
  const { prUrl, settings = {} } = req.body;
  const userId = req.user._id;

  if (!prUrl) {
    throw new ApiError(400, "PR URL is required");
  }

  // Parse PR URL
  const { owner, repo, prNumber } = parsePRUrl(prUrl);

  // Generate unique session ID
  const sessionId = `review_${uuidv4()}`;

  // Create session
  const session = await ReviewSession.create({
    sessionId,
    prUrl,
    owner,
    repo,
    prNumber,
    creator: userId,
    participants: [userId],
    settings: {
      allowAnonymous: settings.allowAnonymous || false,
      maxParticipants: settings.maxParticipants || 10,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, session, "Review session created successfully"));
});

// Get review session with annotations
export const getReviewSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await ReviewSession.findById(id)
    .populate("creator", "username email avatar")
    .populate("participants", "username email avatar");

  if (!session) {
    throw new ApiError(404, "Review session not found");
  }

  // Fetch annotations
  const annotations = await Annotation.find({ sessionId: session.sessionId })
    .populate("author", "username email avatar")
    .populate("parentId")
    .sort({ createdAt: 1 });

  return res.json(
    new ApiResponse(200, { session, annotations }, "Session retrieved successfully")
  );
});

// Create annotation
export const createAnnotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { filePath, lineStart, lineEnd, content, type, parentId } = req.body;
  const userId = req.user._id;

  if (!filePath || !content) {
    throw new ApiError(400, "File path and content are required");
  }

  const session = await ReviewSession.findById(id);
  if (!session) {
    throw new ApiError(404, "Review session not found");
  }

  const annotationId = `annotation_${uuidv4()}`;

  const annotation = await Annotation.create({
    sessionId: session.sessionId,
    annotationId,
    filePath,
    lineStart,
    lineEnd,
    content,
    author: userId,
    type: type || "comment",
    parentId: parentId || null,
  });

  const populatedAnnotation = await Annotation.findById(annotation._id).populate(
    "author",
    "username email avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedAnnotation, "Annotation created successfully"));
});

// Update annotation
export const updateAnnotation = asyncHandler(async (req, res) => {
  const { id, annotationId } = req.params;
  const { content, resolved } = req.body;

  const session = await ReviewSession.findById(id);
  if (!session) {
    throw new ApiError(404, "Review session not found");
  }

  const annotation = await Annotation.findOne({
    annotationId,
    sessionId: session.sessionId,
  });

  if (!annotation) {
    throw new ApiError(404, "Annotation not found");
  }

  // Check if user is the author
  if (annotation.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own annotations");
  }

  if (content) annotation.content = content;
  if (resolved !== undefined) annotation.resolved = resolved;

  await annotation.save();

  const populatedAnnotation = await Annotation.findById(annotation._id).populate(
    "author",
    "username email avatar"
  );

  return res.json(new ApiResponse(200, populatedAnnotation, "Annotation updated successfully"));
});

// Delete annotation
export const deleteAnnotation = asyncHandler(async (req, res) => {
  const { id, annotationId } = req.params;

  const session = await ReviewSession.findById(id);
  if (!session) {
    throw new ApiError(404, "Review session not found");
  }

  const annotation = await Annotation.findOne({
    annotationId,
    sessionId: session.sessionId,
  });

  if (!annotation) {
    throw new ApiError(404, "Annotation not found");
  }

  // Check if user is the author or creator of the session
  const isAuthor = annotation.author.toString() === req.user._id.toString();
  const isCreator = session.creator.toString() === req.user._id.toString();

  if (!isAuthor && !isCreator) {
    throw new ApiError(403, "You don't have permission to delete this annotation");
  }

  await Annotation.deleteOne({ _id: annotation._id });

  return res.json(new ApiResponse(200, null, "Annotation deleted successfully"));
});

// Mirror annotation to GitHub PR
export const mirrorAnnotationToGitHub = asyncHandler(async (req, res) => {
  const { id, annotationId } = req.params;

  const session = await ReviewSession.findById(id);
  if (!session) {
    throw new ApiError(404, "Review session not found");
  }

  const annotation = await Annotation.findOne({
    annotationId,
    sessionId: session.sessionId,
  });

  if (!annotation) {
    throw new ApiError(404, "Annotation not found");
  }

  if (annotation.mirroredToGitHub) {
    throw new ApiError(400, "Annotation already mirrored to GitHub");
  }

  // Post comment to GitHub PR
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new ApiError(500, "GitHub token not configured");
  }

  try {
    const githubApiUrl = `https://api.github.com/repos/${session.owner}/${session.repo}/pulls/${session.prNumber}/comments`;

    const commentData = {
      body: annotation.content,
      path: annotation.filePath,
      line: annotation.lineEnd,
      side: "RIGHT",
    };

    const response = await axios.post(githubApiUrl, commentData, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    // Update annotation with GitHub comment ID
    annotation.mirroredToGitHub = true;
    annotation.githubCommentId = response.data.id;
    await annotation.save();

    return res.json(
      new ApiResponse(200, { githubCommentId: response.data.id }, "Annotation mirrored successfully")
    );
  } catch (error) {
    throw new ApiError(500, `Failed to mirror annotation: ${error.message}`);
  }
});

// Join review session
export const joinReviewSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await ReviewSession.findOne({ sessionId });
  if (!session) {
    throw new ApiError(404, "Review session not found");
  }

  // Check if session is active
  if (session.status !== "active") {
    throw new ApiError(400, "Review session is not active");
  }

  // Check if user is already a participant
  if (!session.participants.includes(userId)) {
    // Check max participants
    if (session.participants.length >= session.settings.maxParticipants) {
      throw new ApiError(400, "Review session is full");
    }

    session.participants.push(userId);
    await session.save();
  }

  return res.json(new ApiResponse(200, session, "Joined session successfully"));
});


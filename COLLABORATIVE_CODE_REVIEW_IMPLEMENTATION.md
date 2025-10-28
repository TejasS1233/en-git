# Real-Time Collaborative Code Review Sessions - Implementation Guide

This document outlines the implementation approach for Issue #10.

## Current Status

- **Assigned to:** EclipseZoro
- **Status:** Implementation pending
- **Existing Infrastructure:**
  - ✅ Socket.IO (client & server)
  - ✅ GitHub API integration via `github.service.js`
  - ✅ Express.js server with MongoDB
  - ⚠️ Agora SDK (mentioned but not implemented)

## Implementation Phases

### Phase 1: Backend Setup

#### 1.1 Database Models

**Location:** `server/src/models/`

**ReviewSession Model:**

```javascript
{
  sessionId: String (unique),
  prUrl: String,
  owner: String,
  repo: String,
  prNumber: Number,
  creator: ObjectId (ref: User),
  participants: [ObjectId],
  createdAt: Date,
  expiresAt: Date,
  settings: {
    allowAnonymous: Boolean,
    maxParticipants: Number
  }
}
```

**Annotation Model:**

```javascript
{
  sessionId: String,
  annotationId: String (unique),
  filePath: String,
  lineStart: Number,
  lineEnd: Number,
  content: String,
  author: ObjectId (ref: User),
  type: String (enum: ['comment', 'suggestion', 'question']),
  parentId: ObjectId? (for replies),
  createdAt: Date,
  resolved: Boolean
}
```

#### 1.2 REST API Endpoints

**Location:** `server/src/controllers/review.controller.js`
**Routes:** `server/src/routes/review.routes.js`

- `POST /api/v1/reviews` - Create review session
- `GET /api/v1/reviews/:id` - Fetch session with annotations
- `POST /api/v1/reviews/:id/annotations` - Add annotation
- `PUT /api/v1/reviews/:id/annotations/:annotationId` - Update annotation
- `DELETE /api/v1/reviews/:id/annotations/:annotationId` - Delete annotation
- `POST /api/v1/reviews/:id/mirror/:annotationId` - Mirror to GitHub PR
- `GET /api/v1/agora/token` - Generate Agora RTC token

#### 1.3 Socket.IO Handlers

**Location:** `server/src/socket/review.socket.js`

Events to handle:

- `session:join` - User joins review session
- `session:leave` - User leaves session
- `cursor:update` - Broadcast cursor position
- `selection:update` - Broadcast code selection
- `annotation:create` - Broadcast new annotation
- `annotation:update` - Broadcast annotation update
- `annotation:delete` - Broadcast annotation deletion
- `presence:update` - Notify user joined/left

### Phase 2: Frontend Components

#### 2.1 Main Components

**Location:** `client/src/pages/ReviewSession.jsx`

Components needed:

1. **ReviewSession.jsx** - Main layout

   - File tree sidebar
   - Code viewer area
   - Annotations panel
   - Video/voice chat panel

2. **FileViewer.jsx** - Code display

   - Syntax highlighting (Monaco Editor or CodeMirror)
   - Line numbers
   - Diff view support
   - Inline annotation markers

3. **LiveCursorsOverlay.jsx** - Real-time cursors

   - Shows other users' cursors
   - Color-coded by user
   - Ghost cursor movement

4. **AnnotationsPanel.jsx** - Comments sidebar

   - Threaded comments
   - File filter
   - Resolve/unresolve actions
   - User avatars

5. **VideoPanel.jsx** - Agora integration
   - Video grid
   - Audio controls
   - Screen sharing option

### Phase 3: Agora Integration

#### 3.1 Install Agora SDK

```bash
cd client
npm install agora-rtc-sdk-ng
```

```bash
cd server
npm install agora-access-token
```

#### 3.2 Server Token Generation

```javascript
// server/src/controllers/agora.controller.js
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export const generateAgoraToken = asyncHandler(async (req, res) => {
  const { channel, uid } = req.query;
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  const expirationTimeInSeconds = 3600;
  const role = RtcRole.PUBLISHER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    role,
    expirationTimeInSeconds
  );

  return res.json({ token, appId });
});
```

#### 3.3 Client Implementation

```javascript
import AgoraRTC from "agora-rtc-sdk-ng";

// Initialize client
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Join channel
await client.join(appId, channel, token, uid);

// Local tracks
const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

// Publish tracks
await client.publish([localAudioTrack, localVideoTrack]);
```

### Phase 4: GitHub PR Integration

#### 4.1 Fetch PR Files

Use existing `github.service.js`:

```javascript
export async function fetchPRFiles(owner, repo, prNumber) {
  const files = await gh.get(
    `/repos/${owner}/${repo}/pulls/${prNumber}/files`,
    { headers: authHeader() }
  );
  return files.data;
}
```

#### 4.2 Post Comments to GitHub

```javascript
export async function postPRComment(owner, repo, prNumber, body, path, line) {
  await gh.post(
    `/repos/${owner}/${repo}/pulls/${prNumber}/comments`,
    {
      body,
      path,
      line,
      side: "RIGHT",
    },
    { headers: authHeader() }
  );
}
```

## Security Considerations

1. **Authentication**: Only authenticated users can create/join sessions
2. **Authorization**: Verify GitHub permissions before posting comments
3. **Input Sanitization**: Sanitize annotation text before saving
4. **Rate Limiting**: Prevent abuse of GitHub API
5. **Token Security**: Agora tokens expire after 1 hour

## Environment Variables

Add to `.env`:

```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
GITHUB_TOKEN=your_github_token
```

## Testing Strategy

1. **Unit Tests**: Test annotation CRUD operations
2. **Integration Tests**: Test Socket.IO event handling
3. **E2E Tests**: Test full review session;flow
4. **Load Testing**: Test concurrent users (up to 10 participants)

## UI/UX Flow

1. User navigates to review session page
2. Enters GitHub PR URL or selects from list
3. Session ID is generated and link is shareable
4. Participants join via link
5. Each participant sees:
   - PR file tree on left
   - Code viewer in center with syntax highlighting
   - Live cursors of other users
   - Annotations panel on right
   - Video/voice panel (minimizable)
6. Users can:
   - Click lines to add annotations
   - Reply to annotations
   - Highlight code sections
   - Mirror comments to GitHub PR

## Estimated Timeline

- **Phase 1 (Backend):** 2-3 days
- **Phase 2 (Frontend):** 3-4 days
- **Phase 3 (Agora):** 1-2 days
- **Phase 4 (GitHub Integration):** 1 day
- **Testing & Polish:** 2-3 days
- **Total:** 9-13 days

## Next Steps

If you want to contribute to this issue:

1. Comment on Issue #10 expressing interest
2. Coordinate with @EclipseZoro to avoid duplicate work
3. Create a branch: `feature/collaborative-code-review`
4. Start with Phase 1 (Backend Setup)
5. Submit incremental PRs as you complete each phase

## Resources

- [Agora Web SDK Docs](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [GitHub PR Comments API](https://docs.github.com/en/rest/pulls/comments)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

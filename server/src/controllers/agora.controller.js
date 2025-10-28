import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

// Generate Agora RTC token for video/voice chat
export const generateAgoraToken = asyncHandler(async (req, res) => {
  const { channel, uid } = req.query;

  if (!channel || !uid) {
    throw new ApiError(400, "Channel and UID are required");
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new ApiError(500, "Agora credentials not configured");
  }

  const expirationTimeInSeconds = 3600; // 1 hour
  const role = RtcRole.PUBLISHER; // Publisher can publish streams

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    parseInt(uid),
    role,
    expirationTimeInSeconds
  );

  return res.json(
    new ApiResponse(
      200,
      {
        token,
        appId,
        channel,
        uid: parseInt(uid),
      },
      "Agora token generated successfully"
    )
  );
});


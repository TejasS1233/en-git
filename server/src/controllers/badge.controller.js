import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { mintCredentialBadge, verifyCredentialBadge } from "../utils/blockchain.js";

export const mintBadge = asyncHandler(async (req, res) => {
  const { badgeId, metadataURI } = req.body;
  if (!badgeId) throw new ApiError("badgeId is required", 400);

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError("User not found", 404);
  if (!user.walletAddress) throw new ApiError("User walletAddress not set", 400);

  // Check if user already has this badge
  const existingBadge = user.credentialBadges?.find(badge => badge.badgeId === badgeId);
  if (existingBadge) {
    throw new ApiError("User already has this badge", 409);
  }

  const result = await mintCredentialBadge({
    toAddress: user.walletAddress,
    badgeId,
    metadataURI: metadataURI || "",
  });

  user.credentialBadges = user.credentialBadges || [];
  user.credentialBadges.push({
    badgeId,
    tokenId: result.tokenId,
    txHash: result.txHash,
    chainId: result.chainId,
    metadataURI: metadataURI || "",
  });
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Badge minted", { ...result, walletAddress: user.walletAddress }));
});

export const verifyBadge = asyncHandler(async (req, res) => {
  const { badgeId, accountAddress } = req.query;
  if (!badgeId) throw new ApiError("badgeId is required", 400);

  const address = accountAddress || (await User.findById(req.user._id))?.walletAddress;
  if (!address) throw new ApiError("accountAddress not provided and user has no walletAddress", 400);

  const result = await verifyCredentialBadge({ accountAddress: address, badgeId });
  return res.status(200).json(new ApiResponse(200, "Badge verification result", result));
});



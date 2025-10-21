import { ethers } from "ethers";
import { ApiError } from "./apiError.js";

const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "razorpay_order_id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "razorpay_payment_id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "currency",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PaymentLogged",
    type: "event",
  },
  {
    inputs: [],
    name: "getPaymentsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_razorpay_order_id",
        type: "string",
      },
      {
        internalType: "string",
        name: "_razorpay_payment_id",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_currency",
        type: "string",
      },
    ],
    name: "logPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "payments",
    outputs: [
      {
        internalType: "string",
        name: "razorpay_order_id",
        type: "string",
      },
      {
        internalType: "string",
        name: "razorpay_payment_id",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "currency",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const { CONTRACT_ADDRESS, BLOCKCHAIN_RPC_URL, WALLET_PRIVATE_KEY } = process.env;

export const logPaymentToBlockchain = async (paymentData) => {
  if (!CONTRACT_ADDRESS || !BLOCKCHAIN_RPC_URL || !WALLET_PRIVATE_KEY) {
    console.warn("Blockchain environment variables are not configured. Skipping blockchain log.");
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    const { razorpay_order_id, razorpay_payment_id, amount, currency } = paymentData;
    const amountInSmallestUnit = Math.round(amount * 100);

    const tx = await contract.logPayment(
      razorpay_order_id,
      razorpay_payment_id,
      amountInSmallestUnit,
      currency
    );

    await tx.wait();
    console.log("Payment logged to blockchain! Transaction hash:", tx.hash);
    return tx.hash;
  } catch (error) {
    throw new ApiError(500, "Error logging payment to blockchain", error);
  }
};

const BADGE_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "badgeId", type: "string" },
      { internalType: "string", name: "tokenURI", type: "string" },
    ],
    name: "mintBadge",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "owner", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "string", name: "badgeId", type: "string" },
    ],
    name: "hasBadge",
    outputs: [{ internalType: "bool", name: "hasIt", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];

const {
  BADGE_CONTRACT_ADDRESS,
  BLOCKCHAIN_RPC_URL: BADGE_BLOCKCHAIN_RPC_URL,
  WALLET_PRIVATE_KEY: BADGE_MINTER_PRIVATE_KEY,
  BADGE_CHAIN_ID,
} = process.env;

function getBadgeContract() {
  if (!BADGE_CONTRACT_ADDRESS || !BADGE_BLOCKCHAIN_RPC_URL || !BADGE_MINTER_PRIVATE_KEY) {
    throw new ApiError(
      500,
      "Blockchain env vars not configured for badge minting (BADGE_CONTRACT_ADDRESS, BLOCKCHAIN_RPC_URL, WALLET_PRIVATE_KEY)"
    );
  }
  const provider = new ethers.JsonRpcProvider(BADGE_BLOCKCHAIN_RPC_URL);
  const wallet = new ethers.Wallet(BADGE_MINTER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(BADGE_CONTRACT_ADDRESS, BADGE_CONTRACT_ABI, wallet);
  return { contract, provider, wallet };
}

export async function mintCredentialBadge({ toAddress, badgeId, metadataURI }) {
  try {
    const { contract } = getBadgeContract();
    const tx = await contract.mintBadge(toAddress, badgeId, metadataURI);
    const receipt = await tx.wait();
    
    // Parse Transfer event to get tokenId
    let tokenId = undefined;
    if (receipt?.logs) {
      // Find Transfer event (from 0x0 to recipient)
      const transferEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'Transfer' && 
                 parsed.args.from === ethers.ZeroAddress && 
                 parsed.args.to.toLowerCase() === toAddress.toLowerCase();
        } catch (e) {
          return false;
        }
      });
      
      if (transferEvent) {
        try {
          const parsed = contract.interface.parseLog(transferEvent);
          tokenId = parsed.args.tokenId.toString();
        } catch (e) {
          console.warn('Failed to parse Transfer event:', e.message);
        }
      }
    }
    
    return {
      txHash: tx.hash,
      tokenId: tokenId,
      chainId: BADGE_CHAIN_ID || "",
    };
  } catch (error) {
    console.error('Error minting credential badge:', error);
    throw new ApiError(500, "Error minting credential badge", error);
  }
}

export async function verifyCredentialBadge({ accountAddress, badgeId }) {
  try {
    const { contract } = getBadgeContract();
    if (contract.hasBadge) {
      const hasIt = await contract.hasBadge(accountAddress, badgeId);
      return { valid: Boolean(hasIt) };
    }
    // Fallback: contract may emit mapping of badgeId->tokenId; not implemented here.
    return { valid: false };
  } catch (error) {
    throw new ApiError(500, "Error verifying credential badge", error);
  }
}
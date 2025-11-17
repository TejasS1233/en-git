import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { CHATBOT_PERSONA } from "../constants.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const handleChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  const user = req.user;

  if (!message || message.trim() === "") {
    throw new ApiError(400, "Message is required");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const systemPrompt = `
      ${CHATBOT_PERSONA}

      The user you are currently talking to is named ${user.fullName}. Please address them by their name when appropriate to make the conversation more personal.
    `;

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: `Hello ${user.fullName}! I'm Nexus, your personal assistant for this platform. How can I help you today?`,
            },
          ],
        },
        ...(history || []),
      ],
      generationConfig: {
        maxOutputTokens: 200,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json(new ApiResponse(200, "Reply sent successfully", { reply: text }));
  } catch (error) {
    console.error("Error communicating with Google AI:", error);
    throw new ApiError(500, "Failed to get a response from the AI service.", [], error.stack);
  }
});

export { handleChat };

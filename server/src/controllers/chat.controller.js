import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError("UserId param not sent with request", 400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "fullname avatar email",
  });

  if (isChat.length > 0) {
    return res.status(200).json(new ApiResponse(200, "Chat already exists", isChat[0]));
  }

  const chatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  try {
    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
    return res.status(200).json(new ApiResponse(200, "New chat created", fullChat));
  } catch (error) {
    throw new ApiError("Failed to create chat", 400);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "fullname avatar email",
    });

    return res.status(200).json(new ApiResponse(200, "Chats fetched successfully", results));
  } catch (error) {
    throw new ApiError("Something went wrong while fetching chats", 400);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    throw new ApiError("Please fill all the fields", 400);
  }

  const parsedUsers = JSON.parse(users);

  if (parsedUsers.length < 2) {
    throw new ApiError("More than 2 users are required to form a group chat", 400);
  }

  parsedUsers.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res
      .status(200)
      .json(new ApiResponse(200, "Group chat created successfully", fullGroupChat));
  } catch (error) {
    throw new ApiError("Something went wrong while creating group", 400);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw new ApiError("Chat not found", 404);
  }

  return res.status(200).json(new ApiResponse(200, "Group renamed successfully", updatedChat));
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw new ApiError("Chat not found", 404);
  }

  return res.status(200).json(new ApiResponse(200, "User added to group", updatedChat));
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw new ApiError("Chat not found", 404);
  }

  return res.status(200).json(new ApiResponse(200, "User removed from group", updatedChat));
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "fullname avatar email")
      .populate("chat");

    return res.status(200).json(new ApiResponse(200, "Messages fetched successfully", messages));
  } catch (error) {
    throw new ApiError("Something went wrong while fetching messages", 400);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    throw new ApiError("Invalid data passed into request", 400);
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "fullname avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "fullname avatar email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    return res.status(200).json(new ApiResponse(200, "Message sent successfully", message));
  } catch (error) {
    throw new ApiError("Something went wrong while sending message", 400);
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { fullname: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).json(new ApiResponse(200, "Users found", users));
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  allMessages,
  sendMessage,
  searchUsers,
};

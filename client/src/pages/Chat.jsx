import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, UserPlus } from "lucide-react";
import axiosInstance from "@/lib/axios";
import socket from "@/lib/socket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

let selectedChatCompare;

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    if (!user) return;
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    return () => {
      socket.off("connected");
    };
  }, [user]);

  const fetchChats = async () => {
    try {
      const { data } = await axiosInstance.get("/chat");
      setChats(data);
    } catch {
      toast.error("Failed to load chats");
    }
  };

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const { data } = await axiosInstance.get(`/chat/${selectedChat._id}`);
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const { data } = await axiosInstance.post("/chat", {
        content: newMessage,
        chatId: selectedChat._id,
      });
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    const messageListener = (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        toast.message("New message received");
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };
    socket.on("message recieved", messageListener);
    return () => {
      socket.off("message recieved", messageListener);
    };
  }, []);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      const { data } = await axiosInstance.get(`/chat/search?search=${search}`);
      setSearchResult(data.data);
    } catch (error) {
      toast.error("Failed to search users");
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await axiosInstance.post(`/chat`, { userId });

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
    } catch (error) {
      toast.error("Error fetching chat");
    }
  };

  const getChatUser = (chat) => {
    if (!chat) return { name: "", avatar: "" };
    if (chat.isGroupChat) return { name: chat.chatName, avatar: null };
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return { name: otherUser.fullname, avatar: otherUser.avatar };
  };

  return (
    <div className="flex h-screen">
      <Toaster position="top-center" />
      <div className="w-1/3 border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserPlus />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a new chat</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Search for a user..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="mt-4 space-y-2">
                {searchResult?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100"
                    onClick={() => accessChat(user._id)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.fullname.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <p className="ml-2">{user.fullname}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-y-auto">
          {Array.isArray(chats) &&
            chats.map((chat) => {
              const { name, avatar } = getChatUser(chat);
              return (
                <div
                  key={chat._id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedChat?._id === chat._id ? "bg-gray-200" : ""
                    }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage src={avatar} />
                      <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-semibold">{name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center">
              <Avatar>
                <AvatarImage src={getChatUser(selectedChat).avatar} />
                <AvatarFallback>{getChatUser(selectedChat).name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold ml-4">{getChatUser(selectedChat).name}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 ${message.sender._id === user._id ? "text-right" : ""}`}
                >
                  <p
                    className={`p-2 rounded-lg inline-block ${message.sender._id === user._id ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="relative flex items-center">
                <Input
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleSendMessage}
                >
                  <Send />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

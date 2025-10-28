import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import socket from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Settings, Maximize2, Minimize2 } from "lucide-react";

const ReviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch session data
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(`/reviews/${sessionId}`);
        setSession(response.data.data.session);
        setAnnotations(response.data.data.annotations);
      } catch (error) {
        toast.error("Failed to load session");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Socket event handlers
    socket.on("presence:joined", (data) => {
      setParticipants((prev) => [...prev, data]);
      toast.info(`${data.userId} joined the session`);
    });

    socket.on("presence:left", (data) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== data.socketId));
    });

    socket.on("annotation:create", (annotation) => {
      setAnnotations((prev) => [...prev, annotation]);
    });

    socket.on("annotation:update", (annotation) => {
      setAnnotations((prev) =>
        prev.map((a) => (a._id === annotation._id ? annotation : a))
      );
    });

    socket.on("annotation:delete", ({ annotationId }) => {
      setAnnotations((prev) => prev.filter((a) => a.annotationId !== annotationId));
    });

    return () => {
      socket.off("presence:joined");
      socket.off("presence:left");
      socket.off("annotation:create");
      socket.off("annotation:update");
      socket.off("annotation:delete");
    };
  }, [sessionId]);

  // Join session
  useEffect(() => {
    if (!session || !user) return;

    socket.emit("session:join", {
      sessionId: session.sessionId,
      userId: user._id,
    });

    return () => {
      socket.emit("session:leave", {
        sessionId: session.sessionId,
        userId: user._id,
      });
    };
  }, [session, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                Review: {session.owner}/{session.repo} PR #{session.prNumber}
              </h1>
              <p className="text-sm text-muted-foreground">{session.prUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <Badge variant="secondary">{participants.length + 1} participants</Badge>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsVideoOpen(!isVideoOpen)}
            >
              {isVideoOpen ? <Minimize2 /> : <Maximize2 />}
            </Button>

            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Viewer Area */}
        <div className="flex-1 flex flex-col">
          <Card className="m-4 h-full">
            <CardHeader>
              <CardTitle>Code Review</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <p className="text-muted-foreground">
                Select a file from the PR to start reviewing
              </p>
              {/* TODO: Integrate Monaco Editor here */}
            </CardContent>
          </Card>
        </div>

        {/* Annotations Panel */}
        <div className="w-96 border-l bg-card overflow-y-auto">
          <Card className="border-0 rounded-none h-full">
            <CardHeader>
              <CardTitle>Annotations</CardTitle>
            </CardHeader>
            <CardContent>
              {annotations.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No annotations yet. Click on lines to add comments.
                </p>
              ) : (
                <div className="space-y-4">
                  {annotations.map((annotation) => (
                    <div key={annotation._id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={annotation.author?.avatar} />
                          <AvatarFallback>
                            {annotation.author?.username?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {annotation.author?.username}
                        </span>
                        <Badge variant="outline" className="ml-auto">
                          {annotation.type}
                        </Badge>
                      </div>
                      <p className="text-sm">{annotation.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {annotation.filePath}:{annotation.lineStart}-{annotation.lineEnd}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Video Panel (Temporary placeholder) */}
        {isVideoOpen && (
          <Card className="w-80 border-l bg-card">
            <CardHeader>
              <CardTitle>Video Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Video chat integration will be available here
              </p>
              {/* TODO: Integrate Agora here */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewSession;


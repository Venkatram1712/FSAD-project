import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Badge } from "../components/badge";
import { CountUp } from "../components/count-up";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/dialog";
import SessionChat from "../components/SessionChat.jsx";
import { useNavigate } from "react-router-dom";
import {
  getCareerPaths,
  getCareerResources,
  getResourceContents
} from "../utils/careerResources";
import {
  getSessionsByStudent
} from "../utils/userManagement";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  MessageSquare,
  TrendingUp,
  LogOut,
  Clock,
  User,
  Play,
  ExternalLink
} from "lucide-react";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  const cleaned = String(value || "").replace(/\D/g, "");
  return cleaned.length === 0 || (cleaned.length >= 10 && cleaned.length <= 15);
}

function StudentDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [recentResources, setRecentResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceContents, setResourceContents] = useState([]);
  const [resourceViewerTab, setResourceViewerTab] = useState("videos");
  const [activeContentId, setActiveContentId] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSessionForChat, setSelectedSessionForChat] = useState(null);
  const [selectedCareerPath, setSelectedCareerPath] = useState(null);
  const [resourceSearchTerm, setResourceSearchTerm] = useState("");
  const [careerPaths, setCareerPaths] = useState([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    specialization: "",
    bio: ""
  });

  const to12Hour = (timeValue) => {
    const value = String(timeValue || "").trim();
    if (!value) return "-";
    const [hourPart = "0", minutePart = "00"] = value.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 || 12;
    return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  const canAccessSessionChat = (session) => {
    if (!["scheduled", "accepted", "active"].includes(String(session?.status || "").toLowerCase())) {
      return false;
    }
    const datePart = String(session?.date || "").slice(0, 10);
    const startPart = String(session?.startTime || session?.time || "").slice(0, 5);
    const endPart = String(session?.endTime || "").slice(0, 5);
    if (!datePart || !startPart || !endPart) return true;
    const start = new Date(`${datePart}T${startPart}:00`);
    const end = new Date(`${datePart}T${endPart}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
    const now = new Date();
    return now >= start && now <= end;
  };

  const isSessionOver = (session) => {
    const datePart = String(session?.date || "").slice(0, 10);
    const endPart = String(session?.endTime || "").slice(0, 5);
    if (!datePart || !endPart) {
      return false;
    }
    const end = new Date(`${datePart}T${endPart}:00`);
    if (Number.isNaN(end.getTime())) {
      return false;
    }
    return new Date() > end;
  };

  const videoContents = resourceContents.filter((content) => content.type === "video");
  const textContents = resourceContents.filter((content) => content.type === "text");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    (async () => {
      try {
        const contents = await getResourceContents(resource.id);
        const normalized = (contents || []).map((item) => ({
          ...item,
          url: item.url ?? (item.type === "video" ? item.content : ""),
          text: item.text ?? (item.type === "text" ? item.content : "")
        }));

        const defaultTab = normalized.some((item) => item.type === "video") ? "videos" : "text";
        const firstItem = normalized.find((item) => item.type === (defaultTab === "videos" ? "video" : "text")) || normalized[0] || null;

        setResourceViewerTab(defaultTab);
        setActiveContentId(firstItem?.id || null);
        setResourceContents(normalized);
        setActiveTab("resource-viewer");
      } catch (error) {
        console.error("Failed to load resource contents:", error);
        setResourceContents([]);
        setActiveTab("resource-viewer");
      }
    })();
  };

  const handleJoinSession = (session) => {
    if (!canAccessSessionChat(session)) {
      setSessionsError(`Chat is available only during session time: ${to12Hour(session.startTime || session.time)} - ${to12Hour(session.endTime)}.`);
      return;
    }
    setSelectedSessionForChat({
      ...session,
      sessionName: session.topic,
      sessionDate: session.date,
      sessionTime: session.startTime || session.time,
      sessionEndTime: session.endTime
    });
    setActiveTab("chat");
  };

  const handleViewChats = (session) => {
    setSelectedSessionForChat({
      ...session,
      sessionName: session.topic,
      sessionDate: session.date,
      sessionTime: session.startTime || session.time,
      sessionEndTime: session.endTime,
      readOnly: true
    });
    setActiveTab("chat");
  };

  const loadSessions = async () => {
    if (!user?.id) return;
    try {
      setIsSessionsLoading(true);
      setSessionsError("");
      const studentSessions = await getSessionsByStudent(user.id);

      const sessionsWithNames = studentSessions.map((session) => {
        return {
          ...session,
          counselor: session.counselorName || session.counselor || "Unknown Counselor",
          student: user.name
        };
      });
      
      // Show only counselor-approved future sessions.
      const upcomingOnly = sessionsWithNames.filter((s) => {
        const normalizedStatus = String(s.status || "").toLowerCase();
        if (!["scheduled", "accepted", "active"].includes(normalizedStatus)) {
          return false;
        }
        const dateValue = new Date(String(s.date || "").slice(0, 10));
        return !Number.isNaN(dateValue.getTime()) && dateValue >= new Date(new Date().toDateString());
      });
      
      setUpcomingSessions(upcomingOnly);
      console.log(`✅ Loaded ${upcomingOnly.length} upcoming sessions`);
    } catch (error) {
      setSessionsError(error?.message || "Unable to load sessions");
      console.error("Error loading sessions:", error);
    } finally {
      setIsSessionsLoading(false);
    }
  };


  const handleLearnMoreCareer = (career) => {
    setSelectedCareerPath(career);
    setActiveTab("career-details");
  };

  const handleViewCoursesCareer = (career) => {
    const normalized = String(career?.category || "").toLowerCase();
    const titlePrefix = String(career?.title || "").toLowerCase().split(" ")[0] || "";
    const matches = recentResources.filter((resource) =>
      (normalized && String(resource.category || "").toLowerCase().includes(normalized)) ||
      (titlePrefix && String(resource.title || "").toLowerCase().includes(titlePrefix))
    );

    setResourceSearchTerm(String(career?.category || ""));
    setActiveTab("resources");

    if (matches.length > 0) {
      handleViewResource(matches[0]);
    }
  };

  const visibleContents = resourceViewerTab === "videos" ? videoContents : textContents;
  const activeContent = visibleContents.find((item) => item.id === activeContentId) || visibleContents[0] || null;

  const getEmbeddableVideoUrl = (url) => {
    const value = String(url || "").trim();
    if (!value) return "";
    const origin = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";

    // Direct video files can be played with <video>.
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) {
      return value;
    }

    // YouTube watch URL -> embed URL
    const youtubeWatch = value.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{6,})/);
    if (youtubeWatch?.[1]) {
      return `https://www.youtube-nocookie.com/embed/${youtubeWatch[1]}?rel=0&modestbranding=1&playsinline=1${origin ? `&origin=${origin}` : ""}`;
    }

    // youtu.be short URL -> embed URL
    const youtubeShort = value.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
    if (youtubeShort?.[1]) {
      return `https://www.youtube-nocookie.com/embed/${youtubeShort[1]}?rel=0&modestbranding=1&playsinline=1${origin ? `&origin=${origin}` : ""}`;
    }

    // Vimeo URL -> player URL
    const vimeo = value.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeo?.[1]) {
      return `https://player.vimeo.com/video/${vimeo[1]}?title=0&byline=0&portrait=0`;
    }

    return value;
  };

  useEffect(() => {
    (async () => {
      try {
        const [resources, paths] = await Promise.all([
          getCareerResources(),
          getCareerPaths()
        ]);
        setRecentResources(resources || []);
        setCareerPaths(paths || []);
      } catch (error) {
        console.error("Failed to load resources/career paths:", error);
      }
    })();

    loadSessions();
  }, [user?.id]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      institution: user?.institution || "",
      specialization: user?.specialization || "",
      bio: user?.bio || ""
    });
  }, [user]);

  const handleProfileInputChange = (key, value) => {
    setProfileForm((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    if (!isValidEmail(profileForm.email)) {
      setProfileError("Enter a valid email address.");
      return;
    }

    if (!isValidPhone(profileForm.phone)) {
      setProfileError("Phone should be 10 to 15 digits.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        institution: profileForm.institution.trim(),
        specialization: profileForm.specialization.trim(),
        bio: profileForm.bio.trim()
      });

      if (!result?.success) {
        setProfileError(result?.error || "Unable to save profile. Please try again.");
        return;
      }

      setProfileSuccess("Profile updated successfully.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-semibold">Career Guidance Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name}</span>
                <Badge variant="outline">{user?.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsProfileDialogOpen(true)}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your career journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="careers">Career Paths</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            {selectedSessionForChat && <TabsTrigger value="chat">Chat</TabsTrigger>}
            {selectedResource && <TabsTrigger value="resource-viewer">Resource Viewer</TabsTrigger>}
            {selectedCareerPath && <TabsTrigger value="career-details">Career Details</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={upcomingSessions.length} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Next session on Feb 22</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Career Matches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={careerPaths.length} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Based on your profile</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resources Accessed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={24} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Counseling Sessions</CardTitle>
                  <CardDescription>Your scheduled sessions with counselors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="p-2 bg-indigo-100 rounded">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{session.topic}</h4>
                        <p className="text-sm text-gray-600">{session.counselor}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Career Matches</CardTitle>
                  <CardDescription>Careers that align with your interests and skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {careerPaths.map((career) => (
                    <div key={career.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{career.title}</h4>
                        <p className="text-sm text-gray-600">{career.courses} related courses</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {career.match} match
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsError && <p className="text-sm text-red-600">⚠️ {sessionsError}</p>}
                {isSessionsLoading && <p className="text-sm text-gray-500">Loading your sessions...</p>}
                {!isSessionsLoading && upcomingSessions.length === 0 && (
                  <p className="text-sm text-gray-500">No sessions scheduled yet.</p>
                )}
                {!isSessionsLoading && upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{session.topic}</h4>
                        <p className="text-sm text-gray-600">with {session.counselor}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{String(session.date || "").slice(0, 10)}</span>
                          <span>{to12Hour(session.startTime || session.time)} - {to12Hour(session.endTime)}</span>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline">{String(session.status || "scheduled")}</Badge>
                          {isSessionOver(session) && <span className="ml-2 text-xs text-amber-700">session is over</span>}
                        </div>
                      </div>
                    </div>
                    {isSessionOver(session) ? (
                      <Button variant="outline" size="sm" onClick={() => handleViewChats(session)}>
                        View Chats
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canAccessSessionChat(session)}
                        onClick={() => handleJoinSession(session)}
                      >
                        Join Session
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            {selectedSessionForChat ? (
              <SessionChat
                session={selectedSessionForChat}
                currentUser={user}
                embedded={true}
                readOnly={Boolean(selectedSessionForChat?.readOnly)}
                onClose={() => {
                  setActiveTab("sessions");
                  setSelectedSessionForChat(null);
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Session</CardTitle>
                  <CardDescription>Select a session from the Sessions tab to start chatting.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Career Paths Tab */}
          <TabsContent value="careers">
            <Card>
              <CardHeader>
                <CardTitle>Explore Career Paths</CardTitle>
                <CardDescription>Discover careers that match your interests and skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerPaths.map((career) => (
                  <div key={career.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium">{career.title}</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {career.match || "Strong"} match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {career.summary || `${career.courses || "Multiple"} related courses and resources available`}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleLearnMoreCareer(career)}>Learn More</Button>
                      <Button size="sm" variant="outline" onClick={() => handleViewCoursesCareer(career)}>View Courses</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Details Tab */}
          <TabsContent value="career-details" className="space-y-6">
            {selectedCareerPath ? (
              (() => {
                const safeSkills = Array.isArray(selectedCareerPath.skills) ? selectedCareerPath.skills : [];
                const safeRoadmap = Array.isArray(selectedCareerPath.roadmap) ? selectedCareerPath.roadmap : [];

                return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>{selectedCareerPath.title}</CardTitle>
                      <CardDescription>{selectedCareerPath.summary || "Explore this career path and related learning resources."}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("careers")}>Back to Career Paths</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Skills</h4>
                    {safeSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {safeSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="bg-white">{skill}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Skills are not configured yet for this path.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Learning Roadmap</h4>
                    {safeRoadmap.length > 0 ? (
                      <div className="space-y-2">
                        {safeRoadmap.map((step, idx) => (
                          <div key={`${step}-${idx}`} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">{idx + 1}</span>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Roadmap steps are not configured yet for this path.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleViewCoursesCareer(selectedCareerPath)}>View Matching Resources</Button>
                    <Button variant="outline" onClick={() => setActiveTab("sessions")}>Book Counselor Session</Button>
                  </div>
                </CardContent>
              </Card>
                );
              })()
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Career Selected</CardTitle>
                  <CardDescription>Select a career and click Learn More.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Career Resources</CardTitle>
                <CardDescription>Articles, guides, and videos to help your career journey</CardDescription>
                <div className="mt-2">
                  <input
                    value={resourceSearchTerm}
                    onChange={(e) => setResourceSearchTerm(e.target.value)}
                    placeholder="Filter resources by category or title"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentResources.filter((resource) => {
                  const term = resourceSearchTerm.trim().toLowerCase();
                  if (!term) return true;
                  return (
                    String(resource.title || "").toLowerCase().includes(term) ||
                    String(resource.category || "").toLowerCase().includes(term)
                  );
                }).map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                          <span className="text-xs text-gray-500">{resource.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewResource(resource)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resource Viewer Tab */}
          <TabsContent value="resource-viewer" className="space-y-6">
            {selectedResource ? (
              <Card className="h-[75vh]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>{selectedResource.title}</CardTitle>
                      <CardDescription>Learning workspace</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("resources")}>
                      Back to Resources
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(75vh-88px)]">
                  {resourceContents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">No content added yet</div>
                  ) : (
                    <div className="h-full min-h-0 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={resourceViewerTab === "videos" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setResourceViewerTab("videos");
                            setActiveContentId(videoContents[0]?.id || null);
                          }}
                        >
                          Videos ({videoContents.length})
                        </Button>
                        <Button
                          variant={resourceViewerTab === "text" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setResourceViewerTab("text");
                            setActiveContentId(textContents[0]?.id || null);
                          }}
                        >
                          Text ({textContents.length})
                        </Button>
                      </div>

                      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 border rounded-xl bg-white overflow-y-auto">
                          <div className="p-3 border-b text-sm font-medium text-gray-600">
                            {resourceViewerTab === "videos" ? "Video Lessons" : "Reading Notes"}
                          </div>
                          {visibleContents.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500">No {resourceViewerTab} available for this resource.</p>
                          ) : (
                            <div className="p-2 space-y-2">
                              {visibleContents.map((content) => (
                                <button
                                  key={content.id}
                                  type="button"
                                  onClick={() => setActiveContentId(content.id)}
                                  className={`w-full text-left p-3 rounded-lg border transition ${
                                    activeContent?.id === content.id
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-white border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {resourceViewerTab === "videos" ? (
                                      <Play className="w-4 h-4 text-red-500" />
                                    ) : (
                                      <BookOpen className="w-4 h-4 text-blue-500" />
                                    )}
                                    <h4 className="font-medium text-sm truncate">{content.title}</h4>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-8 border rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
                          {activeContent ? (
                            <>
                              <div className="p-3 border-b flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-sm truncate">{activeContent.title}</h4>
                                {activeContent.url && (
                                  <a
                                    href={activeContent.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    Open Full Page <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <div className="flex-1 min-h-0 overflow-auto p-4 bg-gray-50">
                                {resourceViewerTab === "videos" ? (
                                  activeContent.url ? (
                                    /\.(mp4|webm|ogg)(\?.*)?$/i.test(getEmbeddableVideoUrl(activeContent.url)) ? (
                                      <video
                                        src={getEmbeddableVideoUrl(activeContent.url)}
                                        controls
                                        className="w-full h-full min-h-[420px] rounded-lg border bg-black"
                                      />
                                    ) : (
                                      <div className="space-y-3">
                                        <iframe
                                          title={activeContent.title}
                                          src={getEmbeddableVideoUrl(activeContent.url)}
                                          className="w-full h-full min-h-[420px] rounded-lg border bg-white"
                                          referrerPolicy="strict-origin-when-cross-origin"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                          allowFullScreen
                                        />
                                        <p className="text-xs text-gray-500">
                                          If playback is blocked by provider policy, use "Open Full Page" to watch directly.
                                        </p>
                                      </div>
                                    )
                                  ) : (
                                    <p className="text-sm text-gray-500">Video link is missing.</p>
                                  )
                                ) : (
                                  <div className="bg-white border rounded-lg p-4">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">
                                      {activeContent.text || "No text content available."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="p-6 text-sm text-gray-500">Select an item to preview.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Resource Selected</CardTitle>
                  <CardDescription>Go to Resources tab and click View on any resource.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your student details. Changes are saved to database.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Name</Label>
                  <Input
                    id="student-name"
                    value={profileForm.name}
                    onChange={(event) => handleProfileInputChange("name", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => handleProfileInputChange("email", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-phone">Phone</Label>
                  <Input
                    id="student-phone"
                    value={profileForm.phone}
                    onChange={(event) => handleProfileInputChange("phone", event.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-institution">College or Institution</Label>
                  <Input
                    id="student-institution"
                    value={profileForm.institution}
                    onChange={(event) => handleProfileInputChange("institution", event.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-specialization">Area of Interest</Label>
                <Input
                  id="student-specialization"
                  value={profileForm.specialization}
                  onChange={(event) => handleProfileInputChange("specialization", event.target.value)}
                  placeholder="Example: Data Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-bio">About You</Label>
                <textarea
                  id="student-bio"
                  className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={profileForm.bio}
                  onChange={(event) => handleProfileInputChange("bio", event.target.value)}
                  placeholder="Add a short bio"
                />
              </div>

              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              {profileSuccess && <p className="text-sm text-green-600">{profileSuccess}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}

export default StudentDashboard;

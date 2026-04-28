import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Badge } from "../components/badge";
import { useNavigate } from "react-router-dom";
import CreateSessionDialog from "../components/CreateSessionDialog.jsx";
import SessionChat from "../components/SessionChat.jsx";
import SessionCard from "../components/SessionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/dialog";
import { Calendar, Users } from "lucide-react";
import { deleteSessionById, getStudents, getSessionsByCounselor } from "../utils/userManagement";

function to12Hour(timeValue) {
  const value = String(timeValue || "").trim();
  if (!value) return "-";
  const [hourPart = "0", minutePart = "00"] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function isWithinSessionWindow(session) {
  const datePart = String(session?.date || "").slice(0, 10);
  const startPart = String(session?.startTime || session?.time || "").slice(0, 5);
  const endPart = String(session?.endTime || "").slice(0, 5);
  if (!datePart || !startPart || !endPart) return true;
  const start = new Date(`${datePart}T${startPart}:00`);
  const end = new Date(`${datePart}T${endPart}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
  const now = new Date();
  return now >= start && now <= end;
}

function isSessionOver(session) {
  const datePart = String(session?.date || "").slice(0, 10);
  const endPart = String(session?.endTime || "").slice(0, 5);
  if (!datePart || !endPart) return false;
  const end = new Date(`${datePart}T${endPart}:00`);
  if (Number.isNaN(end.getTime())) return false;
  return new Date() > end;
}

function getSessionId(session) {
  return session?.id || session?.sessionId || session?.session_id || session?.sessionID;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  const cleaned = String(value || "").replace(/\D/g, "");
  return cleaned.length === 0 || (cleaned.length >= 10 && cleaned.length <= 15);
}

export default function CounselorDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const toggleDark = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", String(!prev));
      return !prev;
    });
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSessionForChat, setSelectedSessionForChat] = useState(null);
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    institution: "",
    experienceYears: "",
    bio: ""
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadDashboardData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [studentsData, sessionsData] = await Promise.all([
        getStudents(),
        getSessionsByCounselor(user.id)
      ]);
      setStudents(studentsData || []);
      setSessions(sessionsData || []);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load counselor data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      specialization: user?.specialization || "",
      institution: user?.institution || "",
      experienceYears:
        user?.experienceYears === null || user?.experienceYears === undefined
          ? ""
          : String(user.experienceYears),
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

    const parsedExperienceYears = profileForm.experienceYears.trim()
      ? Number(profileForm.experienceYears)
      : null;

    if (profileForm.experienceYears.trim() && !Number.isFinite(parsedExperienceYears)) {
      setProfileError("Experience years must be a number.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        specialization: profileForm.specialization.trim(),
        institution: profileForm.institution.trim(),
        experienceYears: parsedExperienceYears,
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

  const scheduledSessions = sessions.filter((session) =>
    ["scheduled", "accepted", "active"].includes(String(session.status).toLowerCase())
  );

  const handleStartSession = (session) => {
    if (!isWithinSessionWindow(session)) {
      setError(`Session chat can be started only between ${to12Hour(session.startTime || session.time)} and ${to12Hour(session.endTime)}.`);
      return;
    }

    setSelectedSessionForChat({
      ...session,
      sessionName: session.topic,
      sessionDate: String(session.date || "").slice(0, 10),
      sessionTime: session.startTime || session.time,
      sessionEndTime: session.endTime
    });
    setActiveTab("chat");
  };

  const handleViewChats = (session) => {
    setSelectedSessionForChat({
      ...session,
      sessionName: session.topic,
      sessionDate: String(session.date || "").slice(0, 10),
      sessionTime: session.startTime || session.time,
      sessionEndTime: session.endTime,
      readOnly: true
    });
    setActiveTab("chat");
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmed = window.confirm("Are you sure you want to delete this session?");
    if (!confirmed) return;

    const result = await deleteSessionById(sessionId);
    if (!result.success) {
      setError(result.error || "Failed to delete session.");
      return;
    }

    if (selectedSessionForChat?.id === sessionId) {
      setSelectedSessionForChat(null);
      setActiveTab("sessions");
    }

    await loadDashboardData();
  };

  return (
    <div className={darkMode ? "dark" : ""}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader
        user={user}
        onLogout={handleLogout}
        onEditProfile={() => setShowEditProfileDialog(true)}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 dark:text-white">Welcome, Counselor {user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your students and counseling sessions</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            {selectedSessionForChat && <TabsTrigger value="chat">Chat</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Active Students" value={students.length} icon={Users} />
              <StatCard title="Scheduled Sessions" value={scheduledSessions.length} icon={Calendar} />
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Students available for counseling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && <p className="text-sm text-gray-500">Loading students...</p>}
                {!isLoading && students.length === 0 && <p className="text-sm text-gray-500">No students found.</p>}
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedStudent(student);
                      setShowProfileDialog(true);
                    }}>
                      View Profile
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>All Sessions</CardTitle>
                  <CardDescription>Scheduled sessions with start and end times</CardDescription>
                </div>
                <Button onClick={() => setShowCreateSessionDialog(true)}>Create Session</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduledSessions.length === 0 && <p className="text-sm text-gray-500">No scheduled sessions available.</p>}
                {scheduledSessions.map((session) => (
                  <SessionCard
                    key={session.id || session.sessionId}
                    session={session}
                    isOver={isSessionOver(session)}
                    canJoin={isWithinSessionWindow(session)}
                    onJoin={handleStartSession}
                    onViewChats={handleViewChats}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            {selectedSessionForChat ? (
              <SessionChat
                session={selectedSessionForChat}
                currentUser={user}
                embedded
                readOnly={Boolean(selectedSessionForChat?.readOnly)}
                onClose={() => {
                  setSelectedSessionForChat(null);
                  setActiveTab("sessions");
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Session</CardTitle>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedStudent?.name || "Student Profile"}</DialogTitle>
              <DialogDescription>{selectedStudent?.email || ""}</DialogDescription>
            </DialogHeader>
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Role:</span> {selectedStudent?.role || "student"}</p>
              <p><span className="font-medium">Status:</span> {selectedStudent?.status || "active"}</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Counselor Profile</DialogTitle>
              <DialogDescription>Update your profile details. Changes are saved to database.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="counselor-name">Name</Label>
                  <Input
                    id="counselor-name"
                    value={profileForm.name}
                    onChange={(event) => handleProfileInputChange("name", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counselor-email">Email</Label>
                  <Input
                    id="counselor-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => handleProfileInputChange("email", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="counselor-phone">Phone</Label>
                  <Input
                    id="counselor-phone"
                    value={profileForm.phone}
                    onChange={(event) => handleProfileInputChange("phone", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counselor-years">Experience (years)</Label>
                  <Input
                    id="counselor-years"
                    value={profileForm.experienceYears}
                    onChange={(event) => handleProfileInputChange("experienceYears", event.target.value)}
                    placeholder="Example: 5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="counselor-specialization">Specialization</Label>
                  <Input
                    id="counselor-specialization"
                    value={profileForm.specialization}
                    onChange={(event) => handleProfileInputChange("specialization", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counselor-institution">Institution</Label>
                  <Input
                    id="counselor-institution"
                    value={profileForm.institution}
                    onChange={(event) => handleProfileInputChange("institution", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="counselor-bio">Bio</Label>
                <textarea
                  id="counselor-bio"
                  className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={profileForm.bio}
                  onChange={(event) => handleProfileInputChange("bio", event.target.value)}
                  placeholder="Share your experience and counseling focus"
                />
              </div>

              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              {profileSuccess && <p className="text-sm text-green-600">{profileSuccess}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditProfileDialog(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <CreateSessionDialog
          isOpen={showCreateSessionDialog}
          onClose={() => setShowCreateSessionDialog(false)}
          counselorId={user?.id}
          students={students}
          onSessionCreated={loadDashboardData}
        />
      </main>
    </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  BookOpen,
  FileText,
  GraduationCap,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import { useAuth } from "../Context/AuthContext.jsx";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { CountUp } from "../components/count-up";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/dialog";
import { Input } from "../components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Textarea } from "../components/textarea";
import {
  createCareerPath,
  createCareerResource,
  createResourceContent,
  deleteCareerPath,
  deleteCareerResource,
  deleteResourceContent,
  getCareerPaths,
  getCareerResources,
  getResourceContents,
  updateCareerPath,
  updateCareerResource,
  updateResourceContent
} from "../utils/careerResources";
import {
  createUser,
  deleteUserById,
  getAdminMetrics,
  getLoginEvents,
  getSignupEvents,
  getUsers,
  updateUserById
} from "../utils/userManagement";

function formatDate(isoDate) {
  if (!isoDate) {
    return "-";
  }

  return new Date(isoDate).toLocaleDateString();
}

function badgeClasses(status) {
  if (status === "active") {
    return "bg-green-50 text-green-700";
  }

  if (status === "inactive") {
    return "bg-gray-100 text-gray-700";
  }

  return "bg-yellow-50 text-yellow-700";
}

function buildActivityFeed() {
  const signupEvents = getSignupEvents().map((event) => ({
    id: event.id,
    type: "signup",
    message: `${event.email || "New user"} signed up as ${event.role}`,
    createdAt: event.createdAt
  }));

  const loginEvents = getLoginEvents().map((event) => ({
    id: event.id,
    type: "login",
    message: `${event.email || "User"} logged in`,
    createdAt: event.createdAt
  }));

  return [...signupEvents, ...loginEvents]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 6);
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [careerResources, setCareerResources] = useState([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceCategory, setResourceCategory] = useState("");
  const [resourceError, setResourceError] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [resourceContents, setResourceContents] = useState({});
  const [selectedResourceForContent, setSelectedResourceForContent] = useState(null);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [contentType, setContentType] = useState("text");
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentText, setContentText] = useState("");
  const [editingContentId, setEditingContentId] = useState(null);
  const [careerPaths, setCareerPaths] = useState([]);
  const [careerPathTitle, setCareerPathTitle] = useState("");
  const [careerPathCategory, setCareerPathCategory] = useState("");
  const [careerPathSummary, setCareerPathSummary] = useState("");
  const [editingCareerPathId, setEditingCareerPathId] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCounselors: 0,
    totalStudents: 0,
    activeCounselors: 0,
    totalSignups: 0,
    totalLoginEvents: 0,
    currentlyLoggedInUsers: 0
  });
  const [activityFeed, setActivityFeed] = useState(() => buildActivityFeed());
  const [managementError, setManagementError] = useState("");
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);

  const [showUserForm, setShowUserForm] = useState(false);
  const [showCounselorForm, setShowCounselorForm] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    status: "active"
  });

  const [newCounselor, setNewCounselor] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
    specialization: ""
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserDraft, setEditingUserDraft] = useState({});

  const [editingCounselorId, setEditingCounselorId] = useState(null);
  const [editingCounselorDraft, setEditingCounselorDraft] = useState({});

  const users = useMemo(() => allUsers.filter((candidate) => candidate.role !== "counselor"), [allUsers]);
  const counselors = useMemo(() => allUsers.filter((candidate) => candidate.role === "counselor"), [allUsers]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const refreshDashboardData = async () => {
    try {
      const [resources, paths, usersFromApi, metricsSnapshot] = await Promise.all([
        getCareerResources(),
        getCareerPaths(),
        getUsers(),
        getAdminMetrics()
      ]);
      setCareerResources(resources || []);
      setCareerPaths(paths || []);
      setAllUsers(usersFromApi);
      setMetrics(metricsSnapshot);
      setActivityFeed(buildActivityFeed());
      setManagementError("");
    } catch (error) {
      setAllUsers([]);
      setMetrics({
        totalUsers: 0,
        totalCounselors: 0,
        totalStudents: 0,
        activeCounselors: 0,
        totalSignups: 0,
        totalLoginEvents: 0,
        currentlyLoggedInUsers: 0
      });
      setManagementError(error?.message || "Failed to refresh users from database.");
    }
  };

  const handleRefreshDashboard = async () => {
    setIsRefreshingDashboard(true);
    await refreshDashboardData();
    setIsRefreshingDashboard(false);
  };

  useEffect(() => {
    refreshDashboardData();
  }, []);

  const handleAddResource = async () => {
    if (!resourceTitle.trim() || !resourceCategory.trim()) {
      setResourceError("Please enter both title and category");
      return;
    }

    try {
      await createCareerResource(resourceTitle, resourceCategory);
      await refreshDashboardData();
    } catch (error) {
      setResourceError("Failed to add resource in database");
      return;
    }

    setResourceTitle("");
    setResourceCategory("");
    setResourceError("");
  };

  const handleStartEditResource = (resource) => {
    setEditingResourceId(resource.id);
    setEditTitle(resource.title);
    setEditCategory(resource.category);
    setResourceError("");
  };

  const handleSaveResourceEdit = async () => {
    if (!editingResourceId) {
      return;
    }

    if (!editTitle.trim() || !editCategory.trim()) {
      setResourceError("Please enter both title and category");
      return;
    }

    try {
      await updateCareerResource(editingResourceId, {
        title: editTitle.trim(),
        category: editCategory.trim()
      });
      await refreshDashboardData();
    } catch (error) {
      setResourceError("Failed to update resource in database");
      return;
    }
    setEditingResourceId(null);
    setEditTitle("");
    setEditCategory("");
    setResourceError("");
  };

  const handleCancelResourceEdit = () => {
    setEditingResourceId(null);
    setEditTitle("");
    setEditCategory("");
    setResourceError("");
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await deleteCareerResource(resourceId);
      await refreshDashboardData();
    } catch (error) {
      setResourceError("Failed to delete resource from database");
      return;
    }

    if (editingResourceId === resourceId) {
      handleCancelResourceEdit();
    }
  };

  const saveResourceContents = (updatedContents) => {
    setResourceContents(updatedContents);
  };

  const reloadContentsForResource = async (resourceId) => {
    const contents = await getResourceContents(resourceId);
    setResourceContents((prev) => ({ ...prev, [resourceId]: contents || [] }));
  };

  const handleAddContent = async () => {
    if (!selectedResourceForContent || !contentTitle.trim()) {
      setResourceError("Please enter content title");
      return;
    }

    if (contentType === "video" && !contentUrl.trim()) {
      setResourceError("Please enter video URL");
      return;
    }

    if (contentType === "text" && !contentText.trim()) {
      setResourceError("Please enter text content");
      return;
    }

    const resourceId = selectedResourceForContent.id;
    const newContent = {
      type: contentType,
      title: contentTitle.trim(),
      url: contentType === "video" ? contentUrl.trim() : null,
      text: contentType === "text" ? contentText.trim() : null,
      createdAt: new Date().toISOString()
    };

    try {
      await createResourceContent(resourceId, newContent);
      await reloadContentsForResource(resourceId);
    } catch (error) {
      setResourceError("Failed to add content in database");
      return;
    }
    setContentTitle("");
    setContentUrl("");
    setContentText("");
    setContentType("text");
    setEditingContentId(null);
    setResourceError("");
  };

  const handleStartEditContent = (content) => {
    setEditingContentId(content.id);
    setContentTitle(content.title || "");
    setContentType(content.type || "text");
    setContentUrl(content.url || content.content || "");
    setContentText(content.text || content.content || "");
    setResourceError("");
  };

  const handleCancelEditContent = () => {
    setEditingContentId(null);
    setContentTitle("");
    setContentUrl("");
    setContentText("");
    setContentType("text");
    setResourceError("");
  };

  const handleUpdateContent = async () => {
    if (!selectedResourceForContent || !editingContentId || !contentTitle.trim()) {
      setResourceError("Please enter content title");
      return;
    }

    if (contentType === "video" && !contentUrl.trim()) {
      setResourceError("Please enter video URL");
      return;
    }

    if (contentType === "text" && !contentText.trim()) {
      setResourceError("Please enter text content");
      return;
    }

    const resourceId = selectedResourceForContent.id;
    try {
      const payload = {
        type: contentType,
        title: contentTitle.trim(),
        url: contentType === "video" ? contentUrl.trim() : null,
        text: contentType === "text" ? contentText.trim() : null,
        updatedAt: new Date().toISOString()
      };
      await updateResourceContent(resourceId, editingContentId, payload);
      await reloadContentsForResource(resourceId);
    } catch (error) {
      setResourceError("Failed to update content in database");
      return;
    }
    handleCancelEditContent();
  };

  const handleDeleteContent = async (resourceId, contentId) => {
    try {
      await deleteResourceContent(resourceId, contentId);
      await reloadContentsForResource(resourceId);
    } catch (error) {
      setResourceError("Failed to delete content from database");
      return;
    }

    if (editingContentId === contentId) {
      handleCancelEditContent();
    }
  };

  const handleOpenContentDialog = (resource) => {
    setSelectedResourceForContent(resource);
    setContentTitle("");
    setContentUrl("");
    setContentText("");
    setContentType("text");
    setEditingContentId(null);
    (async () => {
      try {
        await reloadContentsForResource(resource.id);
      } catch (error) {
        setResourceContents((prev) => ({ ...prev, [resource.id]: [] }));
      }
      setShowContentDialog(true);
    })();
    setResourceError("");
  };

  const handleAddCareerPath = async () => {
    if (!careerPathTitle.trim() || !careerPathCategory.trim()) {
      setResourceError("Career path title and category are required");
      return;
    }

    try {
      await createCareerPath({
        title: careerPathTitle.trim(),
        category: careerPathCategory.trim(),
        summary: careerPathSummary.trim()
      });
      setCareerPathTitle("");
      setCareerPathCategory("");
      setCareerPathSummary("");
      await refreshDashboardData();
    } catch (error) {
      setResourceError("Failed to add career path in database");
    }
  };

  const handleStartEditCareerPath = (path) => {
    setEditingCareerPathId(path.id);
    setCareerPathTitle(path.title || "");
    setCareerPathCategory(path.category || "");
    setCareerPathSummary(path.summary || "");
  };

  const handleSaveCareerPathEdit = async () => {
    if (!editingCareerPathId) return;
    try {
      await updateCareerPath(editingCareerPathId, {
        title: careerPathTitle.trim(),
        category: careerPathCategory.trim(),
        summary: careerPathSummary.trim()
      });
      setEditingCareerPathId(null);
      setCareerPathTitle("");
      setCareerPathCategory("");
      setCareerPathSummary("");
      await refreshDashboardData();
    } catch (error) {
      setResourceError("Failed to update career path in database");
    }
  };

  const handleDeleteCareerPath = async (pathId) => {
    try {
      await deleteCareerPath(pathId);
      await refreshDashboardData();
    } catch (error) {
      setResourceError("Failed to delete career path from database");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setManagementError("User name, email, and password are required.");
      return;
    }

    const result = await createUser(
      {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: "admin",
        status: newUser.status
      },
      {
        source: "admin",
        trackSignup: false,
        syncApi: true
      }
    );

    if (!result.success) {
      setManagementError("Unable to add user. The email might already exist.");
      return;
    }

    setManagementError("");
    setShowUserForm(false);
    setNewUser({ name: "", email: "", password: "", status: "active" });
    await refreshDashboardData();
  };

  const handleAddCounselor = async () => {
    if (!newCounselor.name.trim() || !newCounselor.email.trim() || !newCounselor.password.trim()) {
      setManagementError("Counselor name, email, and password are required.");
      return;
    }

    const result = await createUser(
      {
        name: newCounselor.name,
        email: newCounselor.email,
        password: newCounselor.password,
        role: "counselor",
        status: newCounselor.status,
        specialization: newCounselor.specialization
      },
      {
        source: "admin",
        trackSignup: false,
        syncApi: true
      }
    );

    if (!result.success) {
      setManagementError("Unable to add counselor. The email might already exist.");
      return;
    }

    setManagementError("");
    setShowCounselorForm(false);
    setNewCounselor({
      name: "",
      email: "",
      password: "",
      status: "active",
      specialization: ""
    });
    await refreshDashboardData();
  };

  const startUserEdit = (selectedUser) => {
    setEditingUserId(selectedUser.id);
    setEditingUserDraft({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      status: selectedUser.status
    });
  };

  const saveUserEdit = async () => {
    const result = await updateUserById(editingUserId, editingUserDraft);
    if (!result.success) {
      setManagementError("Failed to update this user.");
      return;
    }

    setEditingUserId(null);
    setEditingUserDraft({});
    setManagementError("");
    await refreshDashboardData();
  };

  const startCounselorEdit = (selectedCounselor) => {
    setEditingCounselorId(selectedCounselor.id);
    setEditingCounselorDraft({
      name: selectedCounselor.name,
      email: selectedCounselor.email,
      status: selectedCounselor.status,
      specialization: selectedCounselor.specialization || ""
    });
  };

  const saveCounselorEdit = async () => {
    const result = await updateUserById(editingCounselorId, {
      ...editingCounselorDraft,
      role: "counselor"
    });

    if (!result.success) {
      setManagementError("Failed to update this counselor.");
      return;
    }

    setEditingCounselorId(null);
    setEditingCounselorDraft({});
    setManagementError("");
    await refreshDashboardData();
  };

  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUserById(userId);
      if (!result.success) {
        setManagementError("Failed to delete this user.");
        return;
      }

      if (user?.id === userId) {
        handleLogout();
        return;
      }

      // Optimistically update table so deletion is visible immediately.
      setAllUsers((prevUsers) => prevUsers.filter((candidate) => candidate.id !== userId));
      setManagementError("");
      await refreshDashboardData();
    } catch (error) {
      setManagementError(error?.message || "Failed to delete this user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, counselors, resources, and login/signup analytics</p>
        </div>

        {managementError && <p className="mb-4 text-sm text-red-600">{managementError}</p>}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={metrics.totalUsers} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">All registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Signups</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={metrics.totalSignups} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Historical signup events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Login Events</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={metrics.totalLoginEvents} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Total successful logins</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Logged In Now</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={metrics.currentlyLoggedInUsers} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Active sessions in storage</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Authentication Activity</CardTitle>
                  <CardDescription>Latest signup and login events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activityFeed.length === 0 && (
                    <p className="text-sm text-gray-500">No signup or login activity tracked yet.</p>
                  )}
                  {activityFeed.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm">{event.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(event.createdAt)}</p>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Counselor Snapshot</CardTitle>
                  <CardDescription>Quick counselor health metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="text-sm">Total Counselors</span>
                    <span className="font-semibold">{metrics.totalCounselors}</span>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="text-sm">Active Counselors</span>
                    <span className="font-semibold">{metrics.activeCounselors}</span>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="text-sm">Career Resources</span>
                    <span className="font-semibold">{careerResources.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-sm text-gray-600">Create admin accounts and manage all non-counselor users</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefreshDashboard} disabled={isRefreshingDashboard}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingDashboard ? "animate-spin" : ""}`} />
                  {isRefreshingDashboard ? "Refreshing..." : "Refresh"}
                </Button>
                <Button onClick={() => setShowUserForm((value) => !value)}>
                  <Users className="w-4 h-4 mr-2" />
                  {showUserForm ? "Close Form" : "Add Admin"}
                </Button>
              </div>
            </div>

            {showUserForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Admin Account</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                  />
                  <div className="flex gap-2">
                    <select
                      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm flex-1"
                      value={newUser.status}
                      onChange={(event) => setNewUser((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <Button onClick={handleAddUser}>Create</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Created</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((listedUser) => (
                        <tr key={listedUser.id} className="border-b">
                          <td className="py-2">
                            {editingUserId === listedUser.id ? (
                              <Input
                                value={editingUserDraft.name || ""}
                                onChange={(event) =>
                                  setEditingUserDraft((prev) => ({ ...prev, name: event.target.value }))
                                }
                              />
                            ) : (
                              listedUser.name
                            )}
                          </td>
                          <td className="py-2">
                            {editingUserId === listedUser.id ? (
                              <Input
                                type="email"
                                value={editingUserDraft.email || ""}
                                onChange={(event) =>
                                  setEditingUserDraft((prev) => ({ ...prev, email: event.target.value }))
                                }
                              />
                            ) : (
                              listedUser.email
                            )}
                          </td>
                          <td className="py-2">
                            {editingUserId === listedUser.id ? (
                              <Badge variant="outline">{editingUserDraft.role || listedUser.role}</Badge>
                            ) : (
                              <Badge variant="outline">{listedUser.role}</Badge>
                            )}
                          </td>
                          <td className="py-2">
                            {editingUserId === listedUser.id ? (
                              <select
                                className="h-9 rounded-md border border-input bg-transparent px-3"
                                value={editingUserDraft.status || "active"}
                                onChange={(event) =>
                                  setEditingUserDraft((prev) => ({ ...prev, status: event.target.value }))
                                }
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            ) : (
                              <Badge variant="outline" className={badgeClasses(listedUser.status)}>
                                {listedUser.status}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2">{formatDate(listedUser.createdAt)}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              {editingUserId === listedUser.id ? (
                                <>
                                  <Button size="sm" onClick={saveUserEdit}>Save</Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUserId(null);
                                      setEditingUserDraft({});
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startUserEdit(listedUser)}>
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(listedUser.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td className="py-4 text-gray-500" colSpan={6}>
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counselors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Counselor Management</h3>
                <p className="text-sm text-gray-600">Create, update, and delete counselors</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefreshDashboard} disabled={isRefreshingDashboard}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingDashboard ? "animate-spin" : ""}`} />
                  {isRefreshingDashboard ? "Refreshing..." : "Refresh"}
                </Button>
                <Button onClick={() => setShowCounselorForm((value) => !value)}>
                  <User className="w-4 h-4 mr-2" />
                  {showCounselorForm ? "Close Form" : "Add Counselor"}
                </Button>
              </div>
            </div>

            {showCounselorForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Counselor</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <Input
                    placeholder="Name"
                    value={newCounselor.name}
                    onChange={(event) =>
                      setNewCounselor((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newCounselor.email}
                    onChange={(event) =>
                      setNewCounselor((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newCounselor.password}
                    onChange={(event) =>
                      setNewCounselor((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Specialization"
                    value={newCounselor.specialization}
                    onChange={(event) =>
                      setNewCounselor((prev) => ({ ...prev, specialization: event.target.value }))
                    }
                  />
                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={newCounselor.status}
                    onChange={(event) =>
                      setNewCounselor((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <Button onClick={handleAddCounselor}>Create</Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Active Counselors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Specialization</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Created</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {counselors.map((counselor) => (
                        <tr key={counselor.id} className="border-b">
                          <td className="py-2">
                            {editingCounselorId === counselor.id ? (
                              <Input
                                value={editingCounselorDraft.name || ""}
                                onChange={(event) =>
                                  setEditingCounselorDraft((prev) => ({
                                    ...prev,
                                    name: event.target.value
                                  }))
                                }
                              />
                            ) : (
                              counselor.name
                            )}
                          </td>
                          <td className="py-2">
                            {editingCounselorId === counselor.id ? (
                              <Input
                                type="email"
                                value={editingCounselorDraft.email || ""}
                                onChange={(event) =>
                                  setEditingCounselorDraft((prev) => ({
                                    ...prev,
                                    email: event.target.value
                                  }))
                                }
                              />
                            ) : (
                              counselor.email
                            )}
                          </td>
                          <td className="py-2">
                            {editingCounselorId === counselor.id ? (
                              <Input
                                value={editingCounselorDraft.specialization || ""}
                                onChange={(event) =>
                                  setEditingCounselorDraft((prev) => ({
                                    ...prev,
                                    specialization: event.target.value
                                  }))
                                }
                              />
                            ) : (
                              counselor.specialization || "-"
                            )}
                          </td>
                          <td className="py-2">
                            {editingCounselorId === counselor.id ? (
                              <select
                                className="h-9 rounded-md border border-input bg-transparent px-3"
                                value={editingCounselorDraft.status || "active"}
                                onChange={(event) =>
                                  setEditingCounselorDraft((prev) => ({
                                    ...prev,
                                    status: event.target.value
                                  }))
                                }
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            ) : (
                              <Badge variant="outline" className={badgeClasses(counselor.status)}>
                                {counselor.status}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2">{formatDate(counselor.createdAt)}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              {editingCounselorId === counselor.id ? (
                                <>
                                  <Button size="sm" onClick={saveCounselorEdit}>Save</Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCounselorId(null);
                                      setEditingCounselorDraft({});
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startCounselorEdit(counselor)}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(counselor.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {counselors.length === 0 && (
                        <tr>
                          <td className="py-4 text-gray-500" colSpan={6}>
                            No counselors found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Career Resources</h3>
                <p className="text-sm text-gray-600">Manage career guidance resources and content</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefreshDashboard} disabled={isRefreshingDashboard}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingDashboard ? "animate-spin" : ""}`} />
                  {isRefreshingDashboard ? "Refreshing..." : "Refresh"}
                </Button>
                <Input
                  placeholder="Resource title"
                  value={resourceTitle}
                  onChange={(event) => setResourceTitle(event.target.value)}
                  className="w-56"
                />
                <Input
                  placeholder="Category"
                  value={resourceCategory}
                  onChange={(event) => setResourceCategory(event.target.value)}
                  className="w-40"
                />
                <Button onClick={handleAddResource}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </div>

            {resourceError && <p className="text-sm text-red-600">{resourceError}</p>}

            <Card>
              <CardHeader>
                <CardTitle>Career Paths</CardTitle>
                <CardDescription>Create and manage editable career paths from admin portal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Career Path Title"
                    value={careerPathTitle}
                    onChange={(e) => setCareerPathTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Category"
                    value={careerPathCategory}
                    onChange={(e) => setCareerPathCategory(e.target.value)}
                  />
                  <Button onClick={editingCareerPathId ? handleSaveCareerPathEdit : handleAddCareerPath}>
                    {editingCareerPathId ? "Save Career Path" : "Add Career Path"}
                  </Button>
                </div>
                <Textarea
                  placeholder="Career path summary"
                  value={careerPathSummary}
                  onChange={(e) => setCareerPathSummary(e.target.value)}
                />

                <div className="space-y-2">
                  {careerPaths.length === 0 ? (
                    <p className="text-sm text-gray-500">No career paths found in database.</p>
                  ) : (
                    careerPaths.map((path) => (
                      <div key={path.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">{path.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{path.category} • {path.summary || "No summary"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleStartEditCareerPath(path)}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCareerPath(path.id)} className="text-red-600">Delete</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Resources</CardTitle>
                <CardDescription>Most viewed career resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerResources.map((resource) => (
                  <div key={resource.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      {editingResourceId === resource.id ? (
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <Input
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
                              placeholder="Resource title"
                              className="max-w-sm"
                            />
                            <Input
                              value={editCategory}
                              onChange={(event) => setEditCategory(event.target.value)}
                              placeholder="Category"
                              className="max-w-40"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveResourceEdit}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelResourceEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-2 bg-blue-100 rounded">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{resource.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                <Badge variant="outline" className="text-xs">
                                  {resource.category}
                                </Badge>
                                <span>{resource.views} views</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {(resourceContents[resource.id] || []).length} content items
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog open={showContentDialog && selectedResourceForContent?.id === resource.id} onOpenChange={(open) => {
                              setShowContentDialog(open);
                              if (!open) {
                                setSelectedResourceForContent(null);
                                setContentTitle("");
                                setContentUrl("");
                                setContentText("");
                                setContentType("text");
                                setEditingContentId(null);
                                setResourceError("");
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleOpenContentDialog(resource)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Manage Content
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Manage Content - {resource.title}</DialogTitle>
                                  <DialogDescription>Add videos and text content to this resource</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                  {resourceError && <p className="text-sm text-red-600">{resourceError}</p>}

                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium">Content Title</label>
                                      <Input
                                        placeholder="e.g., Getting Started with React"
                                        value={contentTitle}
                                        onChange={(e) => setContentTitle(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Content Type</label>
                                      <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="text"
                                            checked={contentType === "text"}
                                            onChange={(e) => setContentType(e.target.value)}
                                          />
                                          <span className="text-sm">Text</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="video"
                                            checked={contentType === "video"}
                                            onChange={(e) => setContentType(e.target.value)}
                                          />
                                          <span className="text-sm">Video</span>
                                        </label>
                                      </div>
                                    </div>

                                    {contentType === "video" ? (
                                      <div>
                                        <label className="text-sm font-medium">Video URL</label>
                                        <Input
                                          placeholder="e.g., https://youtube.com/watch?v=..."
                                          value={contentUrl}
                                          onChange={(e) => setContentUrl(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <label className="text-sm font-medium">Text Content</label>
                                        <Textarea
                                          placeholder="Enter text content..."
                                          value={contentText}
                                          onChange={(e) => setContentText(e.target.value)}
                                          className="mt-1 min-h-32"
                                        />
                                      </div>
                                    )}

                                    <Button onClick={handleAddContent} className="w-full">
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Content
                                    </Button>

                                    {editingContentId && (
                                      <>
                                        <Button variant="secondary" onClick={handleUpdateContent} className="w-full">
                                          Update Selected Content
                                        </Button>
                                        <Button variant="outline" onClick={handleCancelEditContent} className="w-full">
                                          Cancel Edit
                                        </Button>
                                      </>
                                    )}
                                  </div>

                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Content Items</h4>
                                    <div className="space-y-2">
                                      {(resourceContents[resource.id] || []).length === 0 ? (
                                        <p className="text-sm text-gray-500">No content added yet</p>
                                      ) : (
                                        (resourceContents[resource.id] || []).map((content) => (
                                          <div key={content.id} className="flex items-start justify-between p-3 bg-gray-50 rounded border">
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">{content.title}</p>
                                              <p className="text-xs text-gray-600 mt-1">
                                                <span className="inline-block bg-gray-200 px-2 py-1 rounded mr-2">
                                                  {content.type.toUpperCase()}
                                                </span>
                                                {content.type === "video" && (
                                                  <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                                    View Video
                                                  </a>
                                                )}
                                                {content.type === "text" && (
                                                  <span className="text-gray-700 line-clamp-2">{content.text}</span>
                                                )}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStartEditContent(content)}
                                              >
                                                Edit
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteContent(resource.id, content.id)}
                                                className="text-red-600 hover:text-red-800"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => handleStartEditResource(resource)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleRefreshDashboard} disabled={isRefreshingDashboard}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingDashboard ? "animate-spin" : ""}`} />
                {isRefreshingDashboard ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Signup and login insights for admin monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Total Signup Events</span>
                    </div>
                    <CountUp end={metrics.totalSignups} className="text-3xl font-bold text-blue-600" />
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Total Login Events</span>
                    </div>
                    <CountUp end={metrics.totalLoginEvents} className="text-3xl font-bold text-green-600" />
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Currently Logged In</span>
                    </div>
                    <CountUp end={metrics.currentlyLoggedInUsers} className="text-3xl font-bold text-purple-600" />
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-gray-50">
                  <p className="text-center text-gray-600">
                    Login and signup tracking is live. Create users or sign in to see analytics update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

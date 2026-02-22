import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';
import { Badge } from '../components/badge';
import { Input } from '../components/input';
import { CountUp } from '../components/count-up';
import { useNavigate } from 'react-router-dom';
import {
  CAREER_RESOURCES_STORAGE_KEY,
  createCareerResource,
  getCareerResources,
  saveCareerResources,
  type CareerResource,
} from '../utils/careerResources';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp,
  LogOut,
  User,
  Settings,
  BarChart,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [careerResources, setCareerResources] = useState<CareerResource[]>([]);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const [resourceError, setResourceError] = useState('');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    totalUsers: 247,
    activeStudents: 189,
    counselors: 12,
    resources: 156,
    sessionsThisMonth: 342,
  };

  const recentActivity = [
    { id: 1, type: 'user', message: 'New student registration: Emma Wilson', time: '2 hours ago' },
    { id: 2, type: 'session', message: '15 counseling sessions completed today', time: '3 hours ago' },
    { id: 3, type: 'resource', message: 'New career resource added: Tech Interview Guide', time: '5 hours ago' },
    { id: 4, type: 'counselor', message: 'Dr. Sarah Johnson joined as counselor', time: '1 day ago' },
  ];

  const topCounselors = [
    { id: 1, name: 'Dr. Sarah Johnson', students: 45, rating: 4.9, sessions: 128 },
    { id: 2, name: 'Prof. Michael Chen', students: 38, rating: 4.8, sessions: 112 },
    { id: 3, name: 'Dr. Emily Rodriguez', students: 42, rating: 4.7, sessions: 105 },
  ];

  useEffect(() => {
    setCareerResources(getCareerResources());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CAREER_RESOURCES_STORAGE_KEY) {
        setCareerResources(getCareerResources());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddResource = () => {
    if (!resourceTitle.trim() || !resourceCategory.trim()) {
      setResourceError('Please enter both title and category');
      return;
    }

    const newResource = createCareerResource(resourceTitle, resourceCategory);
    const updatedResources = [newResource, ...careerResources];
    saveCareerResources(updatedResources);
    setCareerResources(updatedResources);
    setResourceTitle('');
    setResourceCategory('');
    setResourceError('');
  };

  const handleStartEdit = (resource: CareerResource) => {
    setEditingResourceId(resource.id);
    setEditTitle(resource.title);
    setEditCategory(resource.category);
    setResourceError('');
  };

  const handleSaveEdit = () => {
    if (!editingResourceId) {
      return;
    }

    if (!editTitle.trim() || !editCategory.trim()) {
      setResourceError('Please enter both title and category');
      return;
    }

    const updatedResources = careerResources.map((resource) =>
      resource.id === editingResourceId
        ? { ...resource, title: editTitle.trim(), category: editCategory.trim() }
        : resource
    );

    saveCareerResources(updatedResources);
    setCareerResources(updatedResources);
    setEditingResourceId(null);
    setEditTitle('');
    setEditCategory('');
    setResourceError('');
  };

  const handleCancelEdit = () => {
    setEditingResourceId(null);
    setEditTitle('');
    setEditCategory('');
    setResourceError('');
  };

  const handleDeleteResource = (resourceId: string) => {
    const updatedResources = careerResources.filter((resource) => resource.id !== resourceId);
    saveCareerResources(updatedResources);
    setCareerResources(updatedResources);

    if (editingResourceId === resourceId) {
      handleCancelEdit();
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform resources and monitor engagement</p>
        </div>

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
                  <CountUp end={stats.totalUsers} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={stats.activeStudents} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Currently enrolled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Counselors</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={stats.counselors} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Active advisors</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions (Month)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={stats.sessionsThisMonth} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform updates and events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Counselors</CardTitle>
                  <CardDescription>Based on student engagement and ratings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topCounselors.map((counselor, index) => (
                    <div key={counselor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-semibold text-indigo-600">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{counselor.name}</h4>
                          <p className="text-sm text-gray-600">
                            {counselor.students} students • {counselor.sessions} sessions
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        ★ {counselor.rating}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-sm text-gray-600">View and manage all platform users</p>
              </div>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Status</div>
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 items-center text-sm">
                      <div>User {i}</div>
                      <div>user{i}@example.com</div>
                      <div>
                        <Badge variant="outline">Student</Badge>
                      </div>
                      <div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counselors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Counselor Management</h3>
                <p className="text-sm text-gray-600">Manage career counselors and track connections</p>
              </div>
              <Button>
                <User className="w-4 h-4 mr-2" />
                Add Counselor
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Active Counselors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCounselors.map((counselor) => (
                  <div key={counselor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{counselor.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span>{counselor.students} students</span>
                          <span>•</span>
                          <span>{counselor.sessions} sessions</span>
                          <span>•</span>
                          <span>★ {counselor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                <Input
                  placeholder="Resource title"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-56"
                />
                <Input
                  placeholder="Category"
                  value={resourceCategory}
                  onChange={(e) => setResourceCategory(e.target.value)}
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
                <CardTitle>Top Resources</CardTitle>
                <CardDescription>Most viewed career resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    {editingResourceId === resource.id ? (
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Resource title"
                            className="max-w-sm"
                          />
                          <Input
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            placeholder="Category"
                            className="max-w-40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                              <span>{resource.views} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleStartEdit(resource)}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteResource(resource.id)}>Delete</Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Track user engagement and platform performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Total Resources</span>
                    </div>
                    <CountUp end={careerResources.length} className="text-3xl font-bold text-blue-600" />
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Sessions This Month</span>
                    </div>
                    <CountUp end={stats.sessionsThisMonth} className="text-3xl font-bold text-green-600" />
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Engagement Rate</span>
                    </div>
                    <CountUp end={78} suffix="%" className="text-3xl font-bold text-purple-600" />
                  </div>
                </div>
                <div className="p-6 border rounded-lg bg-gray-50">
                  <p className="text-center text-gray-600">
                    Detailed analytics charts and graphs would be displayed here
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


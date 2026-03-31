import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';
import { Badge } from '../components/badge';
import { CountUp } from '../components/count-up';
import { useNavigate } from 'react-router-dom';
import {
  CAREER_RESOURCES_STORAGE_KEY,
  getCareerResources,
  type CareerResource,
} from '../utils/careerResources';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  LogOut,
  Clock,
  User
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentResources, setRecentResources] = useState<CareerResource[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const upcomingSessions = [
    { id: 1, counselor: 'Dr. Sarah Johnson', date: '2026-02-22', time: '10:00 AM', topic: 'Career Path Discussion' },
    { id: 2, counselor: 'Prof. Michael Chen', date: '2026-02-25', time: '2:00 PM', topic: 'Resume Review' },
  ];

  const careerPaths = [
    { id: 1, title: 'Software Engineering', match: '95%', courses: 12 },
    { id: 2, title: 'Data Science', match: '88%', courses: 8 },
    { id: 3, title: 'Product Management', match: '82%', courses: 6 },
  ];

  useEffect(() => {
    setRecentResources(getCareerResources());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CAREER_RESOURCES_STORAGE_KEY) {
        setRecentResources(getCareerResources());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
          <h1 className="text-3xl mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your career journey</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="careers">Career Paths</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

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

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Session</CardTitle>
                <CardDescription>Book a counseling session with our career advisors</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Counseling Session
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{session.topic}</h4>
                        <p className="text-sm text-gray-600">{session.counselor}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{session.date}</span>
                          <span>{session.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="careers" className="space-y-6">
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
                        {career.match} match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {career.courses} related courses and resources available
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Learn More</Button>
                      <Button size="sm" variant="outline">View Courses</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Career Resources</CardTitle>
                <CardDescription>Articles, guides, and videos to help your career journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentResources.map((resource) => (
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
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


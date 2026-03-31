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
  Users, 
  BookOpen, 
  TrendingUp,
  LogOut,
  Calendar,
  MessageSquare,
  User,
  Clock
} from 'lucide-react';

export default function CounselorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [careerResources, setCareerResources] = useState<CareerResource[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const myStudents = [
    { id: 1, name: 'Emma Wilson', sessions: 5, nextSession: '2026-02-22', status: 'active' },
    { id: 2, name: 'James Smith', sessions: 3, nextSession: '2026-02-23', status: 'active' },
    { id: 3, name: 'Olivia Brown', sessions: 7, nextSession: '2026-02-25', status: 'active' },
  ];

  const upcomingSessions = [
    { id: 1, student: 'Emma Wilson', date: '2026-02-22', time: '10:00 AM', topic: 'Career Path Discussion' },
    { id: 2, student: 'James Smith', date: '2026-02-23', time: '2:00 PM', topic: 'Resume Review' },
    { id: 3, student: 'Olivia Brown', date: '2026-02-25', time: '11:00 AM', topic: 'Interview Preparation' },
  ];

  const sessionRequests = [
    { id: 1, student: 'Michael Johnson', requested: '2026-02-19', topic: 'Career Change Advice' },
    { id: 2, student: 'Sarah Davis', requested: '2026-02-18', topic: 'Skill Development' },
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
          <h1 className="text-3xl mb-2">Welcome, Counselor {user?.name}!</h1>
          <p className="text-gray-600">Manage your students and counseling sessions</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={myStudents.length} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Currently advising</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={upcomingSessions.length} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CountUp end={sessionRequests.length} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Sessions</CardTitle>
                  <CardDescription>Your scheduled sessions for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.slice(0, 2).map((session) => (
                    <div key={session.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="p-2 bg-indigo-100 rounded">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{session.topic}</h4>
                        <p className="text-sm text-gray-600">{session.student}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                  <CardTitle>Session Requests</CardTitle>
                  <CardDescription>Students requesting counseling sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{request.student}</h4>
                        <p className="text-sm text-gray-600">{request.topic}</p>
                        <p className="text-xs text-gray-500 mt-1">Requested: {request.requested}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Accept</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Students you are currently advising</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span>{student.sessions} sessions completed</span>
                          <span>•</span>
                          <span>Next: {student.nextSession}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {student.status}
                      </Badge>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>Your upcoming counseling sessions</CardDescription>
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
                        <p className="text-sm text-gray-600">{session.student}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{session.date}</span>
                          <span>{session.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button size="sm">Start Session</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Requests</CardTitle>
                <CardDescription>Review and respond to student session requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{request.student}</h4>
                        <p className="text-sm text-gray-600 mt-1">{request.topic}</p>
                        <p className="text-xs text-gray-500 mt-2">Requested on: {request.requested}</p>
                      </div>
                      <Badge>Pending</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Accept & Schedule</Button>
                      <Button size="sm" variant="outline">Decline</Button>
                      <Button size="sm" variant="outline">Message Student</Button>
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
                <CardDescription>Resources added by admin for student guidance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerResources.map((resource) => (
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


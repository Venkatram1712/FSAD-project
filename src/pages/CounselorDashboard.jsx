import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Badge } from "../components/badge";
import { CountUp } from "../components/count-up";
import { useNavigate } from "react-router-dom";
import {
  CAREER_RESOURCES_STORAGE_KEY,
  getCareerResources
} from "../utils/careerResources";
import {
  GraduationCap,
  Users,
  BookOpen,
  LogOut,
  Calendar,
  MessageSquare,
  User,
  Clock
} from "lucide-react";
function CounselorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [careerResources, setCareerResources] = useState([]);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const myStudents = [
    { id: 1, name: "Emma Wilson", sessions: 5, nextSession: "2026-02-22", status: "active" },
    { id: 2, name: "James Smith", sessions: 3, nextSession: "2026-02-23", status: "active" },
    { id: 3, name: "Olivia Brown", sessions: 7, nextSession: "2026-02-25", status: "active" }
  ];
  const upcomingSessions = [
    { id: 1, student: "Emma Wilson", date: "2026-02-22", time: "10:00 AM", topic: "Career Path Discussion" },
    { id: 2, student: "James Smith", date: "2026-02-23", time: "2:00 PM", topic: "Resume Review" },
    { id: 3, student: "Olivia Brown", date: "2026-02-25", time: "11:00 AM", topic: "Interview Preparation" }
  ];
  const sessionRequests = [
    { id: 1, student: "Michael Johnson", requested: "2026-02-19", topic: "Career Change Advice" },
    { id: 2, student: "Sarah Davis", requested: "2026-02-18", topic: "Skill Development" }
  ];
  useEffect(() => {
    setCareerResources(getCareerResources());
    const handleStorageChange = (event) => {
      if (event.key === CAREER_RESOURCES_STORAGE_KEY) {
        setCareerResources(getCareerResources());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white border-b", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(GraduationCap, { className: "w-8 h-8 text-indigo-600" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Career Guidance Platform" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: user?.name }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", children: user?.role })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleLogout, children: [
          /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4 mr-2" }),
          "Logout"
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl mb-2", children: [
          "Welcome, Counselor ",
          user?.name,
          "!"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Manage your students and counseling sessions" })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "overview", className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "overview", children: "Overview" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "students", children: "My Students" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "sessions", children: "Sessions" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "requests", children: "Requests" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "resources", children: "Resources" })
        ] }),
        /* @__PURE__ */ jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Active Students" }),
                /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-muted-foreground" })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { children: [
                /* @__PURE__ */ jsx(CountUp, { end: myStudents.length, className: "text-2xl font-bold" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Currently advising" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Upcoming Sessions" }),
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { children: [
                /* @__PURE__ */ jsx(CountUp, { end: upcomingSessions.length, className: "text-2xl font-bold" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "This week" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Requests" }),
                /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-muted-foreground" })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { children: [
                /* @__PURE__ */ jsx(CountUp, { end: sessionRequests.length, className: "text-2xl font-bold" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Awaiting response" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsx(CardTitle, { children: "Today's Sessions" }),
                /* @__PURE__ */ jsx(CardDescription, { children: "Your scheduled sessions for today" })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: upcomingSessions.slice(0, 2).map((session) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-3 border rounded-lg", children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 bg-indigo-100 rounded", children: /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-indigo-600" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-medium", children: session.topic }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: session.student }),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                    session.time
                  ] }) })
                ] })
              ] }, session.id)) })
            ] }),
            /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsx(CardTitle, { children: "Session Requests" }),
                /* @__PURE__ */ jsx(CardDescription, { children: "Students requesting counseling sessions" })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: sessionRequests.map((request) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-medium", children: request.student }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: request.topic }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                    "Requested: ",
                    request.requested
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(Button, { size: "sm", children: "Accept" }) })
              ] }, request.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "students", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "My Students" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Students you are currently advising" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: myStudents.map((student) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-3 bg-purple-100 rounded-full", children: /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-purple-600" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium", children: student.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1 text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    student.sessions,
                    " sessions completed"
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Next: ",
                    student.nextSession
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700", children: student.status }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "View Profile" })
            ] })
          ] }, student.id)) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "sessions", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "All Sessions" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Your upcoming counseling sessions" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: upcomingSessions.map((session) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between p-4 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-indigo-100 rounded", children: /* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5 text-indigo-600" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium", children: session.topic }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: session.student }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-gray-500", children: [
                  /* @__PURE__ */ jsx("span", { children: session.date }),
                  /* @__PURE__ */ jsx("span", { children: session.time })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Reschedule" }),
              /* @__PURE__ */ jsx(Button, { size: "sm", children: "Start Session" })
            ] })
          ] }, session.id)) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "requests", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Session Requests" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Review and respond to student session requests" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: sessionRequests.map((request) => /* @__PURE__ */ jsxs("div", { className: "p-4 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium text-lg", children: request.student }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: request.topic }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [
                  "Requested on: ",
                  request.requested
                ] })
              ] }),
              /* @__PURE__ */ jsx(Badge, { children: "Pending" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(Button, { size: "sm", children: "Accept & Schedule" }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Decline" }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Message Student" })
            ] })
          ] }, request.id)) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "resources", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Career Resources" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Resources added by admin for student guidance" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: careerResources.map((resource) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-100 rounded", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-blue-600" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium", children: resource.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                  /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: resource.category }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: resource.createdAt })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "View" })
          ] }, resource.id)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  CounselorDashboard as default
};

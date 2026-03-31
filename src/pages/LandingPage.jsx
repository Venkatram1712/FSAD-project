import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import {
  GraduationCap,
  Target,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from "lucide-react";
function LandingPage() {
  const features = [
    {
      icon: Target,
      title: "Personalized Career Guidance",
      description: "Get tailored career recommendations based on your interests, skills, and goals."
    },
    {
      icon: Users,
      title: "Expert Counselors",
      description: "Connect with experienced career counselors who understand your aspirations."
    },
    {
      icon: BookOpen,
      title: "Learning Resources",
      description: "Access comprehensive guides, articles, and videos to support your career journey."
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor your career development with our intuitive dashboard and analytics."
    }
  ];
  const benefits = [
    "One-on-one counseling sessions",
    "Career assessment tools",
    "Resume and portfolio reviews",
    "Interview preparation",
    "Industry insights and trends",
    "Networking opportunities"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b bg-white sticky top-0 z-50", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(GraduationCap, { className: "w-8 h-8 text-indigo-600" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Career Guidance Platform" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Link, { to: "/login", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Login" }) }),
        /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx(Button, { children: "Sign Up" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-20", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent", children: "Shape Your Future Career" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-600 mb-8", children: "Connect with expert counselors, explore career paths, and access personalized guidance to achieve your professional goals." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 justify-center", children: [
        /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsxs(Button, { size: "lg", className: "text-lg px-8", children: [
          "Get Started",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
        ] }) }),
        /* @__PURE__ */ jsx(Link, { to: "/login", children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", className: "text-lg px-8", children: "Learn More" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-4", children: "Why Choose Our Platform?" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600", children: "Everything you need to navigate your career journey successfully" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: features.map((feature, index) => /* @__PURE__ */ jsxs(Card, { className: "border-2 hover:border-indigo-200 transition-colors", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(feature.icon, { className: "w-6 h-6 text-indigo-600" }) }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: feature.title })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: feature.description }) })
      ] }, index)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-gray-50", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-6", children: "Comprehensive Career Support" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600 mb-8", children: "Our platform provides all the tools and resources you need to make informed career decisions and achieve your professional goals." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: benefits.map((benefit, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-green-600 flex-shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: benefit })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx(Card, { className: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold mb-2", children: "500+" }),
          /* @__PURE__ */ jsx("p", { className: "text-indigo-100", children: "Students Guided" })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold mb-2", children: "50+" }),
          /* @__PURE__ */ jsx("p", { className: "text-blue-100", children: "Expert Counselors" })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold mb-2", children: "95%" }),
          /* @__PURE__ */ jsx("p", { className: "text-purple-100", children: "Success Rate" })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "bg-gradient-to-br from-orange-500 to-red-600 text-white border-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold mb-2", children: "200+" }),
          /* @__PURE__ */ jsx("p", { className: "text-orange-100", children: "Career Paths" })
        ] }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-4", children: "Who Can Benefit?" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600", children: "Our platform serves different user roles with tailored experiences" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxs(Card, { className: "text-center border-2 hover:border-indigo-200 transition-colors", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(GraduationCap, { className: "w-8 h-8 text-blue-600" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl", children: "Students" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: "Explore career paths, book counseling sessions, and access resources to plan your future." }),
            /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Join as Student" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "text-center border-2 hover:border-purple-200 transition-colors", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-8 h-8 text-purple-600" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl", children: "Counselors" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: "Guide students, manage sessions, and make a difference in their career journeys." }),
            /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Join as Counselor" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "text-center border-2 hover:border-green-200 transition-colors", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-8 h-8 text-green-600" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl", children: "Administrators" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: "Manage platform resources, track engagement, and ensure quality service delivery." }),
            /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Join as Admin" }) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold mb-6", children: "Ready to Start Your Career Journey?" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-indigo-100 mb-8 max-w-2xl mx-auto", children: "Join thousands of students who have found their path with our expert guidance and comprehensive resources." }),
      /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsxs(Button, { size: "lg", variant: "secondary", className: "text-lg px-8", children: [
        "Sign Up Now",
        /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "bg-gray-900 text-gray-300 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(GraduationCap, { className: "w-6 h-6 text-indigo-400" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-white", children: "Career Guidance" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Empowering students to make informed career decisions and achieve their dreams." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-white mb-4", children: "Platform" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Features" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Pricing" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Resources" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-white mb-4", children: "Company" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "About Us" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Careers" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Contact" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-white mb-4", children: "Legal" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Privacy Policy" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Terms of Service" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white", children: "Cookie Policy" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-gray-800 pt-8 text-center text-sm", children: /* @__PURE__ */ jsx("p", { children: "\xA9 2026 Career Guidance Platform. All rights reserved." }) })
    ] }) })
  ] });
}
export {
  LandingPage as default
};

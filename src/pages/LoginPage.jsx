import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { GraduationCap } from "lucide-react";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else if (loggedInUser.role === "counselor") {
        navigate("/counselor");
      } else {
        const hasCompletedQuestionnaire = Boolean(loggedInUser.questionnaireCompleted);
        if (hasCompletedQuestionnaire) {
          navigate("/student");
        } else {
          navigate("/questionnaire");
        }
      }
    } else {
      setError("Invalid credentials");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "p-3 bg-indigo-100 rounded-full", children: /* @__PURE__ */ jsx(GraduationCap, { className: "w-8 h-8 text-indigo-600" }) }) }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "Welcome Back" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Sign in to your Career Guidance Platform account" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "name@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              placeholder: "Enter your password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true
            }
          )
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", children: "Login" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center text-sm", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/signup", className: "text-indigo-600 hover:underline", children: "Sign up" })
      ] })
    ] })
  ] }) });
}
export {
  LoginPage as default
};

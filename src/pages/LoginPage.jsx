import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { GraduationCap } from "lucide-react";

function generateCaptcha(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const styledCaptcha = useMemo(
    () => captchaCode.split("").map((char, index) => ({
      char,
      rotate: (index % 2 === 0 ? 1 : -1) * (6 + index * 2)
    })),
    [captchaCode]
  );
  const { login } = useAuth();
  const navigate = useNavigate();

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!captchaInput.trim()) {
      setError("Please enter verification code");
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setError("Invalid verification code");
      refreshCaptcha();
      return;
    }

    const loginResult = await login(email, password);
    if (loginResult?.success && loginResult?.user) {
      const loggedInUser = loginResult.user;
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
      setError(loginResult?.error || "Unable to login. Check backend connection and credentials.");
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
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "captcha", children: "Verification Code" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 h-12 rounded-md border bg-gray-50 px-3 flex items-center justify-center select-none", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: styledCaptcha.map((item, idx) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "font-bold text-pink-500 text-2xl leading-none",
                style: { transform: `rotate(${item.rotate}deg)` },
                children: item.char
              },
              `${item.char}-${idx}`
            )) }) }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: refreshCaptcha, children: "Refresh" })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "captcha",
              type: "text",
              placeholder: "Enter verification code",
              value: captchaInput,
              onChange: (e) => setCaptchaInput(e.target.value),
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

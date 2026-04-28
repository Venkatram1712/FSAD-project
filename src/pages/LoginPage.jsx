import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import { Button } from "../components/button";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeRole(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "role_admin" || raw === "admin") return "admin";
  if (raw === "role_counselor" || raw === "counselor") return "counselor";
  if (raw === "role_student" || raw === "student") return "student";
  return raw;
}

function getHomeRouteForUser(user) {
  const normalizedRole = normalizeRole(user?.role);
  if (normalizedRole === "admin") {
    return "/admin";
  }

  if (normalizedRole === "counselor") {
    return "/counselor";
  }

  return user?.questionnaireCompleted ? "/student" : "/questionnaire";
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styledCaptcha = useMemo(
    () =>
      captchaCode.split("").map((char, index) => ({
        char,
        rotate: (index % 2 === 0 ? 1 : -1) * (6 + index * 2)
      })),
    [captchaCode]
  );

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    navigate(getHomeRouteForUser(user), { replace: true });
  }, [user, navigate]);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setErrors((previous) => ({ ...previous, captchaInput: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!captchaInput.trim()) {
      nextErrors.captchaInput = "Verification code is required.";
    } else if (captchaInput.trim() !== captchaCode) {
      nextErrors.captchaInput = "Verification code does not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) {
      if (captchaInput.trim() && captchaInput.trim() !== captchaCode) {
        refreshCaptcha();
      }
      return;
    }

    setIsSubmitting(true);
    const loginResult = await login(email.trim(), password);
    setIsSubmitting(false);

    if (loginResult?.success && loginResult?.user) {
      const loggedInUser = loginResult.user;
      navigate(getHomeRouteForUser(loggedInUser), { replace: true });
      return;
    }

    setServerError(loginResult?.error || "Unable to login. Check credentials or backend API status.");
    refreshCaptcha();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
      <Card className="w-full max-w-md border-slate-200/80 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Career Guidance Platform account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((previous) => ({ ...previous, email: "" }));
                }}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((previous) => ({ ...previous, password: "" }));
                }}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha">Verification Code</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-12 rounded-md border bg-gray-50 px-3 flex items-center justify-center select-none">
                  <div className="flex items-center gap-1">
                    {styledCaptcha.map((item, index) => (
                      <span
                        key={`${item.char}-${index}`}
                        className="font-bold text-pink-500 text-2xl leading-none"
                        style={{ transform: `rotate(${item.rotate}deg)` }}
                      >
                        {item.char}
                      </span>
                    ))}
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={refreshCaptcha}>
                  Refresh
                </Button>
              </div>
              <Input
                id="captcha"
                type="text"
                placeholder="Enter verification code"
                value={captchaInput}
                onChange={(event) => {
                  setCaptchaInput(event.target.value);
                  setErrors((previous) => ({ ...previous, captchaInput: "" }));
                }}
              />
              {errors.captchaInput && <p className="text-xs text-red-600">{errors.captchaInput}</p>}
            </div>

            {serverError && (
              <Alert variant="destructive">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default LoginPage;

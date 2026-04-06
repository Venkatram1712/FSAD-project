import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { GraduationCap } from "lucide-react";

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src=\"${GOOGLE_SCRIPT_URL}\"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function getTargetPathByRole(user) {
  if (user?.role === "admin") {
    return "/admin";
  }

  if (user?.role === "counselor") {
    return "/counselor";
  }

  return user?.questionnaireCompleted ? "/student" : "/questionnaire";
}

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const googleButtonRef = useRef(null);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    let isMounted = true;

    (async () => {
      const scriptLoaded = await loadGoogleScript();
      if (!isMounted || !scriptLoaded || !googleButtonRef.current || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) {
            setGoogleError("Google login failed. Please try again.");
            return;
          }

          const googleResult = await googleLogin(response.credential, "student");
          if (!googleResult?.success || !googleResult?.user) {
            setGoogleError(googleResult?.error || "Google login failed. Please try again.");
            return;
          }

          navigate(getTargetPathByRole(googleResult.user));
        }
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: 320,
        text: "signup_with"
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const signupResult = await signup(name, email, password);

    if (!signupResult?.success || !signupResult?.user) {
      setError(signupResult?.error || "Registration failed. Please check backend API.");
      return;
    }

    navigate(getTargetPathByRole(signupResult.user));
  };

  const canUseGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Student Sign Up</CardTitle>
          <CardDescription>Create your student account to start the questionnaire</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          {canUseGoogle ? (
            <div className="flex justify-center">
              <div ref={googleButtonRef} />
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Set VITE_GOOGLE_CLIENT_ID in frontend .env to enable Google Sign Up.
            </p>
          )}
          {googleError && <p className="mt-2 text-sm text-red-600 text-center">{googleError}</p>}
          <div className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export {
  SignupPage as default
};

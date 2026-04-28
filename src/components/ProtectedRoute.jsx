import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";

function normalizeRole(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "role_admin" || raw === "admin") return "admin";
  if (raw === "role_counselor" || raw === "counselor") return "counselor";
  if (raw === "role_student" || raw === "student") return "student";
  return "student";
}

function roleHomePath(role) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/admin";
  if (normalized === "counselor") return "/counselor";
  return "/student";
}

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">
        <div className="text-center rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base font-medium text-slate-700">Restoring your session...</p>
          <p className="mt-1 text-sm text-slate-500">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole === null) {
    return children;
  }

  const normalizedUserRole = normalizeRole(user.role);
  const normalizedAllowedRole = normalizeRole(allowedRole);

  if (normalizedUserRole !== normalizedAllowedRole) {
    return <Navigate to={roleHomePath(normalizedUserRole)} replace />;
  }

  return children;
}

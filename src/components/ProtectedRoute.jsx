import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
function ProtectedRoute({ children, allowedRole }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Loading..." })
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
  }
  if (allowedRole === null) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  if (user.role !== allowedRole) {
    return /* @__PURE__ */ jsx(Navigate, { to: `/${user.role}`, replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
export {
  ProtectedRoute as default
};

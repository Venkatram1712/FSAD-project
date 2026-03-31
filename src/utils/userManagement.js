import axios from "axios";

const USERS_STORAGE_KEY = "users";
const SIGNUP_EVENTS_STORAGE_KEY = "signupEvents";
const LOGIN_EVENTS_STORAGE_KEY = "loginEvents";
const ACTIVE_SESSIONS_STORAGE_KEY = "activeSessions";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_ENABLED = Boolean(API_BASE_URL);
const DEFAULT_USERS_ENDPOINTS = ["/api/users", "/api/auth/users", "/api/admin/users"];

const CONFIGURED_USERS_ENDPOINTS = String(import.meta.env.VITE_USERS_ENDPOINTS || "")
  .split(",")
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);

const signupEventsStore = [];
const loginEventsStore = [];
const activeSessionsStore = new Map();

function normalizeRole(role) {
  return String(role || "student").trim().toLowerCase();
}

function toBackendRole(role) {
  return normalizeRole(role).toUpperCase();
}

function inferCreatedAtFromId(id) {
  const timestamp = Number(id);
  if (Number.isFinite(timestamp)) {
    return new Date(timestamp).toISOString();
  }

  return new Date().toISOString();
}

function sanitizeUser(rawUser) {
  const id = String(rawUser?.id || rawUser?.userId || Date.now());
  const role = normalizeRole(rawUser?.role);

  return {
    id,
    name: String(rawUser?.name || rawUser?.fullName || "").trim(),
    email: String(rawUser?.email || "").trim().toLowerCase(),
    password: String(rawUser?.password || ""),
    role,
    status: rawUser?.status ? String(rawUser.status).toLowerCase() : "active",
    specialization: String(rawUser?.specialization || "").trim(),
    questionnaireCompleted: Boolean(rawUser?.questionnaireCompleted),
    createdAt: rawUser?.createdAt || inferCreatedAtFromId(id),
    updatedAt: rawUser?.updatedAt || rawUser?.createdAt || inferCreatedAtFromId(id)
  };
}

function mapApiUser(apiPayload, email, password) {
  const payloadUser = apiPayload?.user || apiPayload;
  if (!payloadUser || typeof payloadUser !== "object") {
    return null;
  }

  return sanitizeUser({
    id: payloadUser.id || payloadUser.userId || Date.now().toString(),
    name: payloadUser.name || payloadUser.fullName || String(email || "").split("@")[0],
    email: payloadUser.email || email,
    password,
    role: payloadUser.role || "student",
    status: payloadUser.status || "active",
    specialization: payloadUser.specialization || "",
    questionnaireCompleted: Boolean(payloadUser.questionnaireCompleted),
    createdAt: payloadUser.createdAt,
    updatedAt: new Date().toISOString()
  });
}

function mapApiUsers(payload) {
  if (!payload) {
    return [];
  }

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.users)
      ? payload.users
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  return list.map((item) => sanitizeUser(item));
}

async function requestFirst(method, paths, data) {
  if (!API_ENABLED) {
    return null;
  }

  const requestErrors = [];

  for (const path of paths) {
    try {
      const response = await axios({
        method,
        url: `${API_BASE_URL}${path}`,
        data
      });

      return response?.data ?? null;
    } catch (error) {
      requestErrors.push({
        path,
        status: error?.response?.status || null
      });
      // Try the next known endpoint variant.
    }
  }

  const attempted = requestErrors
    .map((entry) => `${entry.path}:${entry.status ?? "ERR"}`)
    .join(", ");

  throw new Error(
    `Unable to load users from API. Checked endpoints at ${API_BASE_URL}: ${attempted || "none"}. ` +
      "Set VITE_USERS_ENDPOINTS in frontend env to your backend users endpoint."
  );
}

async function fetchUsersFromApi() {
  const endpointCandidates = [...new Set([...CONFIGURED_USERS_ENDPOINTS, ...DEFAULT_USERS_ENDPOINTS])];
  const responseData = await requestFirst("get", endpointCandidates);
  return mapApiUsers(responseData);
}

async function authenticateUser(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!API_ENABLED) {
    return { success: false, user: null, source: "none" };
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: normalizedEmail,
      password
    });

    const mappedUser = mapApiUser(response?.data, normalizedEmail, password);
    if (!mappedUser) {
      return { success: false, user: null, source: "none" };
    }

    return { success: true, user: mappedUser, source: "api" };
  } catch {
    return { success: false, user: null, source: "none" };
  }
}

async function registerUserInApi(payload) {
  const responseData = await requestFirst("post", ["/api/auth/register", "/api/users", "/api/admin/users"], {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: toBackendRole(payload.role),
    status: payload.status,
    specialization: payload.specialization
  });

  if (!responseData) {
    return { success: false, user: null };
  }

  return { success: true, user: mapApiUser(responseData, payload.email, payload.password) };
}

async function createUser(payload, options = {}) {
  const email = String(payload?.email || "").trim().toLowerCase();
  const existingUsers = await getUsers();
  const duplicate = existingUsers.find((user) => user.email === email);

  if (duplicate) {
    return { success: false, error: "EMAIL_EXISTS" };
  }

  const newUser = sanitizeUser({
    id: payload?.id || Date.now().toString(),
    name: payload?.name,
    email,
    password: payload?.password,
    role: payload?.role,
    status: payload?.status || "active",
    specialization: payload?.specialization || "",
    questionnaireCompleted: payload?.questionnaireCompleted || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const syncEnabled = options.syncApi !== false;
  if (!syncEnabled) {
    return { success: false, error: "API_REQUIRED" };
  }

  const createdInApi = await registerUserInApi(newUser);
  if (!createdInApi.success) {
    return { success: false, error: "API_CREATE_FAILED" };
  }

  if (options.trackSignup) {
    recordSignupEvent({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      source: options.source || "signup"
    });
  }

  return { success: true, user: createdInApi.user || newUser };
}

async function updateUserById(userId, updates) {
  const payload = {
    ...updates,
    email: updates?.email ? String(updates.email).trim().toLowerCase() : undefined,
    role: updates?.role ? toBackendRole(updates.role) : undefined
  };

  const responseData = await requestFirst("put", [
    `/api/users/${userId}`,
    `/api/admin/users/${userId}`,
    `/api/auth/users/${userId}`
  ], payload);

  if (!responseData) {
    return { success: false, error: "NOT_FOUND" };
  }

  const updated = mapApiUser(responseData, payload.email, "") || sanitizeUser({ id: userId, ...updates });
  return { success: true, user: updated };
}

async function deleteUserById(userId) {
  const responseData = await requestFirst("delete", [
    `/api/users/${userId}`,
    `/api/admin/users/${userId}`,
    `/api/auth/users/${userId}`
  ]);

  if (!responseData) {
    return { success: false, error: "NOT_FOUND" };
  }

  clearActiveSession(userId);
  return { success: true };
}

function recordSignupEvent({ userId, email, role, source = "signup" }) {
  const event = {
    id: `${Date.now()}-signup-${userId || "unknown"}`,
    userId: String(userId || ""),
    email: String(email || "").trim().toLowerCase(),
    role: normalizeRole(role),
    source,
    createdAt: new Date().toISOString()
  };

  signupEventsStore.unshift(event);
  return event;
}

function recordLoginEvent({ userId, email, role }) {
  const event = {
    id: `${Date.now()}-login-${userId || "unknown"}`,
    userId: String(userId || ""),
    email: String(email || "").trim().toLowerCase(),
    role: normalizeRole(role),
    createdAt: new Date().toISOString()
  };

  loginEventsStore.unshift(event);
  return event;
}

function getSignupEvents() {
  return [...signupEventsStore];
}

function getLoginEvents() {
  return [...loginEventsStore];
}

function setActiveSession(user) {
  if (!user?.id) {
    return;
  }

  activeSessionsStore.set(user.id, {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    updatedAt: new Date().toISOString()
  });
}

function clearActiveSession(userId) {
  if (!userId) {
    return;
  }

  activeSessionsStore.delete(userId);
}

function getActiveSessions() {
  return Array.from(activeSessionsStore.values());
}

async function getUsers() {
  return fetchUsersFromApi();
}

async function getUsersByRole(role) {
  const normalizedRole = normalizeRole(role);
  const users = await getUsers();
  return users.filter((user) => user.role === normalizedRole);
}

function saveUsers(users) {
  return users.map(sanitizeUser);
}

async function getAdminMetrics() {
  const users = await getUsers();
  const signupEvents = getSignupEvents();
  const loginEvents = getLoginEvents();
  const activeSessions = getActiveSessions();

  return {
    totalUsers: users.length,
    totalCounselors: users.filter((user) => user.role === "counselor").length,
    totalStudents: users.filter((user) => user.role === "student").length,
    activeCounselors: users.filter((user) => user.role === "counselor" && user.status === "active").length,
    totalSignups: signupEvents.length,
    totalLoginEvents: loginEvents.length,
    currentlyLoggedInUsers: activeSessions.length
  };
}

export {
  ACTIVE_SESSIONS_STORAGE_KEY,
  LOGIN_EVENTS_STORAGE_KEY,
  SIGNUP_EVENTS_STORAGE_KEY,
  USERS_STORAGE_KEY,
  authenticateUser,
  clearActiveSession,
  createUser,
  deleteUserById,
  getActiveSessions,
  getAdminMetrics,
  getLoginEvents,
  getSignupEvents,
  getUsers,
  getUsersByRole,
  normalizeRole,
  recordLoginEvent,
  recordSignupEvent,
  saveUsers,
  setActiveSession,
  updateUserById
};
import axios from "axios";

const USERS_STORAGE_KEY = "users";
const SIGNUP_EVENTS_STORAGE_KEY = "signupEvents";
const LOGIN_EVENTS_STORAGE_KEY = "loginEvents";
const ACTIVE_SESSIONS_STORAGE_KEY = "activeSessions";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const API_ENABLED = true;
const DEFAULT_USERS_ENDPOINTS = ["/api/users", "/api/auth/users", "/api/admin/users"];
const DEFAULT_STUDENTS_ENDPOINTS = ["/api/auth/users/students", "/api/users/students", "/api/students"];

const CONFIGURED_USERS_ENDPOINTS = String(import.meta.env.VITE_USERS_ENDPOINTS || "")
  .split(",")
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);

const CONFIGURED_STUDENTS_ENDPOINTS = String(import.meta.env.VITE_STUDENTS_ENDPOINTS || "")
  .split(",")
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);

const signupEventsStore = [];
const loginEventsStore = [];
const activeSessionsStore = new Map();

function buildApiUrl(path) {
  const normalizedPath = String(path || "");
  if (!API_BASE_URL) {
    return normalizedPath;
  }

  if (API_BASE_URL.endsWith("/") && normalizedPath.startsWith("/")) {
    return `${API_BASE_URL.slice(0, -1)}${normalizedPath}`;
  }

  if (!API_BASE_URL.endsWith("/") && !normalizedPath.startsWith("/")) {
    return `${API_BASE_URL}/${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

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

function hasQuestionnaireCompletedField(user) {
  return Boolean(user) && Object.prototype.hasOwnProperty.call(user, "questionnaireCompleted");
}

function sanitizeUser(rawUser) {
  const id = String(rawUser?.id || rawUser?.userId || Date.now());
  const role = normalizeRole(rawUser?.role);
  const questionnaireCompleted = hasQuestionnaireCompletedField(rawUser)
    ? Boolean(rawUser?.questionnaireCompleted)
    : undefined;

  return {
    id,
    name: String(rawUser?.name || rawUser?.fullName || "").trim(),
    email: String(rawUser?.email || "").trim().toLowerCase(),
    password: String(rawUser?.password || ""),
    role,
    status: rawUser?.status ? String(rawUser.status).toLowerCase() : "active",
    specialization: String(rawUser?.specialization || "").trim(),
    phone: String(rawUser?.phone || "").trim(),
    bio: String(rawUser?.bio || "").trim(),
    institution: String(rawUser?.institution || "").trim(),
    experienceYears: Number.isFinite(Number(rawUser?.experienceYears)) ? Number(rawUser.experienceYears) : null,
    questionnaireCompleted,
    createdAt: rawUser?.createdAt || inferCreatedAtFromId(id),
    updatedAt: rawUser?.updatedAt || rawUser?.createdAt || inferCreatedAtFromId(id)
  };
}

function mapApiUser(apiPayload, email, password) {
  const payloadUser =
    apiPayload?.user ||
    apiPayload?.data?.user ||
    apiPayload?.data ||
    apiPayload?.result?.user ||
    apiPayload?.result ||
    apiPayload;

  if (apiPayload?.success === false) {
    return null;
  }

  if (!payloadUser || typeof payloadUser !== "object") {
    return null;
  }

  const hasKnownUserField = ["id", "userId", "email", "name", "fullName", "role"].some((key) =>
    Object.prototype.hasOwnProperty.call(payloadUser, key)
  );
  if (!hasKnownUserField) {
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
    questionnaireCompleted: payloadUser.questionnaireCompleted,
    createdAt: payloadUser.createdAt,
    updatedAt: new Date().toISOString()
  });
}

function mapApiUsers(payload) {
  if (!payload) {
    return [];
  }

  if (payload?.success === false) {
    return [];
  }

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.users)
      ? payload.users
      : Array.isArray(payload?.data?.users)
        ? payload.data.users
      : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload?.result?.users)
          ? payload.result.users
        : Array.isArray(payload?.result)
          ? payload.result
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
        url: buildApiUrl(path),
        data,
        timeout: 10000
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

  const requestError = new Error(
    `API request failed (${String(method || "get").toUpperCase()}). ` +
      `Checked endpoints at ${API_BASE_URL || "(dev proxy /api)"}: ${attempted || "none"}.`
  );
  requestError.attemptedPaths = requestErrors;
  throw requestError;
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
    const response = await axios.post(buildApiUrl("/api/auth/login"), {
      email: normalizedEmail,
      password
    });

    if (response?.data?.success === false) {
      return {
        success: false,
        user: null,
        source: "none",
        error: response?.data?.message || "INVALID_CREDENTIALS"
      };
    }

    const mappedUser = mapApiUser(response?.data, normalizedEmail, password);
    if (!mappedUser) {
      return {
        success: false,
        user: null,
        source: "none",
        error: "INVALID_LOGIN_RESPONSE"
      };
    }

    return { success: true, user: mappedUser, source: "api" };
  } catch (error) {
    return {
      success: false,
      user: null,
      source: "none",
      error:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 401 ? "Invalid credentials" : "Unable to connect to backend")
    };
  }
}

async function registerUserInApi(payload) {
  const responseData = await requestFirst("post", ["/api/auth/register", "/api/users", "/api/admin/users"], {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: toBackendRole(payload.role),
    status: payload.status,
    specialization: payload.specialization,
    phone: payload.phone,
    bio: payload.bio,
    institution: payload.institution,
    experienceYears: payload.experienceYears
  });

  if (!responseData) {
    return { success: false, user: null, error: "EMPTY_REGISTER_RESPONSE" };
  }

  const mappedUser = mapApiUser(responseData, payload.email, payload.password);
  if (!mappedUser) {
    return {
      success: false,
      user: null,
      error:
        responseData?.message ||
        responseData?.error ||
        "INVALID_REGISTER_RESPONSE"
    };
  }

  return { success: true, user: mappedUser };
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
    questionnaireCompleted: payload?.questionnaireCompleted ?? false,
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

  try {
    const responseData = await requestFirst("put", [
      `/api/users/${userId}`,
      `/api/admin/users/${userId}`,
      `/api/auth/users/${userId}`
    ], payload);

    if (!responseData) {
      return { success: false, error: "Empty response from backend" };
    }

    const updated = mapApiUser(responseData, payload.email, "");
    if (!updated) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || "Invalid user update response"
      };
    }

    return { success: true, user: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save profile to backend"
    };
  }
}

async function deleteUserById(userId) {
  try {
    await requestFirst("delete", [
      `/api/users/${userId}`,
      `/api/admin/users/${userId}`,
      `/api/auth/users/${userId}`
    ]);
  } catch (error) {
    const attemptedPaths = Array.isArray(error?.attemptedPaths) ? error.attemptedPaths : [];
    const methodNotSupported = attemptedPaths.length > 0 && attemptedPaths.every((entry) => {
      const status = Number(entry?.status);
      return status === 404 || status === 405;
    });

    if (methodNotSupported) {
      throw new Error(
        "Delete endpoint is not available in backend API. " +
          "Please implement DELETE /api/auth/users/{id} (or configure VITE_USERS_ENDPOINTS to a users route that supports DELETE)."
      );
    }

    throw error;
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

async function getStudents() {
  const endpointCandidates = [
    ...new Set([...CONFIGURED_STUDENTS_ENDPOINTS, ...DEFAULT_STUDENTS_ENDPOINTS])
  ];

  const responseData = await requestFirst("get", endpointCandidates);
  const students = mapApiUsers(responseData);

  // Keep only student records in case backend endpoint returns mixed users.
  return students.filter((student) => student.role === "student");
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

async function saveQuestionnaireResponse(userId, responseData) {
  if (!API_ENABLED) {
    console.warn("API disabled: questionnaire response not saved");
    return { success: false, error: "API_DISABLED" };
  }

  try {
    const payload = {
      userId,
      interests: Array.isArray(responseData.interests) ? responseData.interests : [],
      strengths: String(responseData.strengths || "").trim(),
      careerGoals: String(responseData.careerGoals || "").trim(),
      educationLevel: String(responseData.educationLevel || "").trim(),
      industries: Array.isArray(responseData.industries) ? responseData.industries : [],
      workStyle: String(responseData.workStyle || "").trim(),
      skills: String(responseData.skills || "").trim(),
      timeline: String(responseData.timeline || "").trim(),
      submittedAt: new Date().toISOString()
    };

    const response = await axios.post(
      buildApiUrl("/api/questionnaire/responses"),
      payload
    );

    return {
      success: true,
      responseId: response?.data?.id || response?.data?.responseId,
      data: response?.data
    };
  } catch (error) {
    console.error("Failed to save questionnaire response:", error?.response?.status, error?.message);
    return {
      success: false,
      error: error?.response?.status || "SAVE_FAILED"
    };
  }
}

// ============== SESSION MANAGEMENT ==============

async function createSession(sessionData) {
  if (!API_ENABLED) {
    return {
      success: false,
      error: "API_DISABLED"
    };
  }

  try {
    const normalizedDate = String(sessionData.sessionDate || "").trim();
    const normalizedStartTime = String(sessionData.sessionStartTime || sessionData.sessionTime || "").trim();
    const normalizedEndTime = String(sessionData.sessionEndTime || "").trim();
    const dateTime = normalizedDate && normalizedStartTime
      ? `${normalizedDate}T${normalizedStartTime}:00`
      : normalizedDate;
    const endDateTime = normalizedDate && normalizedEndTime
      ? `${normalizedDate}T${normalizedEndTime}:00`
      : null;

    const payload = {
      counselorId: sessionData.counselorId,
      studentId: sessionData.studentId,
      topic: sessionData.sessionName,
      date: dateTime,
      time: normalizedStartTime,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      endDateTime,
      notes: sessionData.description,
      status: sessionData.status || "scheduled",
      createdAt: new Date().toISOString()
    };

    const response = await axios.post(
      buildApiUrl("/api/sessions"),
      payload
    );

    return {
      success: true,
      sessionId: response?.data?.data?.id || response?.data?.id || response?.data?.sessionId,
      data: response?.data
    };
  } catch (error) {
    console.error("Failed to create session:", error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.response?.status || "CREATE_FAILED"
    };
  }
}

function normalizeSession(item) {
  const dateValue = item?.date || item?.sessionDate || item?.startDateTime || "";
  const startTime = item?.startTime || item?.time || item?.sessionTime || "";
  const endTime = item?.endTime || item?.sessionEndTime || "";
  const normalizedId = item?.id || item?.sessionId || item?.session_id || item?.sessionID;

  return {
    ...item,
    id: normalizedId,
    date: dateValue,
    time: startTime,
    startTime,
    endTime,
    status: String(item?.status || "scheduled").toLowerCase()
  };
}

async function getSessionsByCounselor(counselorId) {
  if (!API_ENABLED) {
    return [];
  }

  try {
    const response = await axios.get(
      buildApiUrl(`/api/sessions/counselor/${counselorId}`)
    );

    const sessions = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.sessions)
        ? response.data.sessions
        : [];

    return sessions.map(normalizeSession);
  } catch (error) {
    console.error("Failed to fetch counselor sessions from API:", error?.message);
    return [];
  }
}

async function getSessionsByStudent(studentId) {
  if (!API_ENABLED) {
    return [];
  }

  try {
    const response = await axios.get(
      buildApiUrl(`/api/sessions/student/${studentId}`)
    );

    const sessions = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.sessions)
        ? response.data.sessions
        : [];

    return sessions.map(normalizeSession);
  } catch (error) {
    console.error("Failed to fetch student sessions from API:", error?.message);
    return [];
  }
}

async function updateSessionSchedule(sessionId, payload) {
  if (!API_ENABLED) {
    return { success: false, error: "API_DISABLED" };
  }

  try {
    const response = await axios.put(buildApiUrl(`/api/sessions/${sessionId}`), payload);
    return { success: true, data: response?.data };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.response?.status || "UPDATE_FAILED"
    };
  }
}

async function getSessionById(sessionId) {
  if (!API_ENABLED) {
    return null;
  }

  try {
    const response = await axios.get(
      buildApiUrl(`/api/sessions/${sessionId}`)
    );

    return response?.data || null;
  } catch (error) {
    console.error("Failed to fetch session:", error?.message);
    return null;
  }
}

async function updateSessionStatus(sessionId, status) {
  if (!API_ENABLED) {
    return { success: false, error: "API_DISABLED" };
  }

  try {
    const response = await axios.put(
      buildApiUrl(`/api/sessions/${sessionId}`),
      { status }
    );

    return {
      success: true,
      data: response?.data
    };
  } catch (error) {
    console.error("Failed to update session status:", error?.message);
    return {
      success: false,
      error: error?.response?.status || "UPDATE_FAILED"
    };
  }
}

async function deleteSessionById(sessionId) {
  if (!API_ENABLED) {
    return { success: false, error: "API_DISABLED" };
  }

  const normalizedSessionId = String(sessionId || "").trim();
  if (!normalizedSessionId) {
    return { success: false, error: "SESSION_ID_MISSING" };
  }

  try {
    await requestFirst("delete", [
      `/api/sessions/${normalizedSessionId}`,
      `/api/session/${normalizedSessionId}`,
      `/api/sessions/delete/${normalizedSessionId}`
    ]);
    return { success: true };
  } catch (error) {
    const attemptedPaths = Array.isArray(error?.attemptedPaths) ? error.attemptedPaths : [];
    const methodNotSupported = attemptedPaths.length > 0 && attemptedPaths.every((entry) => {
      const status = Number(entry?.status);
      return status === 404 || status === 405;
    });

    if (methodNotSupported) {
      return {
        success: false,
        error: "Delete session endpoint is not available in backend API. Please implement DELETE /api/sessions/{id}."
      };
    }

    const attemptedSummary = attemptedPaths
      .map((entry) => `${entry.path}:${entry.status ?? "ERR"}`)
      .join(", ");

    console.error("Failed to delete session:", error?.message);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.response?.status ||
        (attemptedSummary
          ? `Unable to delete session. Backend delete route not reachable. Tried: ${attemptedSummary}`
          : "Unable to delete session. Backend delete route not reachable.")
    };
  }
}

// ============== CHAT MESSAGES ==============

async function sendChatMessage(sessionId, senderId, senderRole, message) {
  if (!API_ENABLED) {
    return { success: false, error: "API_DISABLED" };
  }

  const normalizedSessionId = String(sessionId || "").trim();
  if (!normalizedSessionId) {
    return { success: false, error: "SESSION_ID_MISSING" };
  }

  try {
    const now = new Date();
    const localDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const messageText = String(message || "").trim();
    const senderRoleValue = String(senderRole || "").trim();
    const senderRoleUpper = senderRoleValue.toUpperCase();
    const senderRoleLower = senderRoleValue.toLowerCase();
    const senderIdValue = String(senderId || "").trim();
    const senderIdAsNumber = Number(senderIdValue);
    const normalizedTimestamp = localDateTime;

    const endpointCandidates = [
      `/api/sessions/${normalizedSessionId}/messages`,
      `/api/session/${normalizedSessionId}/messages`,
      `/api/messages/session/${normalizedSessionId}`
    ];

    const payloadCandidates = [
      {
        sessionId: normalizedSessionId,
        senderId,
        senderRole: senderRoleLower,
        message: messageText,
        timestamp: normalizedTimestamp
      },
      {
        sessionId: normalizedSessionId,
        senderId: Number.isFinite(senderIdAsNumber) ? senderIdAsNumber : senderIdValue,
        senderRole: senderRoleUpper,
        message: messageText,
        sentAt: normalizedTimestamp
      },
      {
        sessionId: normalizedSessionId,
        userId: Number.isFinite(senderIdAsNumber) ? senderIdAsNumber : senderIdValue,
        role: senderRoleUpper,
        content: messageText,
        createdAt: normalizedTimestamp
      }
    ];

    const requestErrors = [];
    let responseData = null;

    for (const path of endpointCandidates) {
      for (const payload of payloadCandidates) {
        try {
          const response = await axios.post(buildApiUrl(path), payload, { timeout: 10000 });
          responseData = response?.data ?? null;
          break;
        } catch (error) {
          requestErrors.push({
            path,
            status: error?.response?.status || null,
            message: error?.response?.data?.message || error?.response?.data?.error || error?.message || "REQUEST_FAILED"
          });
        }
      }

      if (responseData !== null) {
        break;
      }
    }

    if (responseData === null) {
      const attemptedSummary = requestErrors
        .map((entry) => `${entry.path}:${entry.status ?? "ERR"}`)
        .join(", ");
      const firstMessage = requestErrors.find((entry) => entry.message)?.message;

      return {
        success: false,
        error:
          firstMessage ||
          (attemptedSummary
            ? `Unable to send message. Tried: ${attemptedSummary}`
            : "SEND_FAILED")
      };
    }

    return {
      success: true,
      messageId: responseData?.data?.id || responseData?.id || responseData?.messageId,
      data: responseData
    };
  } catch (error) {
    console.error("Failed to send chat message:", error?.message);

    const attemptedPaths = Array.isArray(error?.attemptedPaths) ? error.attemptedPaths : [];
    const attemptedSummary = attemptedPaths
      .map((entry) => `${entry.path}:${entry.status ?? "ERR"}`)
      .join(", ");

    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        (attemptedSummary
          ? `Unable to send message. Tried: ${attemptedSummary}`
          : "SEND_FAILED")
    };
  }
}

async function getSessionMessages(sessionId) {
  if (!API_ENABLED) {
    return [];
  }

  const normalizedSessionId = String(sessionId || "").trim();
  if (!normalizedSessionId) {
    return [];
  }

  try {
    const endpointCandidates = [
      `/api/sessions/${normalizedSessionId}/messages`,
      `/api/session/${normalizedSessionId}/messages`,
      `/api/messages/session/${normalizedSessionId}`
    ];

    const responseData = await requestFirst("get", endpointCandidates);

    const messages = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData?.messages)
        ? responseData.messages
        : [];

    // Sort by timestamp
    return messages.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  } catch (error) {
    console.error("Failed to fetch messages:", error?.message);
    return [];
  }
}

export {
  ACTIVE_SESSIONS_STORAGE_KEY,
  LOGIN_EVENTS_STORAGE_KEY,
  SIGNUP_EVENTS_STORAGE_KEY,
  USERS_STORAGE_KEY,
  authenticateUser,
  clearActiveSession,
  createSession,
  createUser,
  deleteSessionById,
  deleteUserById,
  getActiveSessions,
  getAdminMetrics,
  getLoginEvents,
  getSessionById,
  getSessionMessages,
  getSessionsByCounselor,
  getSessionsByStudent,
  getSignupEvents,
  getStudents,
  getUsers,
  getUsersByRole,
  normalizeRole,
  recordLoginEvent,
  recordSignupEvent,
  saveQuestionnaireResponse,
  saveUsers,
  sendChatMessage,
  setActiveSession,
  updateSessionSchedule,
  updateSessionStatus,
  updateUserById
};
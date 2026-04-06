/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import {
  authenticateWithGoogleToken,
  authenticateUser,
  clearActiveSession,
  createUser,
  recordLoginEvent,
  setActiveSession,
  updateUserById
} from "../utils/userManagement";

const AuthContext = createContext(undefined);
const QUESTIONNAIRE_COMPLETION_STORAGE_KEY = "questionnaireCompletionByUser";

function getQuestionnaireCompletionKeys(userId, email) {
  const keys = [];

  if (userId) {
    keys.push(`id:${String(userId)}`);
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail) {
    keys.push(`email:${normalizedEmail}`);
  }

  return keys;
}

function readQuestionnaireCompletionMap() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(QUESTIONNAIRE_COMPLETION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeQuestionnaireCompletionMap(map) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(QUESTIONNAIRE_COMPLETION_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage write failures.
  }
}

function getLocalQuestionnaireCompletionState(userId, email) {
  const map = readQuestionnaireCompletionMap();
  const keys = getQuestionnaireCompletionKeys(userId, email);

  for (const key of keys) {
    if (typeof map[key] === "boolean") {
      return map[key];
    }
  }

  return undefined;
}

function persistQuestionnaireCompletion(userId, email, completed) {
  const keys = getQuestionnaireCompletionKeys(userId, email);
  if (keys.length === 0) {
    return;
  }

  const map = readQuestionnaireCompletionMap();
  for (const key of keys) {
    map[key] = Boolean(completed);
  }

  writeQuestionnaireCompletionMap(map);
}

function toPublicUser(user) {
  // Priority: localStorage > server > default to false
  // localStorage is most recent (set when user completes questionnaire)
  const localQuestionnaireState = getLocalQuestionnaireCompletionState(user.id, user.email);
  
  if (typeof localQuestionnaireState === "boolean") {
    // User has localStorage completion record - use it
    var hasCompletedQuestionnaire = localQuestionnaireState;
  } else if (typeof user.questionnaireCompleted === "boolean") {
    // No localStorage, but server has a value - use it
    var hasCompletedQuestionnaire = user.questionnaireCompleted;
  } else {
    // No data anywhere - default to false (new user)
    var hasCompletedQuestionnaire = false;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    specialization: user.specialization,
    phone: user.phone,
    bio: user.bio,
    institution: user.institution,
    experienceYears: user.experienceYears,
    questionnaireCompleted: Boolean(hasCompletedQuestionnaire),
    createdAt: user.createdAt
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isLoading = false;

  const login = async (email, password) => {
    const authResult = await authenticateUser(email, password);
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error || "Login failed"
      };
    }

    const foundUser = authResult.user;

    const publicUser = toPublicUser(foundUser);
    setUser(publicUser);

    if (publicUser.questionnaireCompleted) {
      persistQuestionnaireCompletion(publicUser.id, publicUser.email, true);
    }

    recordLoginEvent({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    });
    setActiveSession(foundUser);

    return {
      success: true,
      user: publicUser
    };
  };

  const signup = async (name, email, password) => {
    const result = await createUser(
      {
        name,
        email,
        password,
        role: "student",
        questionnaireCompleted: false,
        status: "active"
      },
      {
        trackSignup: true,
        source: "signup",
        syncApi: true
      }
    );

    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.error || "Registration failed"
      };
    }

    // New signups should always see the questionnaire once.
    persistQuestionnaireCompletion(result.user.id, result.user.email, false);

    const publicUser = toPublicUser(result.user);
    setUser(publicUser);

    return {
      success: true,
      user: publicUser
    };
  };

  const googleLogin = async (idToken, role = "student") => {
    const authResult = await authenticateWithGoogleToken(idToken, role);
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error || "Google login failed"
      };
    }

    const foundUser = authResult.user;
    const publicUser = toPublicUser(foundUser);
    setUser(publicUser);

    if (publicUser.questionnaireCompleted) {
      persistQuestionnaireCompletion(publicUser.id, publicUser.email, true);
    }

    recordLoginEvent({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    });
    setActiveSession(foundUser);

    return {
      success: true,
      user: publicUser
    };
  };

  const markQuestionnaireCompleted = async () => {
    const currentUser = user;
    if (!currentUser) {
      return false;
    }

    let updatedUser = {
      ...currentUser,
      questionnaireCompleted: true
    };

    try {
      const updateResult = await updateUserById(currentUser.id, {
        questionnaireCompleted: true
      });

      if (updateResult?.success && updateResult?.user) {
        updatedUser = toPublicUser(updateResult.user);
      }
    } catch {
      // Keep local state updated even if API update fails.
    }

    setUser(updatedUser);
    setActiveSession(updatedUser);
    persistQuestionnaireCompletion(updatedUser.id, updatedUser.email, true);
    return true;
  };

  const logout = () => {
    const current = user;
    if (current?.id) {
      clearActiveSession(current.id);
    }

    setUser(null);
  };

  const updateProfile = async (updates) => {
    const currentUser = user;
    if (!currentUser?.id) {
      return { success: false, error: "User session not found" };
    }

    try {
      const result = await updateUserById(currentUser.id, updates);
      if (!result?.success || !result?.user) {
        return { success: false, error: result?.error || "Profile update failed" };
      }

      const nextUser = toPublicUser(result.user);
      setUser(nextUser);
      setActiveSession(nextUser);
      return { success: true, user: nextUser };
    } catch (error) {
      return {
        success: false,
        error: error?.message || "Unable to update profile"
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        googleLogin,
        logout,
        isLoading,
        markQuestionnaireCompleted,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

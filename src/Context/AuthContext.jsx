/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import {
  authenticateUser,
  clearActiveSession,
  createUser,
  recordLoginEvent,
  setActiveSession,
  updateUserById
} from "../utils/userManagement";

const AuthContext = createContext(undefined);

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    specialization: user.specialization,
    questionnaireCompleted: user.questionnaireCompleted || false,
    createdAt: user.createdAt
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isLoading = false;

  const login = async (email, password) => {
    const authResult = await authenticateUser(email, password);
    if (!authResult.success || !authResult.user) {
      return null;
    }

    const foundUser = authResult.user;

    const publicUser = toPublicUser(foundUser);
    setUser(publicUser);

    recordLoginEvent({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    });
    setActiveSession(foundUser);

    return publicUser;
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
      return null;
    }

    const publicUser = toPublicUser(result.user);
    setUser(publicUser);

    return publicUser;
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
    return true;
  };

  const logout = () => {
    const current = user;
    if (current?.id) {
      clearActiveSession(current.id);
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, markQuestionnaireCompleted }}>
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

import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Send, Loader2, AlertCircle } from "lucide-react";

function SessionChat({ session, currentUser, onClose, embedded = false, readOnly = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const resolvedSessionId = session?.id || session?.sessionId || session?.session_id || session?.sessionID;

  const to12Hour = (timeValue) => {
    const value = String(timeValue || "").trim();
    if (!value) return "";
    const [hourPart = "0", minutePart = "00"] = value.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 || 12;
    return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  const getSessionWindow = () => {
    const datePart = String(session?.date || session?.sessionDate || "").slice(0, 10);
    const startPart = String(session?.startTime || session?.time || session?.sessionTime || "").slice(0, 5);
    const endPart = String(session?.endTime || session?.sessionEndTime || "").slice(0, 5);
    if (!datePart || !startPart || !endPart) {
      return { hasWindow: false, start: null, end: null };
    }

    const start = new Date(`${datePart}T${startPart}:00`);
    const end = new Date(`${datePart}T${endPart}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { hasWindow: false, start: null, end: null };
    }
    return { hasWindow: true, start, end };
  };

  const sessionWindow = getSessionWindow();
  const now = new Date();
  const isChatWindowOpen = !sessionWindow.hasWindow || (now >= sessionWindow.start && now <= sessionWindow.end);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
    // Polling for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [resolvedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!resolvedSessionId) return;

    setIsLoading(true);

    try {
      const { getSessionMessages } = await import("../utils/userManagement");
      const msgs = await getSessionMessages(resolvedSessionId);
      setMessages(msgs);
      setError("");
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;
    if (!resolvedSessionId) {
      setError("Session id is missing. Please reopen this chat.");
      return;
    }

    setIsSending(true);

    try {
      const { sendChatMessage } = await import("../utils/userManagement");
      
      const result = await sendChatMessage(
        resolvedSessionId,
        currentUser.id,
        currentUser.role,
        newMessage
      );

      if (result.success) {
        setNewMessage("");
        await loadMessages();
      } else {
        setError(result?.error ? `Failed to send message: ${result.error}` : "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const isCurrentUserMessage = (senderId) => String(senderId) === String(currentUser.id);

  return /* @__PURE__ */ jsxs("div", {
    className: embedded
      ? "w-full"
      : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
    children: [
      /* @__PURE__ */ jsxs(Card, {
        className: embedded
          ? "w-full h-[70vh] flex flex-col"
          : "w-full max-w-2xl h-[600px] flex flex-col",
        children: [
          /* @__PURE__ */ jsxs(CardHeader, {
            className: "border-b",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx(CardTitle, {
                        children: session?.sessionName || "Chat"
                      }),
                      /* @__PURE__ */ jsx(CardDescription, {
                        children: `${session?.sessionDate || session?.date || ""} ${to12Hour(session?.startTime || session?.sessionTime || session?.time)}${session?.endTime ? ` - ${to12Hour(session.endTime)}` : ""}`
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx(Badge, {
                    variant: "outline",
                    children: session?.status || "active"
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsxs(CardContent, {
            className: "flex-1 overflow-y-auto p-4 space-y-4",
            children: [
              error && /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md",
                children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm", children: error })
                ]
              }),
              isLoading && !messages.length
                ? /* @__PURE__ */ jsxs("div", {
                    className: "flex flex-col items-center justify-center h-full gap-2",
                    children: [
                      /* @__PURE__ */ jsx(Loader2, {
                        className: "w-6 h-6 animate-spin text-indigo-600"
                      }),
                      /* @__PURE__ */ jsx("p", {
                        className: "text-sm text-gray-500",
                        children: "Loading messages..."
                      })
                    ]
                  })
                  : messages.length === 0
                  ? /* @__PURE__ */ jsx("div", {
                      className: "flex items-center justify-center h-full",
                      children: /* @__PURE__ */ jsx("p", {
                        className: "text-gray-400 text-sm",
                        children: readOnly ? "No chats found for this session." : "No messages yet. Start the conversation!"
                      })
                    })
                  : messages.map((msg) => /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `flex ${
                          isCurrentUserMessage(msg.senderId) ? "justify-end" : "justify-start"
                        }`,
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUserMessage(msg.senderId)
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`,
                            children: [
                              /* @__PURE__ */ jsx("p", {
                                className: "text-sm",
                                children: msg.message
                              }),
                              /* @__PURE__ */ jsx("p", {
                                className: `text-xs mt-1 ${
                                  isCurrentUserMessage(msg.senderId)
                                    ? "text-indigo-100"
                                    : "text-gray-500"
                                }`,
                                children: formatTime(msg.sentAt || msg.timestamp)
                              })
                            ]
                          })
                        ]
                      },
                      msg.id
                    )),
              /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
            ]
          }),
          (readOnly || !isChatWindowOpen) && sessionWindow.hasWindow && /* @__PURE__ */ jsx("div", {
            className: "mx-4 mb-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2",
            children: readOnly
              ? `Session is over. You can only view chats from ${to12Hour(session?.startTime || session?.time || session?.sessionTime)} to ${to12Hour(session?.endTime)}.`
              : `Chat is available only from ${to12Hour(session?.startTime || session?.time || session?.sessionTime)} to ${to12Hour(session?.endTime)}.`
          }),
          /* @__PURE__ */ jsxs("form", {
            onSubmit: handleSendMessage,
            className: "border-t p-4 flex gap-2",
            children: [
              /* @__PURE__ */ jsx(Input, {
                type: "text",
                placeholder: "Type your message...",
                value: newMessage,
                onChange: (e) => setNewMessage(e.target.value),
                disabled: isSending || !isChatWindowOpen || readOnly,
                className: "flex-1"
              }),
              /* @__PURE__ */ jsxs(Button, {
                type: "submit",
                size: "icon",
                disabled: isSending || !newMessage.trim() || !isChatWindowOpen || readOnly,
                children: [
                  isSending
                    ? /* @__PURE__ */ jsx(Loader2, {
                        className: "w-4 h-4 animate-spin"
                      })
                    : /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" })
                ]
              }),
              /* @__PURE__ */ jsx(Button, {
                type: "button",
                variant: "outline",
                onClick: onClose,
                disabled: isSending,
                children: "Close"
              })
            ]
          })
        ]
      })
    ]
  });
}

export { SessionChat as default };

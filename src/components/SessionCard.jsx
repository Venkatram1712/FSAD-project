import { Calendar, Clock } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

function to12Hour(timeValue) {
  const value = String(timeValue || "").trim();
  if (!value) return "-";
  const [hourPart = "0", minutePart = "00"] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export default function SessionCard({ session, onJoin, onViewChats, isOver, canJoin }) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <div>
          <h4 className="font-medium dark:text-white">{session.topic}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {session.counselorName || session.counselor || session.studentName || session.student || ""}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {String(session.date || "").slice(0, 10)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {to12Hour(session.startTime || session.time)} - {to12Hour(session.endTime)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{String(session.status || "scheduled")}</Badge>
            {isOver && <span className="text-xs text-amber-700 dark:text-amber-400">session is over</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2 ml-2">
        {isOver ? (
          <Button variant="outline" size="sm" onClick={() => onViewChats(session)}>
            View Chats
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={!canJoin}
            onClick={() => onJoin(session)}
          >
            Join
          </Button>
        )}
      </div>
    </div>
  );
}

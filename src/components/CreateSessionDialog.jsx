import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { AlertCircle, Loader2 } from "lucide-react";

function CreateSessionDialog({
  isOpen,
  onClose,
  counselorId,
  selectedStudent,
  students = [],
  defaultStatus = "scheduled",
  submitLabel = "Create Session",
  onSessionCreated
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(selectedStudent?.id ? String(selectedStudent.id) : "");
  const [formData, setFormData] = useState({
    sessionName: "",
    sessionDate: "",
    sessionStartTime: "",
    sessionEndTime: "",
    description: ""
  });

  useEffect(() => {
    if (selectedStudent?.id) {
      setSelectedStudentId(String(selectedStudent.id));
    }
  }, [selectedStudent]);

  const resetForm = () => {
    setFormData({
      sessionName: "",
      sessionDate: "",
      sessionStartTime: "",
      sessionEndTime: "",
      description: ""
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sessionName.trim()) {
      setError("Session name is required");
      return;
    }
    if (!formData.sessionDate) {
      setError("Session date is required");
      return;
    }
    if (!formData.sessionStartTime) {
      setError("Session start time is required");
      return;
    }
    if (!formData.sessionEndTime) {
      setError("Session end time is required");
      return;
    }
    if (formData.sessionEndTime <= formData.sessionStartTime) {
      setError("Session end time must be after start time");
      return;
    }
    if (!selectedStudentId) {
      setError("Please select a student");
      return;
    }

    setIsSubmitting(true);

    try {
      const { createSession } = await import("../utils/userManagement");
      const result = await createSession({
        counselorId,
        studentId: selectedStudentId,
        sessionName: formData.sessionName,
        sessionDate: formData.sessionDate,
        sessionStartTime: formData.sessionStartTime,
        sessionEndTime: formData.sessionEndTime,
        description: formData.description,
        status: defaultStatus
      });

      if (result.success) {
        resetForm();
        if (onSessionCreated) {
          onSessionCreated(result.data?.data || result.data);
        }
        onClose();
      } else {
        setError(result.error || "Failed to create session");
      }
    } catch (err) {
      setError(err.message || "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            {selectedStudent
              ? `Schedule a session with ${selectedStudent.name}`
              : "Schedule a counseling session"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sessionName">Session Name</Label>
            <Input
              id="sessionName"
              name="sessionName"
              placeholder="e.g., Career Planning Discussion"
              value={formData.sessionName}
              onChange={handleChange}
              required
            />
          </div>

          {!selectedStudent && (
            <div className="space-y-2">
              <Label htmlFor="studentId">Select Student</Label>
              <select
                id="studentId"
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setError("");
                }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={String(student.id)}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="sessionDate">Date</Label>
              <Input
                id="sessionDate"
                name="sessionDate"
                type="date"
                value={formData.sessionDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionStartTime">Start Time</Label>
              <Input
                id="sessionStartTime"
                name="sessionStartTime"
                type="time"
                value={formData.sessionStartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionEndTime">End Time</Label>
              <Input
                id="sessionEndTime"
                name="sessionEndTime"
                type="time"
                value={formData.sessionEndTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time Format</Label>
              <div className="h-10 px-3 border rounded-md flex items-center text-sm text-gray-600 bg-gray-50">AM/PM</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Session Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What will this session cover?"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSessionDialog;

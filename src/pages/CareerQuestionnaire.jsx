import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import { saveQuestionnaireResponse } from "../utils/userManagement";
import { Button } from "../components/button";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import { Badge } from "../components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import { Checkbox } from "../components/checkbox";
import { Progress } from "../components/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
const interestOptions = [
  "Technology & Computing",
  "Healthcare & Medicine",
  "Business & Finance",
  "Arts & Design",
  "Education & Teaching",
  "Engineering",
  "Science & Research",
  "Social Services",
  "Media & Communications",
  "Law & Legal Services"
];
const industryOptions = [
  "Information Technology",
  "Healthcare",
  "Finance & Banking",
  "Manufacturing",
  "Retail",
  "Education",
  "Hospitality",
  "Entertainment",
  "Non-Profit",
  "Government"
];

function getRoleHomeRoute(role) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "counselor") {
    return "/counselor";
  }

  return "/student";
}

function CareerQuestionnaire() {
  const navigate = useNavigate();
  const { user, markQuestionnaireCompleted } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    interests: [],
    strengths: "",
    careerGoals: "",
    educationLevel: "",
    industries: [],
    workStyle: "",
    skills: "",
    timeline: ""
  });

  useEffect(() => {
    if (user?.questionnaireCompleted) {
      navigate(getRoleHomeRoute(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleInterestToggle = (interest) => {
    setStepError("");
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest]
    }));
  };
  const handleIndustryToggle = (industry) => {
    setStepError("");
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry) ? prev.industries.filter((i) => i !== industry) : [...prev.industries, industry]
    }));
  };
  const handleTextChange = (field, value) => {
    setStepError("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goToNextStep = () => {
    setStepError("");

    if (!canProceed()) {
      if (step === 1) {
        setStepError("Select at least one interest and add your strengths to continue.");
      } else if (step === 2) {
        setStepError("Enter your career goals and choose an education level.");
      } else if (step === 3) {
        setStepError("Select at least one industry and your preferred work style.");
      } else if (step === 4) {
        setStepError("Add your skills and expected timeline before completing.");
      }
      return;
    }

    setStep((prev) => prev + 1);
  };

  const resetErrorState = () => {
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error("User ID not available");
      setSubmitError("User session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const saveResult = await saveQuestionnaireResponse(user.id, formData);
      
      if (!saveResult.success) {
        setSubmitError("We couldn't save your answers. Please try again.");
        console.warn("Failed to save questionnaire response:", saveResult.error);
        return;
      }

      await markQuestionnaireCompleted();

      const redirectRole = user?.role;
      if (redirectRole === "student") {
        navigate("/student");
      } else if (redirectRole === "counselor") {
        navigate("/counselor");
      } else if (redirectRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error completing questionnaire:", error);
      setSubmitError("Something went wrong while saving your questionnaire.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const progress = step / totalSteps * 100;
  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.interests.length > 0 && formData.strengths.trim() !== "";
      case 2:
        return formData.careerGoals.trim() !== "" && formData.educationLevel !== "";
      case 3:
        return formData.industries.length > 0 && formData.workStyle !== "";
      case 4:
        return formData.skills.trim() !== "" && formData.timeline !== "";
      default:
        return false;
    }
  };
  const stepSummary = [
    { label: "Interests", value: formData.interests.length ? formData.interests.length : "0" },
    { label: "Industries", value: formData.industries.length ? formData.industries.length : "0" },
    { label: "Education", value: formData.educationLevel || "-" },
    { label: "Work Style", value: formData.workStyle || "-" }
  ];

  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-7xl", children: [
    /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden border-slate-200/70 shadow-lg", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-4 border-b bg-white/80 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl sm:text-3xl", children: "Career Guidance Questionnaire" }),
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "w-fit px-3 py-1 text-sm", children: [
            "Step ",
            step,
            " of ",
            totalSteps
          ] })
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: progress, className: "h-2" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Help us understand your career aspirations and interests better" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-8 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)] lg:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          stepError && /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(AlertTitle, { children: "Check this step" }),
            /* @__PURE__ */ jsx(AlertDescription, { children: stepError })
          ] }) }),
          submitError && /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(AlertTitle, { children: "Unable to save" }),
            /* @__PURE__ */ jsx(AlertDescription, { children: submitError })
          ] }) }),
          step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "What are your areas of interest? (Select all that apply)" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: interestOptions.map((interest) => /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm transition hover:border-blue-300 hover:bg-blue-50/60", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    id: interest,
                    checked: formData.interests.includes(interest),
                    onCheckedChange: () => handleInterestToggle(interest)
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "font-normal leading-tight", children: interest })
              ] }, interest)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "strengths", className: "text-base font-semibold", children: "What are your key strengths?" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "strengths",
                  placeholder: "Describe your strengths, talents, and what you're naturally good at...",
                  value: formData.strengths,
                  onChange: (e) => handleTextChange("strengths", e.target.value),
                  rows: 4
                }
              )
            ] })
          ] }),
          step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "careerGoals", className: "text-base font-semibold", children: "What are your career goals?" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "careerGoals",
                  placeholder: "Describe your short-term and long-term career aspirations...",
                  value: formData.careerGoals,
                  onChange: (e) => handleTextChange("careerGoals", e.target.value),
                  rows: 4
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "What is your current education level?" }),
              /* @__PURE__ */ jsxs(RadioGroup, { value: formData.educationLevel, onValueChange: (value) => { setStepError(""); setFormData((prev) => ({ ...prev, educationLevel: value })); }, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "high-school", id: "high-school" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "high-school", className: "font-normal cursor-pointer", children: "High School" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "undergraduate", id: "undergraduate" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "undergraduate", className: "font-normal cursor-pointer", children: "Undergraduate/Bachelor's" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "graduate", id: "graduate" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "graduate", className: "font-normal cursor-pointer", children: "Graduate/Master's" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "doctorate", id: "doctorate" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "doctorate", className: "font-normal cursor-pointer", children: "Doctorate/PhD" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "other", id: "other" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "other", className: "font-normal cursor-pointer", children: "Other" })
                ] })
              ] })
            ] })
          ] }),
          step === 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "Which industries interest you? (Select all that apply)" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: industryOptions.map((industry) => /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm transition hover:border-blue-300 hover:bg-blue-50/60", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    id: industry,
                    checked: formData.industries.includes(industry),
                    onCheckedChange: () => handleIndustryToggle(industry)
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "font-normal leading-tight", children: industry })
              ] }, industry)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "What work environment do you prefer?" }),
              /* @__PURE__ */ jsxs(RadioGroup, { value: formData.workStyle, onValueChange: (value) => { setStepError(""); setFormData((prev) => ({ ...prev, workStyle: value })); }, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "office", id: "office" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "office", className: "font-normal cursor-pointer", children: "Traditional Office" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "remote", id: "remote" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "remote", className: "font-normal cursor-pointer", children: "Remote/Work from Home" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "hybrid", id: "hybrid" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "hybrid", className: "font-normal cursor-pointer", children: "Hybrid (Mix of both)" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "field", id: "field" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "field", className: "font-normal cursor-pointer", children: "Field Work/On-site" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "flexible", id: "flexible" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "flexible", className: "font-normal cursor-pointer", children: "Flexible/No preference" })
                ] })
              ] })
            ] })
          ] }),
          step === 4 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "skills", className: "text-base font-semibold", children: "What skills do you currently have or want to develop?" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "skills",
                  placeholder: "List your current skills and skills you want to acquire (e.g., programming, communication, leadership, design, etc.)...",
                  value: formData.skills,
                  onChange: (e) => handleTextChange("skills", e.target.value),
                  rows: 4
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "When do you plan to start your career?" }),
              /* @__PURE__ */ jsxs(RadioGroup, { value: formData.timeline, onValueChange: (value) => { setStepError(""); setFormData((prev) => ({ ...prev, timeline: value })); }, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "immediate", id: "immediate" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "immediate", className: "font-normal cursor-pointer", children: "Immediately" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "6months", id: "6months" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "6months", className: "font-normal cursor-pointer", children: "Within 6 months" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "1year", id: "1year" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "1year", className: "font-normal cursor-pointer", children: "Within 1 year" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "2years", id: "2years" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "2years", className: "font-normal cursor-pointer", children: "1-2 years" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "3plus", id: "3plus" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "3plus", className: "font-normal cursor-pointer", children: "2+ years" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                onClick: () => setStep((prev) => prev - 1),
                disabled: step === 1 || isSubmitting,
                className: "w-full sm:w-auto",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
                  "Previous"
                ]
              }
            ),
            step < totalSteps ? /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: goToNextStep,
                disabled: isSubmitting,
                className: "w-full sm:w-auto",
                children: [
                  "Next",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
                ]
              }
            ) : /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: handleSubmit,
                disabled: !canProceed() || isSubmitting,
                className: "w-full bg-green-600 hover:bg-green-700 sm:w-auto",
                children: [
                  isSubmitting ? /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Completing..."
                  ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                    "Complete",
                    /* @__PURE__ */ jsx(CheckCircle, { className: "ml-2 h-4 w-4" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "space-y-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Your Progress" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Keep an eye on what you’ve already completed." }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: stepSummary.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: item.label }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-600", children: item.value })
          ] }, item.label)) }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-800", children: "Completion tips" }),
            /* @__PURE__ */ jsx("ul", { className: "mt-2 list-disc space-y-1 pl-5", children: [
              /* @__PURE__ */ jsx("li", { children: "Answer all four steps before submitting." }),
              /* @__PURE__ */ jsx("li", { children: "Use specific examples for strengths and skills." }),
              /* @__PURE__ */ jsx("li", { children: "Choose the options that best match your career goals." })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CareerQuestionnaire as default
};

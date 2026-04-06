import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import { saveQuestionnaireResponse } from "../utils/userManagement";
import { Button } from "../components/button";
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
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest]
    }));
  };
  const handleIndustryToggle = (industry) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry) ? prev.industries.filter((i) => i !== industry) : [...prev.industries, industry]
    }));
  };
  const handleSubmit = async () => {
    if (!user?.id) {
      console.error("User ID not available");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save questionnaire response to backend
      const saveResult = await saveQuestionnaireResponse(user.id, formData);
      
      if (!saveResult.success) {
        console.warn("Failed to save questionnaire response:", saveResult.error);
        // Continue anyway - we'll still mark as completed locally
      }

      // Mark questionnaire as completed
      await markQuestionnaireCompleted();

      // Navigate to appropriate dashboard
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
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-3xl", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "Career Guidance Questionnaire" }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Step ",
          step,
          " of ",
          totalSteps
        ] })
      ] }),
      /* @__PURE__ */ jsx(Progress, { value: progress, className: "h-2" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "mt-4", children: "Help us understand your career aspirations and interests better" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "What are your areas of interest? (Select all that apply)" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: interestOptions.map((interest) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: interest,
                checked: formData.interests.includes(interest),
                onCheckedChange: () => handleInterestToggle(interest)
              }
            ),
            /* @__PURE__ */ jsx(Label, { htmlFor: interest, className: "cursor-pointer font-normal", children: interest })
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
              onChange: (e) => setFormData((prev) => ({ ...prev, strengths: e.target.value })),
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
              onChange: (e) => setFormData((prev) => ({ ...prev, careerGoals: e.target.value })),
              rows: 4
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "What is your current education level?" }),
          /* @__PURE__ */ jsxs(RadioGroup, { value: formData.educationLevel, onValueChange: (value) => setFormData((prev) => ({ ...prev, educationLevel: value })), children: [
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
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: industryOptions.map((industry) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: industry,
                checked: formData.industries.includes(industry),
                onCheckedChange: () => handleIndustryToggle(industry)
              }
            ),
            /* @__PURE__ */ jsx(Label, { htmlFor: industry, className: "cursor-pointer font-normal", children: industry })
          ] }, industry)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "What work environment do you prefer?" }),
          /* @__PURE__ */ jsxs(RadioGroup, { value: formData.workStyle, onValueChange: (value) => setFormData((prev) => ({ ...prev, workStyle: value })), children: [
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
              onChange: (e) => setFormData((prev) => ({ ...prev, skills: e.target.value })),
              rows: 4
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-semibold", children: "When do you plan to start your career?" }),
          /* @__PURE__ */ jsxs(RadioGroup, { value: formData.timeline, onValueChange: (value) => setFormData((prev) => ({ ...prev, timeline: value })), children: [
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
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-6 border-t", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => setStep((prev) => prev - 1),
            disabled: step === 1,
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
              "Previous"
            ]
          }
        ),
        step < totalSteps ? /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => setStep((prev) => prev + 1),
            disabled: !canProceed(),
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
            className: "bg-green-600 hover:bg-green-700",
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
    ] })
  ] }) });
}
export {
  CareerQuestionnaire as default
};

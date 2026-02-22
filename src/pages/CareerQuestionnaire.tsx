import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Label } from '../components/label';
import { Textarea } from '../components/textarea';
import { RadioGroup, RadioGroupItem } from '../components/radio-group';
import { Checkbox } from '../components/checkbox';
import { Progress } from '../components/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface QuestionnaireData {
  interests: string[];
  strengths: string;
  careerGoals: string;
  educationLevel: string;
  industries: string[];
  workStyle: string;
  skills: string;
  timeline: string;
}

const interestOptions = [
  'Technology & Computing',
  'Healthcare & Medicine',
  'Business & Finance',
  'Arts & Design',
  'Education & Teaching',
  'Engineering',
  'Science & Research',
  'Social Services',
  'Media & Communications',
  'Law & Legal Services',
];

const industryOptions = [
  'Information Technology',
  'Healthcare',
  'Finance & Banking',
  'Manufacturing',
  'Retail',
  'Education',
  'Hospitality',
  'Entertainment',
  'Non-Profit',
  'Government',
];

export default function CareerQuestionnaire() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<QuestionnaireData>({
    interests: [],
    strengths: '',
    careerGoals: '',
    educationLevel: '',
    industries: [],
    workStyle: '',
    skills: '',
    timeline: '',
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleSubmit = () => {
    // Save questionnaire data to localStorage
    const userData = localStorage.getItem('currentUser');
    let redirectRole = user?.role;

    if (userData) {
      const storedCurrentUser = JSON.parse(userData);
      storedCurrentUser.questionnaireCompleted = true;
      storedCurrentUser.questionnaireData = formData;
      redirectRole = storedCurrentUser.role || redirectRole;
      localStorage.setItem('currentUser', JSON.stringify(storedCurrentUser));

      const authUserData = localStorage.getItem('user');
      if (authUserData) {
        const authUser = JSON.parse(authUserData);
        authUser.questionnaireCompleted = true;
        localStorage.setItem('user', JSON.stringify(authUser));
      }

      // Update in users list
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.email === storedCurrentUser.email ? storedCurrentUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    // Redirect to appropriate dashboard
    if (redirectRole === 'student') {
      navigate('/student');
    } else if (redirectRole === 'counselor') {
      navigate('/counselor');
    } else if (redirectRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.interests.length > 0 && formData.strengths.trim() !== '';
      case 2:
        return formData.careerGoals.trim() !== '' && formData.educationLevel !== '';
      case 3:
        return formData.industries.length > 0 && formData.workStyle !== '';
      case 4:
        return formData.skills.trim() !== '' && formData.timeline !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Career Guidance Questionnaire</CardTitle>
            <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-4">
            Help us understand your career aspirations and interests better
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Interests & Strengths */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label className="text-base font-semibold">What are your areas of interest? (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="cursor-pointer font-normal">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="strengths" className="text-base font-semibold">What are your key strengths?</Label>
                <Textarea
                  id="strengths"
                  placeholder="Describe your strengths, talents, and what you're naturally good at..."
                  value={formData.strengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Goals & Education */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label htmlFor="careerGoals" className="text-base font-semibold">What are your career goals?</Label>
                <Textarea
                  id="careerGoals"
                  placeholder="Describe your short-term and long-term career aspirations..."
                  value={formData.careerGoals}
                  onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">What is your current education level?</Label>
                <RadioGroup value={formData.educationLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, educationLevel: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high-school" id="high-school" />
                    <Label htmlFor="high-school" className="font-normal cursor-pointer">High School</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="undergraduate" id="undergraduate" />
                    <Label htmlFor="undergraduate" className="font-normal cursor-pointer">Undergraduate/Bachelor's</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="graduate" id="graduate" />
                    <Label htmlFor="graduate" className="font-normal cursor-pointer">Graduate/Master's</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctorate" id="doctorate" />
                    <Label htmlFor="doctorate" className="font-normal cursor-pointer">Doctorate/PhD</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 3: Industry & Work Style */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Which industries interest you? (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {industryOptions.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry}
                        checked={formData.industries.includes(industry)}
                        onCheckedChange={() => handleIndustryToggle(industry)}
                      />
                      <Label htmlFor={industry} className="cursor-pointer font-normal">
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">What work environment do you prefer?</Label>
                <RadioGroup value={formData.workStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, workStyle: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="office" />
                    <Label htmlFor="office" className="font-normal cursor-pointer">Traditional Office</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id="remote" />
                    <Label htmlFor="remote" className="font-normal cursor-pointer">Remote/Work from Home</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <Label htmlFor="hybrid" className="font-normal cursor-pointer">Hybrid (Mix of both)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="field" id="field" />
                    <Label htmlFor="field" className="font-normal cursor-pointer">Field Work/On-site</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible" className="font-normal cursor-pointer">Flexible/No preference</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 4: Skills & Timeline */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label htmlFor="skills" className="text-base font-semibold">What skills do you currently have or want to develop?</Label>
                <Textarea
                  id="skills"
                  placeholder="List your current skills and skills you want to acquire (e.g., programming, communication, leadership, design, etc.)..."
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">When do you plan to start your career?</Label>
                <RadioGroup value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate" className="font-normal cursor-pointer">Immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6months" id="6months" />
                    <Label htmlFor="6months" className="font-normal cursor-pointer">Within 6 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1year" id="1year" />
                    <Label htmlFor="1year" className="font-normal cursor-pointer">Within 1 year</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2years" id="2years" />
                    <Label htmlFor="2years" className="font-normal cursor-pointer">1-2 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3plus" id="3plus" />
                    <Label htmlFor="3plus" className="font-normal cursor-pointer">2+ years</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(prev => prev + 1)}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

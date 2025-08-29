import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  CheckCircle, 
  PlayCircle, 
  Upload,
  Camera,
  AlertCircle,
  FileText,
  Eye,
  Loader2
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'theory' | 'practice';
  moduleNumber: number;
  duration: string;
  description: string;
  content?: {
    videoUrl?: string;
    text?: string;
    practiceInstructions?: string;
  };
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

const LessonDetail = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load course and lesson data
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const foundCourse = courses.find((c: Course) => c.id === courseId);
    
    if (!foundCourse) {
      navigate('/training');
      return;
    }
    
    const foundLesson = foundCourse.lessons.find((l: Lesson) => l.id === lessonId);
    
    if (!foundLesson) {
      navigate(`/training/${courseId}`);
      return;
    }
    
    setCourse(foundCourse);
    setLesson(foundLesson);

    // Check if lesson is completed
    const traineeProgress = JSON.parse(localStorage.getItem('traineeProgress') || '{}');
    const userProgress = traineeProgress[user.id] || {};
    const courseProgress = userProgress[courseId!] || [];
    
    setIsCompleted(courseProgress.includes(lessonId!));
  }, [courseId, lessonId, navigate, user]);

  const markAsComplete = () => {
    if (!user || !courseId || !lessonId) return;

    const traineeProgress = JSON.parse(localStorage.getItem('traineeProgress') || '{}');
    if (!traineeProgress[user.id]) {
      traineeProgress[user.id] = {};
    }
    if (!traineeProgress[user.id][courseId]) {
      traineeProgress[user.id][courseId] = [];
    }
    
    if (!traineeProgress[user.id][courseId].includes(lessonId)) {
      traineeProgress[user.id][courseId].push(lessonId);
      localStorage.setItem('traineeProgress', JSON.stringify(traineeProgress));
      setIsCompleted(true);
      
      toast({
        title: "Lesson Completed!",
        description: "Great job! Keep up the good work.",
        variant: "default"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
        setAnalysisResult('');
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const analyzePosture = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results
    const mockResults = [
      "✅ Excellent posture: Your wrist angle is perfect at 15 degrees, allowing for optimal pressure distribution.",
      "⚠️ Minor adjustment needed: Consider lowering your shoulder by 2-3 cm to reduce tension and improve comfort.",
      "✅ Great hand positioning: Your fingers are properly curved, which will help prevent strain during longer sessions.",
      "⚠️ Posture tip: Keep your back straight and engage your core muscles to maintain stability.",
      "✅ Perfect stance: Your foot positioning provides excellent balance and power transfer."
    ];
    
    const randomResults = mockResults
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .join('\n\n');
    
    setAnalysisResult(randomResults);
    setIsAnalyzing(false);
    
    // Automatically mark practical lessons as complete after analysis
    if (lesson?.type === 'practice') {
      setTimeout(() => {
        markAsComplete();
      }, 1000);
    }
  };

  if (!lesson || !course) {
    return <div>Loading...</div>;
  }

  const renderTheoryContent = () => (
    <div className="space-y-6">
      {/* Mock Video Player */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-0">
          <div className="bg-gradient-hero rounded-lg aspect-video flex items-center justify-center text-white">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <p className="text-lg font-medium">Mock Video: {lesson.title}</p>
              <p className="text-sm opacity-80">Duration: {lesson.duration}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theory Content */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-primary">
            <FileText className="h-5 w-5 mr-2" />
            Lesson Content
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {lesson.content?.text || 
            `This theory lesson covers the fundamental concepts of ${lesson.title.toLowerCase()}. 
            You'll learn about proper techniques, safety considerations, and best practices. 
            The content includes detailed explanations, visual aids, and practical examples 
            to help you understand and apply these concepts in real massage therapy sessions.`}
          </p>
        </CardContent>
      </Card>

      {/* Completion Button */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/training/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        
        <Button 
          onClick={markAsComplete}
          disabled={isCompleted}
          className={isCompleted ? "btn-success" : "btn-healing"}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            "Mark as Complete"
          )}
        </Button>
      </div>
    </div>
  );

  const renderPracticeContent = () => (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-healing">
            <Eye className="h-5 w-5 mr-2" />
            Posture Analysis
          </CardTitle>
          <CardDescription>
            Upload an image of your massage posture for AI-powered feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background-secondary p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Position yourself in your massage stance</li>
              <li>• Ensure good lighting and clear visibility</li>
              <li>• Upload a side-view photo for best analysis</li>
              <li>• Our AI will analyze your posture and provide feedback</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="posture-upload"
            />
            <label htmlFor="posture-upload" className="cursor-pointer">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {uploadedFile ? uploadedFile.name : "Upload Posture Image"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Click to browse or drag and drop your image here
              </p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </label>
          </div>
          
          {uploadedFile && (
            <div className="mt-4 text-center">
              <Button 
                onClick={analyzePosture}
                disabled={isAnalyzing}
                className="btn-healing"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Posture"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center text-gradient-success">
              <AlertCircle className="h-5 w-5 mr-2" />
              Posture Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={analysisResult}
              readOnly
              className="min-h-[120px] bg-background-secondary border-0"
            />
            
            <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success font-medium">
                Analysis complete! Review the feedback above and continue practicing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/training/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        
        {isCompleted && (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Lesson Header */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge 
                className={
                  lesson.type === 'theory' 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : 'bg-healing/10 text-healing border-healing/20'
                }
              >
                {lesson.type === 'theory' ? 'Theory Lesson' : 'Practical Exercise'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Module {lesson.moduleNumber} • {lesson.duration}
              </span>
            </div>
            
            <CardTitle className="text-3xl text-gradient-primary mb-2">
              {lesson.title}
            </CardTitle>
            
            <CardDescription className="text-lg">
              {lesson.description}
            </CardDescription>
            
            <div className="pt-4 text-sm text-muted-foreground">
              <span>Course: {course.title}</span>
            </div>
          </CardHeader>
        </Card>

        {/* Lesson Content */}
        {lesson.type === 'theory' ? renderTheoryContent() : renderPracticeContent()}
      </div>
    </div>
  );
};

export default LessonDetail;
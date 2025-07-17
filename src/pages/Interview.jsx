import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Play, 
  StopCircle, 
  Mic, 
  MicOff, 
  RefreshCw, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Remove all interface declarations and type annotations
// Remove React.FC from component declarations
// Remove generics from useState and other functions

const Interview = () => {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [recognition, setRecognition] = useState(null);

  // Interview configuration
  const [interviewConfig, setInterviewConfig] = useState({
    position: user?.preferredPosition || 'frontend developer',
    difficulty: 'medium',
    questionCount: 5
  });

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setCurrentAnswer(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/interviews/generate', interviewConfig);
      setSession(response.data);
      setInterviewStarted(true);
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/interviews/answer', {
        sessionId: session.sessionId,
        questionId: session.questions[currentQuestionIndex].id,
        answer: currentAnswer.trim()
      });

      // Update the current question with the answer and feedback
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        answer: currentAnswer.trim(),
        feedback: response.data.feedback
      };

      setSession({
        ...session,
        questions: updatedQuestions
      });

      setCurrentAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    }
  };

  const previousQuestion = () => {
    if (session && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(session.questions[currentQuestionIndex - 1].answer || '');
    }
  };

  const completeInterview = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/interviews/complete', {
        sessionId: session.sessionId
      });

      setFinalResults(response.data);
      setInterviewCompleted(true);
    } catch (error) {
      console.error('Error completing interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setSession(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setFinalResults(null);
  };

  if (!interviewStarted) {
    return (
      <div className="interview-container fade-in">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="card-title text-2xl">AI Interview Practice</h1>
            <p className="text-gray-600 mt-2">
              Configure your interview settings and start practicing
            </p>
          </div>

          <div className="card-content">
            <div className="form-group">
              <label className="form-label">Position</label>
              <select
                value={interviewConfig.position}
                onChange={(e) => setInterviewConfig({...interviewConfig, position: e.target.value})}
                className="form-select"
              >
                <option value="frontend developer">Frontend Developer</option>
                <option value="backend developer">Backend Developer</option>
                <option value="full stack developer">Full Stack Developer</option>
                <option value="data analyst">Data Analyst</option>
                <option value="product manager">Product Manager</option>
                <option value="ui/ux designer">UI/UX Designer</option>
                <option value="devops engineer">DevOps Engineer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                value={interviewConfig.difficulty}
                onChange={(e) => setInterviewConfig({...interviewConfig, difficulty: e.target.value})}
                className="form-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Questions</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={interviewConfig.questionCount}
                onChange={(e) => setInterviewConfig({
                  ...interviewConfig,
                  questionCount: Math.max(1, Math.min(1000, parseInt(e.target.value) || 1))
                })}
                className="form-input"
                placeholder="Enter number of questions"
              />
            </div>

            <button
              onClick={startInterview}
              disabled={isLoading}
              className={`btn btn-primary w-full py-3 ${isLoading ? 'disabled' : ''}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Interview
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (interviewCompleted && finalResults) {
    return (
      <div className="interview-container fade-in">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="card-title text-2xl">Interview Complete!</h1>
            <p className="text-gray-600 mt-2">Here's your performance summary</p>
          </div>

          <div className="card-content">
            <div className="text-center mb-6">
              <div className="stat-value text-4xl mb-2">{finalResults.score}%</div>
              <div className="stat-label">Overall Score</div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <div className="text-center">
                <div className="font-semibold text-lg">{finalResults.answeredQuestions}</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{finalResults.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Results</h3>
              {session?.questions.map((question, index) => (
                <div key={index} className="feedback-card">
                  <div className="mb-2">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="ml-2 text-sm">{question.question}</span>
                  </div>
                  {question.feedback && (
                    <div className="mt-2">
                      <span className={`feedback-score ${question.feedback.score < 70 ? 'low' : question.feedback.score < 80 ? 'medium' : ''}`}>
                        {question.feedback.score}%
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {question.feedback.summary}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={resetInterview} className="btn btn-primary">
                <RefreshCw className="w-4 h-4" />
                Start New Interview
              </button>
              <button onClick={() => window.location.href = '/dashboard'} className="btn btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="interview-container">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500" style={{ borderTopColor: 'transparent' }}></div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const allQuestionsAnswered = session.questions.every(q => q.answer);

  return (
    <div className="interview-container fade-in">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {session.position} - {session.difficulty} Level
          </h1>
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </div>
        </div>
        <div className="progress-bar mt-2">
          <div 
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-card">
        <div className="mb-4">
          <span className="question-number">Q{currentQuestionIndex + 1}</span>
        </div>
        
        <div className="question-text">
          {currentQuestion.question}
        </div>

        <div className="answer-section">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here or use voice recording..."
            className="form-textarea"
            rows={6}
          />

          <div className="voice-controls">
            {recognition && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`voice-button ${isRecording ? 'recording' : ''}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </>
                )}
              </button>
            )}

            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim() || isLoading}
              className={`btn btn-primary ${(!currentAnswer.trim() || isLoading) ? 'disabled' : ''}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        </div>

        {currentQuestion.feedback && (
          <div className="feedback-card">
            <div className="mb-3">
              <span className={`feedback-score ${currentQuestion.feedback.score < 70 ? 'low' : currentQuestion.feedback.score < 80 ? 'medium' : ''}`}>
                Score: {currentQuestion.feedback.score}%
              </span>
            </div>
            
            <div className="mb-3">
              <h4 className="font-semibold mb-1">Summary</h4>
              <p className="text-sm text-gray-600">{currentQuestion.feedback.summary}</p>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold mb-1">Strengths</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {currentQuestion.feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            {currentQuestion.feedback.improvements.length > 0 && (
              <div className="mb-3">
                <h4 className="font-semibold mb-1">Areas for Improvement</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {currentQuestion.feedback.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-1">Detailed Feedback</h4>
              <p className="text-sm text-gray-600">{currentQuestion.feedback.detailedFeedback}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`btn btn-secondary ${currentQuestionIndex === 0 ? 'disabled' : ''}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <button
              onClick={nextQuestion}
              className="btn btn-primary"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={completeInterview}
              disabled={!allQuestionsAnswered || isLoading}
              className={`btn btn-success ${(!allQuestionsAnswered || isLoading) ? 'disabled' : ''}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Interview
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Award, 
  Target,
  Play,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    streakDays: 0,
    lastActivity: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [challengeResponse, profileResponse] = await Promise.all([
        axios.get('/api/users/daily-challenge'),
        axios.get('/api/users/profile')
      ]);

      setDailyChallenge(challengeResponse.data);
      setStats({
        totalInterviews: profileResponse.data.progress.total_interviews || 0,
        averageScore: profileResponse.data.progress.average_score || 0,
        streakDays: profileResponse.data.progress.streak_days || 0,
        lastActivity: profileResponse.data.progress.last_activity || ''
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = async (answer) => {
    if (!dailyChallenge) return;

    try {
      await axios.post('/api/users/daily-challenge', {
        challengeId: dailyChallenge.id,
        answer
      });

      setDailyChallenge({
        ...dailyChallenge,
        completed: true
      });
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500" style={{ borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Ready to improve your interview skills today?
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalInterviews}</div>
          <div className="stat-label">Total Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageScore.toFixed(1)}</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.streakDays}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div className="stat-label">Last Activity: {stats.lastActivity || 'Never'}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Brain className="w-5 h-5" />
              Start New Interview
            </h2>
          </div>
          <div className="card-content">
            <p className="text-gray-600 mb-4">
              Practice with AI-generated questions tailored to your role and experience level.
            </p>
            <Link to="/interview" className="btn btn-primary">
              <Play className="w-4 h-4" />
              Start Interview
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar className="w-5 h-5" />
              Schedule Interview
            </h2>
          </div>
          <div className="card-content">
            <p className="text-gray-600 mb-4">
              Schedule mock interviews with peers for realistic practice sessions.
            </p>
            <Link to="/schedule" className="btn btn-secondary">
              <Calendar className="w-4 h-4" />
              View Calendar
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Target className="w-5 h-5" />
              Daily Challenge
            </h2>
          </div>
          <div className="card-content">
            {dailyChallenge ? (
              <div>
                <p className="text-gray-600 mb-4">{dailyChallenge.question}</p>
                {dailyChallenge.completed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed!
                  </div>
                ) : (
                  <ChallengeAnswerForm
                    onSubmit={handleChallengeComplete}
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-600">No challenge available today.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp className="w-5 h-5" />
              Progress Overview
            </h2>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interview Skills</span>
                <span className="font-semibold">{stats.averageScore.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.averageScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                Based on {stats.totalInterviews} completed interviews
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Tips</h2>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Practice Regularly</h3>
                  <p className="text-sm text-gray-600">
                    Consistent practice leads to better performance
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Review Feedback</h3>
                  <p className="text-sm text-gray-600">
                    Learn from AI feedback to improve your answers
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Schedule with Peers</h3>
                  <p className="text-sm text-gray-600">
                    Practice with others for realistic experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChallengeAnswerForm = ({ onSubmit }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="form-textarea"
        rows={3}
        required
      />
      <button type="submit" className="btn btn-primary">
        Submit Answer
      </button>
    </form>
  );
};

export default Dashboard;
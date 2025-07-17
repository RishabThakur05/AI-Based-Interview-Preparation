import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Award,
  Edit,
  Save,
  X
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    preferredPosition: '',
    experienceLevel: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchInterviewHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setProfile(response.data);
      setEditForm({
        username: response.data.username,
        email: response.data.email,
        preferredPosition: response.data.preferredPosition,
        experienceLevel: response.data.experienceLevel
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewHistory = async () => {
    try {
      const response = await axios.get('/api/interviews/history');
      setInterviewHistory(response.data);
    } catch (error) {
      console.error('Error fetching interview history:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/users/profile', editForm);
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getExperienceLevel = (level) => {
    switch (level) {
      case 'entry': return 'Entry Level (0-2 years)';
      case 'mid': return 'Mid Level (2-5 years)';
      case 'senior': return 'Senior Level (5+ years)';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500" style={{ borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Error loading profile</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={logout}
          className="btn btn-outline text-red-600 border-red-600 hover-bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Profile Information */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="card-title">
                  <User className="w-5 h-5" />
                  Personal Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn btn-secondary"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="card-content">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Position</label>
                    <select
                      value={editForm.preferredPosition}
                      onChange={(e) => setEditForm({...editForm, preferredPosition: e.target.value})}
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
                    <label className="form-label">Experience Level</label>
                    <select
                      value={editForm.experienceLevel}
                      onChange={(e) => setEditForm({...editForm, experienceLevel: e.target.value})}
                      className="form-select"
                    >
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (2-5 years)</option>
                      <option value="senior">Senior Level (5+ years)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{profile.username}</div>
                      <div className="text-sm text-gray-500">Username</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{profile.email}</div>
                      <div className="text-sm text-gray-500">Email</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{profile.preferredPosition}</div>
                      <div className="text-sm text-gray-500">Preferred Position</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{getExperienceLevel(profile.experienceLevel)}</div>
                      <div className="text-sm text-gray-500">Experience Level</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interview History */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Calendar className="w-5 h-5" />
                Interview History
              </h2>
            </div>

            <div className="card-content">
              {interviewHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No interview history yet. Start your first interview!
                </p>
              ) : (
                <div className="space-y-4">
                  {interviewHistory.map(interview => (
                    <div key={interview.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{interview.position}</h3>
                          <p className="text-sm text-gray-600">
                            {interview.difficulty} level
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getScoreColor(interview.score)}`}>
                            {interview.score}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(interview.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {interview.completed ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp className="w-5 h-5" />
              Statistics
            </h2>
          </div>

          <div className="card-content">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.progress.total_interviews}
                </div>
                <div className="text-sm text-gray-500">Total Interviews</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profile.progress.average_score.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Average Score</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {profile.progress.streak_days}
                </div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Last Activity
                </div>
                <div className="text-sm font-medium">
                  {profile.progress.last_activity || 'Never'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
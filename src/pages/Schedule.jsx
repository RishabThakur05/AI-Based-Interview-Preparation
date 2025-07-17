import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Video, 
  Users, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

const Schedule = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [interviews, setInterviews] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60,
    guestEmail: ''
  });

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  const fetchScheduledInterviews = async () => {
    try {
      const response = await axios.get('/api/interviews/scheduled');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/interviews/schedule', scheduleForm);
      setShowScheduleForm(false);
      setScheduleForm({
        title: '',
        description: '',
        scheduledTime: '',
        duration: 60,
        guestEmail: ''
      });
      fetchScheduledInterviews();
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  // Mark interview as joined before joining
  const joinInterview = async (roomId, interview) => {
    try {
      await axios.post(`/api/interviews/scheduled/${roomId}/joined`);
    } catch (err) {
      // Ignore error, still allow joining
    }
    if (socket) {
      socket.emit('join-interview', roomId);
      navigate(`/interview-room/${roomId}`);
    }
  };

  // Add this function to handle cancel
  const cancelInterview = async (roomId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/interviews/scheduled/${roomId}`);
      // Remove the cancelled interview from the UI
      setInterviews(interviews.filter(i => i.room_id !== roomId));
    } catch (error) {
      alert('Error cancelling interview.');
      console.error('Error cancelling interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getInterviewsForDate = (date) => {
    if (!date) return [];
    
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduled_time);
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600';
      case 'in_progress': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Video className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500" style={{ borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  // Split interviews into upcoming and past
  const now = new Date();
  const upcomingInterviews = interviews.filter(i => new Date(i.scheduled_time) >= now);
  const pastInterviews = interviews.filter(i => new Date(i.scheduled_time) < now);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interview Schedule</h1>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="btn btn-secondary"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="btn btn-secondary"
              >
                →
              </button>
            </div>
          </div>
          
          <div className="card-content">
            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${day?.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <div className="font-semibold">{day.getDate()}</div>
                      <div className="mt-1">
                        {getInterviewsForDate(day).map(interview => (
                          <div
                            key={interview.id}
                            className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded mb-1"
                          >
                            {formatTime(interview.scheduled_time)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interview List - Upcoming */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar className="w-5 h-5" />
              {formatDate(selectedDate.toISOString())}
            </h2>
          </div>
          <div className="card-content">
            {getInterviewsForDate(selectedDate).filter(i => new Date(i.scheduled_time) >= now).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No upcoming interviews scheduled for this date
              </p>
            ) : (
              <div className="space-y-4">
                {getInterviewsForDate(selectedDate).filter(i => new Date(i.scheduled_time) >= now).map(interview => (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{interview.title}</h3>
                      <span className={`flex items-center gap-1 text-sm ${getStatusColor(interview.status)}`}>
                        {getStatusIcon(interview.status)}
                        {interview.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{interview.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(interview.scheduled_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {interview.duration} min
                        </span>
                      </div>
                      <div className="button-group">
                        <button
                          onClick={() => joinInterview(interview.room_id, interview)}
                          className="btn btn-primary btn-sm"
                        >
                          <Video className="w-3 h-3" />
                          Join
                        </button>
                        <button
                          onClick={() => cancelInterview(interview.room_id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interview List - Past */}
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar className="w-5 h-5" />
              Past Interviews ({formatDate(selectedDate.toISOString())})
            </h2>
          </div>
          <div className="card-content">
            {getInterviewsForDate(selectedDate).filter(i => new Date(i.scheduled_time) < now).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No past interviews for this date
              </p>
            ) : (
              <div className="space-y-4">
                {getInterviewsForDate(selectedDate).filter(i => new Date(i.scheduled_time) < now).map(interview => {
                  let joined = false;
                  if (user && interview.host_id === user.id) joined = interview.joined_host;
                  if (user && interview.guest_id === user.id) joined = interview.joined_guest;
                  return (
                    <div key={interview.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{interview.title}</h3>
                        <span className={`flex items-center gap-1 text-sm ${getStatusColor(interview.status)}`}>
                          {getStatusIcon(interview.status)}
                          {interview.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{interview.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(interview.scheduled_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {interview.duration} min
                          </span>
                        </div>
                        <span className={`font-semibold ${joined ? 'text-green-600' : 'text-red-600'}`}>
                          {joined ? 'Joined' : 'Not Joined'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Schedule New Interview</h2>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="text-gray-500 hover-text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Interview Title</label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guest Email</label>
                <input
                  type="email"
                  value={scheduleForm.guestEmail}
                  onChange={(e) => setScheduleForm({...scheduleForm, guestEmail: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <select
                  value={scheduleForm.duration}
                  onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                  className="form-select"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
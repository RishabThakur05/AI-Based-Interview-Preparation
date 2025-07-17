import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredPosition: '',
    experienceLevel: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 fade-in">
      <div className="card">
        <div className="card-header text-center">
          <h1 className="card-title text-2xl">Create Account</h1>
          <p className="text-gray-600 mt-2">Join thousands of professionals improving their interview skills</p>
        </div>

        <form onSubmit={handleSubmit} className="card-content">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Preferred Position
            </label>
            <select
              name="preferredPosition"
              value={formData.preferredPosition}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Position</option>
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
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (2-5 years)</option>
              <option value="senior">Senior Level (5+ years)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="icon"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full py-3 ${loading ? 'disabled' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover-text-blue-600">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;